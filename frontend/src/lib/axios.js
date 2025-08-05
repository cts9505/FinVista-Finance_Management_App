// lib/axios.js
import axios from 'axios';


// Create a new instance of axios
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // Your backend base URL
});

// Function to set up interceptors
export const setupInterceptors = (setIsLoading) => {
  // Request Interceptor: Runs before every request
  api.interceptors.request.use(
    (config) => {
      setIsLoading(true); // Start loading
      return config;
    },
    (error) => {
      setIsLoading(false); // Stop loading on request error
      return Promise.reject(error);
    }
  );

  // Response Interceptor: Runs after every response
  api.interceptors.response.use(
    (response) => {
      setIsLoading(false); // Stop loading on success
      return response;
    },
    (error) => {
      setIsLoading(false); // Stop loading on response error
      return Promise.reject(error);
    }
  );
};

export default api;