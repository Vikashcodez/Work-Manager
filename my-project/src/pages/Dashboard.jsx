import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, UserPlus, ClipboardList, Eye } from "lucide-react";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWorkStatus, setShowWorkStatus] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) navigate("/login");
    setUser(storedUser);
    fetchWorks(); // Fetch work details
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

  return (
    <div className="min-h-screen text-white flex flex-col items-center p-6">
      {user ? (
        <>
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Welcome, {user.organization}!
          </h1>
          <p className="text-gray-400">Position: {user.position}</p>
          <p className="text-gray-400 mb-8">Address: {user.address}</p>

          {/* ✅ 3D Effect Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
            {/* Add Employees */}
            <div
              className="group relative bg-gray-800 p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={() => navigate("/add-employee")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 opacity-10 rounded-2xl blur-xl"></div>
              <UserPlus className="h-12 w-12 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-xl font-semibold text-center">Add Employees</h2>
              <p className="text-gray-400 text-center mt-2">
                Manage and add new employees with ease.
              </p>
            </div>

            {/* Add Works */}
            <div
              className="group relative bg-gray-800 p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={() => navigate("/add-work")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-500 opacity-10 rounded-2xl blur-xl"></div>
              <Briefcase className="h-12 w-12 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-xl font-semibold text-center">Add Works</h2>
              <p className="text-gray-400 text-center mt-2">
                Assign and manage work efficiently.
              </p>
            </div>

            {/* Work Status */}
            <div
              className="group relative bg-gray-800 p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={() => setShowWorkStatus(!showWorkStatus)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-500 opacity-10 rounded-2xl blur-xl"></div>
              <ClipboardList className="h-12 w-12 text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-xl font-semibold text-center">Work Status</h2>
              <p className="text-gray-400 text-center mt-2">
                Track and update work progress easily.
              </p>
            </div>
          </div>

          {/* Work Status Table */}
          {showWorkStatus && (
            <div className="mt-8 w-full max-w-5xl bg-gray-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-white">Work Status</h2>
              {loading ? (
                <p className="text-gray-400">Loading work details...</p>
              ) : works.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs uppercase bg-gray-700 text-gray-300">
                      <tr>
                        <th className="px-4 py-3">Work ID</th>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Start Date</th>
                        <th className="px-4 py-3">Employee</th>
                        <th className="px-4 py-3">Deadline</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {works.map((work) => (
                        <tr key={work._id} className="border-b border-gray-700 hover:bg-gray-900">
                          <td className="px-4 py-3">{work.workId}</td>
                          <td className="px-4 py-3">{work.title}</td>
                          <td className="px-4 py-3">{new Date(work.startDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3">{work.assignedEmployee?.name || "Unassigned"}</td>
                          <td className="px-4 py-3">{new Date(work.deadline).toLocaleDateString()}</td>
                          <td
                            className={`px-4 py-3 font-medium ${
                              work.currentStage === work.stages.length - 1
                                ? "text-green-400"
                                : "text-yellow-400"
                            }`}
                          >
                            {work.status}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => navigate(`/works-details/${work._id}`)}
                              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View More
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400">No work records found.</p>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="text-lg text-gray-400">Loading...</p>
      )}
    </div>
  );
}
