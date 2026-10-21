import fs from 'node:fs/promises';
import { env, geojsonPath, metricsPath } from './config.js';
import { Ward } from './models/Ward.js';
import { HttpError } from './errors.js';
let metricsCache;
async function readJsonFile(filePath) {
    try {
        return JSON.parse(await fs.readFile(filePath, 'utf8'));
    }
    catch {
        throw new HttpError(404, `Dataset file not found or invalid: ${filePath}`);
    }
}
export async function getMetrics() {
    if (env.USE_MONGODB === 'true') {
        const records = await Ward.find({}, { _id: 0, ward_id: 1, data: 1 }).lean();
        return Object.fromEntries(records.map((record) => [record.ward_id, record.data]));
    }
    if (!metricsCache)
        metricsCache = await readJsonFile(metricsPath);
    return metricsCache;
}
export async function getGeoJson() {
    return readJsonFile(geojsonPath);
}
export function clearDataCache() {
    metricsCache = undefined;
}
