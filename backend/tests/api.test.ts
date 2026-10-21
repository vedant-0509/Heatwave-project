import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '../src/app.js';

describe('UrbanHeat API contracts', () => {
  it('reports a truthful health contract and ward count', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('online');
    expect(response.body.wards_loaded).toBe(24);
    expect(response.body.satellite_pipeline).toContain('unavailable');
  });

  it('serves validated ward metrics with stable IDs', async () => {
    const response = await request(app).get('/api/v1/wards/metrics');

    expect(response.status).toBe(200);
    expect(Object.keys(response.body)).toHaveLength(24);
    expect(response.body.WARD_A.ward_id).toBe('WARD_A');
    expect(response.body.WARD_A.is_demo_data).toBe(true);
  });

  it('exposes explicit satellite unavailability', async () => {
    const response = await request(app).get('/api/v1/satellite/lst');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('unavailable');
    expect(response.body.data).toBeNull();
  });

  it('rejects malformed simulation payloads', async () => {
    const response = await request(app)
      .post('/api/v1/ml/simulate')
      .send({ ward_id: 'WARD_A', delta_ndvi: 'invalid' });

    expect(response.status).toBe(422);
    expect(response.body.detail).toBe('Invalid request payload.');
  });

  it('returns a consistent 404 contract', async () => {
    const response = await request(app).get('/api/v1/not-a-route');

    expect(response.status).toBe(404);
    expect(response.body.detail).toBe('Route not found.');
  });

  it('serves upgrade read APIs with stable demo semantics', async () => {
    const comparison = await request(app)
      .post('/api/v1/wards/compare')
      .send({ ward_ids: ['WARD_A', 'WARD_B'] });
    const recommendations = await request(app).get('/api/v1/wards/recommendations/WARD_A');
    const alerts = await request(app).get('/api/v1/alerts');
    const report = await request(app).get('/api/v1/reports/wards.csv');

    expect(comparison.status).toBe(200);
    expect(comparison.body.wards).toHaveLength(2);
    expect(comparison.body.ranking[0].ward_id).toBeDefined();
    expect(recommendations.status).toBe(200);
    expect(recommendations.body.ward_id).toBe('WARD_A');
    expect(recommendations.body.recommendations.length).toBeGreaterThan(0);
    expect(alerts.status).toBe(200);
    expect(alerts.body.data_status).toBe('demo_alerts');
    expect(report.status).toBe(200);
    expect(report.headers['content-type']).toContain('text/csv');
    expect(report.text).toContain('ward_id');
  });

  it('does not pretend local authentication is available without MongoDB', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(response.status).toBe(503);
    expect(response.body.detail).toContain('USE_MONGODB=true');
  });

  it('reports OpenAQ status honestly', async () => {
    const response = await request(app).get('/api/v1/air-quality/current?lat=19.076&lon=72.8777');

    expect(response.status).toBe(200);
    expect(response.body.is_demo_data).toBe(false);
    expect(['current_api', 'unavailable']).toContain(response.body.data_status);
    if (response.body.data_status === 'unavailable') expect(response.body.measurements).toEqual([]);
  });
});
