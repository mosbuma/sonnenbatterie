export const SECOND_MS = 1000;
export const MINUTE_MS = 60 * SECOND_MS;
export const HOUR_MS = 60 * MINUTE_MS;

export const DELIVERY_AREA = "NL";
export const CURRENCY = "EUR";
export const TAXES_PER_KWH = 0.1228; // NL 2025, see: https://support.tibber.com/nl/articles/5605892-wat-verandert-er-in-2025
export const VAT = 1.21;

export const BATTERY_API = `http://localhost:${parseInt(
  Bun.env.BATTERY_PORT || "5001"
)}`;

export interface PriceInfo {
  startsAt: string;
  price: number; // including additional costs and vat
}

export type PriceInfoProvider = "none" | "Tibber" | "Nord Pool";

export const profileNames = [
  "manual",
  "charge-discharge-stop (30 seconds loop)",
  "high-low",
] as const;
export type ProfileName = (typeof profileNames)[number];

export interface AutopilotState {
  profileName: ProfileName;
  priceInfoProvider: PriceInfoProvider;
  priceInfo: PriceInfo[];
}

export const DEFAULT_AUTOPILOT_STATE: AutopilotState = {
  profileName: "high-low",
  priceInfoProvider: "none",
  priceInfo: [],
};
