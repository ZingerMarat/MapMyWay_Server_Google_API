import { fetchDirectionsLegacy } from "../services/directions.service.js"
import { createCoordinates } from "../models/index.js"

/**
 * Controller for getting route between two points
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
export const getDirections = async (req, res) => {
  try {
    const { start, end, mode } = req.body
    
    // Input validation
    if (!start || !end) {
      return res.status(400).json({ 
        error: "Start and end parameters are required",
        code: "MISSING_COORDINATES"
      })
    }

    if (!start.lat || !start.lng || !end.lat || !end.lng) {
      return res.status(400).json({ 
        error: "Coordinates must contain lat and lng",
        code: "INVALID_COORDINATES"
      })
    }

    // Get route (using legacy function for backward compatibility)
    const route = await fetchDirectionsLegacy(start, end, mode || "driving")
    
    // Form response with clear variable names
    const response = {
      route: {
        distance: {
          text: route.distance.text,
          value: route.distance.value
        },
        duration: {
          text: route.duration.text,
          value: route.duration.value
        },
        polyline: route.polyline,
        travelMode: route.travelMode
      },
      startLocation: {
        coordinates: {
          latitude: route.startLocation.coordinates.latitude,
          longitude: route.startLocation.coordinates.longitude
        },
        address: route.startLocation.formattedAddress
      },
      endLocation: {
        coordinates: {
          latitude: route.endLocation.coordinates.latitude,
          longitude: route.endLocation.coordinates.longitude
        },
        address: route.endLocation.formattedAddress
      }
    }

    res.json(response)
  } catch (err) {
    console.error("❌ Directions error:", err)
    res.status(500).json({ 
      error: err.message,
      code: "DIRECTIONS_ERROR"
    })
  }
}
