const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
    console.log(`${req.method} request for '${req.url}'`);
    next(); // Pass control to the next middleware or route handler
});

let batteryState = {
    OperatingMode: "2", // Default to automatic/self-consumption
    BatteryCharging: false,
    USOC: 50, // State of Charge in percentage
    Production_W: 0,
    maxChargingPower: 3500, // Maximum charging power in watts
    chargeSetpoint: 0, // Setpoint for charging in watts
    dischargeSetpoint: 0, // Setpoint for discharging in watts
    currentPowerWh: 0, // Current power in WattHours
    maxPowerWh: 10000 // Maximum power in WattHours
};

// Function to simulate charging/discharging
const simulateCharging = () => {
    const elapsedTime = 5; // Time in seconds
    const chargeRate = (batteryState.BatteryCharging && batteryState.OperatingMode === "1") ? batteryState.chargeSetpoint : 0;
    const dischargeRate = (!batteryState.BatteryCharging && batteryState.OperatingMode === "1") ? batteryState.dischargeSetpoint : 0;

    // Update current power based on charge/discharge rates
    if (chargeRate > 0) {
        batteryState.currentPowerWh = Math.min(batteryState.currentPowerWh + (chargeRate * (elapsedTime / 3600)), batteryState.maxPowerWh);
    } else if (dischargeRate > 0) {
        batteryState.currentPowerWh = Math.max(batteryState.currentPowerWh - (dischargeRate * (elapsedTime / 3600)), 0);
    }
    batteryState.charging = batteryState.charging &&batteryState.currentPowerWh > 0;
    batteryState.discharging = batteryState.discharging && batteryState.currentPowerWh < 0;
};

// Timer to simulate charging/discharging every 5 seconds
setInterval(simulateCharging, 5000);

// Endpoint to get battery status
app.get('/api/v2/status', (req, res) => {
    console.log("Battery status requested");
    res.json(batteryState);
});

// Endpoint to set battery configurations
app.put('/api/v2/configurations', (req, res) => {
    console.log("Battery configurations requested");
    const { EM_OperatingMode } = req.body;
    if (EM_OperatingMode) { 
        batteryState.OperatingMode = EM_OperatingMode;
        batteryState.BatteryCharging = (EM_OperatingMode === "1");
    }
    res.json(batteryState);
});

// Endpoint to set charging power
app.post('/api/v2/setpoint/charge/:watts', (req, res) => {
    console.log("Charging power requested");
    const { watts } = req.params;
    batteryState.BatteryCharging = watts > 0;
    res.json({ message: `Charging set to ${watts} watts` });
});

// Endpoint to set discharge power
app.post('/api/v2/setpoint/discharge/:watts', (req, res) => {
    console.log("Discharge power requested");
    const { watts } = req.params;
    if (watts === "0") {
        batteryState.BatteryCharging = false;
    }
    res.json({ message: `Discharge set to ${watts} watts` });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 