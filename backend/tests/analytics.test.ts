import { describe, expect, it } from 'vitest';
import { riskTier, simulate } from '../src/analytics.js';

describe('analytics compatibility', () => {
  it('keeps legacy risk boundaries', () => {
    expect(riskTier(39.9)).toBe('Low');
    expect(riskTier(40)).toBe('Moderate');
    expect(riskTier(60)).toBe('High');
    expect(riskTier(75)).toBe('Extreme');
  });
  it('reproduces intervention arithmetic', () => {
    const result = simulate({ ward_id: 'WARD_G_NORTH', delta_ndvi: 0.15, delta_ndbi: -0.1, base_lst: 36.5, base_ndvi: 0.18, base_ndbi: 0.65, base_pop_density: 45000, base_hvi: 78.5 }, { ndvi_slope: -15, ndbi_slope: 16.36 });
    expect(result.results.simulated_lst_celsius).toBe(32.6);
    expect(result.results.simulated_hvi).toBe(61.8);
  });
});
