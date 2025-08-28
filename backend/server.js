require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/db/db');
const songRoute = require('./src/routes/song.routes');
const authRoute = require('./src/routes/auth.routes');

const app = express();

// ✅ Parse incoming JSON
app.use(express.json());

// ✅ Allowed origins (local + deployed frontend)
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://moody-player-3-01bn.onrender.com',
];

// ✅ Proper CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin (e.g. Postman, curl)
      if (!origin) return callback(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('CORS not allowed for this origin'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ✅ Handle preflight requests globally
app.options('*', cors());

// ✅ Simple health check endpoint
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

// ✅ API routes
app.use('/auth', authRoute);   // Signup, Login routes
app.use('/songs', songRoute);  // Songs routes

// ✅ Connect to MongoDB
connectDB();

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
