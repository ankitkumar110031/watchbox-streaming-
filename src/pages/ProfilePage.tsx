import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVideos } from '../context/VideoContext';
import Layout from '../components/layout/Layout';
import { Settings, Upload, LogOut, Play, Edit2, Trash2 } from 'lucide-react';
import Button from '../components/ui/Button';

// SeriesTrayCard component for grouped series display
interface Episode {
  id: string;
  title: string;
  season?: number;
  episodeNumber?: number;
  description?: string;
  seriesId?: string;
}

interface SeriesTrayCardProps {
  episodes: Episode[];
  [key: string]: any;
}

const SeriesTrayCard = ({ episodes }: SeriesTrayCardProps) => {
  const { authState } = useAuth();
  const { updateVideo, deleteVideo } = useVideos();
  // Define admin check (customize as needed)
  const isAdmin = (authState.user as any).role === 'admin' || authState.user?.email === 'your@email.com';
  // Group by season
  const seasons = Array.from(new Set(episodes.map(ep => ep.season || 1))).sort((a, b) => Number(a) - Number(b));
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]);
  // Sort episodes in the selected season by episodeNumber
  const episodesInSeason = episodes
    .filter(ep => (ep.season || 1) === selectedSeason)
    .sort((a, b) => (a.episodeNumber || 1) - (b.episodeNumber || 1));
  const [selectedEpisode, setSelectedEpisode] = useState(episodesInSeason[0]?.id);
  const currentEpisode = episodes.find(ep => ep.id === selectedEpisode);

  // Ensure episode numbers are properly initialized
  React.useEffect(() => {
    if (episodesInSeason.length > 0) {
      episodesInSeason.forEach((ep, index) => {
        if (!ep.episodeNumber) {
          updateVideo(ep.id, { episodeNumber: index + 1 });
        }
      });
    }
  }, [episodesInSeason, updateVideo]);

  if (!episodes || episodes.length === 0) {
    return null;
  }

  return (
    <div className="series-card bg-gray-900 rounded-xl p-6 mb-6 shadow-lg">
      <h3 className="text-xl font-bold mb-2">{episodes[0]?.title || 'Untitled Series'}</h3>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
        <div>
          <label className="mr-2">Season:</label>
          <select 
            value={selectedSeason} 
            onChange={e => {
              setSelectedSeason(Number(e.target.value));
              const newSeasonEpisodes = episodes.filter(ep => (ep.season || 1) === Number(e.target.value));
              setSelectedEpisode(newSeasonEpisodes[0]?.id);
            }} 
            className="bg-gray-800 text-white rounded px-2 py-1"
          >
            {seasons.map(season => (
              <option key={season} value={season}>Season {season}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="mr-2">Episode:</label>
          {isAdmin ? (
            <select
              value={selectedEpisode || ''}
              onChange={e => setSelectedEpisode(e.target.value)}
              className="bg-gray-800 text-white rounded px-2 py-1"
            >
              {episodesInSeason.map(ep => (
                <option
                  key={ep.id}
                  value={ep.id}
                  onContextMenu={e => {
                    e.preventDefault();
                    const newNumber = prompt('Enter new episode number:', String(ep.episodeNumber || ''));
                    if (newNumber && !isNaN(Number(newNumber))) {
                      updateVideo(ep.id, { episodeNumber: Number(newNumber) });
                    }
                  }}
                >
                  Ep {ep.episodeNumber || 1}: {ep.title}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedEpisode || ''}
              onChange={e => setSelectedEpisode(e.target.value)}
              className="bg-gray-800 text-white rounded px-2 py-1"
            >
              {episodesInSeason.map(ep => (
                <option key={ep.id} value={ep.id}>
                  Ep {ep.episodeNumber || 1}: {ep.title}
                </option>
              ))}
            </select>
          )}
          {currentEpisode && (
            <div className="flex items-center gap-2">
              <Link 
                to={`/series/${currentEpisode.seriesId || currentEpisode.title}?episode=${currentEpisode.id}`}
                className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition-colors"
                title="Play Episode"
              >
                <Play className="h-4 w-4" />
              </Link>
              {isAdmin && (
                <>
                  <Link
                    to={`/settings?video=${currentEpisode.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
                    title="Edit Episode"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this episode?')) {
                        deleteVideo(currentEpisode.id);
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                    title="Delete Episode"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {currentEpisode && (
        <div className="bg-gray-800 rounded p-4 mt-2">
          <p className="text-gray-300 mb-2">{currentEpisode.description}</p>
        </div>
      )}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { authState, logout } = useAuth();
  const { videos, isLoading } = useVideos();
  
  // Redirect if not logged in
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading your profile...</p>
        </div>
      </Layout>
    );
  }
  
  // Filter videos for this user
  const userVideos = videos.filter(video => video.userId === authState.user?.id);
  
  // Group user videos by seriesId or title
  const grouped: { [key: string]: Episode[] } = {};
  userVideos.forEach(video => {
    const key = (video.seriesId || video.title).trim().toLowerCase();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(video);
  });
  const seriesList = Object.values(grouped) as Episode[][];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-r from-purple-900 to-blue-900">
            <img 
              src="https://images.pexels.com/photos/924824/pexels-photo-924824.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
              alt="Cover" 
              className="w-full h-full object-cover opacity-50"
            />
          </div>
          
          {/* Profile Info */}
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-20 px-4 md:px-8">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full border-4 border-gray-900 overflow-hidden bg-gray-800">
              {authState.user?.avatarUrl ? (
                <img 
                  src={authState.user.avatarUrl}
                  alt={authState.user.username} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                  {authState.user?.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left flex-grow">
              <h1 className="text-2xl md:text-3xl font-bold">{authState.user?.username}</h1>
              <p className="text-gray-400 mb-2">@{authState.user?.username} • Joined {new Date(authState.user?.createdAt || Date.now()).toLocaleDateString()}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <div>
                  <span className="font-bold">{userVideos.length}</span>
                  <span className="text-gray-400 ml-1">Videos</span>
                </div>
                <div>
                  <span className="font-bold">0</span>
                  <span className="text-gray-400 ml-1">Subscribers</span>
                </div>
                <div>
                  <span className="font-bold">0</span>
                  <span className="text-gray-400 ml-1">Following</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-4 md:mt-0">
              <Link to="/upload">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
        
        {/* Profile Navigation Tabs */}
        <div className="border-b border-gray-800 mt-8">
          <div className="flex space-x-8">
            <button className="text-white border-b-2 border-purple-500 px-4 py-2 font-medium">Videos</button>
            <button className="text-gray-400 hover:text-white px-4 py-2 font-medium">Playlists</button>
            <button className="text-gray-400 hover:text-white px-4 py-2 font-medium">About</button>
            <button className="text-gray-400 hover:text-white px-4 py-2 font-medium">Live Streams</button>
          </div>
        </div>
        
        {/* User Videos - Grouped by series */}
        {seriesList.length > 0 ? (
          <div>
            {seriesList.map(episodes => (
              <SeriesTrayCard key={episodes[0]?.seriesId || episodes[0]?.title} episodes={episodes} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-4">You haven't uploaded any videos yet</h3>
            <p className="text-gray-400 mb-8">Your uploaded videos will appear here.</p>
            <Link to="/upload">
              <Button>
                <Upload className="h-5 w-5 mr-2" />
                Upload Your First Video
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;