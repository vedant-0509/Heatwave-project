import 'dotenv/config';
import dns from 'node:dns';
import path from 'node:path';
import { z } from 'zod';
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(8000),
    MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/urbanheat'),
    FRONTEND_ORIGINS: z.string().default('http://localhost:5173,http://127.0.0.1:5173'),
    WEATHER_CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(600),
    USE_MONGODB: z.enum(['true', 'false']).default('false'),
    MONGODB_DNS_SERVERS: z.string().default('1.1.1.1,8.8.8.8'),
    JWT_SECRET: z.string().min(32).default('urbanheat-development-secret-change-me-32'),
    OPENAQ_ENABLED: z.enum(['true', 'false']).default('false'),
    OPENAQ_API_KEY: z.string().optional(),
    OPENAQ_RADIUS_METERS: z.coerce.number().int().min(1000).max(25000).default(15000),
    NASA_ENABLED: z.enum(['true', 'false']).default('false'),
    NASA_EARTHDATA_TOKEN: z.string().optional()
});
export const env = envSchema.parse(process.env);
dns.setServers(env.MONGODB_DNS_SERVERS.split(',').map((server) => server.trim()).filter(Boolean));
export const projectRoot = path.resolve(process.cwd(), '..');
export const dataRoot = path.resolve(projectRoot, 'data');
export const metricsPath = path.join(dataRoot, 'mumbai_satellite_ward_metrics.json');
export const geojsonPath = path.join(dataRoot, 'mcgm_wards.geojson');
export const frontendOrigins = env.FRONTEND_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);
