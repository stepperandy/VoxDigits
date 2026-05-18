/**
 * vpnNativePlugin.js
 *
 * Thin wrapper around the native VoxVpnPlugin Capacitor plugin.
 * On web/browser it falls back to a mock so the UI still works in the browser preview.
 *
 * Native plugin source: android/app/src/main/java/net/voxvpn/mobile/VoxVpnPlugin.kt
 */

import { registerPlugin } from '@capacitor/core';

// Register the native plugin — Capacitor will find VoxVpnPlugin on Android
const VoxVpnNative = registerPlugin('VoxVpnPlugin', {
  // Web fallback: used in browser/Vite preview — simulates the native API
  web: () => import('./vpnNativePluginWebFallback').then(m => new m.VoxVpnPluginWeb()),
});

export default VoxVpnNative;

/**
 * SERVER CONFIG MAP
 * Maps display name → .ovpn filename (without extension).
 * These files must exist in android/app/src/main/assets/configs/
 */
export const SERVER_CONFIG_MAP = [
  { name: '🇺🇸 New York, USA',       config: 'us-ny',    country: 'US' },
  { name: '🇺🇸 Los Angeles, USA',    config: 'us-la',    country: 'US' },
  { name: '🇺🇸 Chicago, USA',        config: 'chicago',  country: 'US' },
  { name: '🇬🇧 London, UK',          config: 'gb-lon',   country: 'GB' },
  { name: '🇩🇪 Frankfurt, Germany',  config: 'de-fra',   country: 'DE' },
  { name: '🇫🇷 Paris, France',       config: 'fr-par',   country: 'FR' },
  { name: '🇳🇱 Amsterdam, Netherlands', config: 'nl-ams', country: 'NL' },
  { name: '🇨🇭 Zurich, Switzerland', config: 'ch-zur',   country: 'CH' },
  { name: '🇸🇪 Stockholm, Sweden',   config: 'se-sto',   country: 'SE' },
  { name: '🇳🇴 Oslo, Norway',        config: 'no-osl',   country: 'NO' },
  { name: '🇯🇵 Tokyo, Japan',        config: 'jp-tyo',   country: 'JP' },
  { name: '🇸🇬 Singapore',           config: 'sg-sgp',   country: 'SG' },
  { name: '🇭🇰 Hong Kong',           config: 'hk-hkg',   country: 'HK' },
  { name: '🇦🇺 Sydney, Australia',   config: 'au-syd',   country: 'AU' },
  { name: '🇨🇦 Toronto, Canada',     config: 'ca-tor',   country: 'CA' },
  { name: '🇧🇷 São Paulo, Brazil',   config: 'br-sao',   country: 'BR' },
  { name: '🇿🇦 Johannesburg, SA',    config: 'za-jnb',   country: 'ZA' },
  { name: '🇮🇳 Mumbai, India',       config: 'in-mum',   country: 'IN' },
  { name: '🇲🇽 Mexico City, Mexico', config: 'mx-mex',   country: 'MX' },
  { name: '🇦🇪 Dubai, UAE',          config: 'ae-dxb',   country: 'AE' },
];