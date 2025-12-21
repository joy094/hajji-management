// ======================================
// Hajji Management System - Backend Entry
// ======================================

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes.js";

dotenv.config();

const app = express();

/* ===========================
   Middleware
=========================== */
app.use(cors());
app.use(express.json());

/* ===========================
   Routes
=========================== */
app.use("/api", routes);

/* ===========================
   MongoDB Connection
=========================== */
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hajji_management";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
  });

/* ===========================
   Server Start
=========================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
