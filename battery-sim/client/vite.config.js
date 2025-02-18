import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const batterySimServerHost = import.meta.env?.VITE_SERVER_HOST || "localhost";
const batterySimServerPort = import.meta.env?.VITE_SERVER_PORT || "5001";
const batterySimServerUrl = `http://${batterySimServerHost}:${batterySimServerPort}`;
// const serverUrl = `http://battery-sim-server:5001`;
// const serverUrl = `http://localhost:5001`;
console.log("********* battery-sim server:", batterySimServerUrl);

const autopilotServerHost =
  import.meta.env?.VITE_AUTOPILOT_SERVER_HOST || "localhost";
const autopilotServerPort =
  import.meta.env?.VITE_AUTOPILOT_SERVER_PORT || "5001";
const autopilotServerUrl = `http://${autopilotServerHost}:${autopilotServerPort}`;
console.log("********* autopilot   server:", autopilotServerUrl);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/autopilot": {
        target: autopilotServerUrl, // Your Express server
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target: batterySimServerUrl, // Your Express server
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
