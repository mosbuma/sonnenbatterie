// battery-sim/client/src/App.jsx
import { useState, useEffect } from "react";

//
const SECOND_MS = 1000;
const UPDATE_INTERVAL = 1 * SECOND_MS;

//
function App() {
  const [batteryState, setBatteryState] = useState({
    OperatingMode: "",
    BatteryCharging: false,
    USOC: 0,
    Production_W: 0,
  });

  const [autopilotState, setAutopilotState] = useState({ enabled: false });

  //
  useEffect(() => {
    const fetchBatteryState = async () => {
      try {
        const response = await fetch(`/api/v2/status`);
        if (!response.ok) {
          throw new Error("Battery network response was not ok");
        }
        const data = await response.json();
        setBatteryState(data);
      } catch (error) {
        console.error("Error fetching battery state:", error);
      }
    };

    const fetchAutopilotState = async () => {
      try {
        const response = await fetch(`/api/autopilot/v1/status`);
        if (!response.ok) {
          throw new Error("Autopilot network response was not ok");
        }
        const data = await response.json();
        setAutopilotState(data);
      } catch (error) {
        console.error("Error fetching autopilot state:", error);
      }
    };

    const fetchState = async () => {
      await Promise.all([fetchBatteryState(), fetchAutopilotState()]);
    };

    fetchState();
    const interval = setInterval(fetchState, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const handleToggleAutopilot = async () => {
    await fetch(`/api/autopilot/v1/enable/${!autopilotState.enabled}`, {
      method: "POST",
    });
  };

  const handleCharge = async () => {
    await fetch(`/api/v2/setpoint/charge/2000`, { method: "POST" });
  };

  const handleDischarge = async () => {
    await fetch(`/api/v2/setpoint/discharge/2000`, { method: "POST" });
  };

  const handleStop = async () => {
    await fetch(`/api/v2/setpoint/discharge/0`, { method: "POST" });
    await fetch(`/api/v2/setpoint/charge/0`, { method: "POST" });
  };

  return (
    <div>
      <h1>Battery Simulator</h1>
      <p>Timestamp: {new Date().toLocaleString()}</p>
      <p>Operating Mode: {batteryState.OperatingMode}</p>
      <p>Battery Charging: {batteryState.BatteryCharging ? "Yes" : "No"}</p>
      <p>State of Charge: {batteryState.USOC}%</p>
      <p>Production: {batteryState.Production_W} W</p>
      <p>
        <span>AUTOPILOT</span>
        <input
          type="checkbox"
          checked={autopilotState.enabled}
          onChange={handleToggleAutopilot}
        />
      </p>
      <p>
        <button onClick={handleCharge} disabled={autopilotState.enabled}>
          CHARGE
        </button>
        <button onClick={handleDischarge} disabled={autopilotState.enabled}>
          DISCHARGE
        </button>
        <button onClick={handleStop} disabled={autopilotState.enabled}>
          STOP
        </button>
      </p>
      <hr />
      <p>Autopilot enabled: {autopilotState.enabled.toString()}</p>
    </div>
  );
}

export default App;
