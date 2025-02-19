import {
  BATTERY_API,
  SECOND_MS,
  type AutopilotState,
} from "../types/autopilot";
import { type BatteryState } from "../types/battery";

const SECONDS_PER_PHASE = 10;
const N_PHASES = 3;

export const highLowProfileHandler = async (
  batteryState: BatteryState,
  autopilotState: AutopilotState,
  currentTime: Date
) => {
  console.log("");
  console.table(autopilotState.priceInfo);
  console.table(batteryState);
  const phase =
    Math.floor(currentTime.getTime() / SECOND_MS / SECONDS_PER_PHASE) %
    N_PHASES;
  console.log(`Phase ${phase} at ${currentTime.toLocaleString()}`);

  // const isCharging = batteryState.BatteryCharging;
  // //   const isCharging = batteryState.ChargingPower_W > 0
  // const isDischarging = batteryState.ChargingPower_W > 0;

  switch (phase) {
    case 0: // charge
      await fetch(`${BATTERY_API}/api/v2/setpoint/charge/2000`, {
        method: "POST",
      });
      break;

    case 1: // discharge
      await fetch(`${BATTERY_API}/api/v2/setpoint/discharge/2000`, {
        method: "POST",
      });
      break;

    default: // stop
      await fetch(`${BATTERY_API}/api/v2/setpoint/discharge/0`, {
        method: "POST",
      });
      await fetch(`${BATTERY_API}/api/v2/setpoint/charge/0`, {
        method: "POST",
      });
      break;
  }
};
