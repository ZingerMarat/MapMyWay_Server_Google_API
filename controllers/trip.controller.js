import { planTrip } from "../services/planner.service.js"

export const planTripController = async (req, res) => {
  try {
    const { origin, destination, mode, preferences, radius } = req.body

    if (!origin || !destination || !preferences) {
      return res.status(400).json({ error: "origin, destination and preferences are required" })
    }

    const result = await planTrip(origin, destination, mode, preferences, radius)

    return res.json(result)
  } catch (err) {
    console.error("❌ planTrip error:", err)
    return res.status(500).json({ error: err.message })
  }
}
