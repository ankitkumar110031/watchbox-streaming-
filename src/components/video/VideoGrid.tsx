import React from 'react';
import { Video } from '../../types';
import VideoCard from './VideoCard';

interface VideoGridProps {
  videos: Video[];
  title?: string;
  description?: string;
  loading?: boolean;
}

const VideoGrid: React.FC<VideoGridProps> = ({ 
  videos, 
  title, 
  description,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
        {description && <p className="text-gray-400 mb-6">{description}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-800 rounded-lg aspect-video mb-3"></div>
              <div className="bg-gray-800 h-5 w-3/4 rounded mb-2"></div>
              <div className="bg-gray-800 h-4 w-1/2 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
        {description && <p className="text-gray-400 mb-6">{description}</p>}
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No videos found</h3>
          <p className="text-gray-400">Try a different search or check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
      {description && <p className="text-gray-400 mb-6">{description}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} episodeCount={video.episodeCount} seasons={video.seasons} normalizedSeriesId={video.normalizedSeriesId} />
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;