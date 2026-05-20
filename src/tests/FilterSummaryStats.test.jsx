/**
 * src/tests/FilterSummaryStats.test.jsx
 * Tests for the FilterSummaryStats component.
 * Mocks fetch to verify rendering for loading, data, empty, and error states.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import FilterSummaryStats from '../components/FilterSummaryStats';

const SAMPLE_DATA = {
  total_tests: 3,
  parameters: [
    { label: 'Peak Load', unit: 'kN', count: 3, mean: 150.0, median: 148.0, min: 140.0, max: 162.0 },
    { label: 'Displacement', unit: 'mm', count: 3, mean: 25.5, median: 25.0, min: 20.0, max: 31.0 },
  ],
};

const EMPTY_DATA = { total_tests: 0, parameters: [] };

describe('FilterSummaryStats', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the summary statistics table when data is returned', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => SAMPLE_DATA,
    });

    render(<FilterSummaryStats filters={{}} />);

    await waitFor(() => {
      expect(screen.getByText('Summary Statistics')).toBeInTheDocument();
    });

    expect(screen.getByText('Peak Load')).toBeInTheDocument();
    expect(screen.getByText('Displacement')).toBeInTheDocument();
  });

  it('shows aggregation subtitle with correct test count', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => SAMPLE_DATA,
    });

    render(<FilterSummaryStats filters={{}} />);

    await waitFor(() => {
      expect(screen.getByText(/Aggregated across 3 tests/)).toBeInTheDocument();
    });
  });

  it('renders nothing when total_tests is 0', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => EMPTY_DATA,
    });

    const { container } = render(<FilterSummaryStats filters={{}} />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('renders nothing when fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const { container } = render(<FilterSummaryStats filters={{}} />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('shows loading text while fetching', async () => {
    // Delay resolution so we can catch the loading state
    vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(
      new Promise((resolve) =>
        setTimeout(() => resolve({ json: async () => SAMPLE_DATA }), 200)
      )
    );

    render(<FilterSummaryStats filters={{}} />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows mean values in the table', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => SAMPLE_DATA,
    });

    render(<FilterSummaryStats filters={{}} />);

    await waitFor(() => {
      expect(screen.getByText('150.00')).toBeInTheDocument();
      expect(screen.getByText('25.50')).toBeInTheDocument();
    });
  });

  it('builds the correct query string from filters', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => SAMPLE_DATA,
    });

    render(<FilterSummaryStats filters={{ supplier: 'Hoek', category: 'Encapsulated' }} />);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('supplier=Hoek')
      );
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('category=Encapsulated')
      );
    });
  });
});
