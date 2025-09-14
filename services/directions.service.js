import axios from "axios"
import redis from "../utils/redisClient.js"

export const fetchDirections = async (start, end, mode) => {
  const startStr = `${start.lat},${start.lng}`
  const endStr = `${end.lat},${end.lng}`

  const cacheKey = `direction:${startStr},${endStr},${mode.toLowerCase()}`

  //check redis cache
  const cached = await redis.get(cacheKey)
  if (cached) {
    console.log("⚡ Cache hit:", cacheKey)
    return JSON.parse(cached)
  }

  const url = new URL("https://maps.googleapis.com/maps/api/directions/json")
  url.searchParams.set("origin", startStr)
  url.searchParams.set("destination", endStr)
  url.searchParams.set("mode", mode)
  url.searchParams.set("key", process.env.GOOGLE_API_KEY)

  const { data } = await axios.get(url.toString())

  if (data.status !== "OK") {
    throw new Error(`Directions API error: ${data.status}`)
  }

  const route = data.routes[0]
  const directionData = {
    distance: route.legs[0].distance,
    duration: route.legs[0].duration,
    polyline: route.overview_polyline.points,
    start_location: route.legs[0].start_location,
    end_location: route.legs[0].end_location,
  }

  //set to redis
  await redis.set(cacheKey, JSON.stringify(directionData), "EX", 2592000)
  console.log("📝 Cache set:", cacheKey)

  return directionData
}
