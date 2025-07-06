import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Observation, Photo, User } from '../types';

const API_BASE_URL = 'http://your-laravel-backend-url/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

interface ApiResponse<T> {
  data: T;
}

const ApiService = {
  // Auth
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<AxiosResponse<{ user: User; token: string }>> => api.post('/register', data),

  login: (data: { email: string; password: string }): Promise<AxiosResponse<{ user: User; token: string }>> => 
    api.post('/login', data),

  logout: (): Promise<AxiosResponse<void>> => api.post('/logout'),

  getUser: (): Promise<AxiosResponse<User>> => api.get('/user'),

  // Observations
  getObservations: (): Promise<AxiosResponse<Observation[]>> => api.get('/observations'),
  
  getObservation: (id: number): Promise<AxiosResponse<Observation>> => api.get(`/observations/${id}`),
  
  createObservation: (data: Omit<Observation, 'id'>): Promise<AxiosResponse<Observation>> => 
    api.post('/observations', data),
  
  updateObservation: (id: number, data: Partial<Observation>): Promise<AxiosResponse<Observation>> => 
    api.put(`/observations/${id}`, data),
  
  deleteObservation: (id: number): Promise<AxiosResponse<void>> => api.delete(`/observations/${id}`),
  
  exportObservations: (): Promise<AxiosResponse<Blob>> => 
    api.get('/observations/export', { responseType: 'blob' }),

  // Helper to convert image to base64
  imageToBase64: async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  }
};

export default ApiService;