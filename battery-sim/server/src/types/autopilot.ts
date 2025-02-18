export const SECOND_MS = 1000;
export const MINUTE_MS = 60 * SECOND_MS;
export const HOUR_MS = 60 * MINUTE_MS;

// NL 2025, see: https://support.tibber.com/nl/articles/5605892-wat-verandert-er-in-2025
export const TAXES_PER_KWH = 0.1228;
export const VAT = 1.21;

export interface PriceInfo {
  startsAt: string;
  price: number; // including additional costs and vat
}

export type PriceInfoProvider = "none" | "Tibber" | "Nord Pool";

export interface AutopilotState {
  enabled: boolean;
  priceInfoProvider: PriceInfoProvider;
  priceInfo: PriceInfo[];
}

export const DEFAULT_AUTOPILOT_STATE: AutopilotState = {
  enabled: false,
  priceInfoProvider: "none",
  priceInfo: [],
};
