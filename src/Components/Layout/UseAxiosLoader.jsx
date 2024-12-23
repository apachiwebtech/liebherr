import axios from 'axios';
import { useEffect, useState } from 'react';
import { Base_Url } from '../Utils/Base_Url'; // Import the Base_Url

// Create an Axios instance using Base_Url
const axiosInstance = axios.create({
  baseURL: Base_Url,  // Use the imported Base_Url
});

// Create a hook to manage loading state globally
export function useAxiosLoader() {
  const [loaders, setLoaders] = useState(false); // Start with false, so the loader is hidden initially

  // Set up Axios interceptors
  useEffect(() => {
    // Request interceptor to show loader
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        setLoaders(true);  // Show loader when request starts
        // console.log('Request started, setting loader to true');
        return config;
      },
      (error) => {
        setLoaders(false);  // Hide loader if request fails
        // console.log('Request failed, hiding loader');
        return Promise.reject(error);
      }
    );

    // Response interceptor to hide loader
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => {
        setLoaders(false);  // Hide loader when response is received
        // console.log('Response received, hiding loader');
        return response;
      },
      (error) => {
        setLoaders(false);  // Hide loader if response fails
        // console.log('Response error, hiding loader');
        return Promise.reject(error);
      }
    );

    // // Cleanup interceptors when the component unmounts
    // return () => {
    //   axiosInstance.interceptors.request.eject(requestInterceptor);
    //   axiosInstance.interceptors.response.eject(responseInterceptor);
    // };
  }, []); // Empty dependency array ensures that interceptors are only set once on mount

  return { loaders, axiosInstance };
}
