import mongoose from "mongoose";

const poleSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
    tilt: Number,
    voltage: Number,
    current: Number,
    status: {
      type: String,
      default: "Normal",
      enum: ["Normal", "Fault", "Maintenance"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Pole || mongoose.model("Pole", poleSchema);


