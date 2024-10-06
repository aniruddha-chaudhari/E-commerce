import Redis from "ioredis"
import dotenv from "dotenv"
import { Client } from "pg";

dotenv.config()

export default redis = new Redis(process.env.UPSTASH_REDIS_URL);
