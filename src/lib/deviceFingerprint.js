// Stable browser device fingerprint used by the device tracker to enforce
// "one account per device" and "no re-registration after the first free use".
// The fingerprint is a SHA-256 hash of hardware + browser + canvas signals,
// cached per session so repeated calls return the same value.

let cached = null;

export async function getDeviceFingerprint() {
  if (cached) return cached;

  const signals = [
    navigator.userAgent || '',
    navigator.language || '',
    (navigator.languages || []).join(','),
    navigator.hardwareConcurrency || '',
    navigator.deviceMemory || '',
    `${screen.width}x${screen.height}`,
    String(screen.colorDepth || ''),
    String(new Date().getTimezoneOffset()),
    (Intl.DateTimeFormat().resolvedOptions().timeZone || ''),
    navigator.platform || '',
    String(navigator.maxTouchPoints || 0),
  ];

  // Canvas fingerprint — drawing specifics vary by GPU/driver/font stack.
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('VoxVPN-device-fp-αβγδ∆', 2, 15);
    ctx.fillStyle = 'rgba(102,204,0,0.7)';
    ctx.fillText('VoxVPN-device-fp-αβγδ∆', 4, 17);
    signals.push(canvas.toDataURL());
  } catch (_) {
    signals.push('no-canvas');
  }

  const raw = signals.join('||');
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  const arr = Array.from(new Uint8Array(buf));
  cached = arr.map((b) => b.toString(16).padStart(2, '0')).join('');
  return cached;
}