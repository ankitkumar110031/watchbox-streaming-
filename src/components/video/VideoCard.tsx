import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, Heart } from 'lucide-react';
import { Video } from '../../types';

interface VideoCardProps {
  video: Video;
  variant?: 'default' | 'featured';
  episodeCount?: number;
  seasons?: number[];
  normalizedSeriesId?: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ 
  video, 
  variant = 'default',
  episodeCount,
  seasons,
  normalizedSeriesId
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Format duration from seconds to mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Format views to K/M format
  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  // Format date to relative time (e.g., "2 days ago")
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  };

  const linkTo = normalizedSeriesId ? `/series/${normalizedSeriesId}` : `/video/${video.id}`;

  if (variant === 'featured') {
    return (
      <Link 
        to={linkTo}
        className="relative block w-full overflow-hidden rounded-xl aspect-[16/9] max-w-[320px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30 z-10 transition-opacity duration-300 opacity-0" style={{ opacity: isHovered ? 1 : 0 }} />
        <img 
          src={video.thumbnailUrl} 
          alt={video.title}
          className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
        {/* Episode count and season badges */}
        <div className="absolute top-2 left-2 flex flex-row gap-2">
          {episodeCount && (
            <div className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
              {episodeCount} Episode{episodeCount > 1 ? 's' : ''}
            </div>
          )}
          {seasons && seasons.length > 0 && seasons.map(season => (
            <div key={season} className="bg-gray-800 text-white text-xs font-semibold px-2 py-1 rounded-full border border-purple-400">
              S{season}
            </div>
          ))}
        </div>
        <div className="absolute inset-0 flex flex-col justify-end p-6 z-20">
          <div className="bg-gradient-to-t from-black to-transparent pb-4 pt-12 px-4 -mx-4 -mb-4">
            <h3 className="text-2xl font-bold mb-2">{video.title}</h3>
            <p className="text-gray-300 mb-3 line-clamp-2">{video.description}</p>
            <div className="flex items-center space-x-4">
              <span className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-1" />
                {formatDuration(video.duration)}
              </span>
              <span className="flex items-center text-sm">
                {formatViews(video.views)}
              </span>
              <span className="flex items-center text-sm">
                <Heart className="h-4 w-4 mr-1 text-pink-500" />
                {video.likes}
              </span>
            </div>
          </div>
        </div>
        {isHovered && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-600 bg-opacity-80 rounded-full p-4 z-30 transition-opacity duration-300">
            <Play className="h-8 w-8" />
          </div>
        )}
      </Link>
    );
  }

  return (
    <Link 
      to={linkTo}
      className="block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-lg aspect-[16/9] max-w-[320px]">
        <img 
          src={video.thumbnailUrl} 
          alt={video.title} 
          className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
        {/* Episode count and season badges */}
        <div className="absolute top-2 left-2 flex flex-row gap-2">
          {episodeCount && (
            <div className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
              {episodeCount} Episode{episodeCount > 1 ? 's' : ''}
            </div>
          )}
          {seasons && seasons.length > 0 && seasons.map(season => (
            <div key={season} className="bg-gray-800 text-white text-xs font-semibold px-2 py-1 rounded-full border border-purple-400">
              S{season}
            </div>
          ))}
        </div>
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs">
          {formatDuration(video.duration)}
        </div>
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center transition-opacity duration-300">
            <div className="bg-purple-600 bg-opacity-80 rounded-full p-3">
              <Play className="h-6 w-6" />
            </div>
          </div>
        )}
      </div>
      <h3 className="font-medium text-lg line-clamp-2 hover:text-purple-400 transition">{video.title}</h3>
      <div className="flex items-center text-sm text-gray-400 mt-1">
        <span>{formatViews(video.views)}</span>
        <span className="mx-2">•</span>
        <span>{formatDate(video.createdAt)}</span>
      </div>
    </Link>
  );
};

export default VideoCard;