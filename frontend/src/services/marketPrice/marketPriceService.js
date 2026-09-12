import apiClient from '../api/apiClient';

export const marketPriceService = {
  // Get current market prices with optional filters
  async getMarketPrices(params = {}) {
    const cleanParams = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value;
      }
    }
    const response = await apiClient.get('/api/v1/market-prices', { params: cleanParams });
    return response.data;
  },

  // Get historical market price trend for a commodity
  async getHistoricalPrices({ commodity, state, district, market, fromDate, toDate }) {
    const today = new Date();
    const defaultToDate = today.toISOString().split('T')[0];
    const defaultFromDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const cleanParams = {
      commodity: commodity || 'Tomato',
      fromDate: fromDate || defaultFromDate,
      toDate: toDate || defaultToDate,
    };

    if (state) cleanParams.state = state;
    if (district) cleanParams.district = district;
    if (market) cleanParams.market = market;

    const response = await apiClient.get('/api/v1/market-prices/history', {
      params: cleanParams,
    });
    return response.data;
  },
};
