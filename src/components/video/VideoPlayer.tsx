import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Download, AlertCircle, RefreshCw } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  metadata?: {
    type: 'movie' | 'series';
    quality: string;
  };
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  autoPlay = false,
  onTimeUpdate,
  onEnded,
  metadata,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qualityMenuRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const [isHovered, setIsHovered] = useState(false);

  // Handle click outside quality menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (qualityMenuRef.current && !qualityMenuRef.current.contains(event.target as Node)) {
        setShowQualityMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetVideo = () => {
    if (videoRef.current) {
      videoRef.current.load();
      setError(null);
      setIsLoading(true);
      setRetryCount(0);
    }
  };

  useEffect(() => {
    // Reset states when source changes
    setError(null);
    setIsLoading(true);
    setIsPlaying(false);
    setRetryCount(0);

    // Check if the URL is from a supported video platform
    try {
      const isYouTubeUrl = src.includes('youtube.com') || src.includes('youtu.be');
      const isVimeoUrl = src.includes('vimeo.com');
      const isMovieBoxUrl = src.includes('moviebox.ng') || src.includes('v.inmoviebox.com');
      
      if (isYouTubeUrl || isVimeoUrl) {
        setIsEmbedded(true);
        if (isYouTubeUrl) {
          // Convert YouTube URL to embed URL
          const videoId = src.includes('youtu.be') 
            ? src.split('/').pop()?.split('?')[0]
            : new URL(src).searchParams.get('v');
          if (videoId) {
            setEmbedUrl(`https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&enablejsapi=1`);
          } else {
            setError('Invalid YouTube URL format');
          }
        } else if (isVimeoUrl) {
          // Convert Vimeo URL to embed URL
          const videoId = src.split('/').pop();
          if (videoId) {
            setEmbedUrl(`https://player.vimeo.com/video/${videoId}?autoplay=${autoPlay ? 1 : 0}`);
          } else {
            setError('Invalid Vimeo URL format');
          }
        }
      } else if (isMovieBoxUrl) {
        // For MovieBox.ng, we'll use direct video playback
        setIsEmbedded(false);
        try {
          const url = new URL(src);
          if (url.hostname === 'v.inmoviebox.com') {
            // Extract the video ID from the path
            const videoId = url.pathname.split('/').pop();
            if (!videoId) {
              setError('Invalid MovieBox video ID');
              return;
            }
            // Attempt to use the direct video URL or let the browser handle it
            // setError('Please use the direct video URL from MovieBox.ng'); // Removed this line
          } else {
            // Handle regular moviebox.ng URLs
            if (!url.pathname.includes('/watch/')) {
              setError('Invalid MovieBox.ng URL format');
              return;
            }
            // Attempt to use the direct video URL or let the browser handle it
            // setError('Please use the direct video URL from MovieBox.ng'); // Removed this line
          }
        } catch (err) {
          setError('Invalid MovieBox URL format');
        }
      } else {
        setIsEmbedded(false);
        // Validate direct video URL
        if (!src.startsWith('http')) {
          setError('Invalid video URL format');
        }
      }
    } catch (err) {
      setError('Invalid video URL');
      setIsEmbedded(false);
    }
  }, [src, autoPlay]);

  useEffect(() => {
    if (isEmbedded) return;

    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleError = (e: Event) => {
      const videoElement = e.target as HTMLVideoElement;
      let errorMessage = 'Error loading video';
      
      if (videoElement.error) {
        switch (videoElement.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Video playback was aborted';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error while loading video';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Video format not supported';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Video source not supported';
            break;
        }
      }

      // Try to recover from error
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          resetVideo();
        }, 1000 * retryCount); // Exponential backoff
      } else {
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    const handleLoadedData = () => {
      setIsLoading(false);
      setError(null);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
    };

    const handleStalled = () => {
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          resetVideo();
        }, 1000 * retryCount);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('stalled', handleStalled);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('stalled', handleStalled);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onTimeUpdate, onEnded, isEmbedded, retryCount]);

  const togglePlay = () => {
    if (videoRef.current && !isEmbedded) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((err) => {
          console.error('Playback error:', err);
          if (retryCount < maxRetries) {
            setRetryCount(prev => prev + 1);
            setTimeout(() => {
              resetVideo();
            }, 1000 * retryCount);
          } else {
            setError('Error playing video. Please try again.');
          }
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current && !isEmbedded) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current && !isEmbedded) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current && !isEmbedded) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen().catch(() => {
        setError('Error entering fullscreen mode');
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (src) {
      try {
        const link = document.createElement('a');
        link.href = src;
        link.download = 'video.mp4';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        setError('Error downloading video');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    switch (e.key.toLowerCase()) {
      case 'arrowleft':
      case 'j':
        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
        break;
      case 'arrowright':
      case 'l':
        videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
        break;
      case ' ': // Spacebar
        e.preventDefault();
        togglePlay();
        break;
      case 'm':
        toggleMute();
        break;
      case 'f':
        toggleFullscreen();
        break;
      case 'arrowup':
        videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.1);
        setVolume(videoRef.current.volume);
        setIsMuted(videoRef.current.volume === 0);
        break;
      case 'arrowdown':
        videoRef.current.volume = Math.max(0, videoRef.current.volume - 0.1);
        setVolume(videoRef.current.volume);
        setIsMuted(videoRef.current.volume === 0);
        break;
      case '0':
        videoRef.current.currentTime = 0;
        break;
      default:
        break;
    }
  };

  if (error) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <div className="flex flex-col space-y-4 mt-4">
            <p className="text-white text-sm">
              For MovieBox.ng videos, please:
              <br />1. Go to the video page on MovieBox.ng
              <br />2. Right-click on the video and select "Copy video address"
              <br />3. Paste that URL here
            </p>
            <div className="flex space-x-4">
              <button
                onClick={resetVideo}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
              {retryCount > 0 && (
                <button
                  onClick={() => {
                    setRetryCount(0);
                    resetVideo();
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Reset Player
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isEmbedded) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video player"
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoading(false)}
          onError={() => setError('Error loading embedded video')}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          style={{ border: 'none' }}
        />
      </div>
    );
  }

  return (
    <div
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ outline: 'none' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        className="w-full h-full"
        onClick={togglePlay}
        playsInline
        crossOrigin="anonymous"
      />

      {/* Play Button Overlay: Only show when paused and hovered */}
      {(!isPlaying && isHovered) && (
        <button
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-600 bg-opacity-80 rounded-full p-4 z-30 focus:outline-none"
          onClick={togglePlay}
          tabIndex={-1}
          aria-label="Play"
          style={{ pointerEvents: 'auto' }}
        >
          <Play className="h-12 w-12 text-white" />
        </button>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress Bar */}
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer mb-2"
          style={{
            background: `linear-gradient(to right, #9333ea ${(currentTime / duration) * 100}%, #4b5563 0%)`,
          }}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-purple-400 transition-colors"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>

            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-purple-400 transition-colors"
              >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Time Display */}
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quality Button */}
            {metadata?.quality && (
              <div className="relative" ref={qualityMenuRef}>
                <button
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className="text-white hover:text-purple-400 transition-colors"
                >
                  {metadata.quality}
                </button>
                {showQualityMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-lg p-2 z-10">
                    <button className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 rounded">
                      480p
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 rounded">
                      720p
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 rounded">
                      1080p
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 rounded">
                      4K
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="text-white hover:text-purple-400 transition-colors"
            >
              <Download size={24} />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-purple-400 transition-colors"
            >
              {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;