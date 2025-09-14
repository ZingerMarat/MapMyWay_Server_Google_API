import { loadMapping } from "../utils/mappingLoader.js"

export const getCategories = (req, res) => {
  const mapping = loadMapping()
  res.json(mapping)
}
