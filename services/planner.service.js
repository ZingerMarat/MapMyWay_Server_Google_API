import { geocodeAddress, geocodeMultipleAddresses } from "./geocoding.service.js"
import { fetchDirections, getRoutePolyline } from "./directions.service.js"
import { searchPlacesOnRoute } from "./places.service.js"
import { getCategories } from "../utils/mappingLoader.js"
import { 
  createTripPlan,
  createUserPreferences,
  createPlaceCategory
} from "../models/index.js"

/**
 * Plans a trip from start to end point with search for interesting places along the route
 * @param {string} origin - Start point (e.g., "Tbilisi")
 * @param {string} destination - End point (e.g., "Batumi")
 * @param {string} travelMode - Travel mode (driving, walking, bicycling)
 * @param {UserPreferences} preferences - User preferences
 * @param {number} searchRadius - Search radius for places in meters (default 3000)
 * @returns {Promise<TripPlan>} Trip plan
 */
export const planTrip = async (origin, destination, travelMode, preferences = {}, searchRadius = 3000) => {
  try {
    // 1. Geocoding start and end points
    console.log("📍 Geocoding addresses...")
    const [startLocation, endLocation] = await geocodeMultipleAddresses([origin, destination])
    
    // Debug: Check if geocoding returned valid data
    console.log("📍 Start location:", startLocation)
    console.log("📍 End location:", endLocation)
    
    if (!startLocation || !startLocation.coordinates || !startLocation.coordinates.latitude) {
      throw new Error(`Invalid start location data: ${JSON.stringify(startLocation)}`)
    }
    if (!endLocation || !endLocation.coordinates || !endLocation.coordinates.latitude) {
      throw new Error(`Invalid end location data: ${JSON.stringify(endLocation)}`)
    }

    // 2. Building route
    console.log("🛣️ Building route...")
    const route = await fetchDirections(startLocation, endLocation, travelMode)
    const polylineString = getRoutePolyline(route)

    // 3. Mapping user preferences to Google Places categories
    console.log("🏷️ Processing user preferences...")
    const userPreferences = createUserPreferences(preferences)
    const placeCategories = mapPreferencesToCategories(userPreferences)

    // 4. Searching places along the route
    console.log("🔍 Searching places along route...")
    const placesSearchResult = await searchPlacesOnRoute(polylineString, placeCategories, searchRadius)

    // 5. Creating final trip plan
    const tripPlan = createTripPlan(
      origin,
      destination,
      startLocation,
      endLocation,
      route,
      placesSearchResult.places,
      userPreferences,
      searchRadius
    )

    console.log("🗺️ Trip plan created:", {
      origin: tripPlan.origin,
      destination: tripPlan.destination,
      totalPlaces: tripPlan.places.length,
      searchRadius: tripPlan.searchRadius
    })

    return tripPlan
  } catch (error) {
    console.error("❌ Error planning trip:", error)
    throw new Error(`Failed to plan trip: ${error.message}`)
  }
}

/**
 * Maps user preferences to Google Places categories
 * @param {UserPreferences} preferences - User preferences
 * @returns {PlaceCategory[]} Array of categories to search for
 */
const mapPreferencesToCategories = (preferences) => {
  const categories = []
  
  // Process activity preferences
  if (preferences.activities && preferences.activities.length > 0) {
    const activityCategories = getCategories("activities", preferences.activities)
    categories.push(...activityCategories.map(cat => createPlaceCategory(cat.type, cat.keyword)))
  }
  
  // Process food preferences
  if (preferences.food && preferences.food.length > 0) {
    const foodCategories = getCategories("food", preferences.food)
    categories.push(...foodCategories.map(cat => createPlaceCategory(cat.type, cat.keyword)))
  }

  return categories
}

/**
 * Plans a trip with additional parameters
 * @param {Object} tripRequest - Trip planning request
 * @param {string} tripRequest.origin - Start point
 * @param {string} tripRequest.destination - End point
 * @param {string} tripRequest.mode - Travel mode
 * @param {UserPreferences} tripRequest.preferences - User preferences
 * @param {number} tripRequest.radius - Search radius
 * @returns {Promise<TripPlan>} Trip plan
 */
export const planTripAdvanced = async (tripRequest) => {
  const { origin, destination, mode, preferences, radius } = tripRequest
  
  return planTrip(origin, destination, mode, preferences, radius)
}

/**
 * Gets trip summary information
 * @param {TripPlan} tripPlan - Trip plan
 * @returns {Object} Summary information
 */
export const getTripSummary = (tripPlan) => {
  return {
    origin: tripPlan.origin,
    destination: tripPlan.destination,
    distance: tripPlan.route.distance,
    duration: tripPlan.route.duration,
    totalPlaces: tripPlan.places.length,
    searchRadius: tripPlan.searchRadius,
    travelMode: tripPlan.route.travelMode
  }
}

/**
 * Filters places by category
 * @param {TripPlan} tripPlan - Trip plan
 * @param {string} categoryType - Category type to filter by
 * @returns {Place[]} Filtered places
 */
export const filterPlacesByCategory = (tripPlan, categoryType) => {
  return tripPlan.places.filter(place => place.category.type === categoryType)
}
