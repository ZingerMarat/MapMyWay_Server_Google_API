import axios from "axios"
import { loadMapping } from "../utils/mappingLoader.js"
import polyline from "@mapbox/polyline"
import redis from "../utils/redisClient.js"

const mapping = loadMapping()

/**
 * Search for nearby places using Google Places API
 * @param {string} location "lat,lng"
 * @param {object} category { type: "museum" } or { type: "restaurant", keyword: "georgian" }
 * @param {number} radius in meters (max 50000)
 * @returns array of places
 */
export const searchNearbyPlaces = async (location, category, radius) => {
  const cacheKey = `places:${location}:${category.type}:${category.keyword || ""}:${radius}`

  //check redis cache
  const cached = await redis.get(cacheKey)
  if (cached) {
    console.log("⚡ Cache hit:", cacheKey)
    return JSON.parse(cached)
  }

  //req to google api
  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json")
  url.searchParams.set("location", location)
  url.searchParams.set("radius", radius)
  url.searchParams.set("type", category.type)
  if (category.keyword) url.searchParams.set("keyword", category.keyword)
  url.searchParams.set("key", process.env.GOOGLE_API_KEY)

  const { data } = await axios.get(url.toString())

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Places error: ${data.status} ${data.error_message || ""}`)
  }

  const places = data.results.slice(0, 3).map((p) => ({
    place_id: p.place_id,
    name: p.name,
    location: p.geometry?.location,
    address: p.vicinity,
    rating: p.rating,
    price_level: p.price_level,
    opening_hours: p.opening_hours,
    types: p.types,
    // photo_url: p.photos?.[0]
    //   ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${p.photos[0].photo_reference}&key=`
    //   : null,
  }))

  await redis.set(cacheKey, JSON.stringify(places), "EX", 2592000) //30 days
  console.log("📝 Cache set:", cacheKey)

  return places
}

/**
 * Search for places along the route (polyline)
 * @param {string} polylineStr Polyline from Directions API
 * @param {array} categories [{ type: "museum" }, { type: "restaurant", keyword: "georgian" }]
 * @param {number} radius radius around each point (default 3000 m)
 * @returns array of places
 */
export const searchPlacesOnRoute = async (polylineStr, categories, radius = 1000) => {
  const categoriesKey = categories.map((c) => c.type + (c.keyword || "")).join("+")
  const cacheKey = `placesOnRoute:${categoriesKey}:${polylineStr}`

  //check redis cache
  const cached = await redis.get(cacheKey)
  if (cached) {
    console.log("⚡ Cache hit:", cacheKey)
    return JSON.parse(cached)
  }

  // Decode the polyline into an array of points
  const points = polyline.decode(polylineStr) // [[lat, lng], ...]
  const totalPoints = points.length

  // Calculate step to get approximately 10 points along the route
  const step = Math.max(1, Math.floor(totalPoints / 10))
  const checkpoints = points.filter((_, i) => i % step === 0)

  const results = []

  for (const [lat, lng] of checkpoints) {
    for (const category of categories) {
      const nearby = await searchNearbyPlaces(`${lat},${lng}`, category, radius)
      results.push(...nearby)
    }
  }

  // Remove duplicates by place_id
  const unique = {}
  results.forEach((p) => {
    unique[p.place_id] = p
  })

  const finalResults = Object.values(unique)

  // Store in Redis for 30 days
  await redis.set(cacheKey, JSON.stringify(finalResults), "EX", 2592000) //30 days
  console.log("📝 Cache set:", cacheKey)

  return finalResults
}
