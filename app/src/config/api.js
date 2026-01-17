// API Configuration
export const API_BASE_URL = 'https://api.shazlo.store';

// Helper function to get image URL
export const getImageUrl = (url) => {
  return `${API_BASE_URL}/v1/items/getimage?url=${encodeURIComponent(url)}`;
};
