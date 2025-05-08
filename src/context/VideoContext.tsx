import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Video } from '../types';

type VideoContextType = {
  videos: Video[];
  featuredVideos: Video[];
  watchHistory: Video[];
  isLoading: boolean;
  error: string | null;
  updateVideo: (id: string, updates: Partial<Video>) => void;
  deleteVideo: (id: string) => void;
  addToHistory: (video: Video) => void;
  clearHistory: () => void;
  getVideosByType: (type: 'movie' | 'series' | 'anime') => Video[];
  getVideo: (id: string) => Video | undefined;
  searchVideos: (query: string) => Video[];
};

const VideoContext = createContext<VideoContextType | undefined>(undefined);

const STORAGE_KEY = 'watchbox_videos';
const HISTORY_KEY = 'watchbox_watch_history';

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<Video[]>([]);
  const [watchHistory, setWatchHistory] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load videos from localStorage on initial mount
  useEffect(() => {
    const loadVideos = () => {
      try {
        setIsLoading(true);
        const storedVideos = localStorage.getItem(STORAGE_KEY);
        
        let loadedVideos: Video[] = [];
        
        if (storedVideos) {
          try {
            loadedVideos = JSON.parse(storedVideos).map((video: any) => ({
              ...video,
              createdAt: new Date(video.createdAt),
              updatedAt: new Date(video.updatedAt)
            }));
          } catch (parseError) {
            console.error('Error parsing stored videos:', parseError);
            loadedVideos = [];
          }
        }
        
        setVideos(loadedVideos);
        setFeaturedVideos(loadedVideos.sort((a, b) => b.views - a.views).slice(0, 3));
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading videos:', err);
        setError('Failed to load videos');
        setIsLoading(false);
      }
    };

    loadVideos();
  }, []);

  // Load watch history
  useEffect(() => {
    const storedHistory = localStorage.getItem(HISTORY_KEY);
    if (storedHistory) {
      try {
        const history = JSON.parse(storedHistory);
        setWatchHistory(history);
      } catch (err) {
        console.error('Error loading watch history:', err);
      }
    }
  }, []);

  const updateVideo = useCallback((id: string, updates: Partial<Video>) => {
    setVideos(prevVideos => {
      const updatedVideos = prevVideos.map(video => 
        video.id === id ? { ...video, ...updates, updatedAt: new Date() } : video
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVideos));
      return updatedVideos;
    });
  }, []); // Assuming setVideos is stable, no direct external dependencies for the setter itself

  const deleteVideo = useCallback((id: string) => {
    setVideos(prevVideos => {
      const updatedVideos = prevVideos.filter(video => video.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVideos));
      return updatedVideos;
    });
  }, []);

  const addToHistory = useCallback((video: Video) => {
    setWatchHistory(prevHistory => {
      const newHistory = [video, ...prevHistory.filter(v => v.id !== video.id)].slice(0, 50);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setWatchHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  const getVideosByType = useCallback((type: 'movie' | 'series' | 'anime'): Video[] => {
    return videos.filter(video => video.metadata?.type === type);
  }, [videos]);

  const getVideo = useCallback((id: string): Video | undefined => {
    return videos.find(video => video.id === id);
  }, [videos]);

  const searchVideos = useCallback((query: string): Video[] => {
    const searchTerm = query.toLowerCase();
    return videos.filter(video => 
      video.title.toLowerCase().includes(searchTerm) ||
      video.description.toLowerCase().includes(searchTerm) ||
      video.metadata?.genre.some(g => g.toLowerCase().includes(searchTerm))
    );
  }, [videos]);

  return (
    <VideoContext.Provider value={{
      videos,
      featuredVideos,
      watchHistory,
      isLoading,
      error,
      updateVideo,
      deleteVideo,
      addToHistory,
      clearHistory,
      getVideosByType,
      getVideo,
      searchVideos
    }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideos = (): VideoContextType => {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideos must be used within a VideoProvider');
  }
  return context;
};