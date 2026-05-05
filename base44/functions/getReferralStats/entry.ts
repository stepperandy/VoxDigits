import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * getReferralStats — get user's referral metrics and rewards
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get referral records
    const referrals = await base44.entities.Referral.filter({ referrer_email: user.email });

    const stats = {
      referral_code: user.referral_code || generateReferralCode(user.email),
      total_referrals: referrals?.length || 0,
      completed: referrals?.filter(r => r.status === 'completed').length || 0,
      pending: referrals?.filter(r => r.status === 'pending').length || 0,
      rewarded: referrals?.filter(r => r.status === 'rewarded').length || 0,
      total_rewards_earned: (referrals?.filter(r => r.status === 'rewarded').length || 0) * 1, // 1 free month per referral
      referral_link: `https://voxvpn.com?ref=${user.referral_code || generateReferralCode(user.email)}`,
    };

    // Create referral code if doesn't exist
    if (!user.referral_code) {
      await base44.auth.updateMe({ referral_code: stats.referral_code });
    }

    return Response.json({
      ...stats,
      recent_referrals: referrals?.slice(0, 5).map(r => ({
        email: r.referee_email,
        status: r.status,
        created_at: r.created_date,
      })) || [],
    });
  } catch (error) {
    console.error('getReferralStats error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateReferralCode(email) {
  const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `REF${hash.toString(36).toUpperCase().slice(0, 8)}`;
}