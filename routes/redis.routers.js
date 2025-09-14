import { Router } from "express"
import { testRedis, redisAll } from "../controllers/redis.controller.js"

const router = Router()

router.get("/test-redis", testRedis)
router.get("/redis-all", redisAll)

export default router
