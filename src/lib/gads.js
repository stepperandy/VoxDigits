// Centralized Google Ads conversion tracking helper.
// send_to values come from get_google_ads_conversion_tag (account AW-18398752210)
// and must be reused verbatim for every flow of the matching category.

export const GADS_CONVERSION_ID = "AW-18398752210";

const SEND_TO = {
  PURCHASE: "AW-18398752210/6p4ACKaHoOQcENLbmsVE",
  SUBSCRIBE_PAID: "AW-18398752210/-WovCMiHo-QcENLbmsVE",
  SIGNUP: "AW-18398752210/Zn6ZCPCNlOQcENLbmsVE",
  CONTACT: "AW-18398752210/UbCQCPSHoOQcENLbmsVE",
  PHONE_CALL_LEAD: "AW-18398752210/4S4oCJX1ouQcENLbmsVE",
  SUBMIT_LEAD_FORM: "AW-18398752210/G0j1CMaJoOQcENLbmsVE",
  BEGIN_CHECKOUT: "AW-18398752210/-xxdCJyElOQcENLbmsVE",
};

// Fire a Google Ads conversion. `category` is one of the keys above.
// Pass { value, currency } for revenue categories and { transaction_id } for
// PURCHASE / SUBSCRIBE_PAID / SIGNUP (real ids only, never blank).
export function fireConversion(category, options = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  const send_to = SEND_TO[category];
  if (!send_to) return;
  const payload = { send_to, ...options };
  window.gtag("event", "conversion", payload);
}