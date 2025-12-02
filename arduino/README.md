# Arduino Setup Guide for ZAPSAFE - GRIDWATCH

This guide explains how to set up the Arduino code to send sensor data (voltage, current, GPS) to the dashboard.

## Hardware Requirements

1. **Arduino Board Options:**
   - ESP32 (recommended - has built-in WiFi)
   - Arduino Uno/Nano with Ethernet Shield
   - Arduino with WiFi Shield

2. **Sensors:**
   - Voltage Sensor (voltage divider circuit)
   - Current Sensor (ACS712 5A or 30A module)
   - GPS Module (optional - NEO-6M or similar)

## Software Setup

### 1. Install Required Libraries

For ESP32:
- WiFi (built-in)
- HTTPClient (built-in)
- ArduinoJson (install from Library Manager)

For Arduino with Ethernet:
- Ethernet (built-in)
- ArduinoJson (install from Library Manager)

For GPS (if using):
- TinyGPS++ (install from Library Manager)

### 2. Configure the Code

1. Open `pole_monitor.ino` in Arduino IDE
2. Uncomment the board you're using:
   ```cpp
   #define ESP32_BOARD
   // or
   // #define ARDUINO_ETHERNET
   ```

3. **For ESP32:**
   - Update WiFi credentials:
     ```cpp
     const char* ssid = "YOUR_WIFI_SSID";
     const char* password = "YOUR_WIFI_PASSWORD";
     ```
   - Update server URL:
     ```cpp
     const char* serverURL = "http://YOUR_SERVER_IP:3000/api/poles/sensor-data";
     ```

4. **For Arduino Ethernet:**
   - Update server IP:
     ```cpp
     IPAddress server(192, 168, 1, 100); // Your server IP
     ```

5. **Set Pole ID:**
   ```cpp
   String POLE_ID = "POLE001"; // Change for each pole
   ```

6. **Adjust Sensor Calibration:**
   - Voltage sensor: Adjust multiplier in `readVoltage()` based on your voltage divider
   - Current sensor: Adjust sensitivity in `readCurrent()` (0.185 for 5A, 0.066 for 30A)

### 3. Upload Code

1. Select your board in Arduino IDE
2. Select the correct port
3. Click Upload

## How It Works

1. **When you save a pole in the dashboard:**
   - The pole is created with ID, latitude, and longitude
   - Arduino should be configured with the same Pole ID

2. **Arduino sends sensor data:**
   - Every 5 seconds, Arduino reads voltage and current
   - Sends data to: `POST /api/poles/sensor-data`
   - Payload: `{ poleId, voltage, current, lat?, lon? }`

3. **Dashboard displays data:**
   - Dashboard polls for updates every 5 seconds
   - Voltage, current, and GPS are displayed in:
     - Map popups
     - Pole table
     - Alerts panel

## API Endpoint

**POST** `/api/poles/sensor-data`

Request body:
```json
{
  "poleId": "POLE001",
  "voltage": 220.5,
  "current": 5.2,
  "lat": 20.5937,
  "lon": 78.9629
}
```

Response:
```json
{
  "success": true,
  "pole": {
    "_id": "...",
    "id": "POLE001",
    "lat": 20.5937,
    "lon": 78.9629,
    "voltage": 220.5,
    "current": 5.2,
    "status": "Normal"
  }
}
```

## Testing

1. Start your server: `cd server && npm start`
2. Upload Arduino code
3. Open Serial Monitor (115200 baud) to see sensor readings
4. Check dashboard - sensor data should appear within 5 seconds

## Troubleshooting

- **WiFi not connecting:** Check SSID and password
- **Server not receiving data:** Verify server URL/IP and port
- **Wrong sensor readings:** Calibrate voltage/current multipliers
- **GPS not working:** Ensure GPS module is connected and has clear sky view

