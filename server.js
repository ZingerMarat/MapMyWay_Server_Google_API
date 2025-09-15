import express from "express"
import dotenv from "dotenv"

import tripRouter from "./routes/trip.routes.js"
import placesRouter from "./routes/places.routes.js"
import directionsRouter from "./routes/directions.routes.js"
import categoriesRouter from "./routes/categories.routes.js"
import geocodeRouter from "./routes/geocode.routes.js"
import redisRouter from "./routes/redis.routers.js"

dotenv.config()
const app = express()
app.use(express.json())

app.use("/redis", redisRouter)

app.use("/api/trip", tripRouter)
//app.use("/api/geocode", geocodeRouter)
//app.use("/api/directions", directionsRouter)
//app.use("/api/places", placesRouter)
//app.use("/api/categories", categoriesRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`))
