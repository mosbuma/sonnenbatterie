import {
  type AutopilotState,
  type ProfileName,
  BATTERY_API,
  DEFAULT_AUTOPILOT_STATE,
  PriceInfo,
  profileNames,
  SECOND_MS,
} from "../types/autopilot";
import { getPriceInfo } from "../lib/Priceinfo";
import { profileHandlers } from "../autopilot-profile-handlers";

//
const AUTOPILOT_UPDATE_INTERVAL = 10 * SECOND_MS;

//
export class Autopilot {
  private state: AutopilotState;

  constructor(initialState: Partial<AutopilotState> = {}) {
    this.state = { ...DEFAULT_AUTOPILOT_STATE, ...initialState };

    // pollPriceInfo(this.updateState);
    this.autopilotInterval();
    setInterval(this.autopilotInterval, AUTOPILOT_UPDATE_INTERVAL);
  }

  autopilotInterval = async () => {
    console.log("");

    // note: we could optimize the following by wrapping them in a Promise.all(...)
    const currentTimeResponse = await fetch(
      `${BATTERY_API}/api/v2/time/current`
    );
    const result = await currentTimeResponse.json();
    const currentTime = new Date(result.currentTime);

    const priceInfo = await getPriceInfo(currentTime);

    const batteryResponse = await fetch(`${BATTERY_API}/api/v2/status`);
    const batteryState = await batteryResponse.json();

    profileHandlers[this.state.profileName](
      currentTime,
      priceInfo,
      batteryState
    );

    console.log(`${currentTime.toLocaleString()}: ${this.state.profileName}`);
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
