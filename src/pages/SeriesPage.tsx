import React, { useState } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useVideos } from '../context/VideoContext';
import Layout from '../components/layout/Layout';
import VideoPlayer from '../components/video/VideoPlayer';
import { Home } from 'lucide-react';

const SeriesPage: React.FC = () => {
  const { seriesId } = useParams<{ seriesId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { videos } = useVideos();

  // Normalize seriesId from URL
  const normalizedSeriesId = (seriesId || '').trim().toLowerCase();

  // Get all episodes for this series
  const episodes = videos.filter(v => (v.seriesId || v.title).trim().toLowerCase() === normalizedSeriesId);

  // Group episodes by season
  const seasons: { [season: number]: typeof episodes } = {};
  episodes.forEach(ep => {
    const seasonNum = ep.season || 1;
    if (!seasons[seasonNum]) seasons[seasonNum] = [];
    seasons[seasonNum].push(ep);
  });

  // Sort seasons and episodes
  const sortedSeasonNumbers = Object.keys(seasons).map(Number).sort((a, b) => a - b);
  sortedSeasonNumbers.forEach(seasonNum => {
    seasons[seasonNum].sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0));
  });

  // Get series info from the first episode
  const seriesInfo = episodes[0];

  // State for selected season and episode
  const [selectedSeason, setSelectedSeason] = useState(sortedSeasonNumbers[0] || 1);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(
    searchParams.get('episode') || (seasons[selectedSeason]?.[0]?.id || '')
  );

  // Update selected episode when season changes
  React.useEffect(() => {
    if (!seasons[selectedSeason]?.find(ep => ep.id === selectedEpisodeId)) {
      setSelectedEpisodeId(seasons[selectedSeason]?.[0]?.id || '');
    }
  }, [selectedSeason, selectedEpisodeId, seasons]);

  // Update URL when episode changes
  React.useEffect(() => {
    if (selectedEpisodeId) {
      navigate(`/series/${seriesId}?episode=${selectedEpisodeId}`, { replace: true });
    }
  }, [selectedEpisodeId, navigate, seriesId]);

  const selectedEpisode = episodes.find(ep => ep.id === selectedEpisodeId) || seasons[selectedSeason]?.[0];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-white">
            <Home className="h-4 w-4" />
          </Link>
          <span>/</span>
          <Link to="/tv" className="hover:text-white">TV Shows</Link>
          <span>/</span>
          <span className="text-white">{seriesInfo?.title}</span>
        </div>

        {/* Main Content: Video + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Video Player */}
          <div className="flex-1 min-w-0">
            <div className="mb-4">
              {selectedEpisode && selectedEpisode.videoUrl ? (
                <VideoPlayer
                  src={selectedEpisode.videoUrl}
                  poster={selectedEpisode.thumbnailUrl}
                  autoPlay
                />
              ) : (
                <div className="bg-gray-900 text-red-400 p-4 rounded-lg text-center">
                  Video not available for this episode.
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Season/Episode Selector */}
          <aside className="w-full lg:w-72 flex-shrink-0 bg-gray-900 rounded-xl p-4 h-fit">
            <h3 className="text-lg font-bold mb-2 text-center">Resources</h3>
            {/* Season Selector */}
            <div className="flex justify-center space-x-2 mb-4">
              {sortedSeasonNumbers.map(seasonNum => (
                <button
                  key={seasonNum}
                  className={`px-3 py-1 rounded-full font-semibold text-sm transition-colors ${selectedSeason === seasonNum ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                  onClick={() => setSelectedSeason(seasonNum)}
                >
                  S{String(seasonNum).padStart(2, '0')}
                </button>
              ))}
            </div>
            {/* Episode Grid */}
            <div className="grid grid-cols-6 gap-2">
              {seasons[selectedSeason]?.map(episode => (
                <button
                  key={episode.id}
                  className={`aspect-square rounded-md font-bold text-xs flex items-center justify-center transition-colors ${
                    selectedEpisodeId === episode.id
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedEpisodeId(episode.id)}
                  title={episode.title}
                >
                  {String(episode.episodeNumber || 1).padStart(2, '0')}
                </button>
              ))}
            </div>
          </aside>
        </div>

        {/* Series Info & Episode Description */}
        <div className="bg-gray-900 rounded-xl p-6 mt-8">
          <h1 className="text-3xl font-bold mb-2">{seriesInfo?.title}</h1>
          <p className="text-gray-400 mb-4">{seriesInfo?.description}</p>
          {selectedEpisode && (
            <>
              <h2 className="text-xl font-bold mb-2">Episode {selectedEpisode.episodeNumber || 1}: {selectedEpisode.title}</h2>
              <p className="text-gray-400">{selectedEpisode.description}</p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SeriesPage; 