// Detects the native Capacitor shell and specifically iOS.
// Used to disable subscription / external-payment UI for Apple App Store builds.
export function isNativeCapacitor() {
  return typeof window !== 'undefined' &&
    window.Capacitor &&
    (window.Capacitor.isNative === true || window.Capacitor.platform !== 'web');
}

export function isNativeIOS() {
  if (!isNativeCapacitor()) return false;
  return window.Capacitor.platform === 'ios';
}