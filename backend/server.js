require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./src/db/db')
const songRoute = require('./src/routes/song.routes')

const app = express()
app.use(express.json())
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://moody-player-3-01bn.onrender.com'
  ],
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true, 
  allowedHeaders: ['Content-Type','Authorization'],
})) // ✅ allow frontend to call backend
app.use('/songs', songRoute)

connectDB()

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000")
})
