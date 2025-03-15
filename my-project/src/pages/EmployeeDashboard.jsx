import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, CheckCircle, X, Eye, Bell, User, Search, Menu, Calendar, Clock, AlertCircle } from "lucide-react";
import axios from "axios";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [works, setWorks] = useState([]);
  const [completedWorks, setCompletedWorks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedView, setSelectedView] = useState("dashboard");

  useEffect(() => {
    let storedEmployee = null;
    try {
      storedEmployee = JSON.parse(localStorage.getItem("user")) || null;
    } catch (error) {
      console.error("🚨 Failed to parse localStorage:", error);
    }

    if (!storedEmployee || storedEmployee.role !== "employee") {
      console.error("🚨 Invalid user data, redirecting...");
      navigate("/login");
      return;
    }

    setEmployee(storedEmployee);

    if (storedEmployee._id) {
      fetchAssignedWorks(storedEmployee._id);
    } else {
      console.error("🚨 Employee ID is missing from stored data");
    }
  }, [navigate]);

  const fetchAssignedWorks = async (employeeId) => {
    if (!employeeId) {
      console.error("🚨 fetchAssignedWorks: Employee ID is undefined, skipping request.");
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/works/employee/${employeeId}`, {
        withCredentials: true,
        timeout: 10000,
      });

      if (res.status === 200) {
        const activeWorks = res.data.filter((work) => work.currentStage < work.stages.length - 1);
        const completedWorks = res.data.filter((work) => work.currentStage === work.stages.length - 1);

        setWorks(activeWorks);
        setCompletedWorks(completedWorks);
      }
    } catch (err) {
      console.error("🚨 Error fetching assigned works:", err.response?.data || err.message);
    }
  };

  const handleViewDetails = (workId) => {
    navigate(`/work-details/${workId}`);
  };

  const filteredWorks = (works) => {
    return works.filter(work => 
      work.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      work.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getPriorityColor = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const daysRemaining = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) return "bg-red-500"; // Overdue
    if (daysRemaining <= 2) return "bg-orange-500"; // Urgent
    if (daysRemaining <= 7) return "bg-yellow-500"; // High
    return "bg-green-500"; // Normal
  };

  const getWorkStatusLabel = (work) => {
    if (work.currentStage === 0) return { label: "To Do", color: "bg-blue-500" };
    if (work.currentStage === work.stages.length - 1) return { label: "Completed", color: "bg-green-500" };
    return { label: "In Progress", color: "bg-purple-500" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex">
      {/* Sidebar */}
      <div className={`bg-gray-900 w-64 shadow-xl border-r border-gray-700 flex flex-col transition-all duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-64 md:translate-x-0'}`}>
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">WorkFlow Pro</h1>
        </div>
        
        {employee && (
          <div className="p-4 border-b border-gray-700 flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-6 h-6" />
            </div>
            <div className="ml-3">
              <p className="font-medium truncate">{employee.name}</p>
              <p className="text-xs text-gray-400">{employee.position}</p>
            </div>
          </div>
        )}
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setSelectedView("dashboard")}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${selectedView === "dashboard" ? "bg-gray-800 shadow-md" : "hover:bg-gray-800"}`}
              >
                <Briefcase className="w-5 h-5 mr-3" />
                Dashboard
              </button>
            </li>
            <li>
              <button 
                onClick={() => setShowModal(true)}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${showModal && showModal !== "completed" ? "bg-gray-800 shadow-md" : "hover:bg-gray-800"}`}
              >
                <Calendar className="w-5 h-5 mr-3" />
                My Tasks
              </button>
            </li>
            <li>
              <button 
                onClick={() => setShowModal("completed")}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${showModal === "completed" ? "bg-gray-800 shadow-md" : "hover:bg-gray-800"}`}
              >
                <CheckCircle className="w-5 h-5 mr-3" />
                Completed
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-gray-800 border-b border-gray-700 shadow-md p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-white md:hidden mr-3"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="bg-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 rounded-full hover:bg-gray-700">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-850">
          {employee ? (
            <>
              {/* Welcome Banner */}
              <div className="mb-8 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 shadow-xl border border-gray-700 transform transition hover:shadow-2xl">
                <h1 className="text-3xl font-bold mb-2 flex items-center">
                  <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                    Welcome, {employee.name}!
                  </span>
                </h1>
                <p className="text-gray-400">
                  <span className="font-medium">{works.length}</span> active tasks and <span className="font-medium">{completedWorks.length}</span> completed tasks
                </p>
              </div>

              {/* Dashboard Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Pending Tasks Card */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-xl border border-gray-700 p-6 transform transition hover:translate-y-1 hover:shadow-2xl">
                  <div className="flex justify-between mb-4">
                    <h3 className="font-semibold text-gray-300">Pending Tasks</h3>
                    <div className="bg-blue-500 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{works.length}</p>
                  <div className="mt-2 text-blue-400 text-sm flex items-center">
                    <button onClick={() => setShowModal(true)} className="flex items-center hover:underline">
                      View all <Eye className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>

                {/* Completed Tasks Card */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-xl border border-gray-700 p-6 transform transition hover:translate-y-1 hover:shadow-2xl">
                  <div className="flex justify-between mb-4">
                    <h3 className="font-semibold text-gray-300">Completed</h3>
                    <div className="bg-green-500 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{completedWorks.length}</p>
                  <div className="mt-2 text-green-400 text-sm flex items-center">
                    <button onClick={() => setShowModal("completed")} className="flex items-center hover:underline">
                      View all <Eye className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>

                {/* Overdue Tasks Card */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-xl border border-gray-700 p-6 transform transition hover:translate-y-1 hover:shadow-2xl">
                  <div className="flex justify-between mb-4">
                    <h3 className="font-semibold text-gray-300">Overdue</h3>
                    <div className="bg-red-500 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {works.filter(work => new Date(work.deadline) < new Date()).length}
                  </p>
                  <div className="mt-2 text-red-400 text-sm flex items-center">
                    <button onClick={() => setShowModal(true)} className="flex items-center hover:underline">
                      View all <Eye className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>

                {/* Upcoming Tasks Card */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-xl border border-gray-700 p-6 transform transition hover:translate-y-1 hover:shadow-2xl">
                  <div className="flex justify-between mb-4">
                    <h3 className="font-semibold text-gray-300">Due Soon</h3>
                    <div className="bg-yellow-500 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg">
                      <Calendar className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {works.filter(work => {
                      const deadlineDate = new Date(work.deadline);
                      const now = new Date();
                      const daysRemaining = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
                      return daysRemaining >= 0 && daysRemaining <= 3;
                    }).length}
                  </p>
                  <div className="mt-2 text-yellow-400 text-sm flex items-center">
                    <button onClick={() => setShowModal(true)} className="flex items-center hover:underline">
                      View all <Eye className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Tasks Section */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-xl border border-gray-700 p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
                
                {works.length === 0 ? (
                  <div className="bg-gray-750 rounded-lg p-6 text-center">
                    <Briefcase className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">No tasks assigned yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {works.slice(0, 3).map((work) => (
                      <div 
                      key={work._id} 
                      className="bg-gray-750 rounded-lg p-4 flex items-center shadow-md border border-gray-700 transform transition hover:shadow-lg hover:translate-y-px"
                    >
                      <div className={`${getPriorityColor(work.deadline)} w-4 h-full mr-4 rounded-full`}></div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{work.title}</h3>
                        <p className="text-gray-400 text-sm truncate">{work.description}</p>
                        <div className="flex items-center mt-2 text-xs">
                          <div className={`${getWorkStatusLabel(work).color} text-white px-2 py-1 rounded-full mr-3`}>
                            {getWorkStatusLabel(work).label}
                          </div>
                          <span className="text-gray-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Due {new Date(work.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewDetails(work._id)}
                        className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transform transition-all shadow hover:shadow-lg flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </div>
                  ))}
                  {works.length > 3 && (
                    <button 
                      onClick={() => setShowModal(true)}
                      className="w-full text-center text-blue-400 hover:text-blue-300 py-2"
                    >
                      View all {works.length} tasks
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-t-blue-500 border-b-purple-500 border-l-blue-300 border-r-purple-300 rounded-full animate-spin"></div>
              <p className="mt-4 text-xl font-medium text-gray-400">Loading dashboard...</p>
            </div>
          </div>
        )}
      </main>
    </div>

    {/* Work Details Modal */}
    {showModal && (
      <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)}></div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl shadow-2xl border border-gray-700 w-11/12 max-w-5xl max-h-[90vh] z-10 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold flex items-center">
              {showModal === "completed" ? (
                <>
                  <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
                  Completed Tasks
                </>
              ) : (
                <>
                  <Briefcase className="w-6 h-6 mr-2 text-blue-500" />
                  My Tasks
                </>
              )}
            </h2>
            <button 
              onClick={() => setShowModal(false)} 
              className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Search Bar */}
            <div className="mb-6 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="bg-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {showModal === "completed" ? (
              completedWorks.length === 0 ? (
                <div className="text-center p-10 bg-gray-750 rounded-xl">
                  <CheckCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Completed Tasks</h3>
                  <p className="text-gray-400">You haven't completed any tasks yet.</p>
                </div>
              ) : filteredWorks(completedWorks).length === 0 ? (
                <div className="text-center p-10 bg-gray-750 rounded-xl">
                  <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Matching Tasks</h3>
                  <p className="text-gray-400">No completed tasks match your search.</p>
                </div>
              ) : (
                <TaskTable works={filteredWorks(completedWorks)} handleViewDetails={handleViewDetails} />
              )
            ) : works.length === 0 ? (
              <div className="text-center p-10 bg-gray-750 rounded-xl">
                <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No Assigned Tasks</h3>
                <p className="text-gray-400">You don't have any tasks assigned yet.</p>
              </div>
            ) : filteredWorks(works).length === 0 ? (
              <div className="text-center p-10 bg-gray-750 rounded-xl">
                <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No Matching Tasks</h3>
                <p className="text-gray-400">No active tasks match your search.</p>
              </div>
            ) : (
              <TaskTable works={filteredWorks(works)} handleViewDetails={handleViewDetails} />
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);
}

// Enhanced Task Table Component
const TaskTable = ({ works, handleViewDetails }) => {
const getPriorityColor = (deadline) => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const daysRemaining = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysRemaining < 0) return "bg-red-500"; // Overdue
  if (daysRemaining <= 2) return "bg-orange-500"; // Urgent
  if (daysRemaining <= 7) return "bg-yellow-500"; // High
  return "bg-green-500"; // Normal
};

const getPriorityLabel = (deadline) => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const daysRemaining = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysRemaining < 0) return { label: "Overdue", color: "text-red-500" };
  if (daysRemaining <= 2) return { label: "Urgent", color: "text-orange-500" };
  if (daysRemaining <= 7) return { label: "High", color: "text-yellow-500" };
  return { label: "Normal", color: "text-green-500" };
};

const getWorkStatusLabel = (work) => {
  if (work.currentStage === 0) return { label: "To Do", color: "bg-blue-500" };
  if (work.currentStage === work.stages.length - 1) return { label: "Completed", color: "bg-green-500" };
  return { label: "In Progress", color: "bg-purple-500" };
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  
  // If the date is today
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  // If the date is tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  
  // Otherwise return formatted date
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

return (
  <div className="overflow-x-auto rounded-xl shadow-lg bg-gray-750 border border-gray-700">
    <table className="w-full">
      <thead>
        <tr className="bg-gray-800 text-left text-sm font-medium">
          <th className="p-4 pl-6">Task</th>
          <th className="p-4">Status</th>
          <th className="p-4">Priority</th>
          <th className="p-4">Start Date</th>
          <th className="p-4">Deadline</th>
          <th className="p-4 text-right pr-6">Actions</th>
        </tr>
      </thead>
      <tbody>
        {works.map((work, index) => (
          <tr 
            key={work._id} 
            className={`text-sm border-t border-gray-700 hover:bg-gray-700 transition-colors ${index % 2 === 0 ? 'bg-gray-800 bg-opacity-30' : ''}`}
          >
            <td className="p-4 pl-6">
              <div className="flex items-center">
                <div className={`${getPriorityColor(work.deadline)} w-2 h-2 rounded-full mr-3`}></div>
                <div>
                  <h4 className="font-medium">{work.title}</h4>
                  <p className="text-gray-400 text-xs mt-1 truncate max-w-xs">{work.description}</p>
                </div>
              </div>
            </td>
            <td className="p-4">
              <span className={`${getWorkStatusLabel(work).color} text-white text-xs px-2 py-1 rounded-full`}>
                {getWorkStatusLabel(work).label}
              </span>
            </td>
            <td className="p-4">
              <span className={`${getPriorityLabel(work.deadline).color} text-xs font-medium`}>
                {getPriorityLabel(work.deadline).label}
              </span>
            </td>
            <td className="p-4 text-gray-300 text-sm">
              {formatDate(work.startDate)}
            </td>
            <td className="p-4 text-sm">
              <div className={`${new Date(work.deadline) < new Date() ? 'text-red-400' : 'text-gray-300'} flex items-center`}>
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(work.deadline)}
              </div>
            </td>
            <td className="p-4 text-right pr-6">
              <button
                onClick={() => handleViewDetails(work._id)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition-colors shadow-md flex items-center ml-auto"
              >
                <Eye className="w-4 h-4 mr-1" />
                Details
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
};