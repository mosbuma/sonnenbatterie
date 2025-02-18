// battery-sim/client/src/App.jsx
import { useState, useEffect } from "react";
import moment from "moment";
import StatusLed from "./components/StatusLed";

//
const UPDATE_INTERVAL = 1000;

// Get API URLs from environment variables
const BATTERY_API =
  import.meta.env.VITE_BATTERY_API_URL || "http://localhost:5001";
const AUTOPILOT_API =
  import.meta.env.VITE_AUTOPILOT_API_URL || "http://localhost:5002";

//
function App() {
  const [batteryState, setBatteryState] = useState({
    OperatingMode: "",
    BatteryCharging: false,
    USOC: 0,
    Production_W: 0,
    ChargingPower_W: 0,
    DischargingPower_W: 0,
  });

  const [autopilotState, setAutopilotState] = useState({
    enabled: false,
    priceInfoProvider: "none",
    priceInfo: [],
  });

  const [timeRunningState, setTimeRunningState] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    battery: "unknown",
    autopilot: "unknown",
  });

  const [currentTime, setCurrentTime] = useState("");

  const [speedup, setSpeedup] = useState(1);

  const [minChargeLevel, setMinChargeLevel] = useState(20);

  //
  useEffect(() => {
    const fetchCurrentTime = async () => {
      try {
        const response = await fetch(`${BATTERY_API}/api/v2/time/current`);
        const result = await response.json();
        setCurrentTime(moment(result.currentTime).format("LLLL"));
      } catch (error) {
        console.error("Error fetching current time:", error);
      } finally {
        setTimeout(fetchCurrentTime, UPDATE_INTERVAL);
      }
    };

    const fetchBatteryState = async () => {
      try {
        const batteryResponse = await fetch(
          `${BATTERY_API}/api/v2/status`
        ).catch(() => ({ ok: false }));
        setApiStatus((prevStatus) => ({
          ...prevStatus,
          battery: batteryResponse.ok ? "online" : "offline",
        }));

        if (!batteryResponse.ok) {
          throw new Error("Battery network response was not ok");
        }

        const batteryData = await batteryResponse.json();
        setBatteryState(batteryData);
      } catch (error) {
        console.error("Error fetching battery state:", error);
      } finally {
        setTimeout(fetchBatteryState, UPDATE_INTERVAL);
      }
    };

    const fetchTimeState = async () => {
      try {
        const timeResponse = await fetch(
          `${BATTERY_API}/api/v2/time/status`
        ).catch(() => ({ ok: false }));

        if (!timeResponse.ok) {
          throw new Error("Time network response was not ok");
        }

        const timeData = await timeResponse.json();
        setTimeRunningState(timeData.running);
      } catch (error) {
        console.error("Error fetching time state:", error);
      }
    };

    const fetchMinChargeLevel = async () => {
      try {
        const response = await fetch(`${BATTERY_API}/api/v2/min-charge-level`);
        const result = await response.json();
        setMinChargeLevel(result.minChargeLevel);
      } catch (error) {
        console.error("Error fetching minimum charge level:", error);
      } finally {
        setTimeout(fetchMinChargeLevel, UPDATE_INTERVAL);
      }
    };

    fetchCurrentTime();
    fetchBatteryState();
    fetchTimeState();
    fetchMinChargeLevel();
  }, []);

  useEffect(() => {
    const fetchAutopilotState = async () => {
      try {
        const autopilotResponse = await fetch(
          `${AUTOPILOT_API}/api/autopilot/v1/status`
        ).catch(() => ({ ok: false }));
        setApiStatus((prevStatus) => ({
          ...prevStatus,
          autopilot: autopilotResponse.ok ? "online" : "offline",
        }));

        if (!autopilotResponse.ok) {
          throw new Error("Autopilot network response was not ok");
        }

        const autopilotData = await autopilotResponse.json();
        setAutopilotState(autopilotData);
      } catch (error) {
        console.error("Error fetching autopilot state:", error);
      } finally {
        setTimeout(fetchAutopilotState, UPDATE_INTERVAL);
      }
    };

    fetchAutopilotState();
  }, []);

  const handleToggleAutopilot = async () => {
    await fetch(
      `${AUTOPILOT_API}/api/autopilot/v1/enable/${!autopilotState.enabled}`,
      {
        method: "POST",
      }
    );
  };

  const handleStartTime = async () => {
    try {
      const response = await fetch(`${BATTERY_API}/api/v2/time/start`, {
        method: "POST",
      });
      const result = await response.json();
      setTimeRunningState(result.running);
    } catch (error) {
      console.error("Error starting time:", error);
    }
  };

  const handleStopTime = async () => {
    try {
      const response = await fetch(`${BATTERY_API}/api/v2/time/stop`, {
        method: "POST",
      });
      const result = await response.json();
      setTimeRunningState(result.running);
    } catch (error) {
      console.error("Error stopping time:", error);
    }
  };

  const handleAdvanceTime = async (hours) => {
    try {
      const response = await fetch(`${BATTERY_API}/api/v2/time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ duration: hours * 3600 }), // Convert hours to seconds
      });
      const result = await response.json();
      setTimeRunningState(result.running); // Update state based on API response
    } catch (error) {
      console.error(`Error advancing time by ${hours} hours:`, error);
    }
  };

  const handleCharge = async () => {
    await fetch(`${BATTERY_API}/api/v2/setpoint/charge/2000`, {
      method: "POST",
    });
  };

  const handleDischarge = async () => {
    await fetch(`${BATTERY_API}/api/v2/setpoint/discharge/2000`, {
      method: "POST",
    });
  };

  const handleStop = async () => {
    await fetch(`${BATTERY_API}/api/v2/setpoint/discharge/0`, {
      method: "POST",
    });
    await fetch(`${BATTERY_API}/api/v2/setpoint/charge/0`, { method: "POST" });
  };

  const handleSpeedupChange = async (newSpeedup) => {
    setSpeedup(newSpeedup);
    try {
      await fetch(`${BATTERY_API}/api/v2/time/speedup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ speedup: newSpeedup }),
      });
    } catch (error) {
      console.error(`Error setting speedup to ${newSpeedup}x:`, error);
    }
  };

  const handleResetEmpty = async () => {
    try {
      await fetch(`${BATTERY_API}/api/v2/reset/empty`, { method: "POST" });
      setBatteryState((prevState) => ({ ...prevState, USOC: 0 })); // Update state to reflect empty charge
      setCurrentTime(moment("2025-01-01T00:00:00").format("LLLL")); // Reset time
    } catch (error) {
      console.error("Error resetting to empty:", error);
    }
  };

  const handleResetFull = async () => {
    try {
      await fetch(`${BATTERY_API}/api/v2/reset/full`, { method: "POST" });
      setBatteryState((prevState) => ({ ...prevState, USOC: 100 })); // Update state to reflect full charge
      setCurrentTime(moment("2025-01-01T00:00:00").format("LLLL")); // Reset time
    } catch (error) {
      console.error("Error resetting to full:", error);
    }
  };

  return (
    <div className="w-screen h-screen border-2 border-red-500 flex flex-col items-center justify-center">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Battery Simulator
        </h1>

        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md relative">
              <StatusLed status={apiStatus.battery} />
              <h2 className="text-xl font-semibold mb-4 text-center">
                Battery Status
              </h2>
              <div className="space-y-2">
                <p className="text-gray-600">Timestamp: {currentTime}</p>
                <p className="text-gray-600">
                  Operating Mode: {batteryState.OperatingMode}
                </p>
                <p className="text-gray-600">
                  Battery Charging:{" "}
                  {batteryState.BatteryCharging ? "Yes" : "No"}
                </p>
                <p className="text-gray-600">
                  State of Charge: {batteryState.USOC}%
                </p>
                <p className="text-gray-600">
                  Minimum Charge Level: {minChargeLevel}%
                </p>
                <p className="text-gray-600">
                  Production: {batteryState.Production_W} W
                </p>
                <p className="text-gray-600">
                  Charging Power: {batteryState.ChargingPower_W} W
                </p>
                <p className="text-gray-600">
                  Discharging Power: {batteryState.DischargingPower_W} W
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-center">
                Simulation Control
              </h2>
              <div className="space-y-4">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={handleStartTime}
                    disabled={timeRunningState}
                    className={`px-4 py-2 rounded-md ${
                      timeRunningState
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    Start Time
                  </button>
                  <button
                    onClick={handleStopTime}
                    disabled={!timeRunningState}
                    className={`px-4 py-2 rounded-md ${
                      !timeRunningState
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                  >
                    Stop Time
                  </button>
                  <button
                    onClick={() => handleAdvanceTime(1)}
                    disabled={timeRunningState}
                    className={`px-4 py-2 rounded-md ${
                      timeRunningState
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    Advance 1 Hour
                  </button>
                  <button
                    onClick={() => handleAdvanceTime(4)}
                    disabled={timeRunningState}
                    className={`px-4 py-2 rounded-md ${
                      timeRunningState
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    Advance 4 Hours
                  </button>
                </div>
                <div className="flex justify-center space-x-2 mt-4">
                  <button
                    onClick={handleResetEmpty}
                    className="px-4 py-2 rounded-md bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Reset Empty
                  </button>
                  <button
                    onClick={handleResetFull}
                    className="px-4 py-2 rounded-md bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Reset Full
                  </button>
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="speedup"
                      value="1"
                      checked={speedup === 1}
                      onChange={() => handleSpeedupChange(1)}
                      className="mr-2"
                    />
                    1x
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="speedup"
                      value="60"
                      checked={speedup === 60}
                      onChange={() => handleSpeedupChange(60)}
                      className="mr-2"
                    />
                    1s = 1min
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="speedup"
                      value="900"
                      checked={speedup === 900}
                      onChange={() => handleSpeedupChange(900)}
                      className="mr-2"
                    />
                    1s = 15min
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="speedup"
                      value="1800"
                      checked={speedup === 1800}
                      onChange={() => handleSpeedupChange(1800)}
                      className="mr-2"
                    />
                    1s = 0.5h
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8 relative">
          <StatusLed status={apiStatus.autopilot} />
          <h2 className="text-xl font-semibold mb-4">Battery Control</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-2 ">
              <span className="text-gray-700 w-16">Auto</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autopilotState.enabled}
                  onChange={handleToggleAutopilot}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <button
                onClick={() => {
                  const s = autopilotState.priceInfo
                    .map(
                      (priceInfo) => `${priceInfo.startsAt} €${priceInfo.price}`
                    )
                    .join("\n");

                  alert(s);
                }}
                disabled={!autopilotState.enabled}
                className={`px-4 py-2 rounded-md ${
                  !autopilotState.enabled
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {autopilotState.priceInfoProvider} Price Info
              </button>
            </div>

            <div className="flex space-x-2 items-center">
              <span className="text-gray-700 w-16">Manual</span>
              <button
                onClick={handleCharge}
                disabled={autopilotState.enabled}
                className={`px-4 py-2 rounded-md ${
                  autopilotState.enabled
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                CHARGE
              </button>
              <button
                onClick={handleDischarge}
                disabled={autopilotState.enabled}
                className={`px-4 py-2 rounded-md ${
                  autopilotState.enabled
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600 text-white"
                }`}
              >
                DISCHARGE
              </button>
              <button
                onClick={handleStop}
                disabled={autopilotState.enabled}
                className={`px-4 py-2 rounded-md ${
                  autopilotState.enabled
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                STOP
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="space-y-2">
            <p className="text-gray-600">
              Autopilot enabled: {autopilotState.enabled.toString()}
            </p>
            <p className="text-gray-600">
              Time simulation running: {timeRunningState.toString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
