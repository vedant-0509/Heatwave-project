import { env } from './config.js';
import { HttpError } from './errors.js';
const cache = new Map();
function coordinates(lat, lon) {
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        throw new HttpError(400, 'Invalid latitude or longitude coordinates.');
    }
}
async function request(url) {
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (!response.ok)
            throw new Error(`Open-Meteo returned HTTP ${response.status}`);
        return await response.json();
    }
    catch (error) {
        throw new HttpError(503, error instanceof Error ? error.message : 'Open-Meteo request failed.');
    }
}
function staleValue(key, reason) {
    const cached = cache.get(key);
    if (!cached)
        throw new HttpError(503, `Weather data temporarily unavailable: ${reason}`);
    return {
        ...cached.value,
        data_status: 'stale_cache',
        is_stale: true,
        stale_reason: reason.slice(0, 240),
        last_successful_fetch: cached.value.retrieved_at
    };
}
export async function currentWeather(lat, lon) {
    coordinates(lat, lon);
    const key = `${lat.toFixed(3)},${lon.toFixed(3)}`;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.fetchedAt < env.WEATHER_CACHE_TTL_SECONDS * 1000)
        return cached.value;
    try {
        const data = await request(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,precipitation&wind_speed_unit=kmh&timezone=auto`);
        const current = (data.current ?? {});
        const air = Number(current.temperature_2m);
        const humidity = Number(current.relative_humidity_2m);
        const apparent = Number(current.apparent_temperature);
        const recordedAt = String(current.time ?? '');
        if (![air, humidity, apparent].every(Number.isFinite) || humidity < 0 || humidity > 100 || !recordedAt) {
            throw new Error('Open-Meteo returned incomplete current-weather data.');
        }
        const retrievedAt = new Date().toISOString();
        const value = {
            latitude: typeof data.latitude === 'number' ? data.latitude : lat,
            longitude: typeof data.longitude === 'number' ? data.longitude : lon,
            air_temp_celsius: air,
            relative_humidity_pct: humidity,
            apparent_temperature_celsius: apparent,
            heat_index_celsius: null,
            wind_speed_kmh: Number(current.wind_speed_10m ?? 0),
            precipitation_mm: Number(current.precipitation ?? 0),
            recorded_at: recordedAt,
            data_source: 'Open-Meteo Forecast API (weather-model data)',
            is_demo_data: false,
            data_status: 'current_api',
            is_stale: false,
            retrieved_at: retrievedAt,
            last_successful_fetch: retrievedAt,
            timezone: String(data.timezone ?? 'unknown'),
            stale_reason: null
        };
        cache.set(key, { fetchedAt: Date.now(), value });
        return value;
    }
    catch (error) {
        if (error instanceof HttpError && !cache.has(key))
            throw error;
        return staleValue(key, error instanceof Error ? error.message : 'Unknown provider error.');
    }
}
export async function historicalWeather(lat, lon, pastDays) {
    coordinates(lat, lon);
    if (!Number.isInteger(pastDays) || pastDays < 7 || pastDays > 92) {
        throw new HttpError(400, 'past_days must be between 7 and 92.');
    }
    const data = await request(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&past_days=${pastDays}&forecast_days=1&daily=temperature_2m_max,apparent_temperature_max,precipitation_sum&timezone=Asia%2FKolkata`);
    const daily = (data.daily ?? {});
    const dates = Array.isArray(daily.time) ? daily.time : [];
    const temps = Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max : [];
    const apparent = Array.isArray(daily.apparent_temperature_max) ? daily.apparent_temperature_max : [];
    const points = dates.flatMap((date, index) => {
        const air = Number(temps[index]);
        const feelsLike = Number(apparent[index]);
        if (!Number.isFinite(air) || !Number.isFinite(feelsLike))
            return [];
        return [{
                date: String(date),
                air_temp_celsius: air,
                apparent_temperature_celsius: feelsLike,
                lst_mean_celsius: null,
                is_demo_data: false,
                source: 'Open-Meteo daily weather-model data',
                data_status: 'api_success',
                lst_status: 'unavailable: this weather endpoint does not provide satellite land-surface temperature',
                timezone: 'Asia/Kolkata'
            }];
    });
    return { total_days: points.length, points, is_demo_data: false };
}
