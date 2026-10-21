import fs from 'node:fs/promises';

import { env, geojsonPath, metricsPath } from './config.js';
import { Ward } from './models/Ward.js';
import { HttpError } from './errors.js';
import type { WardRecord } from './types.js';

let metricsCache: Record<string, WardRecord> | undefined;

async function readJsonFile<T>(filePath: string): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8')) as T;
  } catch {
    throw new HttpError(404, `Dataset file not found or invalid: ${filePath}`);
  }
}

export async function getMetrics(): Promise<Record<string, WardRecord>> {
  if (env.USE_MONGODB === 'true') {
    const records = await Ward.find({}, { _id: 0, ward_id: 1, data: 1 }).lean();
    return Object.fromEntries(records.map((record) => [record.ward_id, record.data as WardRecord]));
  }
  if (!metricsCache) metricsCache = await readJsonFile<Record<string, WardRecord>>(metricsPath);
  return metricsCache;
}

export async function getGeoJson(): Promise<unknown> {
  return readJsonFile<unknown>(geojsonPath);
}

export function clearDataCache(): void {
  metricsCache = undefined;
}
