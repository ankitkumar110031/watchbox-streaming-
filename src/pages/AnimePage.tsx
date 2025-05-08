import React from 'react';
import Layout from '../components/layout/Layout';
import { useVideos } from '../context/VideoContext';
import VideoGrid from '../components/video/VideoGrid';

const AnimePage: React.FC = () => {
  const { getVideosByType, isLoading, videos } = useVideos();
  const animeVideos = getVideosByType('anime');

  // Group strictly by seriesId
  const uniqueSeriesMap = new Map();
  animeVideos.forEach(video => {
    const key = (video.seriesId || video.title).trim().toLowerCase();
    if (!uniqueSeriesMap.has(key)) {
      // Collect all episodes for this seriesId
      const episodes = animeVideos.filter(v => (v.seriesId || v.title).trim().toLowerCase() === key);
      // Collect unique seasons
      const seasons = Array.from(new Set(episodes.map(ep => ep.season || 1))).sort((a, b) => a - b);
      uniqueSeriesMap.set(key, { ...video, episodeCount: episodes.length, seasons, normalizedSeriesId: key });
    }
  });
  const uniqueSeries = Array.from(uniqueSeriesMap.values());

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Anime</h1>
        <VideoGrid videos={uniqueSeries} loading={isLoading} title="All Anime" />
      </div>
    </Layout>
  );
};

export default AnimePage; 