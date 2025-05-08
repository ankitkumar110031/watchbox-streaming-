import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Search } from 'lucide-react';
import { useVideos } from '../../context/VideoContext';

const providers = [
  { id: 'netflix', name: 'Netflix', color: 'bg-red-600' },
  { id: 'disney', name: 'Disney+', color: 'bg-blue-600' },
  { id: 'prime', name: 'Prime Video', color: 'bg-blue-500' },
  { id: 'hbo', name: 'HBO Max', color: 'bg-purple-600' },
  { id: 'hulu', name: 'Hulu', color: 'bg-green-500' }
];

const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProviderMenuOpen, setIsProviderMenuOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(providers[0]);

  const toggleProviderMenu = () => {
    setIsProviderMenuOpen(!isProviderMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Play className="h-8 w-8 text-purple-500" />
            <span className="ml-2 text-xl font-bold">WatchBox</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/movies" className="text-gray-300 hover:text-white">Movies</Link>
            <Link to="/tv" className="text-gray-300 hover:text-white">TV Shows</Link>
            <Link to="/anime" className="text-gray-300 hover:text-white">Anime</Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos..."
                className="w-full bg-gray-800 text-white rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </form>
          </div>

          {/* Provider Selector */}
          <div className="relative">
            <button
              onClick={toggleProviderMenu}
              className="flex items-center space-x-2 text-gray-300 hover:text-white"
            >
              <div className={`w-4 h-4 rounded-full ${selectedProvider.color}`} />
              <span>{selectedProvider.name}</span>
            </button>
            {isProviderMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1">
                {providers.map(provider => (
                  <button
                    key={provider.id}
                    onClick={() => {
                      setSelectedProvider(provider);
                      setIsProviderMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    <div className={`w-3 h-3 rounded-full ${provider.color}`} />
                    <span>{provider.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;