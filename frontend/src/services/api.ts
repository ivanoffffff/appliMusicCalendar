import axios, { type AxiosResponse } from 'axios';
import type { ApiResponse, LoginCredentials, RegisterData, User, Artist, FavoriteArtist } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Configuration axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'auth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<User> & { accessToken?: string }> {
    const response: AxiosResponse<ApiResponse<User> & { accessToken?: string }> = await api.post('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<ApiResponse<User> & { accessToken?: string }> {
    const response: AxiosResponse<ApiResponse<User> & { accessToken?: string }> = await api.post('/auth/register', data);
    return response.data;
  },

  async getProfile(): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await api.get('/auth/me');
    return response.data;
  },
};

// Services pour les artistes
export const artistService = {
  async searchArtists(query: string, limit = 20): Promise<ApiResponse<Artist[]>> {
    const response: AxiosResponse<ApiResponse<Artist[]>> = await api.get(`/artists/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  },

  async addToFavorites(spotifyId: string, category = 'default'): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/artists/favorites', {
      spotifyId,
      category,
    });
    return response.data;
  },

  async removeFromFavorites(artistId: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await api.delete(`/artists/favorites/${artistId}`);
    return response.data;
  },

  async getFavorites(): Promise<ApiResponse<FavoriteArtist[]>> {
    const response: AxiosResponse<ApiResponse<FavoriteArtist[]>> = await api.get('/artists/favorites');
    return response.data;
  },

  async testSpotify(): Promise<ApiResponse<{ spotifyConnected: boolean }>> {
    const response: AxiosResponse<ApiResponse<{ spotifyConnected: boolean }>> = await api.get('/artists/test-spotify');
    return response.data;
  },
};

export default api;

// Services pour les sorties musicales
export const releaseService = {
  async syncReleases(): Promise<ApiResponse<Release[]>> {
    const response: AxiosResponse<ApiResponse<Release[]>> = await api.post('/releases/sync');
    return response.data;
  },

  async getUserReleases(startDate?: string, endDate?: string): Promise<ApiResponse<Release[]>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response: AxiosResponse<ApiResponse<Release[]>> = await api.get(`/releases?${params}`);
    return response.data;
  },
};

// Services pour OAuth Spotify
export const spotifyOAuthService = {
  async getConnectionStatus(): Promise<ApiResponse<{ isConnected: boolean; connectedAt?: string }>> {
    const response: AxiosResponse<ApiResponse<{ isConnected: boolean; connectedAt?: string }>> = await api.get('/spotify/status');
    return response.data;
  },

  async initiateConnection(): Promise<ApiResponse<{ authUrl: string }>> {
    const response: AxiosResponse<ApiResponse<{ authUrl: string }>> = await api.get('/spotify/connect');
    return response.data;
  },

  async syncFavorites(): Promise<ApiResponse<{ imported: number; existing: number }>> {
    const response: AxiosResponse<ApiResponse<{ imported: number; existing: number }>> = await api.post('/spotify/sync');
    return response.data;
  },

  async disconnect(): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await api.delete('/spotify/disconnect');
    return response.data;
  },
};
