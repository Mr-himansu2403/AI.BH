// Helper function to extract error messages
export const extractErrorMessage = (error) => {
  // API error response
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Network error
  if (error.message === 'Network Error') {
    return 'Unable to connect to server. Please try again.';
  }
  
  // Timeout error
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }
  
  // Generic error
  return error.message || 'An unexpected error occurred';
};
