import { Router } from "express"
import { getCategories } from "../controllers/categories.controller.js"

const router = Router()

// просто вернуть mapping.json
router.get("/", getCategories)

export default router
