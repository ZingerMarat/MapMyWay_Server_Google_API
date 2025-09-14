import redis from "./utils/redisClient.js"

/**
 * Clear all cached data to force fresh API calls
 */
async function clearCache() {
  try {
    console.log("🗑️ Clearing Redis cache...")
    await redis.flushall()
    console.log("✅ Cache cleared successfully!")
  } catch (error) {
    console.error("❌ Error clearing cache:", error)
  } finally {
    process.exit(0)
  }
}

clearCache()
