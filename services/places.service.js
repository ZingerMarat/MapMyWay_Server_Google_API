import axios from "axios"
import { loadMapping } from "../utils/mappingLoader.js"
import polyline from "@mapbox/polyline"
import redis from "../utils/redisClient.js"
import { 
  createPlace,
  createPlaceCategory,
  createCoordinates,
  createPlacesSearchResult,
  coordinatesToString
} from "../models/index.js"

const mapping = loadMapping()

/**
 * Search for places near a specified point using Google Places API
 * @param {string} locationString - Coordinate string in "lat,lng" format
 * @param {PlaceCategory} category - Place category to search for
 * @param {number} radius - Search radius in meters (maximum 50000)
 * @returns {Promise<Place[]>} Array of found places
 */
export const searchNearbyPlaces = async (locationString, category, radius) => {
  const cacheKey = `places:${locationString}:${category.type}:${category.keyword || ""}:${radius}`

  // Check Redis cache
  const cached = await redis.get(cacheKey)
  if (cached) {
    console.log("⚡ Cache hit:", cacheKey)
    const cachedData = JSON.parse(cached)
    
    // Check if cached data has the new structure
    if (Array.isArray(cachedData) && cachedData.length > 0 && 
        cachedData[0].coordinates && cachedData[0].coordinates.latitude !== undefined) {
      return cachedData
    }
    
    // If old format, we need to fetch fresh data
    console.log("🔄 Cached data in old format, fetching fresh data")
  }

  // Request to Google Places API
  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json")
  url.searchParams.set("location", locationString)
  url.searchParams.set("radius", radius)
  url.searchParams.set("type", category.type)
  if (category.keyword) url.searchParams.set("keyword", category.keyword)
  url.searchParams.set("key", process.env.GOOGLE_API_KEY)

  const { data } = await axios.get(url.toString())

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Places error: ${data.status} ${data.error_message || ""}`)
  }

  // Create typed place objects
  const places = data.results.slice(0, 3).map((placeData) => {
    const coordinates = createCoordinates(
      placeData.geometry?.location.lat || 0,
      placeData.geometry?.location.lng || 0
    )

    const additionalInfo = {
      rating: placeData.rating,
      priceLevel: placeData.price_level,
      openingHours: placeData.opening_hours,
      types: placeData.types
    }

    return createPlace(
      placeData.place_id,
      placeData.name,
      coordinates,
      placeData.vicinity,
      category,
      additionalInfo
    )
  })

  // Save to Redis
  await redis.set(cacheKey, JSON.stringify(places), "EX", 2592000)
  console.log("📝 Cache set:", cacheKey)

  return places
}

/**
 * Search for places along a route (polyline)
 * @param {string} polylineString - Polyline from Directions API
 * @param {PlaceCategory[]} categories - Array of categories to search for
 * @param {number} radius - Search radius around each point (default 1000 m)
 * @returns {Promise<PlacesSearchResult>} Places search result
 */
export const searchPlacesOnRoute = async (polylineString, categories, radius = 1000) => {
  const categoriesKey = categories.map((c) => c.type + (c.keyword || "")).join("+")
  const cacheKey = `placesOnRoute:${categoriesKey}:${polylineString}`

  // Check Redis cache
  const cached = await redis.get(cacheKey)
  if (cached) {
    console.log("⚡ Cache hit:", cacheKey)
    const cachedData = JSON.parse(cached)
    
    // Check if cached data has the new structure
    if (cachedData.places && Array.isArray(cachedData.places) && 
        cachedData.places.length > 0 && cachedData.places[0].coordinates && 
        cachedData.places[0].coordinates.latitude !== undefined) {
      return cachedData
    }
    
    // If old format, we need to fetch fresh data
    console.log("🔄 Cached data in old format, fetching fresh data")
  }

  // Decode polyline into array of points
  const points = polyline.decode(polylineString) // [[lat, lng], ...]
  const totalPoints = points.length

  // Calculate step to get approximately 10 points along the route
  const step = Math.max(1, Math.floor(totalPoints / 10))
  const checkpoints = points.filter((_, i) => i % step === 0)

  const allPlaces = []

  // Search places for each route point and each category
  for (const [latitude, longitude] of checkpoints) {
    const locationString = coordinatesToString(createCoordinates(latitude, longitude))
    
    for (const category of categories) {
      const nearbyPlaces = await searchNearbyPlaces(locationString, category, radius)
      allPlaces.push(...nearbyPlaces)
    }
  }

  // Remove duplicates by place_id
  const uniquePlaces = {}
  allPlaces.forEach((place) => {
    uniquePlaces[place.placeId] = place
  })

  const finalPlaces = Object.values(uniquePlaces)

  // Create typed search result
  const searchResult = createPlacesSearchResult(
    checkpoints.length,
    finalPlaces,
    categories
  )

  // Save to Redis
  await redis.set(cacheKey, JSON.stringify(searchResult), "EX", 2592000)
  console.log("📝 Cache set:", cacheKey)

  return searchResult
}

/**
 * Search for places near coordinates
 * @param {Coordinates} coordinates - Coordinates to search
 * @param {PlaceCategory} category - Place category
 * @param {number} radius - Search radius in meters
 * @returns {Promise<Place[]>} Array of found places
 */
export const searchPlacesNearCoordinates = async (coordinates, category, radius) => {
  const locationString = coordinatesToString(coordinates)
  return searchNearbyPlaces(locationString, category, radius)
}

/**
 * Search for places by multiple categories at one point
 * @param {Coordinates} coordinates - Coordinates to search
 * @param {PlaceCategory[]} categories - Array of categories
 * @param {number} radius - Search radius in meters
 * @returns {Promise<Place[]>} Array of found places
 */
export const searchPlacesByCategories = async (coordinates, categories, radius) => {
  const locationString = coordinatesToString(coordinates)
  const allPlaces = []

  for (const category of categories) {
    const places = await searchNearbyPlaces(locationString, category, radius)
    allPlaces.push(...places)
  }

  // Remove duplicates
  const uniquePlaces = {}
  allPlaces.forEach((place) => {
    uniquePlaces[place.placeId] = place
  })

  return Object.values(uniquePlaces)
}
