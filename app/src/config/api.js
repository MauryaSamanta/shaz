// API Configuration
export const API_BASE_URL = 'http://192.168.31.12:8000';

// Helper function to get image URL
export const getImageUrl = (url) => {
  return `${API_BASE_URL}/v1/items/getimage?url=${encodeURIComponent(url)}`;
};