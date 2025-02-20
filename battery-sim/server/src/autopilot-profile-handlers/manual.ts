import { type PriceInfo } from "../types/autopilot";
import { type BatteryState } from "../types/battery";

export const manualProfileHandler = async (
  currentTime: Date,
  priceInfo: PriceInfo[],
  batteryState: BatteryState
) => {
  // Do nothing because this the user wants to do this himself (probably from the UI)
};
