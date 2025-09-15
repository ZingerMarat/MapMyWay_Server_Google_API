import axios from "axios"
import { loadMapping } from "../utils/mappingLoader.js"
import polyline from "@mapbox/polyline"
import {
  createPlace,
  createPlaceCategory,
  createCoordinates,
  createPlacesSearchResult,
  coordinatesToString,
} from "../models/index.js"

const mapping = loadMapping()

/** Fetch detailed place information from Google Places API
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object>} Detailed place information
 */
const fetchPlaceDetails = async (placeId) => {
  const cacheKey = `placeDetails:${placeId}`

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json")
  url.searchParams.set("place_id", placeId)
  url.searchParams.set("key", process.env.GOOGLE_API_KEY)

  const { data } = await axios.get(url.toString())

  if (data.status !== "OK") {
    throw new Error(`Place Details error: ${data.status} ${data.error_message || ""}`)
  }

  // No caching - always fetch fresh place details

  return data.result
}

/**
 * Search for places near a specified point using Google Places API
 * @param {string} locationString - Coordinate string in "lat,lng" format
 * @param {PlaceCategory} category - Place category to search for
 * @param {number} radius - Search radius in meters (maximum 50000)
 * @returns {Promise<Place[]>} Array of found places
 */
export const searchNearbyPlaces = async (locationString, category, radius) => {
  const cacheKey = `places:${locationString}:${category.type}:${category.keyword || ""}:${radius}`

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
  const places = await Promise.all(
    data.results.slice(0, 3).map(async (placeData) => {
      const details = await fetchPlaceDetails(placeData.place_id)

      const coordinates = createCoordinates(
        placeData.geometry?.location.lat || 0,
        placeData.geometry?.location.lng || 0
      )

      const photoUrl = details.photos?.[0]
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${details.photos[0].photo_reference}&key=${process.env.GOOGLE_API_KEY}`
        : null

      return createPlace(
        placeData.place_id,
        placeData.name,
        coordinates,
        placeData.vicinity,
        category,
        {
          summary: details.editorial_summary?.overview || "",
          openingHours: details.opening_hours.periods,
          phone: details.international_phone_number,
          website: details.website,
          url: details.url,
          rating: details.rating,
          types: details.types,
          photo: photoUrl,
        }
      )
    })
  )

  // No caching - always return fresh places

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

  // Decode polyline into array of points
  const points = polyline.decode(polylineString) // [[lat, lng], ...]
  const totalPoints = points.length

  // Calculate step to get approximately 5 points along the route
  const step = Math.max(1, Math.floor(totalPoints / 5))
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
  const searchResult = createPlacesSearchResult(checkpoints.length, finalPlaces, categories)

  // No caching - always return fresh search results

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
