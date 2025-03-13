import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft, Calendar, User, Clock, ChevronDown, MessageSquare, CheckCircle
} from "lucide-react";

export default function WorkDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activityLog, setActivityLog] = useState([]);
  const [expandedSection, setExpandedSection] = useState("details");

  useEffect(() => {
    fetchWorkDetails();
  }, []);

  const fetchWorkDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/works/${id}`, { withCredentials: true });
      if (res.status === 200) {
        setWork(res.data);
        fetchActivityLogs();
      }
    } catch (err) {
      console.error("🚨 Error fetching work details:", err.response?.data || err.message);
      setError("Failed to load work details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/works/${id}/activities`, { withCredentials: true });
      if (res.status === 200) {
        setActivityLog(res.data);
      }
    } catch (err) {
      console.error("🚨 Error fetching activity logs:", err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-blue-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Work Header */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold">{work.title}</h1>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      work.currentStage === work.stages.length - 1
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {work.status}
                  </span>
                </div>
                
                <div className="text-sm text-gray-500 flex items-center gap-4 mb-4">
                  <span>Work ID: {work.workId || id.substring(0, 8)}</span>
                  <span>•</span>
                  <span>Assigned: {work.assignedEmployee?.name || "Unassigned"}</span>
                </div>
              </div>

              {/* ✅ Timeline Progress */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Work Progress</h2>
                <div className="flex items-center justify-between relative">
                  {work.stages.map((stage, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 font-semibold
                        ${index < work.currentStage ? "bg-green-500 text-white border-green-500"
                          : index === work.currentStage ? "bg-blue-500 text-white border-blue-500"
                          : "bg-gray-300 text-gray-700 border-gray-400"}`}>
                        {index < work.currentStage ? <CheckCircle className="w-5 h-5" /> : index + 1}
                      </div>
                      <p className="text-xs mt-2 text-center text-gray-700 w-20">{stage}</p>
                    </div>
                  ))}
                  <div className="absolute top-5 left-0 w-full h-1 bg-gray-300 -z-10"></div>
                </div>
              </div>

              {/* Work Content Accordion */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* Description Section */}
                <div className="border-b border-gray-200">
                  <button 
                    className="w-full px-6 py-4 text-left flex justify-between items-center"
                    onClick={() => toggleSection("details")}
                  >
                    <span className="text-sm font-medium text-gray-800">Work Details</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transform ${expandedSection === "details" ? "rotate-180" : ""}`} />
                  </button>
                  {expandedSection === "details" && (
                    <div className="px-6 py-4 bg-gray-50">
                      <h3 className="text-sm font-medium mb-2">Description</h3>
                      <p className="text-gray-700 mb-4">{work.description}</p>
                    </div>
                  )}
                </div>

                {/* Activity Log Section */}
                <div className="border-b border-gray-200">
                  <button 
                    className="w-full px-6 py-4 text-left flex justify-between items-center"
                    onClick={() => toggleSection("activity")}
                  >
                    <span className="text-sm font-medium text-gray-800">Activity & Comments</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transform ${expandedSection === "activity" ? "rotate-180" : ""}`} />
                  </button>
                  {expandedSection === "activity" && (
                    <div className="px-6 py-4 bg-gray-50">
                      {activityLog.length > 0 ? (
                        activityLog.map((activity, index) => (
                          <div key={index} className="flex gap-3 mb-4">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between">
                                <h4 className="text-sm font-medium">{activity.user || "System"}</h4>
                                <span className="text-xs text-gray-500">{formatDate(activity.timestamp)}</span>
                              </div>
                              <p className="text-sm text-gray-700">{activity.comment}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No activity recorded yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
