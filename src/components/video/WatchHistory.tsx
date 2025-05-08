import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Video } from '../../types';

interface WatchHistoryProps {
  videos: Video[];
}

const WatchHistory: React.FC<WatchHistoryProps> = ({ videos }) => {
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="h-5 w-5 text-purple-500" />
        <h2 className="text-lg font-semibold">Watch History</h2>
      </div>
      
      <div className="space-y-4">
        {videos.slice(0, 15).map((video) => (
          <Link 
            key={video.id} 
            to={`/video/${video.id}`}
            className="flex space-x-3 hover:bg-gray-800 rounded-lg p-2 transition-colors duration-200"
          >
            <div className="w-24 h-16 rounded overflow-hidden flex-shrink-0">
              <img 
                src={video.thumbnailUrl} 
                alt={video.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium line-clamp-1 hover:text-purple-400 transition-colors">{video.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{video.views} views</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default WatchHistory; 