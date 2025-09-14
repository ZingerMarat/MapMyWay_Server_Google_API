import axios from "axios"
import redis from "../utils/redisClient.js"

export const geocodeAddress = async (address) => {
  const cacheKey = `geocode:${address.toLowerCase()}`

  //check redis cache
  const cached = await redis.get(cacheKey)
  if (cached) {
    console.log("⚡ Cache hit:", cacheKey)
    return JSON.parse(cached)
  }

  //req to google api
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json")
  url.searchParams.set("address", address)
  url.searchParams.set("key", process.env.GOOGLE_API_KEY)

  const { data } = await axios.get(url.toString())

  if (data.status !== "OK") {
    throw new Error(`Geocoding error: ${data.status} ${data.error_message || ""}`)
  }

  const loc = data.results[0].geometry.location // {lat, lng}
  const result = { lat: loc.lat, lng: loc.lng }

  //set to redis
  await redis.set(cacheKey, JSON.stringify(result), "EX", 2592000)
  console.log("📝 Cache set:", cacheKey)

  return result
}
