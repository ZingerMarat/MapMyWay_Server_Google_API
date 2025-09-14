import axios from "axios"
import redis from "../utils/redisClient.js"
import { 
  createGeocodedAddress, 
  createCoordinates,
  coordinatesToString 
} from "../models/index.js"

/**
 * Geocodes an address to coordinates using Google Geocoding API
 * @param {string} address - Address to geocode
 * @returns {Promise<GeocodedAddress>} Geocoded address with coordinates
 */
export const geocodeAddress = async (address) => {
  const cacheKey = `geocode:${address.toLowerCase()}`

  // Check Redis cache
  const cached = await redis.get(cacheKey)
  if (cached) {
    console.log("⚡ Cache hit:", cacheKey)
    const cachedData = JSON.parse(cached)
    
    // Check if cached data has the new structure
    if (cachedData.coordinates && cachedData.coordinates.latitude !== undefined) {
      return cachedData
    }
    
    // Convert old format to new format if needed
    if (cachedData.lat !== undefined && cachedData.lng !== undefined) {
      console.log("🔄 Converting cached data to new format")
      return createGeocodedAddress(
        address,
        createCoordinates(cachedData.lat, cachedData.lng),
        cachedData.formattedAddress || null,
        cachedData.placeId || null
      )
    }
    
    return cachedData
  }

  // Request to Google API
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json")
  url.searchParams.set("address", address)
  url.searchParams.set("key", process.env.GOOGLE_API_KEY)

  const { data } = await axios.get(url.toString())

  if (data.status !== "OK") {
    throw new Error(`Geocoding error: ${data.status} ${data.error_message || ""}`)
  }

  const result = data.results[0]
  const location = result.geometry.location
  
  // Create typed geocoded address object
  const geocodedAddress = createGeocodedAddress(
    address,
    createCoordinates(location.lat, location.lng),
    result.formatted_address,
    result.place_id
  )

  // Save to Redis
  await redis.set(cacheKey, JSON.stringify(geocodedAddress), "EX", 2592000)
  console.log("📝 Cache set:", cacheKey)

  return geocodedAddress
}

/**
 * Geocodes multiple addresses in parallel
 * @param {string[]} addresses - Array of addresses to geocode
 * @returns {Promise<GeocodedAddress[]>} Array of geocoded addresses
 */
export const geocodeMultipleAddresses = async (addresses) => {
  const geocodingPromises = addresses.map(address => geocodeAddress(address))
  return Promise.all(geocodingPromises)
}

/**
 * Gets coordinates from geocoded address in string format for API
 * @param {GeocodedAddress} geocodedAddress - Geocoded address
 * @returns {string} Coordinate string in "lat,lng" format
 */
export const getCoordinatesString = (geocodedAddress) => {
  return coordinatesToString(geocodedAddress.coordinates)
}
