import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { z } from 'zod';

import { frontendOrigins } from './config.js';
import { getGeoJson, getMetrics } from './dataStore.js';
import { errorMessage, HttpError } from './errors.js';
import { mlSummary, simulate } from './analytics.js';
import { currentWeather, historicalWeather } from './weather.js';
import { currentAirQuality } from './airQuality.js';
import { databaseReady } from './database.js';
import { login, register, requireAuth, requireRole, type AuthenticatedRequest } from './auth.js';

const simulationSchema = z.object({
  ward_id: z.string().min(1).max(64),
  delta_ndvi: z.number().min(-1).max(1),
  delta_ndbi: z.number().min(-1).max(1),
  base_lst: z.number().finite(), base_ndvi: z.number().min(0).max(1), base_ndbi: z.number().min(0).max(1),
  base_pop_density: z.number().nonnegative(), base_hvi: z.number().min(0).max(100)
});
const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(8).max(200) });
const wardSelectionSchema = z.object({ ward_ids: z.array(z.string().min(1).max(64)).min(1).max(24) });

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: frontendOrigins }));
app.use(express.json({ limit: '32kb' }));
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

app.get('/api/v1/health', async (_req, res) => {
  const metrics = await getMetrics();
  res.json({
    status: 'online',
    platform: 'UrbanHeat Mumbai',
    version: '3.1.0-node-transparency',
    weather_integration: 'Open-Meteo weather-model API; may be unavailable or stale',
    ward_surface_temperature: 'Bundled demo value or unvalidated heuristic; never satellite-observed LST in this data path',
    ward_environmental_inputs: 'Static/demo dataset unless separately verified',
    satellite_pipeline: 'not implemented/verified; satellite observations unavailable',
    ml_engine: 'Rule-based archetypes and illustrative sensitivity; validation scores unavailable',
    cached_locations_count: 0,
    wards_loaded: Object.keys(metrics).length
  });
});
app.get('/api/v1/ready', async (_req, res) => {
  try {
    if (!databaseReady()) return res.status(503).json({ status: 'not_ready', data: false });
    await getMetrics();
    res.json({ status: 'ready', data: true });
  } catch { res.status(503).json({ status: 'not_ready', data: false }); }
});
app.post('/api/v1/auth/register', async (req, res, next) => {
  try { const payload = credentialsSchema.parse(req.body); res.status(201).json(await register(payload.email, payload.password)); } catch (error) { next(error); }
});
app.post('/api/v1/auth/login', async (req, res, next) => {
  try { const payload = credentialsSchema.parse(req.body); res.json(await login(payload.email, payload.password)); } catch (error) { next(error); }
});
app.get('/api/v1/auth/me', requireAuth, (req: AuthenticatedRequest, res) => { res.json({ user: req.user }); });
app.get('/api/v1/wards/geojson', async (_req, res, next) => { try { res.json(await getGeoJson()); } catch (error) { next(error); } });
app.get('/api/v1/wards/metrics', async (_req, res, next) => { try { res.json(await getMetrics()); } catch (error) { next(error); } });
app.get('/api/v1/wards/live-metrics', async (_req, res, next) => { try { res.json(await getMetrics()); } catch (error) { next(error); } });
app.post('/api/v1/wards/refresh-live', async (_req, res, next) => { try { res.json(await getMetrics()); } catch (error) { next(error); } });
app.post('/api/v1/admin/wards/refresh', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try { res.json({ status: 'complete', records: Object.keys(await getMetrics()).length, message: 'Static/demo ward source reloaded. No satellite provider is configured.' }); } catch (error) { next(error); }
});
app.post('/api/v1/users/saved-wards', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { ward_ids } = wardSelectionSchema.parse(req.body);
    const { User } = await import('./models/User.js');
    const user = await User.findByIdAndUpdate(req.user?.id, { savedWards: ward_ids }, { new: true, select: 'email role savedWards' }).lean();
    if (!user) throw new HttpError(404, 'User account not found.');
    res.json({ saved_wards: user.savedWards });
  } catch (error) { next(error); }
});
app.post('/api/v1/wards/compare', async (req, res, next) => {
  try {
    const { ward_ids } = wardSelectionSchema.parse(req.body);
    const metrics = await getMetrics();
    const wards = ward_ids.map((id) => metrics[id]).filter((ward): ward is NonNullable<typeof ward> => Boolean(ward));
    if (wards.length !== ward_ids.length) throw new HttpError(404, 'One or more requested wards were not found.');
    res.json({ wards, ranking: [...wards].sort((a, b) => b.hvi_score - a.hvi_score).map((ward) => ({ ward_id: ward.ward_id, ward_name: ward.ward_name, hvi_score: ward.hvi_score, risk_tier: ward.risk_tier })) });
  } catch (error) { next(error); }
});
app.get('/api/v1/wards/recommendations/:wardId', async (req, res, next) => {
  try {
    const ward = (await getMetrics())[req.params.wardId];
    if (!ward) throw new HttpError(404, 'Ward not found.');
    const recommendations = [];
    if (ward.ndvi_mean < 0.25) recommendations.push({ intervention: 'Urban canopy increase', reason: 'Low NDVI indicates limited vegetation.', expected_effect: 'Illustrative reduction in surface-temperature sensitivity.', priority: 'high' });
    if (ward.ndbi_mean > 0.68) recommendations.push({ intervention: 'Cool roofs and reflective surfaces', reason: 'High NDBI indicates dense built-up surface.', expected_effect: 'Illustrative reduction in built-surface heat contribution.', priority: 'high' });
    if (ward.population_density > 45000) recommendations.push({ intervention: 'Shaded public cooling spaces', reason: 'High population field increases exposure.', expected_effect: 'Reduce exposure during heat events.', priority: 'medium' });
    if (!recommendations.length) recommendations.push({ intervention: 'Maintain existing canopy and monitoring', reason: 'No dominant single factor was identified.', expected_effect: 'Preserve current thermal buffer.', priority: 'medium' });
    res.json({ ward_id: ward.ward_id, data_status: 'illustrative_recommendations', validated: false, recommendations });
  } catch (error) { next(error); }
});
app.get('/api/v1/alerts', async (_req, res, next) => {
  try {
    const wards = Object.values(await getMetrics()).filter((ward) => ward.hvi_score >= 75);
    res.json({ generated_at: new Date().toISOString(), data_status: 'demo_alerts', alerts: wards.map((ward) => ({ severity: 'high', ward_id: ward.ward_id, ward_name: ward.ward_name, hvi_score: ward.hvi_score, message: `${ward.ward_name} has an extreme baseline heat-risk score.`, source: 'Bundled demo ward metrics', is_demo_data: true })) });
  } catch (error) { next(error); }
});
app.get('/api/v1/reports/wards.csv', async (_req, res, next) => {
  try {
    const rows = Object.values(await getMetrics());
    const header = 'ward_id,ward_name,hvi_score,risk_tier,lst_mean_celsius,ndvi_mean,ndbi_mean,population_density';
    const csv = [header, ...rows.map((ward) => [ward.ward_id, JSON.stringify(ward.ward_name), ward.hvi_score, ward.risk_tier, ward.lst_mean_celsius, ward.ndvi_mean, ward.ndbi_mean, ward.population_density].join(','))].join('\n');
    res.type('text/csv').setHeader('Content-Disposition', 'attachment; filename="urbanheat-wards.csv"').send(csv);
  } catch (error) { next(error); }
});
app.get('/api/v1/satellite/lst/status', (_req, res) => {
  res.json({
    provider: 'unconfigured',
    status: 'unavailable',
    observations_available: false,
    message: 'Satellite LST ingestion is not configured. Ward surface-temperature-like values remain bundled demo data.'
  });
});
app.get('/api/v1/satellite/lst', (_req, res) => {
  res.json({
    status: 'unavailable',
    data: null,
    message: 'Satellite observations are unavailable until a verified ingestion provider is configured.'
  });
});
app.get('/api/v1/ml/summary', async (_req, res, next) => { try { res.json(mlSummary(Object.values(await getMetrics()))); } catch (error) { next(error); } });
app.get('/api/v1/ml/clusters', async (_req, res, next) => { try { res.json(mlSummary(Object.values(await getMetrics())).clustering); } catch (error) { next(error); } });
app.post('/api/v1/ml/simulate', async (req, res, next) => {
  try {
    const payload = simulationSchema.parse(req.body);
    const summary = mlSummary(Object.values(await getMetrics()));
    res.json(simulate(payload, summary.regression.coefficients));
  } catch (error) { next(error); }
});
app.get('/api/v1/weather/current', async (req, res, next) => {
  try { res.json(await currentWeather(Number(req.query.lat ?? 19.076), Number(req.query.lon ?? 72.8777))); } catch (error) { next(error); }
});
app.get('/api/v1/weather/historical', async (req, res, next) => {
  try { res.json(await historicalWeather(Number(req.query.lat ?? 19.076), Number(req.query.lon ?? 72.8777), Number(req.query.past_days ?? 30))); } catch (error) { next(error); }
});
app.get('/api/v1/air-quality/current', async (req, res, next) => {
  try { res.json(await currentAirQuality(Number(req.query.lat ?? 19.076), Number(req.query.lon ?? 72.8777))); } catch (error) { next(error); }
});
app.use((_req, _res, next) => next(new HttpError(404, 'Route not found.')));
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status = error instanceof z.ZodError ? 422 : error instanceof HttpError ? error.statusCode : 500;
  const message = error instanceof z.ZodError ? 'Invalid request payload.' : error instanceof HttpError ? error.message : 'Internal server error.';
  if (status >= 500) console.error(errorMessage(error));
  res.status(status).json({ detail: message });
});

export { app };
