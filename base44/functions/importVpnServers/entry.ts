import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const vpnServers = [
  {
    region: "Madrid",
    country: "ES",
    city: "Madrid",
    ip_address: "185.225.234.180",
    port: 1194,
    proto: "udp",
    status: "online",
    max_connections: 1000,
    active_connections: 0,
    uptime_percentage: 99.9,
  },
  {
    region: "Los Angeles",
    country: "US",
    city: "Los Angeles",
    ip_address: "108.61.121.240",
    port: 1194,
    proto: "udp",
    status: "online",
    max_connections: 1000,
    active_connections: 0,
    uptime_percentage: 99.9,
  },
  {
    region: "London",
    country: "GB",
    city: "London",
    ip_address: "108.61.169.215",
    port: 1194,
    proto: "udp",
    status: "online",
    max_connections: 1000,
    active_connections: 0,
    uptime_percentage: 99.9,
  },
  {
    region: "Atlanta",
    country: "US",
    city: "Atlanta",
    ip_address: "104.238.136.216",
    port: 1194,
    proto: "udp",
    status: "online",
    max_connections: 1000,
    active_connections: 0,
    uptime_percentage: 99.9,
  },
  {
    region: "Johannesburg",
    country: "ZA",
    city: "Johannesburg",
    ip_address: "139.84.226.7",
    port: 1194,
    proto: "udp",
    status: "online",
    max_connections: 1000,
    active_connections: 0,
    uptime_percentage: 99.9,
  },
  {
    region: "Paris",
    country: "FR",
    city: "Paris",
    ip_address: "108.61.171.196",
    port: 1194,
    proto: "udp",
    status: "online",
    max_connections: 1000,
    active_connections: 0,
    uptime_percentage: 99.9,
  },
  {
    region: "New Jersey",
    country: "US",
    city: "New Jersey",
    ip_address: "45.76.7.211",
    port: 1194,
    proto: "udp",
    status: "online",
    max_connections: 1000,
    active_connections: 0,
    uptime_percentage: 99.9,
  },
  {
    region: "Milan",
    country: "IT",
    city: "Milan",
    ip_address: "45.76.136.141",
    port: 1194,
    proto: "udp",
    status: "online",
    max_connections: 1000,
    active_connections: 0,
    uptime_percentage: 99.9,
  },
  {
    region: "Miami",
    country: "US",
    city: "Miami",
    ip_address: "104.238.134.12",
    port: 1194,
    proto: "udp",
    status: "online",
    max_connections: 1000,
    active_connections: 0,
    uptime_percentage: 99.9,
  },
  {
    region: "Melbourne",
    country: "AU",
    city: "Melbourne",
    ip_address: "108.61.212.19",
    port: 1194,
    proto: "udp",
    status: "online",
    max_connections: 1000,
    active_connections: 0,
    uptime_percentage: 99.9,
  },
  {
    region: "Manchester",
    country: "GB",
    city: "Manchester",
    ip_address: "45.77.164.12",
    port: 1194,
    proto: "udp",
    status: "online",
    max_connections: 1000,
    active_connections: 0,
    uptime_percentage: 99.9,
  },
  {
    region: "Frankfurt",
    country: "DE",
    city: "Frankfurt",
    ip_address: "108.61.210.37",
    port: 1194,
    proto: "udp",
    status: "online",
    max_connections: 1000,
    active_connections: 0,
    uptime_percentage: 99.9,
  },
  {
    region: "Singapore",
    country: "SG",
    city: "Singapore",
    ip_address: "45.32.100.169",
    port: 1194,
    proto: "udp",
    status: "online",
    max_connections: 1000,
    active_connections: 0,
    uptime_percentage: 99.9,
  },
  {
    region: "Sydney",
    country: "AU",
    city: "Sydney",
    ip_address: "108.61.213.203",
    port: 1194,
    proto: "udp",
    status: "online",
    max_connections: 1000,
    active_connections: 0,
    uptime_percentage: 99.9,
  },
  {
    region: "Chicago",
    country: "US",
    city: "Chicago",
    ip_address: "104.238.150.180",
    port: 1194,
    proto: "udp",
    status: "online",
    max_connections: 1000,
    active_connections: 0,
    uptime_percentage: 99.9,
  },
  {
    region: "Seattle",
    country: "US",
    city: "Seattle",
    ip_address: "108.61.191.137",
    port: 1194,
    proto: "udp",
    status: "online",
    max_connections: 1000,
    active_connections: 0,
    uptime_percentage: 99.9,
  },
  {
    region: "Silicon Valley",
    country: "US",
    city: "Silicon Valley",
    ip_address: "45.63.93.123",
    port: 1194,
    proto: "udp",
    status: "online",
    max_connections: 1000,
    active_connections: 0,
    uptime_percentage: 99.9,
  },
  {
    region: "Toronto",
    country: "CA",
    city: "Toronto",
    ip_address: "155.138.137.170",
    port: 1194,
    proto: "udp",
    status: "online",
    max_connections: 1000,
    active_connections: 0,
    uptime_percentage: 99.9,
  },
  {
    region: "New York",
    country: "US",
    city: "New York",
    ip_address: "45.76.7.211",
    port: 1194,
    proto: "udp",
    status: "online",
    max_connections: 1000,
    active_connections: 0,
    uptime_percentage: 99.9,
  },
  {
    region: "Tokyo",
    country: "JP",
    city: "Tokyo",
    ip_address: "202.182.105.14",
    port: 1194,
    proto: "udp",
    status: "online",
    max_connections: 1000,
    active_connections: 0,
    uptime_percentage: 99.9,
    ca_cert: `-----BEGIN CERTIFICATE-----
MIIDTjCCAjagAwIBAgIUU8H64hGfFtQf5jwkhtrrthjKgVEwDQYJKoZIhvcNAQEL
BQAwFjEUMBIGA1UEAwwLRWFzeS1SU0EgQ0EwHhcNMjYwNTA1MDIzNjEyWhcNMzYw
NTAyMDIzNjEyWjAWMRQwEgYDVQQDDAtFYXN5LVJTQSBDQTCCASIwDQYJKoZIhvcN
AQEBBQADggEPADCCAQoCggEBAK/vNhRI199KR0qx0Hto1a/R6SldrNiwX/arTstY
SnijTZ+5N0G01nqC0Kz4n4qpmXchdTN55M4c+a/EwlqVg9V8s7U701IuAl6Alz94
r9ek2hs3nKawzQl45f2RJTbYimXJy0r+dyabdmS/U16K1ibmmDwOvJmyeCWNJ++y
w8IX4OWeJryWmnMOw7P9GQ4YhWgbhEvgWXxOJlpiK1DK70BJMoDGsQOAYnJbQcV6
/LEQRUMkQx5LdhbMGvonz1w14Zdw08Sag5lg9uzJstYu7PCDd5TSYf5DgR4S7215
tB3GopuWgCe4lIes3FgaujIwR1BbIhELWqmaTBqNB7ZEbwECAwEAAaOBkzCBkDAP
BgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBREgpwTVmYbU2hGh7/z9rUUPScJQzBR
BgNVHSMESjBIgBREgpwTVmYbU2hGh7/z9rUUPScJQ6EapBgwFjEUMBIGA1UEAwwL
RWFzeS1SU0EgQ0FCFFPB+uIRnxbUH+Y8JIba67YYyoFRMAsGA1UdDwQEAwIBBjAN
BgkqhkiG9w0BAQsFAAOCAQEAahF0y2vXCDS0SphnFrUjI2pH+SQPWxNwV691V+TE
4BSKVt/cr6H+f09Z2d/rAVghor30SocrkUlzm1qIdD84cy5f/C8lSFfSjmG44nvY
X/77Zt6wMoufKQEPS3RYNErf0PZj5YRF9e79rVRJj9r5/4f1MayFfEDac6lwAJup
yo3qqCXljegcshEBaIhuoRZA9+5DMQp39FbMBvbMxzNaT23hyfFiAIhp1/5O7pJs
d+CN03C0Mh29KgxVy2hRampEsl74gOk7PHqTw82i4rnaHHVvfzQtuClXC92lWQUU
cDfQBYb+1ASJsKa+4gNwkl5auhbSUdY4KlWVtoB9QkD92Q==
-----END CERTIFICATE-----`,
    tls_auth_key: `-----BEGIN OpenVPN Static key V1-----
6b198f85f7feaa4187a737a96a515291
fd2c64ef50fdbc61d69b096cb263774f
05ee334c779aaa387bcbb02182eb7019
9aae18dbdbbac5e118e9ae3762bae31f
b751b625e8d1233ebd019462594cf235
316363ef82a368a234061a67affcf865
b73be034a2e17ff2bdd94277294a7f6d
933f7ed5796911e4ab138fd9474bf92e
701d6f0a294ee7d4b0d6d89001ac4a95
6731a806da7703dd48218070ed468645
21fce2e5ded8862658787ed3b9834e9b
be4a4cdaf06f41bd7dd51f343a393f1f
b83a16f1864566b864e85a33d84ab855
6f77469137e48a1b028a4008cf9382bc
d51d51f823b898d39fe66c7189a294eb
53ebdd08a24f0b6136d87bd877500e2e
-----END OpenVPN Static key V1-----`,
  },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const results = { created: [], skipped: [], errors: [] };

    for (const server of vpnServers) {
      const existing = await base44.asServiceRole.entities.VPNServer.filter({ ip_address: server.ip_address });
      
      if (existing.length > 0) {
        results.skipped.push(server.city);
      } else {
        const created = await base44.asServiceRole.entities.VPNServer.create(server);
        results.created.push({ id: created.id, city: server.city, ip: server.ip_address });
      }
    }

    return Response.json({
      success: true,
      message: `Imported ${results.created.length} servers, skipped ${results.skipped.length} duplicates`,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});