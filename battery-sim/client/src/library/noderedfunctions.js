export class SonnenAPI {
    constructor(sonnen_ip, sonnen_token) {
        this.sonnen_ip = sonnen_ip;
        this.sonnen_token = sonnen_token;
    }

    getStatusRequest() {
        const endpoint = "/api/v2/status";
        return {
            url: `http://${this.sonnen_ip}${endpoint}`,
            method: "GET",
            headers: {
                'Auth-Token': this.sonnen_token
            }
        };
    }

    setModeRequest(desiredMode) {
        const endpoint = "/api/v2/configurations";
        if (typeof desiredMode !== 'undefined') {
            return {
                url: `http://${this.sonnen_ip}${endpoint}`,
                method: "PUT",
                headers: {
                    'Auth-Token': this.sonnen_token
                },
                payload: { "EM_OperatingMode": desiredMode }
            };
        } else {
            console.warn("Mode Set called without mode msg.batteryMode");
            return null;
        }
    }

    chargeBatteryRequest(watts) {
        const endpoint = `/api/v2/setpoint/charge/${watts}`;
        return {
            url: `http://${this.sonnen_ip}${endpoint}`,
            method: "POST",
            headers: {
                'Auth-Token': this.sonnen_token
            },
            payload: {}
        };
    }

    stopChargingRequest() {
        const endpoint = "/api/v2/setpoint/charge/0";
        return {
            url: `http://${this.sonnen_ip}${endpoint}`,
            method: "POST",
            headers: {
                'Auth-Token': this.sonnen_token
            },
            payload: {}
        };
    }

    dischargeBatteryRequest() {
        const endpoint = "/api/v2/setpoint/discharge/0";
        return {
            url: `http://${this.sonnen_ip}${endpoint}`,
            method: "POST",
            headers: {
                'Auth-Token': this.sonnen_token
            },
            payload: {}
        };
    }

    logSBStatus(status) {
        console.log("Sonnen Battery Status:");
        console.log(`Operating Mode: ${status.OperatingMode}`);
        console.log(`Remaining Capacity (Wh): ${status.RemainingCapacity_Wh}`);
        console.log(`State of Charge (SoC): ${status.USOC}`);
        console.log(`Battery Charging: ${status.BatteryCharging}`);
        console.log(`Error Code: ${status.ErrorCode}`);
    }

    checkSoC(currentSoC, desiredSoC) {
        if (currentSoC < desiredSoC) {
            console.log(`Current SoC (${currentSoC}) is less than Desired SoC (${desiredSoC}).`);
            return true; // Indicate that charging is needed
        } else {
            console.log(`Current SoC (${currentSoC}) is sufficient.`);
            return false; // Indicate that charging is not needed
        }
    }

    amICharging(status) {
        return status.BatteryCharging; // Returns true if the battery is charging
    }

    calcChargedWh(currentSoC, previousSoC, batteryCapacityWh) {
        const chargedWh = (currentSoC - previousSoC) * (batteryCapacityWh / 100);
        console.log(`Charged Wh: ${chargedWh}`);
        return chargedWh; // Returns the amount of energy charged in watt-hours
    }

    dischargeControlOn(status) {
        return status.OperatingMode === "2"; // Assuming "2" means automatic mode
    }

    calculateDischargeCost(currentPrice, chargedWh, conversionLossFactor) {
        const effectiveChargedWh = chargedWh * conversionLossFactor; // Adjust for losses
        const dischargeCost = currentPrice * effectiveChargedWh; // Cost calculation
        console.log(`Discharge Cost: ${dischargeCost}`);
        return dischargeCost; // Returns the cost of discharging in currency
    }

    shouldIDischarge(currentSoC, desiredSoC, currentPrice, batteryPrice, surplus) {
        if (currentSoC > desiredSoC && currentPrice > batteryPrice) {
            console.log("Discharging allowed.");
            return true; // Indicate that discharging is allowed
        } else {
            console.log("Discharging not allowed.");
            return false; // Indicate that discharging is not allowed
        }
    }

    // collectInfo(status) {
    //     const tibber_today = global.get("tibber_today");
    //     const tibber_tomorrow = global.get("tibber_tomorrow");
    //     const cheapHours = flow.get("cheapHours");
    //     const conversion_loss_factor = flow.get("conversion_loss_factor");
    //     const maxPrice = flow.get("maxPrice");
    //     const sonnen_discharge_control = flow.get("sonnen_discharge_control");

    //     const chargeLog = global.get("chargeLog");

    //     const currentSoc = status.USOC; // Assuming status contains the SoC
    //     const operatingMode = status.OperatingMode;

    //     const currentProduction = status.Production_W; // Assuming status contains production data
    //     const currentConsumption = status.Consumption_W; // Assuming status contains consumption data
    //     const surplus = currentProduction - currentConsumption;

    //     let dcTableRows = "";

    //     if (sonnen_discharge_control) {
    //         dcTableRows = `<tr><td>Current Surplus</td><td>${surplus}</td></tr>
    //                        <tr><td>Current Tibber Price</td><td>${flow.get("dcCurrentPrice")}</td></tr>
    //                        <tr><td>Battery Price (incl. loss)</td><td>${flow.get("dcBatteryPrice")}</td></tr>
    //                        <tr><td colspan=2>${flow.get("dcStatus")}</td></tr>`;
    //     }

    //     return {
    //         chargeLog: JSON.stringify(chargeLog),
    //         cheapHours: JSON.stringify(cheapHours),
    //         currentSoc: currentSoc,
    //         currentProduction: currentProduction,
    //         currentConsumption: currentConsumption,
    //         operatingMode: operatingMode,
    //         tibber_today: JSON.stringify(tibber_today),
    //         tibber_tomorrow: JSON.stringify(tibber_tomorrow),
    //         tibber_all: JSON.stringify(tibber_today.concat(tibber_tomorrow)),
    //         displayMode: (operatingMode == "1" ? "Manual / API controlled" :
    //                       operatingMode == "2" ? "Automatic (Self-Consumption)" :
    //                       "Unknown Mode"),
    //         displayDischargeControl: (sonnen_discharge_control) ? "on" : "off",
    //         dcBatteryPrice: flow.get("dcBatteryPrice"),
    //         dcCurrentPrice: flow.get("dcCurrentPrice"),
    //         dcStatus: flow.get("dcStatus"),
    //         dcTableRows: dcTableRows
    //     };
    // }
}