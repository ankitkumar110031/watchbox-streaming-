import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Search } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className={`flex-1 bg-gray-950 text-white flex flex-col transition-all duration-300 ${collapsed ? 'ml-14' : 'ml-36'} px-6`}>
        {/* Search Section at the top */}
        <div className="w-full px-8 pt-8 pb-4">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search videos, movies, TV shows, anime..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>
        <div className="flex-1">{children}</div>
        <Footer />
      </main>
    </div>
  );
};

export default Layout;