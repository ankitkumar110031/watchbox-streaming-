import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useVideos } from '../context/VideoContext';
import VideoGrid from '../components/video/VideoGrid';

const MoviesPage: React.FC = () => {
  const { getVideosByType, isLoading } = useVideos();
  const movies = getVideosByType('movie');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Home Navigation */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-purple-400 hover:text-purple-300 transition"
          >
            <Home className="h-5 w-5 mr-2" />
            <span>Back to Home</span>
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-4">Movies</h1>
        <VideoGrid videos={movies} loading={isLoading} title="All Movies" />
      </div>
    </Layout>
  );
};

export default MoviesPage; 