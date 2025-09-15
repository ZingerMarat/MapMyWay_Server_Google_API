import { planTrip } from "../services/planner.service.js"
import { getTripPlanByDays } from "../services/gemini.service.js"

/**
 * Controller for trip planning
 * @param {Object} req - Request
 * @param {Object} res - Response
 */
export const planTripController = async (req, res) => {
  try {
    const { origin, destination, mode, preferences, radius, days } = req.body

    // Input validation
    if (!origin || !destination) {
      return res.status(400).json({
        error: "Origin and destination parameters are required",
        code: "MISSING_LOCATIONS",
      })
    }

    if (
      !preferences ||
      (typeof preferences === "object" && Object.keys(preferences).length === 0)
    ) {
      return res.status(400).json({
        error: "Preferences parameter is required and must not be empty",
        code: "MISSING_PREFERENCES",
      })
    }

    // Plan the trip
    const tripPlan = await planTrip(
      origin,
      destination,
      mode || "driving",
      preferences,
      radius || 3000
    )

    // Prepare minimal data for Gemini service (startPoint, endPoint, places)
    const minimalForGemini = {
      startPoint: {
        name: tripPlan.origin,
        coordinates: {
          latitude: tripPlan.startLocation.coordinates.latitude,
          longitude: tripPlan.startLocation.coordinates.longitude,
        },
      },
      endPoint: {
        name: tripPlan.destination,
        coordinates: {
          latitude: tripPlan.endLocation.coordinates.latitude,
          longitude: tripPlan.endLocation.coordinates.longitude,
        },
      },
      days: days || 1,
      places: tripPlan.places.map((p) => ({
        id: p.placeId,
        name: p.name,
        coordinates: {
          latitude: p.coordinates.latitude,
          longitude: p.coordinates.longitude,
        },
        category: p.category.type,
      })),
    }

    // Get Gemini trip plan
    const geminiPlan = await getTripPlanByDays(minimalForGemini).catch((err) => {
      console.error("❌ Gemini send error:", err)
    })

    // object with enriched Gemini plan
    const placesById = Object.fromEntries(tripPlan.places.map((p) => [p.placeId, p]))

    // merge Gemini plan with full place details
    const enrichedGeminiPlan = {
      ...geminiPlan,
      itinerary: geminiPlan.itinerary.map((day) => ({
        ...day,
        categories: day.categories.map((cat) => ({
          ...cat,
          options: cat.options.map((opt) => placesById[opt.id]).filter(Boolean),
        })),
      })),
    }

    const responseWithGemini = {
      tripInfo: {
        origin: tripPlan.origin,
        destination: tripPlan.destination,
        travelMode: tripPlan.route.travelMode,
        searchRadius: tripPlan.searchRadius,
      },
      originInfo: {
        coordinates: {
          latitude: tripPlan.startLocation.coordinates.latitude,
          longitude: tripPlan.startLocation.coordinates.longitude,
        },
        address: tripPlan.startLocation.formattedAddress,
        placeId: tripPlan.startLocation.placeId,
      },
      destinationInfo: {
        coordinates: {
          latitude: tripPlan.endLocation.coordinates.latitude,
          longitude: tripPlan.endLocation.coordinates.longitude,
        },
        address: tripPlan.endLocation.formattedAddress,
        placeId: tripPlan.endLocation.placeId,
      },
      geminiPlan: enrichedGeminiPlan ? enrichedGeminiPlan : "No Gemini plan available",
    }

    console.log("🗺️ Trip places planned:", enrichedGeminiPlan)

    res.json(responseWithGemini)
  } catch (err) {
    console.error("❌ Trip planning error:", err)
    res.status(500).json({
      error: err.message,
      code: "TRIP_PLANNING_ERROR",
    })
  }
}
