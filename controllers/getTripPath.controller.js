import { buildTripPath } from "../services/getTripPath.service.js"

export const getTripPathController = async (req, res) => {
  try {
    const { origin, destination, waypoints } = req.body

    // Input validation
    if (!origin || !destination || !Array.isArray(waypoints)) {
      return res.status(400).json({
        error: "Origin, destination, and waypoints must be provided",
        code: "MISSING_PARAMETERS",
      })
    }

    // Get final trip plan with daily breakdown
    const tripPath = await buildTripPath(origin, destination, waypoints)

    return res.status(200).json({ tripPath })
  } catch (error) {
    console.error("Error in getTripPathController:", error)
    return res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    })
  }
}
