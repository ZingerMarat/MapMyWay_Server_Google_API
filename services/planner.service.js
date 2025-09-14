import { geocodeAddress } from "./geocoding.service.js"
import { fetchDirections } from "./directions.service.js"
import { searchPlacesOnRoute } from "./places.service.js"
import { getCategories } from "../utils/mappingLoader.js"

/**
 * Plan a trip from origin to destination, finding places of interest along the route.
 * @param {string} origin Start name/address (e.g. "Tbilisi")
 * @param {string} destination End name/address (e.g. "Batumi")
 * @param {string} mode Travel mode (driving, walking, etc.)
 * @param {object} preferences Object with groups from mapping.json (e.g. { food: [...], activities: [...] })
 * @param {number} radius Radius to search for places (default 3000 m)
 */
export const planTrip = async (origin, destination, mode, preferences = {}, radius = 3000) => {
  // 1. Геокодинг
  const start = await geocodeAddress(origin)
  const end = await geocodeAddress(destination)

  // 2. Построение маршрута
  const directions = await fetchDirections(start, end, mode)
  const polylineStr = directions.polyline

  // 3. Маппим preferences → категории Google из mapping.json

  let categories = []
  for (const [group, keys] of Object.entries(preferences)) {
    categories = [...categories, ...getCategories(group, keys)]
  }

  // 4. Поиск мест вдоль маршрута
  const places = await searchPlacesOnRoute(polylineStr, categories, radius)

  // 5. Возвращаем результат
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
