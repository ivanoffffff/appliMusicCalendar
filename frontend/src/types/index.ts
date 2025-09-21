// Types pour l'authentification
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  accessToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Types pour les artistes
export interface Artist {
  spotifyId: string;
  name: string;
  genres: string[];
  imageUrl?: string;
  popularity: number;
  followers: number;
  spotifyUrl: string;
}

export interface FavoriteArtist {
  id: string;
  category: string;
  addedAt: string;
  artist: {
    id: string;
    spotifyId: string;
    name: string;
    genres: string[];
    imageUrl?: string;
    popularity: number;
    followers: number;
    spotifyUrl: string;
  };
}

// Types pour l'API
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  total?: number;
}

// Types pour les sorties musicales
export interface Release {
  id: string;
  spotifyId?: string;
  name: string;
  releaseType: 'ALBUM' | 'SINGLE' | 'EP';
  releaseDate: string;
  imageUrl?: string;
  spotifyUrl?: string;
  trackCount?: number;
  artist: {
    id: string;
    name: string;
    spotifyId?: string;
  };
}

export interface UserRelease {
  id: string;
  isListened: boolean;
  rating?: number;
  notes?: string;
  listenedAt?: string;
  release: Release;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps: {
    release: Release;
    releaseType: string;
  };
}
