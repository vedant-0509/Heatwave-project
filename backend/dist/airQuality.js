import { env } from './config.js';
import { HttpError } from './errors.js';
function validateCoordinates(lat, lon) {
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        throw new HttpError(400, 'Invalid latitude or longitude coordinates.');
    }
}
export async function currentAirQuality(lat, lon) {
    validateCoordinates(lat, lon);
    if (env.OPENAQ_ENABLED !== 'true' || !env.OPENAQ_API_KEY) {
        return {
            latitude: lat, longitude: lon, radius_meters: env.OPENAQ_RADIUS_METERS,
            measurements: [], data_source: 'OpenAQ v3', data_status: 'unavailable',
            is_demo_data: false, retrieved_at: new Date().toISOString(),
            message: 'OpenAQ is not configured. Set OPENAQ_ENABLED=true and OPENAQ_API_KEY in backend/.env.'
        };
    }
    const params = new URLSearchParams({
        coordinates: `${lat.toFixed(4)},${lon.toFixed(4)}`,
        radius: String(env.OPENAQ_RADIUS_METERS),
        limit: '10',
        page: '1'
    });
    try {
        const response = await fetch(`https://api.openaq.org/v3/locations?${params}`, {
            headers: { 'X-API-Key': env.OPENAQ_API_KEY },
            signal: AbortSignal.timeout(8000)
        });
        if (!response.ok)
            throw new Error(`OpenAQ returned HTTP ${response.status}`);
        const body = await response.json();
        const locations = body.results ?? [];
        const location = locations
            .map((item) => {
            const coordinates = item.coordinates;
            const locationLat = Number(coordinates?.latitude);
            const locationLon = Number(coordinates?.longitude);
            return {
                item,
                distance: Number.isFinite(locationLat) && Number.isFinite(locationLon)
                    ? Math.hypot(locationLat - lat, locationLon - lon)
                    : Number.POSITIVE_INFINITY
            };
        })
            .sort((a, b) => a.distance - b.distance)[0]?.item;
        const locationId = Number(location?.id);
        if (!Number.isInteger(locationId)) {
            return {
                latitude: lat, longitude: lon, radius_meters: env.OPENAQ_RADIUS_METERS,
                measurements: [], data_source: 'OpenAQ v3 latest location measurements',
                data_status: 'current_api', is_demo_data: false,
                retrieved_at: new Date().toISOString(),
                message: 'No OpenAQ monitoring station was found within the configured radius.'
            };
        }
        const latestResponse = await fetch(`https://api.openaq.org/v3/locations/${locationId}/latest`, {
            headers: { 'X-API-Key': env.OPENAQ_API_KEY },
            signal: AbortSignal.timeout(8000)
        });
        if (!latestResponse.ok)
            throw new Error(`OpenAQ returned HTTP ${latestResponse.status} for location ${locationId}`);
        const latestBody = await latestResponse.json();
        const sensors = Array.isArray(location?.sensors) ? location.sensors : [];
        const measurements = (latestBody.results ?? []).flatMap((item) => {
            const sensor = sensors.find((candidate) => Number(candidate.id) === Number(item.sensorsId));
            const parameter = sensor?.parameter;
            const date = item.datetime;
            const value = Number(item.value);
            if (!parameter || !Number.isFinite(value) || !date?.utc)
                return [];
            return [{
                    parameter: String(parameter.name ?? parameter.displayName ?? 'unknown'),
                    value,
                    unit: String(parameter.units ?? ''),
                    measured_at: String(date.utc),
                    location: typeof location?.name === 'string' ? location.name : null
                }];
        });
        return {
            latitude: lat, longitude: lon, radius_meters: env.OPENAQ_RADIUS_METERS,
            measurements, data_source: 'OpenAQ v3 latest station measurements',
            data_status: 'current_api', is_demo_data: false,
            retrieved_at: new Date().toISOString()
        };
    }
    catch (error) {
        throw new HttpError(503, error instanceof Error ? error.message : 'OpenAQ request failed.');
    }
}
