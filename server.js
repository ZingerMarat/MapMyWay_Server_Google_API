import express from "express"
import dotenv from "dotenv"

import tripRouter from "./routes/trip.routes.js"

dotenv.config()
const app = express()
app.use(express.json())

app.use("/api/trip", tripRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`))
