/**
 * Operating modes for the battery
 * 1: Manual/API control
 * 2: Automatic (Self-Consumption)
 */
export type OperatingMode = "1" | "2";

/**
 * Represents the current state of the battery system
 */
export interface BatteryState {
  /** Current operating mode of the battery */
  OperatingMode: OperatingMode;

  /** Indicates if the battery is currently charging */
  BatteryCharging: boolean;

  /** User State of Charge (percentage) */
  USOC: number;

  /** Current power production in watts */
  Production_W: number;

  /** Remaining capacity in watt-hours */
  RemainingCapacity_Wh: number;

  /** Current power consumption in watts */
  Consumption_W: number;

  /** Current grid feed-in power in watts (positive = feeding to grid) */
  GridFeedIn_W: number;

  /** Current charging power in watts */
  ChargingPower_W: number;

  /** Current discharging power in watts */
  DischargingPower_W: number;
}

/**
 * Default battery state values
 */
export const DEFAULT_BATTERY_STATE: BatteryState = {
  OperatingMode: "2",
  BatteryCharging: false,
  USOC: 0,
  Production_W: 0,
  RemainingCapacity_Wh: 5000,
  Consumption_W: 0,
  GridFeedIn_W: 0,
  ChargingPower_W: 0,
  DischargingPower_W: 0
};
