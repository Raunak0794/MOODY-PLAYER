require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./src/db/db')
const songRoute = require('./src/routes/song.routes')

const app = express()
app.use(express.json())
app.use(cors()) // ✅ allow frontend to call backend
app.use('/songs', songRoute)

connectDB()

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000")
})
