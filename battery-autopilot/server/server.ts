const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// There is a rate limit of 100 requests in 5 minutes per IP address intended to protect the API.
// So don't poll more often then once every 3 seconds

import { TibberQuery, IConfig } from "tibber-api";

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const UPDATE_INTERVAL = 15 * MINUTE_MS;

// console.log(import.meta.env.VITE_TIBBER_APIKEY);

// Config object needed when instantiating TibberQuery
const config: IConfig = {
  active: true,
  apiEndpoint: {
    apiKey: import.meta.env.VITE_TIBBER_APIKEY,
    queryUrl: "https://api.tibber.com/v1-beta/gql",
  },
};

const tibberQuery = new TibberQuery(config);

let autopilotState = {
  enabled: false,
};

const pollTibber = () => {
  console.log("TODO: pollTibber");
};
pollTibber();
setInterval(pollTibber, UPDATE_INTERVAL);

//
const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use((req, _res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next(); // Pass control to the next middleware or route handler
});

// Endpoint to get autopilot status
app.get("/api/autopilot/v1/status", (req, res) => {
  console.log("Autopilot status requested");
  res.json(autopilotState);
});

app.post("/api/autopilot/v1/enable/:enabled", (req, res) => {
  const enabled = req.params.enabled === "true";
  console.log(`Autopilot enabled ${enabled} requested`);
  autopilotState.enabled = enabled;
  res.json(autopilotState);
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`battery-autopilot server running on http://localhost:${PORT}`);
});
