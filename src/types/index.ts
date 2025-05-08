export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface VideoMetadata {
  type: 'movie' | 'series' | 'anime';
  year: number;
  genre: string[];
  quality: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  views: number;
  likes: number;
  userId: string;
  user?: User;
  metadata?: VideoMetadata;
  createdAt: Date;
  updatedAt: Date;
  seriesId?: string;
  season?: number;
  episodeNumber?: number;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  videoId: string;
  user?: User;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface VideoUploadProgress {
  progress: number;
  isUploading: boolean;
  error: string | null;
}