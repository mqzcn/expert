import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import languageRoutes from "./routes/languages.js";
import bookingRoutes from "./routes/bookings.js";
import interpreterRoutes from "./routes/interpreters.js";
import Language from "./models/Language.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.get("/api/", (req, res) => {
  res.send("Welcome to the API!"); // You can customize this message
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/languages", languageRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/interpreters", interpreterRoutes);
app.use("/api/admin", adminRoutes);

// Connect to MongoDB and initialize languages
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost/expert-language")
  .then(() => {
    console.log("Connected to MongoDB");
    return Language.initializeCommonLanguages();
  })
  .then(() => {
    console.log("Common languages initialized");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Find an available port
const findAvailablePort = async (startPort) => {
  for (let port = startPort; port < startPort + 100; port++) {
    try {
      await new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
          server.close();
          resolve(port);
        });
        server.on("error", reject);
      });
      return port;
    } catch (err) {
      if (err.code !== "EADDRINUSE") throw err;
    }
  }
  throw new Error("No available ports found");
};

// Start server
const startServer = async () => {
  try {
    const port = await findAvailablePort(parseInt(process.env.PORT) || 5000);
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
