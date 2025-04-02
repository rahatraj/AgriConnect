import axios from 'axios'
import toast from 'react-hot-toast';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // This is important for handling cookies
    timeout: 15000, // 15 seconds timeout
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle global errors
        if (error.response) {
            const { status, data } = error.response;

            // Unauthorized or token expired
            if (status === 401) {
                toast.error(data.message || "Session expired. Please log in again.");
                window.location.href = "/login";
            } 
            else if (status === 403) {
                toast.error(data.message || "You do not have permission to perform this action.");
            } 
            else if (status >= 500) {
                toast.error(data.message || "Server error. Please try again later.");
                
                // Retry logic for 500 errors (optional)
                if (!originalRequest._retry && status >= 500) {
                    originalRequest._retry = true;
                    return axiosInstance(originalRequest);
                }
            }
        } 
        else if (error.request) {
            // Network error
            if (!navigator.onLine) {
                toast.error("You are offline. Please check your internet connection.");
            } else {
                toast.error("Unable to reach the server. Please try again later.");
            }
        } 
        else {
            toast.error("An unexpected error occurred.");
        }

        return Promise.reject(error);
    }
);

// Add a response transformer to handle common data structures
axiosInstance.defaults.transformResponse = [...axios.defaults.transformResponse, 
    (data) => {
        return data;
    }
];

export default axiosInstance;

