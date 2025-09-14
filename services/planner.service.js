import { geocodeAddress } from "./geocoding.service.js"
import { fetchDirections } from "./directions.service.js"
import { searchPlacesOnRoute } from "./places.service.js"
import { mapCategory } from "../utils/mappingLoader.js"

const mapPreferencesToCategories = (preferences) => {
  const categories = []

  for (const pref of preferences) {
    // ищем в activities
    if (mapping.activities[pref]) categories.push(mapping.activities[pref])
    // ищем в food
    else if (mapping.food[pref]) categories.push(mapping.food[pref])
  }

  return categories
}

/**
 * Plan a trip from origin to destination, finding places of interest along the route.
 * @param {string} origin Start name/address (e.g. "Tbilisi")
 * @param {string} destination End name/address (e.g. "Batumi")
 * @param {Array} categories [{ type: "museum" }, { type:"restaurant", keyword:"georgian" }]
 * @param {number} radius Radius to search for places (default 3000 m)
 */
export const planTrip = async (origin, destination, mode, preferences, radius = 3000) => {
  // get lat/lng for origin and destination
  const start = await geocodeAddress(origin)
  const end = await geocodeAddress(destination)

  // create directions (route) from origin to destination
  const directions = await fetchDirections(start, end, mode)

  const polylineStr = directions.polyline

  // search for places along the route
  console.log("Preferences:", preferences)

  const categories = preferences
    .map((pref) => mapCategory("activities", pref) || mapCategory("food", pref))
    .filter(Boolean)
  console.log("🔍 Mapped preferences to categories:", categories)

  const places = await searchPlacesOnRoute(polylineStr, categories, radius)

  const tripOptions = {
    origin,
    destination,
    start,
    end,
    polyline: polylineStr,
    places,
  }
  console.log("🗺️ Trip options:", tripOptions)

  return tripOptions
}
