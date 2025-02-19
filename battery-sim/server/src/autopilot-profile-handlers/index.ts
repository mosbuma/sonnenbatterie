import { ProfileName } from "../types/autopilot";

import { manualProfileHandler } from "./manual";
import { highLowProfileHandler } from "./high-low";
import { chargeDischargeStopProfileHandler } from "./charge-discharge-stop (30 seconds loop)";

export const profileHandlers: Record<ProfileName, Function> = {
  manual: manualProfileHandler,
  "charge-discharge-stop (30 seconds loop)": chargeDischargeStopProfileHandler,
  "high-low": highLowProfileHandler,
};
