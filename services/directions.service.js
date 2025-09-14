import axios from "axios"
import redis from "../utils/redisClient.js"
import { 
  createRoute,
  createDistanceInfo,
  createDurationInfo,
  createGeocodedAddress,
  createCoordinates,
  coordinatesToString
} from "../models/index.js"

/**
 * Gets route between two points using Google Directions API
 * @param {GeocodedAddress} startLocation - Start point
 * @param {GeocodedAddress} endLocation - End point
 * @param {string} travelMode - Travel mode (driving, walking, bicycling)
 * @returns {Promise<Route>} Route information
 */
export const fetchDirections = async (startLocation, endLocation, travelMode) => {
  const startCoordinatesString = coordinatesToString(startLocation.coordinates)
  const endCoordinatesString = coordinatesToString(endLocation.coordinates)

  const cacheKey = `direction:${startCoordinatesString},${endCoordinatesString},${travelMode.toLowerCase()}`

  // Check Redis cache
  const cached = await redis.get(cacheKey)
  if (cached) {
    console.log("⚡ Cache hit:", cacheKey)
    const cachedData = JSON.parse(cached)
    
    // Check if cached data has the new structure
    if (cachedData.startLocation && cachedData.startLocation.coordinates && 
        cachedData.startLocation.coordinates.latitude !== undefined) {
      return cachedData
    }
    
    // If old format, we need to fetch fresh data
    console.log("🔄 Cached data in old format, fetching fresh data")
  }

  // Request to Google Directions API
  const url = new URL("https://maps.googleapis.com/maps/api/directions/json")
  url.searchParams.set("origin", startCoordinatesString)
  url.searchParams.set("destination", endCoordinatesString)
  url.searchParams.set("mode", travelMode)
  url.searchParams.set("key", process.env.GOOGLE_API_KEY)

  const { data } = await axios.get(url.toString())

  if (data.status !== "OK") {
    throw new Error(`Directions API error: ${data.status}`)
  }

  const route = data.routes[0]
  const leg = route.legs[0]

  // Create typed objects for distance and duration
  const distanceInfo = createDistanceInfo(leg.distance.text, leg.distance.value)
  const durationInfo = createDurationInfo(leg.duration.text, leg.duration.value)

  // Create geocoded addresses for route start and end points
  const routeStartLocation = createGeocodedAddress(
    startLocation.originalAddress,
    createCoordinates(leg.start_location.lat, leg.start_location.lng),
    leg.start_address
  )

  const routeEndLocation = createGeocodedAddress(
    endLocation.originalAddress,
    createCoordinates(leg.end_location.lat, leg.end_location.lng),
    leg.end_address
  )

  // Create typed route object
  const routeData = createRoute(
    distanceInfo,
    durationInfo,
    route.overview_polyline.points,
    routeStartLocation,
    routeEndLocation,
    travelMode
  )

  // Save to Redis
  await redis.set(cacheKey, JSON.stringify(routeData), "EX", 2592000)
  console.log("📝 Cache set:", cacheKey)

  return routeData
}

/**
 * Gets route between coordinates (backward compatibility)
 * @param {Object} start - Object with coordinates {lat, lng}
 * @param {Object} end - Object with coordinates {lat, lng}
 * @param {string} mode - Travel mode
 * @returns {Promise<Route>} Route information
 * @deprecated Use fetchDirections with GeocodedAddress objects
 */
export const fetchDirectionsLegacy = async (start, end, mode) => {
  const startLocation = createGeocodedAddress(
    "Unknown",
    createCoordinates(start.lat, start.lng)
  )
  
  const endLocation = createGeocodedAddress(
    "Unknown", 
    createCoordinates(end.lat, end.lng)
  )

  return fetchDirections(startLocation, endLocation, mode)
}

/**
 * Gets route polyline
 * @param {Route} route - Route object
 * @returns {string} Route polyline
 */
export const getRoutePolyline = (route) => {
  return route.polyline
}

/**
 * Gets route distance information
 * @param {Route} route - Route object
 * @returns {Object} Distance information
 */
export const getRouteDistance = (route) => {
  return route.distance
}

/**
 * Gets route duration information
 * @param {Route} route - Route object
 * @returns {Object} Duration information
 */
export const getRouteDuration = (route) => {
  return route.duration
}
