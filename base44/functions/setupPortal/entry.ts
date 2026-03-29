import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// In-memory store for demo purposes.
// In production, replace with a real database lookup via base44.entities.
const portalData = {
  "demo-token": {
    email: "buyer@example.com",
    orderId: "ORD-10001",
    profiles: [
      { os: "windows", fileName: "voxvpn-windows.conf", downloadUrl: "/api/setup/download/token1" },
      { os: "macos",   fileName: "voxvpn-macos.conf",   downloadUrl: "/api/setup/download/token2" },
      { os: "linux",   fileName: "voxvpn-linux.conf",   downloadUrl: "/api/setup/download/token3" },
      { os: "android", fileName: "voxvpn-android.conf", downloadUrl: "/api/setup/download/token4", qrToken: "token4" },
      { os: "ios",     fileName: "voxvpn-ios.conf",     downloadUrl: "/api/setup/download/token5", qrToken: "token5" },
    ],
  },
};

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return Response.json({ error: "Missing token" }, { status: 400 });
  }

  const data = portalData[token];
  if (!data) {
    return Response.json({ error: "Invalid or expired token" }, { status: 404 });
  }

  return Response.json(data);
});