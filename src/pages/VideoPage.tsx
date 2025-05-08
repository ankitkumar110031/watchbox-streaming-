import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useVideos } from '../context/VideoContext';
import Layout from '../components/layout/Layout';
import VideoPlayer from '../components/video/VideoPlayer';
import { ThumbsUp, MessageCircle, Share2, Clock, Eye, ArrowLeft } from 'lucide-react'; // Import ArrowLeft
import Button from '../components/ui/Button';
import WatchHistory from '../components/video/WatchHistory';

const VideoPage: React.FC = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const { id } = useParams<{ id: string }>();
  const { getVideo, addToHistory, watchHistory } = useVideos();
  const [showComments, setShowComments] = useState(false);

  const video = id ? getVideo(id) : null;

  useEffect(() => {
    if (video) {
      addToHistory(video);
    }
  }, [video, addToHistory]);

  if (!video) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-300">Video not found</h1>
            <p className="text-gray-400 mt-2">The video you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost" // Ghost variant provides hover:bg-gray-800 in dark mode
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center space-x-2 text-white font-semibold py-2 px-3 rounded-md hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player */}
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <VideoPlayer
                src={video.videoUrl}
                poster={video.thumbnailUrl}
                autoPlay
              />
            </div>

            {/* Video Info */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-white">{video.title}</h1>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-400">{video.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-400">{formatDate(video.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                    onClick={() => {/* Handle like */}}
                  >
                    <ThumbsUp className="h-5 w-5" />
                    <span>{video.likes}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                    onClick={() => setShowComments(!showComments)}
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Comments</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                    onClick={() => {/* Handle share */}}
                  >
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                  </Button>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <p className="text-gray-300 whitespace-pre-wrap">{video.description}</p>
              </div>
            </div>
          </div>

          {/* Watch History Sidebar Removed */}
          {/* <div className="lg:col-span-1">
            <WatchHistory videos={watchHistory} />
          </div> */}
        </div>
      </div>
    </Layout>
  );
};

export default VideoPage;