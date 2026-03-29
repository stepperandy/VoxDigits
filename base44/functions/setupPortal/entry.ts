import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const portalData = {
  "demo-token": {
    email: "buyer@example.com",
    orderId: "ORD-10001",
    profiles: [
      {
        os: "windows",
        fileName: "VoxVPN-Windows-Setup.conf",
        downloadUrl: "/api/setup/download/token1",
        serverName: "VoxVPN New York 01"
      },
      {
        os: "macos",
        fileName: "VoxVPN-macOS-Setup.conf",
        downloadUrl: "/api/setup/download/token2",
        serverName: "VoxVPN London 01"
      },
      {
        os: "linux",
        fileName: "VoxVPN-Linux-Setup.conf",
        downloadUrl: "/api/setup/download/token3",
        serverName: "VoxVPN Frankfurt 01"
      },
      {
        os: "android",
        fileName: "VoxVPN-Android-Setup.conf",
        downloadUrl: "/api/setup/download/token4",
        qrToken: "token4",
        serverName: "VoxVPN Toronto 01"
      },
      {
        os: "ios",
        fileName: "VoxVPN-iPhone-iPad-Setup.conf",
        downloadUrl: "/api/setup/download/token5",
        qrToken: "token5",
        serverName: "VoxVPN Amsterdam 01"
      },
    ],
  },
};

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token;

    if (!token) {
      return Response.json({ error: "Missing token" }, { status: 400 });
    }

    const data = portalData[token];
    if (!data) {
      return Response.json({ error: "Invalid or expired token" }, { status: 404 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});