require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/db/db');           // keep your existing path
const songRoute = require('./src/routes/song.routes'); // keep your existing path

const app = express();
const authRoute = require("./src/routes/auth.routes");
app.use("/auth", authRoute);


app.use(express.json());

// ✅ CORS: allow local dev + your deployed frontend
const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'https://moody-player-3-01bn.onrender.com',
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// simple health check
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

// routes
app.use('/songs', songRoute);

// connect DB and start
connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
