import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Tv, BookOpen, Menu, Play, Clock, Home, UploadCloud, Settings } from 'lucide-react';
import { useVideos } from '../../context/VideoContext';
import WatchHistory from '../video/WatchHistory';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { watchHistory } = useVideos();
  const [showHistory, setShowHistory] = useState(false);

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-gray-950 text-white flex flex-col z-20 transition-all duration-300 ${
        collapsed ? 'w-14' : 'w-36'
      }`}
    >
      {/* Logo and Nav Icon always at the top */}
      <div className="flex flex-col items-center justify-center h-20 mb-2">
        <Link to="/" className="flex items-center space-x-2">
          <Play className="h-7 w-7 text-purple-500" />
          {!collapsed && <span className="text-lg font-bold tracking-wide">WatchBox</span>}
        </Link>
        <button
          className="mt-3 bg-gray-800 rounded-full p-2 hover:bg-gray-700 transition"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar content */}
      {!collapsed && (
        <div className="flex flex-col justify-between flex-1 p-6 pr-3">
          <div>
            <h2 className="text-lg font-bold mb-4">Browse</h2>
            <nav className="flex flex-col space-y-3">
              <Link to="/" className="flex items-center space-x-2 hover:text-purple-400">
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
              <Link to="/movies" className="flex items-center space-x-2 hover:text-purple-400">
                <Film className="h-5 w-5" />
                <span>Movies</span>
              </Link>
              <Link to="/tv" className="flex items-center space-x-2 hover:text-purple-400">
                <Tv className="h-5 w-5" />
                <span>TV Shows</span>
              </Link>
              <Link to="/anime" className="flex items-center space-x-2 hover:text-purple-400">
                <BookOpen className="h-5 w-5" />
                <span>Anime</span>
              </Link>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center space-x-2 hover:text-purple-400"
              >
                <Clock className="h-5 w-5" />
                <span>History</span>
              </button>
              {showHistory && (
                <div className="ml-7 mt-2 bg-gray-900 rounded-lg p-2">
                  <WatchHistory videos={watchHistory} />
                </div>
              )}
            </nav>
          </div>
          {/* Bottom section for Upload and Settings */}
          <div className="pb-4">
            <nav className="flex flex-col space-y-3">
              <Link to="/upload" className="flex items-center space-x-2 hover:text-purple-400">
                <UploadCloud className="h-5 w-5" />
                <span>Upload</span>
              </Link>
              <Link to="/settings" className="flex items-center space-x-2 hover:text-purple-400">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar; 