import redis from "../utils/redisClient.js"

export const testRedis = async (req, res) => {
  try {
    await redis.set("hello", "world", "EX", 2592000) // 30 days
    const value = await redis.get("hello")
    res.json({ redis: value })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const redisAll = async (req, res) => {
  const keys = await redis.keys("*")
  const values = {}
  for (const key of keys) {
    values[key] = await redis.get(key)
  }
  res.json(values)
}
