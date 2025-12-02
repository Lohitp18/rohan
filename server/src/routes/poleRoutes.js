import express from "express";
import Pole from "../models/Pole.js";

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const poles = await Pole.find().sort({ createdAt: -1 });
    res.json(poles);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { id, lat, lon, tilt, voltage, current, status } = req.body;

    if (id === undefined || lat === undefined || lon === undefined) {
      return res
        .status(400)
        .json({ message: "id, lat, and lon are required fields." });
    }

    const parsedLat = Number(lat);
    const parsedLon = Number(lon);

    if (Number.isNaN(parsedLat) || Number.isNaN(parsedLon)) {
      return res.status(400).json({ message: "lat and lon must be numbers." });
    }

    const pole = await Pole.create({
      id: String(id),
      lat: parsedLat,
      lon: parsedLon,
      tilt: tilt === undefined ? undefined : Number(tilt),
      voltage: voltage === undefined ? undefined : Number(voltage),
      current: current === undefined ? undefined : Number(current),
      status,
    });

    res.status(201).json(pole);
  } catch (error) {
    if (error.code === 11000) {
      error.status = 409;
      error.message = "Pole ID already exists.";
    }
    next(error);
  }
});

router.get("/:poleId", async (req, res, next) => {
  try {
    const pole = await Pole.findOne({ id: req.params.poleId });
    if (!pole) {
      return res.status(404).json({ message: "Pole not found" });
    }
    res.json(pole);
  } catch (error) {
    next(error);
  }
});

// Endpoint to update pole with Arduino sensor data
router.put("/:poleId/sensor-data", async (req, res, next) => {
  try {
    const { voltage, current, lat, lon } = req.body;
    const { poleId } = req.params;

    const updateData = {};
    if (voltage !== undefined) updateData.voltage = Number(voltage);
    if (current !== undefined) updateData.current = Number(current);
    if (lat !== undefined) updateData.lat = Number(lat);
    if (lon !== undefined) updateData.lon = Number(lon);

    const pole = await Pole.findOneAndUpdate(
      { id: poleId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!pole) {
      return res.status(404).json({ message: "Pole not found" });
    }

    res.json(pole);
  } catch (error) {
    next(error);
  }
});

// Endpoint for Arduino to send sensor data (by pole ID)
router.post("/sensor-data", async (req, res, next) => {
  try {
    const { poleId, voltage, current, lat, lon } = req.body;

    if (!poleId) {
      return res.status(400).json({ message: "poleId is required" });
    }

    const updateData = {};
    if (voltage !== undefined) updateData.voltage = Number(voltage);
    if (current !== undefined) updateData.current = Number(current);
    if (lat !== undefined) updateData.lat = Number(lat);
    if (lon !== undefined) updateData.lon = Number(lon);

    const pole = await Pole.findOneAndUpdate(
      { id: String(poleId) },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!pole) {
      return res.status(404).json({ message: "Pole not found" });
    }

    res.json({ success: true, pole });
  } catch (error) {
    next(error);
  }
});

export default router;

