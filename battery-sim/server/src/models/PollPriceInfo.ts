import { TibberQuery } from "tibber-api";

// Taxes   : https://support.tibber.com/nl/articles/5605892-wat-verandert-er-in-2025
// via api : https://dataportal-api.nordpoolgroup.com/api/DayAheadPrices?date=2025-02-18&market=DayAhead&deliveryArea=NL&currency=EUR
// via site: https://data.nordpoolgroup.com/auction/day-ahead/prices?deliveryDate=2025-02-18&currency=EUR&aggregation=DeliveryPeriod&deliveryAreas=NL

// total in 2025 = (energy * €0.1228 per kWh) * 1.21 (VAT% in NL)

// Taxes   : https://support.tibber.com/nl/articles/5605892-wat-verandert-er-in-2025
// via api : https://dataportal-api.nordpoolgroup.com/api/DayAheadPrices?date=2025-02-18&market=DayAhead&deliveryArea=NL&currency=EUR
// via site: https://data.nordpoolgroup.com/auction/day-ahead/prices?deliveryDate=2025-02-18&currency=EUR&aggregation=DeliveryPeriod&deliveryAreas=NL

// total in 2025 = (energy * €0.1228 per kWh) * 1.21 (VAT% in NL)

import {
  type AutopilotState,
  PriceInfo,
  PriceInfoProvider,
  HOUR_MS,
  MINUTE_MS,
  TAXES_PER_KWH,
  VAT,
  DELIVERY_AREA,
  CURRENCY,
} from "../types/autopilot";

// There is a rate limit of 100 requests in 5 minutes per IP address intended to protect the API.
// So don't poll more often then once every 3 seconds

const POLL_PRICEINFO_UPDATE_INTERVAL = 15 * MINUTE_MS;

//
export const pollPriceInfo = (
  updateState: (stateUpdates: Partial<AutopilotState>) => void
) => {
  const pollPriceInfoProviderTibber = async (): Promise<
    [PriceInfoProvider, PriceInfo[]]
  > => {
    const tibberQuery = new TibberQuery({
      active: true,
      apiEndpoint: {
        apiKey: process.env.VITE_TIBBER_APIKEY || "",
        queryUrl: "https://api.tibber.com/v1-beta/gql",
      },
    });

    const homes = await tibberQuery.getHomes();

    if (!homes?.length) {
      console.error(
        "error: no homes found with VITE_TIBBER_APIKEY environment variable"
      );
      return ["none", []];
    }

    const homeId = homes[0].id;

    const todaysEnergyPrices = await tibberQuery.getTodaysEnergyPrices(homeId);

    const tomorrowsEnergyPrices = await tibberQuery.getTomorrowsEnergyPrices(
      homeId
    );

    const prices = [...todaysEnergyPrices, ...tomorrowsEnergyPrices];

    // update state
    const priceInfo: PriceInfo[] = prices.map((price) => ({
      startsAt: price.startsAt,
      price: price.total,
    }));

    return ["Tibber", priceInfo];
  };

  //
  const pollPriceInfoProviderNordPool = async (): Promise<
    [PriceInfoProvider, PriceInfo[]]
  > => {
    let todaysEnergyPrices;
    try {
      const now = new Date();
      const todayString = `${now.getFullYear()}-${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
      const urlToday = `https://dataportal-api.nordpoolgroup.com/api/DayAheadPrices?date=${todayString}&market=DayAhead&deliveryArea=${DELIVERY_AREA}&currency=${CURRENCY}`;
      const responseToday = await fetch(urlToday);
      todaysEnergyPrices = (await responseToday.json()).multiAreaEntries;
    } catch (e) {
      todaysEnergyPrices = [];
    }

    let tomorrowsEnergyPrices;
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = `${tomorrow.getFullYear()}-${(
        tomorrow.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${tomorrow.getDate().toString().padStart(2, "0")}`;
      const urlTomorrow = `https://dataportal-api.nordpoolgroup.com/api/DayAheadPrices?date=${tomorrowString}&market=DayAhead&deliveryArea=${DELIVERY_AREA}&currency=${CURRENCY}`;
      const responseTomorrow = await fetch(urlTomorrow);
      tomorrowsEnergyPrices = (await responseTomorrow.json()).multiAreaEntries;
    } catch (e) {
      tomorrowsEnergyPrices = [];
    }

    const prices = [...todaysEnergyPrices, ...tomorrowsEnergyPrices];

    const priceInfo: PriceInfo[] = prices.map((entry: any) => ({
      startsAt: entry.deliveryStart,
      price: Number(
        ((entry.entryPerArea.NL / 1000 + TAXES_PER_KWH) * VAT).toFixed(4)
      ),
    }));

    return ["Nord Pool", priceInfo];
  };

  //
  const pollPriceInfoProvider = async () => {
    let priceInfoProvider: PriceInfoProvider;
    let priceInfo: PriceInfo[];

    if (process.env.VITE_TIBBER_APIKEY) {
      [priceInfoProvider, priceInfo] = await pollPriceInfoProviderTibber();
    } else {
      [priceInfoProvider, priceInfo] = await pollPriceInfoProviderNordPool();
    }

    const upcomingPrices = priceInfo.filter(
      (price) =>
        new Date(price.startsAt).getTime() >= new Date().getTime() - 1 * HOUR_MS
    );

    // console.table(upcomingPrices);
    // console.log(`priceInfoProvider: ${priceInfoProvider}`);

    updateState({
      priceInfoProvider,
      priceInfo: upcomingPrices,
    });
  };

  //
  pollPriceInfoProvider();
  setInterval(pollPriceInfoProviderTibber, POLL_PRICEINFO_UPDATE_INTERVAL);
};
