import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ success: false, error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const today = new Date().toISOString().split('T')[0];

    // If post_id is provided, publish just that post; otherwise publish all scheduled posts due today
    let postsToPublish;
    if (body.post_id) {
      postsToPublish = await base44.asServiceRole.entities.SMOPost.filter({ id: body.post_id });
    } else {
      postsToPublish = await base44.asServiceRole.entities.SMOPost.filter({ status: "scheduled" });
      // Filter to only posts scheduled for today or earlier
      postsToPublish = postsToPublish.filter(p => !p.scheduled_date || p.scheduled_date <= today);
    }

    if (!postsToPublish || postsToPublish.length === 0) {
      return Response.json({ success: true, published: 0, message: "No posts to publish" });
    }

    const results = [];
    let published = 0;

    for (const post of postsToPublish) {
      try {
        const fullContent = post.content + 
          (post.hashtags?.length ? "\n\n" + post.hashtags.map(h => `#${h}`).join(" ") : "") +
          (post.cta ? `\n\n${post.cta}` : "");

        let postUrl = "";
        let platformNote = "";

        if (post.platform === "Facebook") {
          platformNote = await postToFacebook(base44, fullContent);
        } else if (post.platform === "LinkedIn") {
          platformNote = await postToLinkedIn(base44, fullContent);
        } else if (post.platform === "Instagram") {
          platformNote = await postToInstagram(base44, post, fullContent);
        } else {
          // Twitter / TikTok - not supported for auto-posting
          results.push({ id: post.id, platform: post.platform, status: "skipped", reason: "Platform not supported for auto-posting" });
          continue;
        }

        published++;
        await base44.asServiceRole.entities.SMOPost.update(post.id, {
          status: "posted",
          notes: `[Published ${new Date().toISOString()}] ${platformNote}`
        });
        results.push({ id: post.id, platform: post.platform, status: "posted", detail: platformNote });
      } catch (err) {
        results.push({ id: post.id, platform: post.platform, status: "failed", error: err.message });
      }
    }

    return Response.json({ success: true, published, total: postsToPublish.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ── Facebook Pages ──
async function postToFacebook(base44, content) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("facebook_pages");

  // List managed Pages and get Page access token
  const pagesRes = await fetch(`https://graph.facebook.com/v25.0/me/accounts?fields=id,name,access_token&access_token=${accessToken}`);
  const pagesData = await pagesRes.json();
  if (!pagesData.data || pagesData.data.length === 0) {
    throw new Error("No Facebook Pages found. Make your page is published and you have admin access.");
  }
  const page = pagesData.data[0];

  // Post to Page feed
  const postRes = await fetch(`https://graph.facebook.com/v25.0/${page.id}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: content, access_token: page.access_token })
  });
  const postData = await postRes.json();
  if (postData.error) throw new Error(`Facebook: ${postData.error.message}`);

  return `Facebook Page "${page.name}" — post ID: ${postData.id}`;
}

// ── LinkedIn ──
async function postToLinkedIn(base44, content) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("linkedin");

  // Get user ID
  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const profile = await profileRes.json();
  if (!profile.sub) throw new Error("Could not get LinkedIn user ID");

  // Post to LinkedIn feed
  const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0"
    },
    body: JSON.stringify({
      author: `urn:li:person:${profile.sub}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: content },
          shareMediaCategory: "NONE"
        }
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
    })
  });
  const postData = await postRes.json();
  if (postData.status >= 400 || postData.message) throw new Error(`LinkedIn: ${postData.message || "Post failed"}`);

  return `LinkedIn — post ID: ${postData.id || "published"}`;
}

// ── Instagram Business ──
async function postToInstagram(base44, post, content) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("instagram");

  // Get Instagram user ID
  const meRes = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
  const me = await meRes.json();
  if (!me.id) throw new Error("Could not get Instagram user ID");

  // Instagram requires an image — generate one from the image_prompt if available
  let imageUrl = "";
  // Check if an image URL is already stored in notes
  const existingUrlMatch = post.notes?.match(/\[Image URL: (https?:\/\/[^\]]+)\]/);
  if (existingUrlMatch) {
    imageUrl = existingUrlMatch[1];
  } else if (post.image_prompt) {
    const genResult = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt: post.image_prompt });
    imageUrl = genResult.url;
  } else {
    throw new Error("Instagram posts require an image. Add an image prompt to this post.");
  }

  // Create media container
  const containerRes = await fetch(`https://graph.instagram.com/v21.0/${me.id}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_url: imageUrl,
      caption: content,
      access_token: accessToken
    })
  });
  const container = await containerRes.json();
  if (container.error) throw new Error(`Instagram container: ${container.error.message}`);

  // Publish the media container
  const publishRes = await fetch(`https://graph.instagram.com/v21.0/${me.id}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: container.id,
      access_token: accessToken
    })
  });
  const publishData = await publishRes.json();
  if (publishData.error) throw new Error(`Instagram publish: ${publishData.error.message}`);

  return `Instagram (@${me.username}) — media ID: ${publishData.id}`;
}