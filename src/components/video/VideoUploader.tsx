import React, { useState, useRef } from 'react';
import { Upload, X, FileVideo, Image, Link as LinkIcon, Film, Tv } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useVideos } from '../../context/VideoContext';
import { useAuth } from '../../context/AuthContext';
import { VideoUploadProgress } from '../../types';

const VideoUploader: React.FC = () => {
  const { uploadVideo, videos } = useVideos();
  const { authState } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<VideoUploadProgress>({
    progress: 0,
    isUploading: false,
    error: null,
  });
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    video?: string;
    videoUrl?: string;
    thumbnail?: string;
    genre?: string;
  }>({});
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('url');
  const [contentType, setContentType] = useState<'movie' | 'series' | 'anime'>('movie');
  const [genre, setGenre] = useState<string[]>([]);
  const [quality, setQuality] = useState('1080p');
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [season, setSeason] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState('');
  const [stickyTitle, setStickyTitle] = useState('');
  const [stickyThumbnail, setStickyThumbnail] = useState<string | null>(null);
  const [stickyGenre, setStickyGenre] = useState<string[]>([]);
  const [stickyDescription, setStickyDescription] = useState('');

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const genreOptions = [
    'Action', 'Adult', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Sport', 'Thriller', 'War', 'Western'
  ];

  // Compute unique series/anime options
  const seriesOptions = Array.from(
    new Map(
      videos
        .filter(v => v.metadata?.type === contentType && (contentType === 'series' || contentType === 'anime'))
        .map(v => [
          (v.seriesId || v.title).trim().toLowerCase(),
          v
        ])
    ).values()
  );

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.includes('video/')) {
        setErrors(prev => ({ ...prev, video: 'Please select a valid video file' }));
        return;
      }
      
      setVideoFile(file);
      setErrors(prev => ({ ...prev, video: undefined }));
    }
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setVideoUrl(url);
    
    // Basic URL validation
    try {
      new URL(url);
      setErrors(prev => ({ ...prev, videoUrl: undefined }));
    } catch {
      setErrors(prev => ({ ...prev, videoUrl: 'Please enter a valid URL' }));
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.includes('image/')) {
        setErrors(prev => ({ ...prev, thumbnail: 'Please select a valid image file' }));
        return;
      }
      
      setThumbnailFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      setErrors(prev => ({ ...prev, thumbnail: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (uploadMethod === 'file' && !videoFile) {
      newErrors.video = 'Video file is required';
    }
    
    if (uploadMethod === 'url') {
      if (!videoUrl.trim()) {
        newErrors.videoUrl = 'Video URL is required';
      } else {
        try {
          new URL(videoUrl);
        } catch {
          newErrors.videoUrl = 'Please enter a valid URL';
        }
      }
    }
    
    if (!thumbnailFile && !thumbnailPreview) {
      newErrors.thumbnail = 'Thumbnail is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const simulateUpload = (callback: (progress: number) => void) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      callback(Math.floor(progress));
    }, 300);
    
    return () => clearInterval(interval);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setUploadProgress({
        progress: 0,
        isUploading: true,
        error: null,
      });
      
      // In a real app, you would upload the files to a server
      // For this mock, we'll simulate the upload progress
      simulateUpload((progress) => {
        setUploadProgress(prev => ({
          ...prev,
          progress,
        }));
      });
      
      // Simulate upload time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock thumbnail URL (in a real app, this would be the uploaded thumbnail URL)
      const thumbnailUrl = thumbnailPreview || 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=600';
      
      await uploadVideo({
        title,
        description,
        thumbnailUrl,
        videoUrl: uploadMethod === 'url' ? videoUrl : 'https://example.com/video.mp4',
        duration: 120, // Mock duration in seconds
        userId: authState.user?.id || '1',
        metadata: {
          type: contentType,
          year: new Date().getFullYear(),
          genre,
          quality,
        },
        seriesId: contentType === 'series' || contentType === 'anime' ? title.trim().toLowerCase() : undefined,
        season: season ? parseInt(season) : undefined,
        episodeNumber: episodeNumber ? parseInt(episodeNumber) : undefined,
      });
      
      if (contentType === 'series' || contentType === 'anime') {
        setStickyTitle(title);
        setStickyThumbnail(thumbnailPreview);
        setStickyGenre(genre);
        setStickyDescription(description);
        // Only clear video URL, season, episode
        setVideoUrl('');
        setSeason('');
        setEpisodeNumber('');
        setVideoFile(null);
        setUploadProgress({ progress: 100, isUploading: false, error: null });
        if (videoInputRef.current) videoInputRef.current.value = '';
        // Do not clear title, thumbnail, genre, or description
      } else {
        // For movies, clear everything
        setTitle('');
        setDescription('');
        setVideoFile(null);
        setVideoUrl('');
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setGenre([]);
        setQuality('1080p');
        setSeason('');
        setEpisodeNumber('');
        if (videoInputRef.current) videoInputRef.current.value = '';
        if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
        setUploadProgress({ progress: 100, isUploading: false, error: null });
      }
      
      // Show success message
      alert('Video uploaded successfully!');
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress({
        progress: 0,
        isUploading: false,
        error: 'Failed to upload video. Please try again.',
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-gray-900 rounded-lg p-6 shadow-xl">
      <h1 className="text-2xl font-bold mb-6">Upload {contentType === 'movie' ? 'Movie' : contentType === 'series' ? 'TV Series' : 'Anime'}</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Content Type Selection */}
          <div className="flex space-x-4">
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-lg border ${
                contentType === 'movie'
                  ? 'border-purple-500 bg-purple-500/10 text-purple-500'
                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
              onClick={() => setContentType('movie')}
            >
              <Film className="h-5 w-5 mx-auto mb-2" />
              Movie
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-lg border ${
                contentType === 'series'
                  ? 'border-purple-500 bg-purple-500/10 text-purple-500'
                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
              onClick={() => setContentType('series')}
            >
              <Tv className="h-5 w-5 mx-auto mb-2" />
              TV Series
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-lg border ${
                contentType === 'anime'
                  ? 'border-purple-500 bg-purple-500/10 text-purple-500'
                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
              onClick={() => setContentType('anime')}
            >
              <Film className="h-5 w-5 mx-auto mb-2" />
              Anime
            </button>
          </div>

          {/* Title & Description */}
          <div className="space-y-4">
            {/* Series/Anime Selector */}
            {(contentType === 'series' || contentType === 'anime') && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Select Existing {contentType === 'series' ? 'TV Show' : 'Anime'} or Create New</label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white mb-2"
                  value={seriesOptions.some(opt => opt.seriesId === title || opt.title === title) ? title : ''}
                  onChange={e => {
                    const selected = seriesOptions.find(opt => opt.seriesId === e.target.value || opt.title === e.target.value);
                    if (selected) {
                      setTitle(selected.seriesId || selected.title);
                      setStickyTitle(selected.seriesId || selected.title);
                      setThumbnailPreview(selected.thumbnailUrl);
                      setStickyThumbnail(selected.thumbnailUrl);
                      setGenre(selected.metadata?.genre || []);
                      setStickyGenre(selected.metadata?.genre || []);
                      setDescription(selected.description || '');
                      setStickyDescription(selected.description || '');
                    } else {
                      setTitle('');
                      setStickyTitle('');
                      setThumbnailPreview(null);
                      setStickyThumbnail(null);
                      setGenre([]);
                      setStickyGenre([]);
                      setDescription('');
                      setStickyDescription('');
                    }
                  }}
                >
                  <option value="">-- Create New --</option>
                  {seriesOptions.map(opt => (
                    <option key={opt.seriesId || opt.title} value={opt.seriesId || opt.title}>
                      {opt.seriesId || opt.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <Input
              label="Title"
              placeholder={`Enter ${contentType === 'movie' ? 'movie' : contentType === 'series' ? 'series' : 'anime'} title`}
              value={contentType === 'series' || contentType === 'anime' ? (title || stickyTitle) : title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              error={errors.title}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={4}
                placeholder="Describe the content"
                value={contentType === 'series' || contentType === 'anime' ? (description || stickyDescription) : description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>
            {/* Season & Episode fields for series/anime */}
            {(contentType === 'series' || contentType === 'anime') && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Season"
                  type="number"
                  placeholder="Season number"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                />
                <Input
                  label="Episode"
                  type="number"
                  placeholder="Episode number"
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="genre" className="block text-sm font-medium text-gray-300">
                Genre
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-left focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onClick={() => setShowGenreDropdown((prev) => !prev)}
                >
                  {genre.length > 0 ? genre.join(', ') : 'Select genre(s)'}
                </button>
                {showGenreDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-gray-900 border border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {genreOptions.map((option) => (
                      <label key={option} className="flex items-center px-3 py-2 hover:bg-gray-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={genre.includes(option)}
                          onChange={() => {
                            setGenre((prev) =>
                              prev.includes(option)
                                ? prev.filter((g) => g !== option)
                                : [...prev, option]
                            );
                          }}
                          className="mr-2 accent-purple-500"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {errors.genre && (
                <p className="text-red-500 text-sm">{errors.genre}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Quality
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100"
              >
                <option value="480p">480p</option>
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
                <option value="4K">4K</option>
              </select>
            </div>
          </div>

          {/* Upload Method Selection */}
          <div className="space-y-4">
            <div className="flex space-x-4">
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-lg border ${
                  uploadMethod === 'file'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-500'
                    : 'border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
                onClick={() => setUploadMethod('file')}
              >
                <FileVideo className="h-5 w-5 mx-auto mb-2" />
                Upload File
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-lg border ${
                  uploadMethod === 'url'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-500'
                    : 'border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
                onClick={() => setUploadMethod('url')}
              >
                <LinkIcon className="h-5 w-5 mx-auto mb-2" />
                Video URL
              </button>
            </div>

            {/* Video Upload Section */}
            {uploadMethod === 'file' ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Video File
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    ref={videoInputRef}
                    onChange={handleVideoChange}
                    accept="video/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="h-5 w-5" />
                    <span>Choose Video</span>
                  </Button>
                  {videoFile && (
                    <span className="text-sm text-gray-400">
                      {videoFile.name}
                    </span>
                  )}
                </div>
                {errors.video && (
                  <p className="text-sm text-red-500">{errors.video}</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Video URL
                </label>
                <Input
                  type="url"
                  placeholder="Enter video URL (e.g., MovieBox.ng, YouTube, or direct video link)"
                  value={videoUrl}
                  onChange={handleVideoUrlChange}
                  fullWidth
                  error={errors.videoUrl}
                />
              </div>
            )}
          </div>

          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Thumbnail
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                ref={thumbnailInputRef}
                onChange={handleThumbnailChange}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                className="flex items-center space-x-2"
              >
                <Image className="h-5 w-5" />
                <span>Choose Thumbnail</span>
              </Button>
              {thumbnailPreview && (
                <div className="relative w-20 h-20">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailPreview(null);
                      setThumbnailFile(null);
                      if (thumbnailInputRef.current) {
                        thumbnailInputRef.current.value = '';
                      }
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            {errors.thumbnail && (
              <p className="text-sm text-red-500">{errors.thumbnail}</p>
            )}
          </div>

          {/* Upload Progress */}
          {uploadProgress.isUploading && (
            <div className="space-y-2">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 text-center">
                Uploading... {uploadProgress.progress}%
              </p>
            </div>
          )}

          {/* Error Message */}
          {uploadProgress.error && (
            <p className="text-sm text-red-500 text-center">
              {uploadProgress.error}
            </p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={uploadProgress.isUploading}
          >
            {uploadProgress.isUploading ? 'Uploading...' : 'Upload Content'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VideoUploader;