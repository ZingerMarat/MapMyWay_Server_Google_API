import axios from "axios"
import { createGeocodedAddress, createCoordinates, coordinatesToString } from "../models/index.js"

/**
 * Geocodes an address to coordinates using Google Geocoding API
 * @param {string} address - Address to geocode
 * @returns {Promise<GeocodedAddress>} Geocoded address with coordinates
 */
export const geocodeAddress = async (address) => {
  const cacheKey = `geocode:${address.toLowerCase()}`

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

  // No caching: always return fresh data

  return geocodedAddress
}

/**
 * Geocodes multiple addresses in parallel
 * @param {string[]} addresses - Array of addresses to geocode
 * @returns {Promise<GeocodedAddress[]>} Array of geocoded addresses
 */
export const geocodeMultipleAddresses = async (addresses) => {
  const geocodingPromises = addresses.map((address) => geocodeAddress(address))
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
