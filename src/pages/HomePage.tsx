import React from 'react';
import { useVideos } from '../context/VideoContext';
import Layout from '../components/layout/Layout';
import VideoCard from '../components/video/VideoCard';
import VideoGrid from '../components/video/VideoGrid';
import { Play, TrendingUp, Clock, Star } from 'lucide-react';

const HomePage: React.FC = () => {
  const { featuredVideos, videos, isLoading } = useVideos();

  // Group anime and TV series by seriesId
  const groupedVideos = videos.map(video => {
    if (video.metadata?.type === 'anime' || video.metadata?.type === 'series') {
      const key = (video.seriesId || video.title).trim().toLowerCase();
      const episodes = videos.filter(v => 
        (v.seriesId || v.title).trim().toLowerCase() === key && 
        v.metadata?.type === video.metadata?.type
      );
      const seasons = Array.from(new Set(episodes.map(ep => ep.season || 1))).sort((a, b) => a - b);
      return { ...video, episodeCount: episodes.length, seasons, normalizedSeriesId: key };
    }
    return video;
  });

  // Remove duplicate series entries
  const uniqueVideos = Array.from(
    new Map(
      groupedVideos.map(video => [
        video.normalizedSeriesId || video.id,
        video
      ])
    ).values()
  );

  return (
    <Layout>
      {/* Latest Videos */}
      <section>
        <h2 className="text-2xl font-bold mb-8">Latest Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uniqueVideos.map((video) => (
            <VideoCard 
              key={video.id} 
              video={video} 
              episodeCount={video.episodeCount}
              seasons={video.seasons}
              normalizedSeriesId={video.normalizedSeriesId}
            />
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center">
              <TrendingUp className="h-6 w-6 text-red-500 mr-2" />
              Trending Now
            </h2>
            <a href="#" className="text-purple-400 hover:text-purple-300 transition">
              See More
            </a>
          </div>
          <VideoGrid
            videos={uniqueVideos.filter(v => v.views > 1000)}
            loading={isLoading}
          />
        </div>
      </section>

      {/* Recent Uploads */}
      <section className="py-12 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center">
              <Clock className="h-6 w-6 text-green-500 mr-2" />
              Recent Uploads
            </h2>
            <a href="#" className="text-purple-400 hover:text-purple-300 transition">
              View All
            </a>
          </div>
          <VideoGrid
            videos={uniqueVideos.filter(v => new Date().getTime() - new Date(v.createdAt).getTime() < 1000 * 60 * 60 * 24 * 7)}
            loading={isLoading}
          />
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;