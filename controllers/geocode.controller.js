import { geocodeAddress, getCoordinatesString } from "../services/geocoding.service.js"

/**
 * Controller for address geocoding
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
export const geocode = async (req, res) => {
  try {
    const { address } = req.query
    
    if (!address) {
      return res.status(400).json({ 
        error: "Address parameter is required",
        code: "MISSING_ADDRESS"
      })
    }

    // Geocode the address
    const geocodedAddress = await geocodeAddress(address)
    
    // Form response with clear variable names
    const response = {
      originalAddress: geocodedAddress.originalAddress,
      coordinates: {
        latitude: geocodedAddress.coordinates.latitude,
        longitude: geocodedAddress.coordinates.longitude
      },
      formattedAddress: geocodedAddress.formattedAddress,
      placeId: geocodedAddress.placeId,
      coordinatesString: getCoordinatesString(geocodedAddress)
    }

    res.json(response)
  } catch (err) {
    console.error("❌ Geocoding error:", err)
    res.status(500).json({ 
      error: err.message,
      code: "GEOCODING_ERROR"
    })
  }
}
