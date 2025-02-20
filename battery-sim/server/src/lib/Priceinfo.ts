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
  // MINUTE_MS,
  TAXES_PER_KWH,
  VAT,
  DELIVERY_AREA,
  CURRENCY,
} from "../types/autopilot";

//
export const getPriceInfo = async (currentTime: Date) => {
  // Tibber has a rate limit of 100 requests in 5 minutes per IP address intended to protect the API.
  // So don't query more often then once every 3 seconds!
  const getPriceInfoProviderTibber = async () => {
    console.error(
      "error: we only read today and tomorrow's priceinfo from Tibber. Retrieving historic data from Tibber is currently not supporting by us. Better not use this!"
    );

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
      return [];
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

    return priceInfo;
  };

  //
  const getPriceInfoProviderNordPool = async () => {
    const toDateString = (date: Date) => {
      return `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    };

    const fetchNordPoolPrices = async (date: Date) => {
      try {
        const dateString = toDateString(date);
        const url = `https://dataportal-api.nordpoolgroup.com/api/DayAheadPrices?date=${dateString}&market=DayAhead&deliveryArea=${DELIVERY_AREA}&currency=${CURRENCY}`;
        // console.log(url);
        const response = await fetch(url);
        return (await response.json()).multiAreaEntries;
      } catch (e) {
        return [];
      }
    };

    const nextDay = new Date(currentTime);
    nextDay.setDate(nextDay.getDate() + 1);

    const prices = [
      ...(await fetchNordPoolPrices(currentTime)),
      ...(await fetchNordPoolPrices(nextDay)),
    ];

    const priceInfo: PriceInfo[] = prices.map((entry: any) => ({
      startsAt: entry.deliveryStart,
      price: Number(
        ((entry.entryPerArea.NL / 1000 + TAXES_PER_KWH) * VAT).toFixed(4)
      ),
    }));

    return priceInfo;
  };

  //
  let priceInfo: PriceInfo[];

  if (process.env.VITE_TIBBER_APIKEY) {
    priceInfo = await getPriceInfoProviderTibber();
  } else {
    priceInfo = await getPriceInfoProviderNordPool();
  }

  // remove prices in the past
  priceInfo = priceInfo.filter(
    (price) =>
      new Date(price.startsAt).getTime() >= currentTime.getTime() - 1 * HOUR_MS
  );

  return priceInfo;
};
