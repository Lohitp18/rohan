# Arduino Integration Guide

## Overview

This document explains how the Arduino integration works with the ZAPSAFE - GRIDWATCH dashboard.

## Complete Flow

### 1. Saving a Pole in Dashboard

When you fill the pole form and click "Save":
1. Frontend sends POST request to `/api/poles` with:
   - `id`: Pole ID
   - `lat`: Latitude
   - `lon`: Longitude

2. Backend saves the pole to MongoDB

3. Dashboard displays the new pole on the map and in the table

### 2. Arduino Sending Sensor Data

The Arduino code (`arduino/pole_monitor.ino`) runs continuously and:
1. Reads voltage from analog pin A0
2. Reads current from analog pin A1
3. Reads GPS coordinates (if GPS module is connected)
4. Every 5 seconds, sends POST request to `/api/poles/sensor-data` with:
   ```json
   {
     "poleId": "POLE001",
     "voltage": 220.5,
     "current": 5.2,
     "lat": 20.5937,
     "lon": 78.9629
   }
   ```

### 3. Backend Updating Pole Data

When Arduino sends sensor data:
1. Backend receives POST at `/api/poles/sensor-data`
2. Finds the pole by `poleId`
3. Updates the pole with:
   - `voltage`: Voltage reading
   - `current`: Current reading
   - `lat`: GPS latitude (if provided)
   - `lon`: GPS longitude (if provided)
4. Returns updated pole data

### 4. Dashboard Displaying Sensor Data

The dashboard:
1. Polls `/api/poles` every 5 seconds to get updated data
2. Displays sensor values in:
   - **Map Popups**: Shows voltage, current, GPS coordinates, tilt, and status
   - **Pole Table**: Shows all sensor readings with proper units (V, A, °)
   - **Alerts Panel**: Shows poles with fault status and their sensor readings

## API Endpoints

### POST `/api/poles`
Creates a new pole (called when saving pole form)

**Request:**
```json
{
  "id": "POLE001",
  "lat": 20.5937,
  "lon": 78.9629
}
```

### POST `/api/poles/sensor-data`
Updates pole with Arduino sensor data

**Request:**
```json
{
  "poleId": "POLE001",
  "voltage": 220.5,
  "current": 5.2,
  "lat": 20.5937,
  "lon": 78.9629
}
```

**Response:**
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
    "status": "Normal",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### PUT `/api/poles/:poleId/sensor-data`
Alternative endpoint to update pole sensor data (by pole ID in URL)

**Request:**
```json
{
  "voltage": 220.5,
  "current": 5.2,
  "lat": 20.5937,
  "lon": 78.9629
}
```

## Setup Instructions

### 1. Backend Setup
- Ensure MongoDB is running
- Start server: `cd server && npm start`
- Server runs on port 5000 (or PORT from env)

### 2. Arduino Setup
- Follow instructions in `arduino/README.md`
- Configure WiFi/Ethernet settings
- Set correct Pole ID matching the pole in dashboard
- Set server URL/IP address
- Upload code to Arduino

### 3. Frontend Setup
- Start frontend: `cd client && npm run dev`
- Dashboard automatically polls for updates every 5 seconds

## Testing

1. **Create a pole:**
   - Fill form with Pole ID: "POLE001"
   - Enter latitude and longitude
   - Click "Save"
   - Pole appears on map

2. **Configure Arduino:**
   - Set `POLE_ID = "POLE001"` in Arduino code
   - Upload code
   - Open Serial Monitor to see sensor readings

3. **Verify data flow:**
   - Check Serial Monitor - should see "Sending to server" messages
   - Check dashboard - voltage, current, and GPS should appear within 5 seconds
   - Click on map marker - popup should show sensor values
   - Check table view - sensor values should be displayed

## Troubleshooting

- **Arduino not sending data:** Check WiFi/Ethernet connection, verify server URL
- **Dashboard not showing data:** Check browser console for errors, verify server is running
- **Wrong sensor readings:** Calibrate voltage/current multipliers in Arduino code
- **GPS not updating:** Ensure GPS module has clear sky view, check GPS wiring

