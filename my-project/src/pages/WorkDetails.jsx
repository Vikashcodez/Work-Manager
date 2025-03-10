import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Calendar, User, Clock, AlertCircle, CheckCircle, Info } from "lucide-react";

export default function WorkDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    fetchWorkDetails();
  }, []);

  const fetchWorkDetails = async () => {
    try {
      console.log(`📡 Fetching work details for ID: ${id}`);
      const res = await axios.get(`http://localhost:5000/works/${id}`, {
        withCredentials: true,
      });

      if (res.status === 200) {
        console.log("✅ Work details fetched successfully:", res.data);
        setWork(res.data);
        setCurrentStage(0);
      } else {
        console.warn("⚠️ Unexpected response:", res);
      }
    } catch (err) {
      console.error("🚨 Error fetching work details:", err.response?.data || err.message);
      setError("Failed to load work details.");
    } finally {
      setLoading(false);
    }
  };

  // Priority badge renderer
  const PriorityBadge = ({ priority = "medium" }) => {
    const priorityMap = {
      high: { color: "bg-red-500", icon: <AlertCircle className="w-4 h-4 mr-1" /> },
      medium: { color: "bg-orange-500", icon: <Info className="w-4 h-4 mr-1" /> },
      low: { color: "bg-green-500", icon: <CheckCircle className="w-4 h-4 mr-1" /> },
    };
    
    const { color, icon } = priorityMap[priority.toLowerCase()] || priorityMap.medium;
    
    return (
      <span className={`flex items-center ${color} text-white text-xs px-2 py-1 rounded-full`}>
        {icon}
        {priority.toUpperCase()}
      </span>
    );
  };

  // Calculate days remaining
  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Status badge renderer
  const StatusBadge = ({ status = "in progress" }) => {
    const statusMap = {
      "not started": "bg-gray-500",
      "in progress": "bg-blue-500",
      "review": "bg-purple-500",
      "completed": "bg-green-500",
      "blocked": "bg-red-500",
    };
    
    return (
      <span className={`${statusMap[status.toLowerCase()] || "bg-blue-500"} text-white text-xs px-2 py-1 rounded-full`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Header section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
            
            {!loading && !error && work && (
              <div className="flex items-center space-x-3">
                <StatusBadge status={work.status || "in progress"} />
                <PriorityBadge priority={work.priority || "medium"} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 flex justify-center items-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-lg text-red-700">{error}</p>
            <button 
              onClick={() => navigate(-1)} 
              className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Main ticket info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Ticket header */}
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">{work.title}</h1>
                    <div className="text-sm text-gray-500">
                      #{id.slice(0, 8)}
                    </div>
                  </div>
                </div>
                
                {/* Progress tracker */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Progress</h2>
                  <div className="flex items-center gap-1 overflow-x-auto pb-2">
                    {work.stages?.length > 0 ? (
                      work.stages.map((stage, index) => (
                        <div key={index} className="flex items-center">
                          <div
                            className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-medium text-sm ${
                              index < currentStage
                                ? "bg-green-100 text-green-700 border border-green-300"
                                : index === currentStage
                                ? "bg-blue-100 text-blue-700 border-2 border-blue-500"
                                : "bg-gray-100 text-gray-500 border border-gray-300"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div
                            className={`h-1 w-12 ${
                              index < work.stages.length - 1
                                ? index < currentStage
                                  ? "bg-green-500"
                                  : "bg-gray-200"
                                : "hidden"
                            }`}
                          ></div>
                          <div className="absolute mt-12 -ml-10 w-20 text-center">
                            <p className={`text-xs ${
                              index < currentStage
                                ? "text-green-600"
                                : index === currentStage
                                ? "text-blue-600 font-medium"
                                : "text-gray-500"
                            }`}>
                              {stage.length > 10 ? stage.slice(0, 10) + "..." : stage}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No stages available</p>
                    )}
                  </div>
                </div>
                
                {/* Description */}
                <div className="px-6 py-4">
                  <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Description</h2>
                  <div className="prose max-w-none text-gray-700 bg-gray-50 p-4 rounded-md">
                    {work.description}
                  </div>
                </div>
                
                {/* Detailed work description */}
                <div className="px-6 py-4 border-t border-gray-200">
                  <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Work Details</h2>
                  <div className="prose max-w-none text-gray-700 bg-gray-50 p-4 rounded-md whitespace-pre-line">
                    {work.workDescription}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column - Sidebar info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Dates card */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                  <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Dates</h2>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="text-sm font-medium text-gray-700">{new Date(work.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Deadline</p>
                      <p className="text-sm font-medium text-gray-700">{new Date(work.deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {/* Days remaining label */}
                  {work.deadline && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Days remaining:</span>
                        <span 
                          className={`text-sm font-medium rounded-full px-2 py-1 ${
                            getDaysRemaining(work.deadline) < 0
                              ? "bg-red-100 text-red-700"
                              : getDaysRemaining(work.deadline) < 3
                              ? "bg-orange-100 text-orange-700" 
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {getDaysRemaining(work.deadline)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* People card */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                  <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">People</h2>
                </div>
                <div className="p-4">
                  {work.assignedEmployee ? (
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        {work.assignedEmployee.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{work.assignedEmployee.name}</p>
                        <p className="text-xs text-gray-500">{work.assignedEmployee.position}</p>
                        <div className="mt-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block">
                          Assignee
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-500">
                      <User className="w-5 h-5 mr-2" />
                      <p className="text-sm">No assignee</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Activity card placeholder - in a real app this would have comments/activity */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                  <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Activity</h2>
                </div>
                <div className="p-4 text-center text-sm text-gray-500">
                  <p>No recent activity</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}