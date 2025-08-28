const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./src/db/db");
const songRoute = require("./src/routes/song.routes");
const authRoute = require("./src/routes/auth.routes");

const app = express();

app.use(express.json());

// ✅ Allow both localhost & deployed frontend
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://moody-player-3-01bn.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// ✅ Handle preflight requests
app.options("*", cors());

// ✅ Health check route
app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

// ✅ Routes
app.use("/songs", songRoute);
app.use("/auth", authRoute);

// ✅ Connect DB and start server
connectDB();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
