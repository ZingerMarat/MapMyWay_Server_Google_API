import { fetchDirections } from "../services/directions.service.js"

export const getDirections = async (req, res) => {
  try {
    const { start, end, mode } = req.body
    //mode is "driving", "walking", "bicycling"
    if (!start || !end) {
      return res.status(400).json({ error: "start and end needed" })
    }

    const directions = await fetchDirections(start, end, mode)
    res.json(directions)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
