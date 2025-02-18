import { TibberQuery, IConfig } from "tibber-api";

// via api : https://dataportal-api.nordpoolgroup.com/api/DayAheadPrices?date=2025-02-18&market=DayAhead&deliveryArea=NL&currency=EUR
// via site: https://data.nordpoolgroup.com/auction/day-ahead/prices?deliveryDate=2025-02-18&currency=EUR&aggregation=DeliveryPeriod&deliveryAreas=NL

import {
  type AutopilotState,
  DEFAULT_AUTOPILOT_STATE,
} from "../types/autopilot";

// There is a rate limit of 100 requests in 5 minutes per IP address intended to protect the API.
// So don't poll more often then once every 3 seconds

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;

const AUTOPILOT_UPDATE_INTERVAL = 15 * MINUTE_MS;

//
export class Autopilot {
  private state: AutopilotState;

  //
  constructor(initialState: Partial<AutopilotState> = {}) {
    this.state = { ...DEFAULT_AUTOPILOT_STATE, ...initialState };

    const config: IConfig = {
      active: true,
      apiEndpoint: {
        apiKey: process.env.VITE_TIBBER_APIKEY || "",
        queryUrl: "https://api.tibber.com/v1-beta/gql",
      },
    };

    const tibberQuery = new TibberQuery(config);

    //
    const pollTibber = async () => {
      const homes = await tibberQuery.getHomes();

      if (!homes?.length) {
        console.error(
          "error: no homes found with VITE_TIBBER_APIKEY environment variable"
        );
        return;
      }

      const homeId = homes[0].id;
      // console.table(`homeId: ${homeId}`);

      // const currentEnergyPrice = await tibberQuery.getCurrentEnergyPrice(homeId);
      // console.table(currentEnergyPrice);

      const todaysEnergyPrices = await tibberQuery.getTodaysEnergyPrices(
        homeId
      );
      // console.table(todaysEnergyPrices);

      const tomorrowsEnergyPrices = await tibberQuery.getTomorrowsEnergyPrices(
        homeId
      );
      // console.table(tomorrowsEnergyPrices);

      const prices = [...todaysEnergyPrices, ...tomorrowsEnergyPrices];
      const upcomingPrices = prices.filter(
        (price) =>
          new Date(price.startsAt).getTime() >=
          new Date().getTime() - 1 * HOUR_MS
      );
      console.table(upcomingPrices);

      // TODO: store in DynamicPricesState and write getting method
    };

    if (!process.env.VITE_TIBBER_APIKEY) {
      console.error("error: VITE_TIBBER_APIKEY environment variable not found");
    } else {
      pollTibber();
      setInterval(pollTibber, AUTOPILOT_UPDATE_INTERVAL);
    }
  }

  getState(): DynamicPricesState {
    return { ...this.state };
  }

  setEnabled(enabled: boolean): void {
    this.state.enabled = enabled;
  }
}
