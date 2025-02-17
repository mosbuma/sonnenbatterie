import { BatteryState, OperatingMode, DEFAULT_BATTERY_STATE } from '../types/battery';

export class Battery {
  private state: BatteryState;

  // Battery parameters
  private capacityWh: number; // Max capacity in Wh
  private chargeRateW: number; // Max charge rate in W
  private dischargeRateW: number; // Max discharge rate in W
  private chargeEfficiency: number; // Charging efficiency (0 to 1)
  private dischargeEfficiency: number; // Discharging efficiency (0 to 1)
  private minChargeLevel: number; // Minimum charge level in percentage

  constructor(initialState: Partial<BatteryState> = {}, capacityWh = 10000, chargeRateW = 3000, dischargeRateW = 3000, chargeEfficiency = 0.95, dischargeEfficiency = 0.95, minChargeLevel = 20) {
    this.state = { ...DEFAULT_BATTERY_STATE, ...initialState };
    this.capacityWh = capacityWh;
    this.chargeRateW = chargeRateW;
    this.dischargeRateW = dischargeRateW;
    this.chargeEfficiency = chargeEfficiency;
    this.dischargeEfficiency = dischargeEfficiency;
    this.minChargeLevel = minChargeLevel;
  }

  getState(): BatteryState {
    return { ...this.state };
  }

  getMinChargeLevel(): number {
    return this.minChargeLevel;
  }

  setMinChargeLevel(percentage: number): void {
    if (percentage >= 0 && percentage <= 100) {
      this.minChargeLevel = percentage;
    }
  }

  setCharging(watts: number): void {
    if (watts > 0) {
      this.state.BatteryCharging = true;
      this.state.OperatingMode = '1';
      this.state.ChargingPower_W = Math.min(watts, this.chargeRateW);
      this.state.DischargingPower_W = 0;
    } else {
      this.state.BatteryCharging = false;
      this.state.ChargingPower_W = 0;
    }
  }

  setDischarging(watts: number): void {
    if (watts > 0) {
      this.state.BatteryCharging = false;
      this.state.OperatingMode = '1';
      this.state.DischargingPower_W = Math.min(watts, this.dischargeRateW);
      this.state.ChargingPower_W = 0;
    } else {
      this.state.DischargingPower_W = 0;
    }
  }

  setOperatingMode(mode: OperatingMode): void {
    this.state.OperatingMode = mode;
  }

  updatePowerMetrics(consumption: number, production: number): void {
    this.state.Consumption_W = consumption;
    this.state.Production_W = production;
    this.state.GridFeedIn_W = production - consumption;
  }

  tick(durationSeconds: number): void {
    const durationHours = durationSeconds / 3600;

    if (this.state.ChargingPower_W > 0) {
      const energyGained = this.state.ChargingPower_W * durationHours * this.chargeEfficiency;
      this.state.RemainingCapacity_Wh = Math.min(this.capacityWh, this.state.RemainingCapacity_Wh + energyGained);
    }

    if (this.state.DischargingPower_W > 0) {
      const energyLost = (this.state.DischargingPower_W * durationHours) / this.dischargeEfficiency;
      this.state.RemainingCapacity_Wh = Math.max(this.minChargeLevel / 100 * this.capacityWh, this.state.RemainingCapacity_Wh - energyLost);
    }

    this.state.USOC = (this.state.RemainingCapacity_Wh / this.capacityWh) * 100;
  }

  setStateOfCharge(percentage: number): void {
    this.state.RemainingCapacity_Wh = (percentage / 100) * this.capacityWh;
    this.state.USOC = percentage;
  }
}
