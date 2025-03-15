import React, { useState, useEffect } from 'react';
import { Search, Layers, CheckCircle, AlertCircle, Clock, Calendar, UserCircle } from 'lucide-react';
import axios from 'axios';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [workDetails, setWorkDetails] = useState(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    // Animation for the 3D card when component mounts
    const welcomeCard = document.getElementById('welcome-card');
    if (welcomeCard) {
      welcomeCard.classList.add('animate-rise');
    }
  }, []);

  // Handle Search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      setError('');
      const res = await axios.get(`http://localhost:5000/works/${encodeURIComponent(searchQuery)}`, {
        withCredentials: true,
      });

      if (!res.data || !res.data.workId) {
        setError("No work found. Please enter a valid Work ID.");
        setWorkDetails(null);
        return;
      }

      setWorkDetails(res.data);
      setExpanded(false);
      
      // Add to recent searches
      setRecentSearches(prev => {
        const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 3);
        return updated;
      });
    } catch (err) {
      console.error("🚨 Error fetching work:", err.response?.data || err.message);
      setError(err.response?.data?.msg || "Work not found. Please enter a valid Work ID.");
      setWorkDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen  p-4">
      {/* 3D Floating Header Card */}
      <div 
        id="welcome-card"
        className="max-w-4xl mx-auto mb-8 bg-white rounded-xl shadow-xl overflow-hidden transform transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-2xl"
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden">
          {/* 3D Decorative Elements */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/10 to-transparent"></div>
          
          <div className="relative z-10 flex items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Work Manager</h1>
              <p className="text-blue-100 text-lg max-w-xl">
                Track, manage, and organize your work in one place with our professional management system
              </p>
            </div>
            <div className="ml-auto">
              <div className="w-24 h-24 relative">
                <div className="absolute inset-0 bg-indigo-500 rounded-lg transform rotate-45 translate-x-2 translate-y-2"></div>
                <div className="absolute inset-0 bg-blue-500 rounded-lg transform rotate-12 translate-x-1 translate-y-1"></div>
                <div className="absolute inset-0 bg-white rounded-lg flex items-center justify-center">
                  <Layers className="w-12 h-12 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 transform transition-all duration-300 hover:shadow-xl">
          <form onSubmit={handleSearch}>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Enter work ID (e.g., WM-1234)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-lg border border-slate-300 
                           shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           placeholder-slate-400 transition-all duration-200
                           text-slate-800"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 
                                text-slate-400 w-5 h-5" />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg
                         hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         transition-colors duration-200 shadow-md flex items-center gap-2"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-1">Recent searches:</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(search)}
                    className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full
                             hover:bg-slate-200 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Work Details Card */}
        {workDetails && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">
                  {workDetails.title}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(workDetails.status)}`}>
                  {workDetails.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Started: {new Date(workDetails.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {new Date(workDetails.deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserCircle className="w-4 h-4" />
                  <span>{workDetails.assignedEmployee?.name || "Unassigned"}</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-6 py-4">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <h3 className="text-lg font-semibold text-slate-700">Work ID: {workDetails.workId}</h3>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-slate-600">Organization:</span>
                  <span className="text-sm text-slate-700">{workDetails.organization || "N/A"}</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.round((workDetails.currentStage / (workDetails.stages.length - 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(workDetails.currentStage / (workDetails.stages.length - 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Fixed Workflow Stages */}
              <div className="mt-12 mb-16">
                <h4 className="text-sm font-semibold text-slate-700 mb-6">Workflow Stages</h4>
                
                {/* Stage bar with proper spacing */}
                <div className="relative">
                  {/* Progress line */}
                  <div className="absolute top-4 left-0 right-0 h-1 bg-slate-300"></div>
                  <div 
                    className="absolute top-4 left-0 h-1 bg-blue-600"
                    style={{ width: `${(workDetails.currentStage / (workDetails.stages.length - 1)) * 100}%` }}
                  ></div>

                  {/* Stage markers */}
                  <div className="flex justify-between">
                    {workDetails.stages.map((stage, index) => (
                      <div key={index} className="relative flex flex-col items-center">
                        {/* Stage circle */}
                        <div className={`w-8 h-8 rounded-full z-10 flex items-center justify-center ${
                          index < workDetails.currentStage ? 'bg-blue-600' : 
                          index === workDetails.currentStage ? 'bg-white border-2 border-blue-600' : 'bg-white border-2 border-slate-300'
                        }`}>
                          {index < workDetails.currentStage ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <span className="text-xs font-semibold">{index + 1}</span>
                          )}
                        </div>
                        
                        {/* Stage label with careful positioning */}
                        <div className="text-xs font-medium text-slate-600 mt-3 w-20 text-center">
                          {stage}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* View More Button */}
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-4 w-full px-4 py-3 text-blue-600 font-semibold border border-blue-200 rounded-lg
                         hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         transition duration-200 flex items-center justify-center"
              >
                {expanded ? "Hide Details" : "View More Details"}
              </button>
            </div>

            {/* Expanded Details */}
            {expanded && (
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-1">Description</h4>
                    <p className="text-slate-600 text-sm">{workDetails.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-1">Work Description</h4>
                    <p className="text-slate-600 text-sm">{workDetails.workDescription}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Activity Log</h4>
                    <div className="space-y-3">
                      {workDetails.activityLog.map((log, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-700">{log.user}</span>
                            <span className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{log.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;