import { ProfileName } from "../types/autopilot";

import { manualProfileHandler } from "./manual";
import { highLowProfileHandler } from "./high-low";

export const profileHandlers: Record<ProfileName, Function> = {
  manual: manualProfileHandler,
  "high-low": highLowProfileHandler,
};
