import {
  type AutopilotState,
  type ProfileName,
  BATTERY_API,
  DEFAULT_AUTOPILOT_STATE,
  profileNames,
  SECOND_MS,
} from "../types/autopilot";
import { pollPriceInfo } from "./PollPriceInfo";
import { profileHandlers } from "../autopilot-profile-handlers";

const AUTOPILOT_UPDATE_INTERVAL = 10 * SECOND_MS;

export class Autopilot {
  private state: AutopilotState;

  constructor(initialState: Partial<AutopilotState> = {}) {
    this.state = { ...DEFAULT_AUTOPILOT_STATE, ...initialState };
    pollPriceInfo(this.updateState);
    this.autopilotInterval();
    setInterval(this.autopilotInterval, AUTOPILOT_UPDATE_INTERVAL);
  }

  autopilotInterval = async () => {
    const batteryResponse = await fetch(`${BATTERY_API}/api/v2/status`);
    const batteryState = await batteryResponse.json();

    const autopilotState = this.state;

    const currentTimeResponse = await fetch(
      `${BATTERY_API}/api/v2/time/current`
    );
    const result = await currentTimeResponse.json();

    profileHandlers[this.state.profileName](
      batteryState,
      autopilotState,
      new Date(result.currentTime)
    );
  };

  // state related
  getState = (): AutopilotState => {
    return { ...this.state };
  };

  updateState = (stateUpdates: Partial<AutopilotState>): void => {
    this.state = { ...this.state, ...stateUpdates };
  };

  // profile related
  getProfileNames = (): ProfileName[] => {
    return [...profileNames];
  };

  setProfileName = (profileName: ProfileName): void => {
    this.state.profileName = profileName;
  };
}
