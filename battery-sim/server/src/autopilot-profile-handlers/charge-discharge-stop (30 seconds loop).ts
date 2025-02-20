import { BATTERY_API, SECOND_MS, type PriceInfo } from "../types/autopilot";
import { type BatteryState } from "../types/battery";

const SECONDS_PER_PHASE = 10;
const N_PHASES = 3;

export const chargeDischargeStopProfileHandler = async (
  currentTime: Date,
  priceInfo: PriceInfo[],
  batteryState: BatteryState
) => {
  console.table(priceInfo);
  console.table(batteryState);
  const phase =
    Math.floor(currentTime.getTime() / SECOND_MS / SECONDS_PER_PHASE) %
    N_PHASES;
  console.log(`Applying phase ${phase}`);

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
