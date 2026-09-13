import "dotenv/config";
import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", () => {
  // Redis unavailable.
});

redisClient.on("ready", () => {
  console.log("Redis connected");
});

export default redisClient;
