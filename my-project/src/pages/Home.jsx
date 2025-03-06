import React, { useState } from 'react';
import { Search } from 'lucide-react';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search functionality here
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Welcome Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          Welcome to Work Manager
        </h1>
        <p className="text-slate-600 text-lg">
          Track, manage, and organize your work in one place
        </p>
      </div>

      {/* Search Section */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="relative">
          <div className="flex gap-2">
            {/* Search Input */}
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Enter work ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 
                           shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           placeholder-slate-400 transition-all duration-200
                           text-slate-800 text-lg"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 
                                text-slate-400 w-5 h-5" />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg
                         hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         transition-colors duration-200 shadow-sm"
            >
              Search
            </button>
          </div>
        </form>

        {/* Quick Tips */}
        <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Quick Tips</h2>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Enter the complete work ID (e.g., WM-1234)</li>
            <li>• Use the search button or press Enter to search</li>
            <li>• Recent searches will appear here</li>
          </ul>
        </div>
      </div>

      {/* Recent Searches Placeholder */}
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Recent Searches</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-600 hover:bg-slate-50 p-2 rounded cursor-pointer">
              <Search className="w-4 h-4" />
              <span>WM-1234</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 hover:bg-slate-50 p-2 rounded cursor-pointer">
              <Search className="w-4 h-4" />
              <span>WM-5678</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;