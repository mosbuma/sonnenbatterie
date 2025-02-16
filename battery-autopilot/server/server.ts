import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { TibberQuery, IConfig } from "tibber-api";

// There is a rate limit of 100 requests in 5 minutes per IP address intended to protect the API.
// So don't poll more often then once every 3 seconds

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;

const UPDATE_INTERVAL = 15 * MINUTE_MS;

// Config object needed when instantiating TibberQuery
const config: IConfig = {
  active: true,
  apiEndpoint: {
    apiKey: process.env.VITE_TIBBER_APIKEY,
    queryUrl: "https://api.tibber.com/v1-beta/gql",
  },
};

const tibberQuery = new TibberQuery(config);

let autopilotState = {
  enabled: false,
};

const pollTibber = async () => {
  const homeId = (await tibberQuery.getHomes())[0].id;
  // console.table(`homeId: ${homeId}`);

  // const currentEnergyPrice = await tibberQuery.getCurrentEnergyPrice(homeId);
  // console.table(currentEnergyPrice);

  const todaysEnergyPrices = await tibberQuery.getTodaysEnergyPrices(homeId);
  // console.table(todaysEnergyPrices);

  const tomorrowsEnergyPrices = await tibberQuery.getTomorrowsEnergyPrices(
    homeId
  );
  // console.table(tomorrowsEnergyPrices);

  const prices = [...todaysEnergyPrices, ...tomorrowsEnergyPrices];
  const upcomingPrices = prices.filter(
    (price) =>
      new Date(price.startsAt).getTime() >= new Date().getTime() - 1 * HOUR_MS
  );
  console.table(upcomingPrices);
};
if (!process.env.VITE_TIBBER_APIKEY) {
  console.error("error: VITE_TIBBER_APIKEY environment variable not found");
} else {
  pollTibber();
  setInterval(pollTibber, UPDATE_INTERVAL);
}

//
const app = express();
app.use(bodyParser.json());
app.use(cors());

// app.use((req, _res, next) => {
//   console.log(`${req.method} request for '${req.url}'`);
//   next(); // Pass control to the next middleware or route handler
// });

// Endpoint to get autopilot status
app.get("/api/autopilot/v1/status", (req, res) => {
  // console.log("Autopilot status requested");
  res.json(autopilotState);
});

app.post("/api/autopilot/v1/enable/:enabled", (req, res) => {
  const enabled = req.params.enabled === "true";
  console.log(`Autopilot enable ${enabled} requested`);
  autopilotState.enabled = enabled;
  res.json(autopilotState);
});

const PORT = Bun.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`battery-autopilot server running on http://localhost:${PORT}`);
});
