import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, UserPlus, ClipboardList, Eye, Edit, Trash2, Activity, ChevronDown, Filter, Plus, Search } from "lucide-react";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWorkStatus, setShowWorkStatus] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) navigate("/login");
    setUser(storedUser);
    fetchWorks();
  }, [navigate]);

  const fetchWorks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/works", {
        withCredentials: true,
      });
      setWorks(res.data);
    } catch (error) {
      console.error("🚨 Error fetching works:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this work?")) return;

    try {
      await axios.delete(`http://localhost:5000/works/delete/${id}`, { withCredentials: true });
      alert("Work deleted successfully!");
      fetchWorks();
    } catch (error) {
      console.error("🚨 Error deleting work:", error.response?.data || error.message);
      alert("Failed to delete work.");
    }
  };

  // Filter works based on status and search term
  const filteredWorks = works.filter(work => {
    const matchesStatus = filterStatus === "All" || work.status === filterStatus;
    const matchesSearch = work.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          work.workId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (work.assignedEmployee?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Get status counts for the sidebar
  const getStatusCounts = () => {
    const counts = { All: works.length };
    works.forEach(work => {
      counts[work.status] = (counts[work.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();
  const statusColors = {
    "In Progress": "bg-blue-500",
    "Completed": "bg-green-500",
    "Pending": "bg-yellow-500",
    "Delayed": "bg-red-500",
    "Not Started": "bg-gray-500"
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-4 shadow-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            WorkFlow
          </h1>
          <p className="text-sm text-gray-400">Project Management</p>
        </div>
        
        {user && (
          <div className="mb-6 bg-gray-700 p-3 rounded-lg">
            <p className="font-semibold">{user.organization}</p>
            <p className="text-xs text-gray-400">{user.position}</p>
            <p className="text-xs text-gray-400">{user.address}</p>
          </div>
        )}
        
        <nav>
          <ul className="space-y-2">
            <li>
              <div className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
                <Activity className="h-5 w-5 text-blue-400" />
                <span>Dashboard</span>
              </div>
            </li>
            <li>
              <div onClick={() => navigate("/add-employee")} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
                <UserPlus className="h-5 w-5 text-green-400" />
                <span>Employees</span>
              </div>
            </li>
            <li>
              <div onClick={() => navigate("/add-work")} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
                <Briefcase className="h-5 w-5 text-purple-400" />
                <span>Projects</span>
              </div>
            </li>
            <li>
              <div onClick={() => setShowWorkStatus(!showWorkStatus)} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
                <ClipboardList className="h-5 w-5 text-yellow-400" />
                <span>Work Status</span>
              </div>
            </li>
          </ul>
        </nav>
        
        {/* Status filters */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">FILTER BY STATUS</h3>
          <ul className="space-y-1">
            {Object.entries(statusCounts).map(([status, count]) => (
              <li key={status}>
                <button 
                  onClick={() => setFilterStatus(status)}
                  className={`w-full text-left p-2 rounded-md flex justify-between items-center ${filterStatus === status ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                >
                  <div className="flex items-center">
                    {status !== "All" && (
                      <span className={`w-2 h-2 rounded-full mr-2 ${statusColors[status] || 'bg-gray-400'}`}></span>
                    )}
                    <span>{status}</span>
                  </div>
                  <span className="text-xs bg-gray-600 px-2 py-1 rounded-full">{count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-gray-800 p-4 shadow-md flex justify-between items-center">
          <h1 className="text-xl font-semibold">Projects Dashboard</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="pl-10 pr-4 py-2 rounded-md bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => navigate("/add-work")}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md flex items-center space-x-2 transform transition-transform duration-200 hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </button>
          </div>
        </header>
        
        {/* Content */}
        <div className="p-6">
          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Add Employees Card */}
            <div 
              onClick={() => navigate("/add-employee")}
              className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-2 hover:scale-105 cursor-pointer border border-gray-700 group"
              style={{ 
                perspective: "1000px",
                transformStyle: "preserve-3d"
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">Manage Employees</h2>
                  <p className="text-sm text-gray-400 mt-1">Add and manage team members</p>
                </div>
                <div className="bg-indigo-500/20 p-3 rounded-lg transform transition-transform duration-300 group-hover:rotate-12">
                  <UserPlus className="h-6 w-6 text-indigo-400" />
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center text-sm font-medium">
                <span className="text-gray-400">Total Employees: 12</span>
                <span className="text-indigo-400">View →</span>
              </div>
            </div>
            
            {/* Add Works Card */}
            <div 
              onClick={() => navigate("/add-work")}
              className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-2 hover:scale-105 cursor-pointer border border-gray-700 group"
              style={{ 
                perspective: "1000px",
                transformStyle: "preserve-3d"
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">Create Project</h2>
                  <p className="text-sm text-gray-400 mt-1">Add new projects and tasks</p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-lg transform transition-transform duration-300 group-hover:rotate-12">
                  <Briefcase className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center text-sm font-medium">
                <span className="text-gray-400">Active Projects: {works.length}</span>
                <span className="text-green-400">View →</span>
              </div>
            </div>
            
            {/* Work Status Card */}
            <div 
              onClick={() => setShowWorkStatus(!showWorkStatus)}
              className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-2 hover:scale-105 cursor-pointer border border-gray-700 group"
              style={{ 
                perspective: "1000px",
                transformStyle: "preserve-3d"
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">Project Status</h2>
                  <p className="text-sm text-gray-400 mt-1">Track project progress</p>
                </div>
                <div className="bg-yellow-500/20 p-3 rounded-lg transform transition-transform duration-300 group-hover:rotate-12">
                  <ClipboardList className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center text-sm font-medium">
                <span className="text-gray-400">Pending Tasks: 8</span>
                <span className="text-yellow-400">View →</span>
              </div>
            </div>
          </div>
          
          {/* Work Status Table */}
          {showWorkStatus && (
            <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
              <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Projects & Tasks</h2>
                <div className="flex items-center space-x-2">
                  <button className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md flex items-center space-x-1">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-500/20 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading project details...</p>
                </div>
              ) : filteredWorks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-700 text-gray-300">
                      <tr>
                        <th className="px-4 py-3">Project ID</th>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Start Date</th>
                        <th className="px-4 py-3">Assigned To</th>
                        <th className="px-4 py-3">Deadline</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWorks.map((work) => {
                        // Calculate days remaining
                        const deadline = new Date(work.deadline);
                        const today = new Date();
                        const daysRemaining = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
                        
                        // Determine status color
                        let statusColor = "bg-blue-500"; // Default
                        if (work.status === "Completed") statusColor = "bg-green-500";
                        else if (work.status === "Pending") statusColor = "bg-yellow-500";
                        else if (work.status === "Delayed" || daysRemaining < 0) statusColor = "bg-red-500";
                        else if (work.status === "Not Started") statusColor = "bg-gray-500";
                        
                        return (
                          <tr key={work._id} className="border-b border-gray-700 hover:bg-gray-750">
                            <td className="px-4 py-3 font-medium">
                              <span className="bg-gray-700 px-2 py-1 rounded text-xs">{work.workId}</span>
                            </td>
                            <td className="px-4 py-3 font-medium">{work.title}</td>
                            <td className="px-4 py-3">{new Date(work.startDate).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center mr-2">
                                  {work.assignedEmployee?.name ? work.assignedEmployee.name.charAt(0) : "?"}
                                </div>
                                <span>{work.assignedEmployee?.name || "Unassigned"}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                {new Date(work.deadline).toLocaleDateString()}
                                {daysRemaining > 0 ? (
                                  <span className="text-xs text-gray-400 block">{daysRemaining} days remaining</span>
                                ) : (
                                  <span className="text-xs text-red-400 block">Overdue by {Math.abs(daysRemaining)} days</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`${statusColor} text-white text-xs px-2 py-1 rounded-full`}>
                                {work.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() => navigate(`/works-details/${work._id}`)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md flex items-center text-xs transition-transform hover:scale-105"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </button>
                                <button
                                  onClick={() => navigate(`/edit-work/${work._id}`)}
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded-md flex items-center text-xs transition-transform hover:scale-105"
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(work._id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md flex items-center text-xs transition-transform hover:scale-105"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="bg-gray-700 rounded-full p-4 inline-block mb-4">
                    <ClipboardList className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400">No projects found matching your criteria.</p>
                  <button 
                    onClick={() => {
                      setFilterStatus("All");
                      setSearchTerm("");
                    }}
                    className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Clear filters
                  </button>
                </div>
              )}
              
              {/* Pagination */}
              {filteredWorks.length > 0 && (
                <div className="p-4 border-t border-gray-700 flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    Showing <span className="font-medium">{filteredWorks.length}</span> of <span className="font-medium">{works.length}</span> projects
                  </div>
                  <div className="flex space-x-1">
                    <button className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm">Previous</button>
                    <button className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-sm">1</button>
                    <button className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm">2</button>
                    <button className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm">3</button>
                    <button className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm">Next</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}