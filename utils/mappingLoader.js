import fs from "fs"

export const loadMapping = () => {
  const raw = fs.readFileSync("mapping.json", "utf-8")
  return JSON.parse(raw)
}

/**
 * Map a category key to its mapping value for a given group.
 * @param {string} group "activities" or "food"
 * @param {string} key Category key (e.g. "museum", "vegan")
 * @returns {object|null} Mapping value or null if not found
 */

export const getCategories = (group, keys) => {
  const mapping = loadMapping()
  if (!mapping[group]) return []
  return keys.map((k) => mapping[group][k]).filter(Boolean)
}
