import { searchPlacesOnRoute } from "../services/places.service.js"

export const getPlacesOnRoute = async (req, res) => {
  try {
    const { polyline, categories, radius } = req.body

    if (!polyline || !categories) {
      return res.status(400).json({ error: "polyline and categories are required" })
    }

    // categories ожидаем в формате:
    // [ { type: "museum" }, { type: "restaurant", keyword: "georgian" } ]

    const results = await searchPlacesOnRoute(polyline, categories, radius || 3000)

    return res.json({
      checkpoints: results.length,
      places: results,
    })
  } catch (err) {
    console.error("❌ getPlacesOnRoute error:", err)
    return res.status(500).json({ error: err.message })
  }
}
