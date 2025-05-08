import React, { useState } from 'react';
import { useVideos } from '../context/VideoContext';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { Trash2, Edit2, Play, Instagram, Mail, Save, X, ShieldAlert } from 'lucide-react'; // Added ShieldAlert
import { Link, Navigate } from 'react-router-dom'; // Added Navigate

// SeriesTrayCard component for grouped series display
const SeriesTrayCard = ({ episodes, onEdit, onDelete, editingVideo, ...editProps }) => {
  const { authState } = useAuth();
  const { updateVideo } = useVideos();
  // Define admin check (customize as needed)
  const isAdmin = authState.user?.email === 'ankitkuma110001@gmail.com';
  const seasons = Array.from(new Set(episodes.map(ep => ep.season || 1))).sort((a, b) => a - b);
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]);
  // Always sort episodes in the selected season
  const episodesInSeason = episodes
    .filter(ep => (ep.season || 1) === selectedSeason)
    .sort((a, b) => (a.episodeNumber || 1) - (b.episodeNumber || 1));
  // Always keep selectedEpisode in sync with dropdown
  const [selectedEpisode, setSelectedEpisode] = useState(episodesInSeason[0]?.id);
  // When selectedSeason changes, reset selectedEpisode to first in new season
  React.useEffect(() => {
    if (!episodesInSeason.find(ep => ep.id === selectedEpisode)) {
      setSelectedEpisode(episodesInSeason[0]?.id);
    }
  }, [selectedSeason, episodesInSeason]);
  // Always get currentEpisode from selectedEpisode
  const currentEpisode = episodes.find(ep => ep.id === selectedEpisode);

  return (
    <div className="bg-gray-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between mb-4">
      <div className="flex-1">
        <h3 className="text-lg font-bold mb-1">{episodes[0].title}</h3>
        <div className="flex flex-wrap gap-4 mb-2">
          <div>
            <label className="mr-2">Season:</label>
            <select value={selectedSeason} onChange={e => {
              setSelectedSeason(Number(e.target.value));
              const newSeasonEpisodes = episodes.filter(ep => (ep.season || 1) === Number(e.target.value));
              setSelectedEpisode(newSeasonEpisodes[0]?.id);
            }} className="bg-gray-800 text-white rounded px-2 py-1">
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
                  to={`/series/${encodeURIComponent(currentEpisode.seriesId || currentEpisode.title)}?episode=${currentEpisode.id}`}
                  className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition-colors"
                  title={`Play Episode ${currentEpisode.episodeNumber || 1}`}
                  onClick={(e) => {
                    // Store the selected episode in localStorage for the series page to use
                    localStorage.setItem('selectedEpisode', currentEpisode.id);
                  }}
                >
                  <Play className="h-4 w-4" />
                </Link>
                {isAdmin && (
                  <button
                    onClick={() => onEdit(currentEpisode)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
                    title="Edit Episode"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => onDelete(currentEpisode.id)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                    title="Delete Episode"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {currentEpisode && (
          <div className="text-gray-300 mb-2">{currentEpisode.description}</div>
        )}
      </div>
      {/* If editing this episode, show the edit form below (optional) */}
      {isAdmin && (() => { console.log('DEBUG: editingVideo:', editingVideo, 'currentEpisode?.id:', currentEpisode?.id); return null; })()}
      {isAdmin && String(editingVideo) === String(currentEpisode?.id) && editProps.renderEditForm && editProps.renderEditForm(currentEpisode)}
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const { videos, deleteVideo, updateVideo } = useVideos();
  const { authState } = useAuth();
  const [editingVideo, setEditingVideo] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedGenre, setEditedGenre] = useState<string[]>([]);
  const [editedType, setEditedType] = useState('');
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [editedThumbnail, setEditedThumbnail] = useState<string | null>(null);
  const [editedThumbnailFile, setEditedThumbnailFile] = useState<File | null>(null);
  const [editedSeason, setEditedSeason] = useState<number | ''>('');
  const [editedEpisode, setEditedEpisode] = useState<number | ''>('');

  // Admin check
  const isAdmin = authState.user?.email === 'ankitkuma110001@gmail.com';

  if (!authState.isAuthenticated) {
    // If not logged in, redirect to login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!isAdmin) {
    // If logged in but not admin, show access denied or redirect to home
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">You do not have permission to view this page.</p>
          <Link to="/" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            Go to Homepage
          </Link>
        </div>
      </Layout>
    );
  }

  const genreOptions = [
    'Action', 'Adult', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Sport', 'Thriller', 'War', 'Western'
  ];

  const resizeImage = (file: File, maxSize = 400): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height *= maxSize / width));
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width *= maxSize / height));
              height = maxSize;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Try JPEG first, fallback to PNG
            let dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            if (dataUrl.length > 5 * 1024 * 1024) {
              dataUrl = canvas.toDataURL('image/png');
            }
            resolve(dataUrl);
          } else {
            reject(new Error('Could not get canvas context'));
          }
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleEdit = (videoId: string, title: string, description: string, genre: string[] | string | undefined, type: string) => {
    // Debug log
    console.log('Edit button clicked for videoId:', videoId);
    setEditingVideo(String(videoId));
    setEditedTitle(title);
    setEditedDescription(description);
    let genreArr: string[] = [];
    if (Array.isArray(genre)) {
      genreArr = genre;
    } else if (typeof genre === 'string' && genre) {
      genreArr = [genre];
    }
    setEditedGenre(genreArr);
    setEditedType(type || '');
    const video = videos.find(v => String(v.id) === String(videoId));
    setEditedThumbnail(null);
    setEditedThumbnailFile(null);
    setEditedSeason(video?.season ?? '');
    setEditedEpisode(video?.episodeNumber ?? '');
  };

  const handleSave = (videoId: string) => {
    // Only update the selected episode
    updateVideo(videoId, {
      title: editedTitle,
      episodeNumber: editedEpisode !== '' ? Number(editedEpisode) : undefined,
    });
    setEditingVideo(null);
    setEditedThumbnail(null);
    setEditedThumbnailFile(null);
    setEditedSeason('');
    setEditedEpisode('');
  };

  const handleDelete = (videoId: string) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      deleteVideo(videoId);
    }
  };

  // Group videos by seriesId or title
  const grouped = {};
  videos.forEach(video => {
    const key = (video.seriesId || video.title).trim().toLowerCase();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(video);
  });
  const seriesList = Object.values(grouped);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* DEBUG: Show current user email */}
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded">
          <strong>Debug:</strong> Current user email: {authState.user?.email || 'Not logged in'}
        </div>
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {/* Profile Information */}
        <section className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Instagram className="h-5 w-5 text-pink-500" />
              <a 
                href="https://instagram.com/juxt.ankit07" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300"
              >
                @juxt.ankit07
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <Mail className="h-5 w-5 text-blue-500" />
              <a 
                href="mailto:ankitkuma110001@gmail.com"
                className="text-purple-400 hover:text-purple-300"
              >
                ankitkuma110001@gmail.com
              </a>
            </div>
          </div>
        </section>

        {/* My Videos */}
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">My Videos</h2>
          <div className="space-y-4">
            {seriesList.length > 0 ? (
              seriesList.map(episodes => (
                <SeriesTrayCard
                  key={episodes[0].seriesId || episodes[0].title}
                  episodes={episodes}
                  onEdit={(ep) => handleEdit(ep.id, ep.title, ep.description, ep.metadata?.genre, ep.metadata?.type)}
                  onDelete={handleDelete}
                  editingVideo={editingVideo}
                  renderEditForm={(ep) => editingVideo === ep.id && (
                    <div className="flex-1 space-y-4 mt-4">
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="w-full bg-gray-600 text-white rounded px-3 py-2"
                        placeholder="Video Title"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Episode Number</label>
                        <input
                          type="number"
                          min="1"
                          value={editedEpisode}
                          onChange={e => setEditedEpisode(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-gray-600 text-white rounded px-3 py-2"
                          placeholder="Episode number"
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-medium"
                          onClick={() => handleSave(ep.id)}
                        >
                          <Save className="h-4 w-4 mr-1 inline" /> Save
                        </button>
                        <button
                          className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white font-medium"
                          onClick={() => setEditingVideo(null)}
                        >
                          <X className="h-4 w-4 mr-1 inline" /> Cancel
                        </button>
                      </div>
                    </div>
                  )}
                />
              ))
            ) : (
              <div className="text-gray-400 text-center py-8">No videos found.</div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default SettingsPage; 