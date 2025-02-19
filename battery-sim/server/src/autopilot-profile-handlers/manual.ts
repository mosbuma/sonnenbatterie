import { type AutopilotState } from "../types/autopilot";
import { type BatteryState } from "../types/battery";

export const manualProfileHandler = async (
  batteryState: BatteryState,
  autopilotState: AutopilotState,
  currentTime: Date
) => {
  // Do nothing because this the user wants to do this himself (probably from the UI)
};
