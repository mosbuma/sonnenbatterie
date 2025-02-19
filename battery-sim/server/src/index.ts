import { Hono } from "hono";
import { cors } from "hono/cors";
import { Battery } from "./models/Battery";
import { env } from "bun";
import { Autopilot } from "./models/Autopilot";
import { ProfileName, profileNames } from "./types/autopilot";

// Create separate apps for different ports
const batteryApp = new Hono();
const autopilotApp = new Hono();

// Add CORS middleware to both apps
// batteryApp.use('/*', cors());
// autopilotApp.use('/*', cors());

batteryApp.use(
  "/*",
  cors({
    origin: ["http://localhost:5173", "http://battery-sim-client"],
    credentials: true,
  })
);

autopilotApp.use(
  "/*",
  cors({
    origin: ["http://localhost:5173", "http://battery-sim-client"],
    credentials: true,
  })
);

const battery = new Battery();
const autopilot = new Autopilot();

// Time configuration
const TIME_INTERVAL_MS = 1000;
let timeInterval: ReturnType<typeof setInterval> | null = null;
let timeRunning = false;
let currentTime = new Date("2025-01-01T00:00:00");
let speedupFactor = 60;

// Battery Simulator endpoints
batteryApp.get("/api/v2/status", (c) => {
  return c.json(battery.getState());
});

batteryApp.post("/api/v2/setpoint/charge/:watts", (c) => {
  const watts = parseInt(c.req.param("watts"));
  if (isNaN(watts)) {
    return c.json({ error: "Invalid watts parameter" }, 400);
  }
  battery.setCharging(watts);
  return c.json(true);
});

batteryApp.post("/api/v2/setpoint/discharge/:watts", (c) => {
  const watts = parseInt(c.req.param("watts"));
  if (isNaN(watts)) {
    return c.json({ error: "Invalid watts parameter" }, 400);
  }
  battery.setDischarging(watts);
  return c.json(true);
});

batteryApp.post("/api/v2/time", async (c) => {
  if (!timeRunning) {
    const body = await c.req.json();
    const duration = body.duration || 1;
    currentTime.setSeconds(currentTime.getSeconds() + duration);
    battery.tick(duration);
  }
  return c.json({ running: timeRunning });
});

batteryApp.post("/api/v2/time/start", (c) => {
  if (!timeRunning) {
    timeRunning = true;
    timeInterval = setInterval(() => {
      const secondsToAdvance = (TIME_INTERVAL_MS / 1000) * speedupFactor;
      currentTime.setSeconds(currentTime.getSeconds() + secondsToAdvance);
      battery.tick(secondsToAdvance);
    }, TIME_INTERVAL_MS);
  }
  return c.json({ running: timeRunning });
});

batteryApp.post("/api/v2/time/stop", (c) => {
  if (timeInterval) {
    clearInterval(timeInterval);
    timeInterval = null;
  }
  timeRunning = false;
  return c.json({ running: timeRunning });
});

batteryApp.get("/api/v2/time/status", (c) => {
  return c.json({ running: timeRunning });
});

batteryApp.post("/api/v2/time/set", async (c) => {
  const body = await c.req.json();
  currentTime = new Date(body.time);
  return c.json({ success: true });
});

batteryApp.get("/api/v2/time/current", (c) => {
  return c.json({ currentTime: currentTime.toISOString() });
});

batteryApp.post("/api/v2/time/speedup", async (c) => {
  const body = await c.req.json();
  speedupFactor = body.speedup || 1;
  return c.json({ success: true });
});

batteryApp.post("/api/v2/reset/empty", (c) => {
  battery.setStateOfCharge(0); // Set battery charge to 0%
  currentTime = new Date("2025-01-01T00:00:00"); // Reset time
  return c.json({ success: true });
});

batteryApp.post("/api/v2/reset/full", (c) => {
  battery.setStateOfCharge(100); // Set battery charge to 100%
  currentTime = new Date("2025-01-01T00:00:00"); // Reset time
  return c.json({ success: true });
});

batteryApp.get("/api/v2/min-charge-level", (c) => {
  return c.json({ minChargeLevel: battery.getMinChargeLevel() });
});

batteryApp.post("/api/v2/min-charge-level", async (c) => {
  const body = await c.req.json();
  const { minChargeLevel } = body;
  if (minChargeLevel >= 0 && minChargeLevel <= 100) {
    battery.setMinChargeLevel(minChargeLevel);
    return c.json({ success: true });
  } else {
    return c.json({ success: false, message: "Invalid charge level" }, 400);
  }
});

// Autopilot endpoints
autopilotApp.get("/api/autopilot/v1/status", (c) => {
  return c.json(autopilot.getState());
});

autopilotApp.get("/api/autopilot/v1/profiles", (c) => {
  return c.json(autopilot.getProfileNames());
});

autopilotApp.post("/api/autopilot/v1/profile/:name", (c) => {
  const name = c.req.param("name") as ProfileName;
  if (!profileNames.includes(name)) {
    // console.error(`error: unknown profile name "${name}"`);
    return c.json(false);
  }
  autopilot.setProfileName(name);
  return c.json(true);
});

// Start both servers
const batteryPort = parseInt(env.BATTERY_PORT || "5001");
const autopilotPort = parseInt(env.AUTOPILOT_PORT || "5002");

const batteryServer = Bun.serve({
  port: batteryPort,
  hostname: "0.0.0.0",
  fetch: batteryApp.fetch,
});

const autopilotServer = Bun.serve({
  port: autopilotPort,
  hostname: "0.0.0.0",
  fetch: autopilotApp.fetch,
});

console.log(`Battery   server running at http://0.0.0.0:${batteryPort}`);
console.log(`Autopilot server running at http://0.0.0.0:${autopilotPort}`);
