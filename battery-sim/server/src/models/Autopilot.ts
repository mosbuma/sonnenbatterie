import {
  type AutopilotState,
  type ProfileName,
  DEFAULT_AUTOPILOT_STATE,
  profileNames,
  SECOND_MS,
} from "../types/autopilot";
import { pollPriceInfo } from "./PollPriceInfo";

const AUTOPILOT_UPDATE_INTERVAL = 10 * SECOND_MS;

const BATTERY_API = `http://localhost:${parseInt(
  Bun.env.BATTERY_PORT || "5001"
)}`;
// console.log(`BATTERY_API: ${BATTERY_API}`);

export class Autopilot {
  private state: AutopilotState;

  constructor(initialState: Partial<AutopilotState> = {}) {
    this.state = { ...DEFAULT_AUTOPILOT_STATE, ...initialState };
    pollPriceInfo(this.updateState);
    this.autopilotInterval();
    setInterval(this.autopilotInterval, AUTOPILOT_UPDATE_INTERVAL);
  }

  autopilotInterval = async () => {
    if (this.state.profileName === "manual") return;

    console.log(`TODO: autopilot profile ${this.state.profileName}`);

    // talk to BATTERY_API and see if we need to charge/discharge/stop the battery
  };

  // state related
  getState = (): AutopilotState => {
    return { ...this.state };
  };

  updateState = (stateUpdates: Partial<AutopilotState>): void => {
    this.state = { ...this.state, ...stateUpdates };
  };

  // profile related
  getProfileNames = (): readonly ProfileName[] => {
    return profileNames;
  };

  setProfileName = (profileName: ProfileName): void => {
    this.state.profileName = profileName;
  };
}
