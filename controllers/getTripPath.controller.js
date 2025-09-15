import { buildTripPath } from "../services/getTripPath.service.js"

export const getTripPathController = async (req, res) => {
  //     {
  //   "origin": {
  //     "latitude": 41.6938026,
  //     "longitude": 44.80151679999999
  //   },
  //   "destination": {
  //     "latitude": 41.6460978,
  //     "longitude": 41.64049
  //   },
  //   "waypoints": [
  //     {
  //       "latitude": 41.6891795,
  //       "longitude": 44.8036152
  //     },
  //     {
  //       "latitude": 41.88838579999999,
  //       "longitude": 44.70756550000001
  //     },
  //     {
  //       "latitude": 42.1003064,
  //       "longitude": 43.05851549999999
  //     },
  //     {
  //       "latitude": 41.8180646,
  //       "longitude": 41.7745763
  //     },
  //     {
  //       "latitude": 41.6633509,
  //       "longitude": 41.6820748
  //     }
  //   ]
  // }

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
