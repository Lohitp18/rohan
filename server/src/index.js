// server/src/index.js  (partial additions / replace telemetry handler)
import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";

import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

import Pole from "./models/Pole.js"; // <-- adjust path if your model is elsewhere

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/zapsafe_gridwatch";

const ARDUINO_PORT = process.env.ARDUINO_PORT || "COM5";
const ARDUINO_BAUD = Number(process.env.ARDUINO_BAUD || 115200);

// threshold in meters to consider a telemetry belongs to a pole
const MATCH_THRESHOLD_M = Number(process.env.POLE_MATCH_THRESHOLD_M || 50);

// haversine distance (meters)
function haversineMeters(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371000; // Earth radius meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// keep last telemetry in memory (existing)
let latestTelemetry = null;

app.get("/api/telemetry/latest", (req, res) => {
  if (!latestTelemetry) return res.status(204).send();
  res.json(latestTelemetry);
});

async function tryMatchAndUpdatePole(io, telemetry) {
  // only match if GPS valid and lat/lng present
  if (!telemetry) return null;
  if (telemetry.gps_valid !== 1 || telemetry.lat == null || telemetry.lng == null) return null;

  // load all poles (if many poles, optimize with geoIndex / geospatial query)
  const poles = await Pole.find({}).lean().exec();
  if (!poles || poles.length === 0) return null;

  // find nearest
  let best = null;
  let bestDist = Infinity;
  for (const p of poles) {
    if (typeof p.lat !== "number" || typeof p.lon !== "number") continue;
    const d = haversineMeters(telemetry.lat, telemetry.lng, p.lat, p.lon);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }

  if (!best) return null;
  if (bestDist > MATCH_THRESHOLD_M) {
    // too far from any pole
    console.log(`Telemetry not matched (nearest ${bestDist.toFixed(1)} m)`);
    return null;
  }

  // Build telemetry record to store
  const now = new Date();
  const telemetryRecord = {
    ...telemetry,
    matchedAt: now,
    matchedDistanceMeters: bestDist,
  };

  // Update the matched pole document (store telemetry under .telemetry)
  const updated = await Pole.findOneAndUpdate(
    { id: best.id }, // use 'id' property; replace with _id or other key if needed
    { $set: { telemetry: telemetryRecord, updatedAt: now } },
    { new: true }
  ).lean().exec();

  if (updated) {
    console.log(`⚡ Updated pole ${updated.id} with telemetry (dist ${bestDist.toFixed(1)} m)`);
    // broadcast updated pole to clients
    io.emit("pole-updated", updated);
  }

  return updated;
}

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Connected to MongoDB");

    const server = http.createServer(app);
    const io = new SocketIOServer(server, {
      cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
    });

    // Serial setup
    const serialPort = new SerialPort({ path: ARDUINO_PORT, baudRate: ARDUINO_BAUD, autoOpen: true });
    const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\n" }));

    serialPort.on("open", () => {
      console.log(`✅ ESP32 serial port opened on ${ARDUINO_PORT} @ ${ARDUINO_BAUD}`);
    });
    serialPort.on("error", (err) => console.error("❌ ESP32 serial error:", err.message));

    // NEW: on full JSON line arrival
    parser.on("data", async (line) => {
      const raw = String(line || "").trim();
      if (!raw) return;
      console.log("📥 From ESP32 (line):", raw);

      try {
        const json = JSON.parse(raw);

        latestTelemetry = {
          voltage: json.voltage,
          current: json.current,
          final_alert: json.final_alert,
          coarse_tilt: json.coarse_tilt,
          minute_tilt: json.minute_tilt,
          horiz_mag: json.horiz_mag,
          acc_x: json.acc_x,
          acc_y: json.acc_y,
          acc_z: json.acc_z,
          gps_valid: json.gps_valid,
          lat: json.lat,
          lng: json.lng,
          receivedAt: new Date(),
        };

        // broadcast raw telemetry to clients
        io.emit("arduino-telemetry", latestTelemetry);

        // try match and update nearest pole (if GPS valid)
        try {
          await tryMatchAndUpdatePole(io, latestTelemetry);
        } catch (err) {
          console.error("Error matching/updating pole:", err);
        }
      } catch (err) {
        console.warn("⚠️ Ignored non-JSON serial line:", raw);
      }
    });

    io.on("connection", (socket) => {
      console.log("🌐 Browser connected:", socket.id);
      if (latestTelemetry) socket.emit("arduino-telemetry", latestTelemetry);
    });

    server.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error("❌ Failed to start server", err);
    process.exit(1);
  }
}

startServer();
