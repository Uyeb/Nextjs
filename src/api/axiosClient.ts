import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { getCookie } from 'cookies-next';

const axiosClient = axios.create({
  baseURL: '', 
  withCredentials: true, 
});

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getCookie('accessToken'); 
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

export default axiosClient;
