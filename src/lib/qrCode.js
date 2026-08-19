// Lazy-loads the `qrcode` library from its CDN UMD build at runtime, because
// the npm package could not be resolved by the production bundler. The UMD
// build exposes the library on window.QRCode with the same toCanvas/toDataURL
// API used by the npm package.
const QRCODE_CDN_URL = "https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js";
let qrCodePromise = null;

export function loadQRCode() {
  if (typeof window !== "undefined" && window.QRCode && typeof window.QRCode.toCanvas === "function") {
    return Promise.resolve(window.QRCode);
  }
  if (qrCodePromise) return qrCodePromise;
  qrCodePromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = QRCODE_CDN_URL;
    script.async = true;
    script.onload = () => {
      const QRCode = window.QRCode;
      if (QRCode && typeof QRCode.toCanvas === "function") resolve(QRCode);
      else reject(new Error("qrcode loaded but toCanvas was not found"));
    };
    script.onerror = () => reject(new Error("Failed to load qrcode from CDN"));
    document.head.appendChild(script);
  });
  return qrCodePromise;
}