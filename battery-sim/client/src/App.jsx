// battery-sim/client/src/App.jsx
import { useState, useEffect } from 'react';

function App() {
    const [batteryState, setBatteryState] = useState({
        OperatingMode: '',
        BatteryCharging: false,
        USOC: 0,
        Production_W: 0
    });

    useEffect(() => {
        const fetchBatteryState = async () => {
            try {
                const response = await fetch('/api/v2/status');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setBatteryState(data);
            } catch (error) {
                console.error('Error fetching battery state:', error);
            }
        };

        fetchBatteryState();
        const interval = setInterval(fetchBatteryState, 5000); // Refresh every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const handleCharge = async () => {
        await fetch('/api/v2/setpoint/charge/2000', { method: 'POST' });
    };

    const handleDischarge = async () => {
        await fetch('/api/v2/setpoint/discharge/2000', { method: 'POST' });
    };

    const handleStop = async () => {
        await fetch('/api/v2/setpoint/discharge/0', { method: 'POST' });
        await fetch('/api/v2/setpoint/charge/0', { method: 'POST' });
    };

    return (
        <div>
            <h1>Battery Simulator</h1>
            <p>Operating Mode: {batteryState.OperatingMode}</p>
            <p>Battery Charging: {batteryState.BatteryCharging ? 'Yes' : 'No'}</p>
            <p>State of Charge: {batteryState.USOC}%</p>
            <p>Production: {batteryState.Production_W} W</p>
            <div>
                <button onClick={handleCharge}>CHARGE</button>
                <button onClick={handleDischarge}>DISCHARGE</button>
                <button onClick={handleStop}>STOP</button>
            </div>
        </div>
    );
}

export default App;