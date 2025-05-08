import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useVideos } from '../context/VideoContext';
import Layout from '../components/layout/Layout';
import VideoGrid from '../components/video/VideoGrid';
import { Video } from '../types';
import { SearchX } from 'lucide-react';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  const { searchVideos } = useVideos();
  const [results, setResults] = useState<Video[]>([]);
  const [isSearching, setIsSearching] = useState(true);

  useEffect(() => {
    if (query) {
      setIsSearching(true);
      // Simulate search delay
      const timer = setTimeout(() => {
        const searchResults = searchVideos(query);
        setResults(searchResults);
        setIsSearching(false);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsSearching(false);
    }
  }, [query, searchVideos]);

  return (
    <Layout>
      {query ? (
        <>
          {isSearching ? (
            <VideoGrid loading={true} title={`Searching for "${query}"...`} />
          ) : (
            <>
              {results.length > 0 ? (
                <VideoGrid 
                  videos={results} 
                  title={`Search results for "${query}"`}
                  description={`Found ${results.length} video${results.length !== 1 ? 's' : ''}`}
                />
              ) : (
                <div className="container mx-auto px-4 py-16 text-center">
                  <SearchX className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No results found</h2>
                  <p className="text-gray-400 mb-8">
                    We couldn't find any videos matching "{query}"
                  </p>
                  <div className="max-w-md mx-auto">
                    <h3 className="text-lg font-medium mb-2">Suggestions:</h3>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Check your spelling</li>
                      <li>• Try different keywords</li>
                      <li>• Try more general keywords</li>
                      <li>• Try fewer keywords</li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Search for videos</h2>
          <p className="text-gray-400">
            Enter a search term in the search bar above to find videos.
          </p>
        </div>
      )}
    </Layout>
  );
};

export default SearchPage;