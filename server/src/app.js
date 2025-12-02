import express from "express";
import cors from "cors";
import morgan from "morgan";

import poleRoutes from "./routes/poleRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : "*",
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.use("/api/poles", poleRoutes);
app.use("/api/auth", authRoutes);

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong",
  });
});

export default app;


