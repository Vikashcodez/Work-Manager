import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, Calendar, User, Clock, AlertCircle, 
  CheckCircle, Info, ChevronDown, MessageSquare 
} from "lucide-react";

export default function WorkDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [work, setWork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentStage, setCurrentStage] = useState(0);
    const [updating, setUpdating] = useState(false);
    const [comment, setComment] = useState("");
    const [timeSpent, setTimeSpent] = useState("");
    const [activityLog, setActivityLog] = useState([]);
    const [expandedSection, setExpandedSection] = useState("details");

    useEffect(() => {
        fetchWorkDetails();
    }, []);

    const fetchWorkDetails = async () => {
        try {
            console.log(`📡 Fetching work details for ID: ${id}`);
            const res = await axios.get(`http://localhost:5000/works/${id}`, { withCredentials: true });

            if (res.status === 200) {
                console.log("✅ Work details fetched successfully:", res.data);
                setWork(res.data);
                setCurrentStage(res.data.currentStage || 0);
                
                // Also fetch activity logs
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
            console.error("Error fetching activity logs:", err);
        }
    };

    // Handle Stage Update with comments and time tracking
    const handleStageChange = async (newStage) => {
        // Remove the conditional return that was preventing updates
        // if (newStage === currentStage) return;
        
        // Add validation for comment
        if (!comment.trim()) {
            alert("Please add a comment before updating the status.");
            return;
        }
        
        setUpdating(true);
        try {
            const payload = {
                stageIndex: newStage,
                comment: comment || `Updated status to ${work.stages[newStage]}`,
                timeSpent: timeSpent || "0h",
            };
    
            const res = await axios.put(
                `http://localhost:5000/works/update-stage/${id}`,
                payload,
                { withCredentials: true }
            );
    
            if (res.status === 200) {
                console.log("✅ Status updated:", res.data);
                setComment("");
                setTimeSpent("");
    
                // ✅ Fetch the updated work details to refresh UI
                fetchWorkDetails();  
            }
        } catch (err) {
            console.error("🚨 Error updating status:", err.response?.data || err.message);
        } finally {
            setUpdating(false);
        }
    };
    
    // Add a comment without changing stage
    const addComment = async () => {
        if (!comment.trim()) return;
        
        try {
            const payload = {
                comment: comment,
                timeSpent: timeSpent || "0h"
            };
            
            const res = await axios.post(
                `http://localhost:5000/works/${id}/comment`,
                payload,
                { withCredentials: true }
            );

            if (res.status === 200) {
                console.log("✅ Comment added:", res.data);
                setComment("");
                setTimeSpent("");
                fetchActivityLogs(); // Refresh activity logs
            }
        } catch (err) {
            console.error("🚨 Error adding comment:", err);
        }
    };

    // Calculate days remaining
    const getDaysRemaining = () => {
        if (!work?.deadline) return "No deadline";
        const deadline = new Date(work.deadline);
        const today = new Date();
        const diffTime = deadline - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return "Overdue";
        if (diffDays === 0) return "Due today";
        return `${diffDays} days remaining`;
    };

    // Get status class for deadline
    const getDeadlineStatusClass = () => {
        if (!work?.deadline) return "text-gray-500";
        const deadline = new Date(work.deadline);
        const today = new Date();
        const diffTime = deadline - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return "text-red-600";
        if (diffDays <= 2) return "text-amber-500";
        return "text-green-600";
    };

    // Format date to readable string
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Toggle section expansion
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
                        {work && (
                            <div className="flex items-center">
                                <span className={`text-sm font-medium ${getDeadlineStatusClass()}`}>
                                    {getDaysRemaining()}
                                </span>
                            </div>
                        )}
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
                                        currentStage === work.stages.length - 1 
                                            ? "bg-green-100 text-green-800" 
                                            : "bg-blue-100 text-blue-800"
                                    }`}>
                                        {work.stages[currentStage]}
                                    </span>
                                </div>
                                
                                <div className="text-sm text-gray-500 flex items-center gap-4 mb-4">
                                    <span>Work ID: {work.workId || id.substring(0, 8)}</span>
                                    <span>•</span>
                                    <span>Assigned: {work.assignedTo || "Unassigned"}</span>
                                </div>

                                {/* Progress Tracker (JIRA-style) */}
                                <div className="relative mb-6">
                                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                                        <div 
                                            style={{ width: `${((currentStage + 1) / work.stages.length) * 100}%` }}
                                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                                        ></div>
                                    </div>
                                    <div className="flex justify-between">
                                        {work.stages?.map((stage, index) => (
                                            <div 
                                                key={index} 
                                                className="relative flex flex-col items-center"
                                                style={{ 
                                                    left: `${index === 0 ? 0 : index === work.stages.length - 1 ? 0 : '-12px'}`,
                                                    right: `${index === work.stages.length - 1 ? 0 : 'auto'}`
                                                }}
                                            >
                                                <button
                                                    className={`flex items-center justify-center w-8 h-8 rounded-full border text-sm font-medium ${
                                                        index < currentStage
                                                            ? "bg-blue-500 text-white"
                                                            : index === currentStage
                                                            ? "bg-blue-600 text-white ring-2 ring-blue-300"
                                                            : "bg-gray-200 text-gray-500"
                                                    }`}
                                                    onClick={() => handleStageChange(index)}
                                                    disabled={updating}
                                                >
                                                    {index + 1}
                                                </button>
                                                <span className="text-xs mt-1 text-gray-500 max-w-[80px] text-center">
                                                    {stage}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
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
                                            
                                            <h3 className="text-sm font-medium mb-2">Work Details</h3>
                                            <p className="text-gray-700">{work.workDescription}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Activity Log */}
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
                                            <div className="space-y-4 mb-6">
                                                {activityLog && activityLog.length > 0 ? (
                                                    activityLog.map((activity, index) => (
                                                        <div key={index} className="flex gap-3">
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
                                                                {activity.timeSpent && (
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        Time spent: {activity.timeSpent}
                                                                    </p>
                                                                )}
                                                                {activity.stageChange && (
                                                                    <p className="text-xs text-blue-600 mt-1">
                                                                        Changed status to "{activity.stageChange}"
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500 text-sm">No activity recorded yet.</p>
                                                )}
                                            </div>

                                            {/* Add Comment */}
                                            <div className="border-t border-gray-200 pt-4">
                                                <h3 className="text-sm font-medium mb-2">Add Comment</h3>
                                                <textarea
                                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Add a comment..."
                                                    rows="3"
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                ></textarea>
                                                <div className="flex items-center mt-2">
                                                    <label className="text-sm text-gray-500 mr-2">Time spent:</label>
                                                    <input
                                                        type="text"
                                                        className="border rounded px-2 py-1 w-20 text-sm"
                                                        placeholder="1h 30m"
                                                        value={timeSpent}
                                                        onChange={(e) => setTimeSpent(e.target.value)}
                                                    />
                                                    <button
                                                        className="ml-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                                        onClick={addComment}
                                                    >
                                                        Add Comment
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Update Status Section */}
                                <div>
                                    <button 
                                        className="w-full px-6 py-4 text-left flex justify-between items-center"
                                        onClick={() => toggleSection("status")}
                                    >
                                        <span className="text-sm font-medium text-gray-800">Update Status</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-500 transform ${expandedSection === "status" ? "rotate-180" : ""}`} />
                                    </button>
                                    {expandedSection === "status" && (
                                        <div className="px-6 py-4 bg-gray-50">
                                            <h3 className="text-sm font-medium mb-2">Current Status: <span className="text-blue-600">{work.stages[currentStage]}</span></h3>
                                            
                                            <div className="mb-4">
                                                <label className="text-sm text-gray-700 block mb-2">Update Status</label>
                                                <div className="relative">
                                                    <select
                                                        className="w-full p-2 border rounded-lg text-gray-800 pr-10"
                                                        value={currentStage}
                                                        onChange={(e) => setCurrentStage(Number(e.target.value))}
                                                        disabled={updating}
                                                    >
                                                        {work.stages?.map((stage, index) => (
                                                            <option key={index} value={index}>
                                                                {stage}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute top-3 right-3 w-4 h-4 text-gray-500" />
                                                </div>
                                            </div>
                                            
                                            <div className="mb-4">
                                                <label className="text-sm text-gray-700 block mb-2">Comment (required)</label>
                                                <textarea
                                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Describe what you've done or why you're changing the status..."
                                                    rows="3"
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                ></textarea>
                                            </div>
                                            
                                            <div className="mb-4">
                                                <label className="text-sm text-gray-700 block mb-2">Time Spent</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g. 1h 30m"
                                                    value={timeSpent}
                                                    onChange={(e) => setTimeSpent(e.target.value)}
                                                />
                                            </div>
                                            
                                            <button
                                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                                                onClick={() => handleStageChange(currentStage)}
                                                disabled={updating}
                                            >
                                                {updating ? "Updating..." : "Update Status"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Status Card */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-sm font-medium text-gray-500 uppercase mb-4">Status</h2>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className={`w-3 h-3 rounded-full ${
                                        currentStage === work.stages.length - 1
                                            ? "bg-green-500"
                                            : "bg-blue-500"
                                    }`}></div>
                                    <span className="font-medium">{work.stages[currentStage]}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    Stage {currentStage + 1} of {work.stages.length}
                                </div>
                            </div>
                            
                            {/* Dates */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-sm font-medium text-gray-500 uppercase mb-4">Dates</h2>
                                <div className="space-y-3">
                                    <div className="flex items-start">
                                        <Calendar className="w-4 h-4 text-gray-400 mt-1 mr-2" />
                                        <div>
                                            <p className="text-sm text-gray-500">Created</p>
                                            <p className="text-gray-700">{formatDate(work.startDate)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Clock className="w-4 h-4 text-gray-400 mt-1 mr-2" />
                                        <div>
                                            <p className="text-sm text-gray-500">Deadline</p>
                                            <p className={`${getDeadlineStatusClass()}`}>
                                                {formatDate(work.deadline)}
                                                <span className="block text-sm">
                                                    {getDaysRemaining()}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* People */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-sm font-medium text-gray-500 uppercase mb-4">People</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                            <User className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{work.assignedTo || "Unassigned"}</p>
                                            <p className="text-xs text-gray-500">Assignee</p>
                                        </div>
                                    </div>
                                    {work.reporter && (
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                                <User className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{work.reporter}</p>
                                                <p className="text-xs text-gray-500">Reporter</p>
                                            </div>
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