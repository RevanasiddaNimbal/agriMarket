import apiClient from '../api/apiClient';

export const weatherService = {
  // Get 7-day daily weather forecast
  async getDailyWeather(latitude, longitude) {
    const response = await apiClient.get('/api/v1/weather/daily', {
      params: { latitude, longitude },
    });
    return response.data;
  },

  // Get hourly weather forecast
  async getHourlyWeather(latitude, longitude) {
    const response = await apiClient.get('/api/v1/weather/hourly', {
      params: { latitude, longitude },
    });
    return response.data;
  },

  // Calculate farming risk for a specific day
  async getDailyRisk(latitude, longitude, date) {
    const response = await apiClient.get('/api/v1/weather/risk/daily', {
      params: { latitude, longitude, date },
    });
    return response.data;
  },

  // Calculate 7-day weekly farming risk breakdown
  async getWeeklyRisk(latitude, longitude) {
    const response = await apiClient.get('/api/v1/weather/risk/weekly', {
      params: { latitude, longitude },
    });
    return response.data;
  },
};
