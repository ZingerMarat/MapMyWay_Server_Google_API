import { Router } from "express"
import { testRedis, redisAll } from "../controllers/redis.controller.js"
import redis from "../utils/redisClient.js"

const router = Router()

router.get("/test-redis", testRedis)
router.get("/redis-all", redisAll)
router.get("/delete-all", async (req, res) => {
  try {
    await redis.flushall()
    res.json({ message: "All keys deleted" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
