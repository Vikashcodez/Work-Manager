import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, CheckCircle, X, Eye } from "lucide-react";
import axios from "axios";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [works, setWorks] = useState([]); // Stores assigned works
  const [showModal, setShowModal] = useState(false); // Modal visibility

  useEffect(() => {
    // ✅ Ensure safe JSON parsing
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

    console.log("🚀 Stored Employee:", storedEmployee); // Debugging
    setEmployee(storedEmployee);

    // ✅ Ensure employee ID exists before fetching
    if (storedEmployee._id) {
      fetchAssignedWorks(storedEmployee._id);
    } else {
      console.error("🚨 Employee ID is missing from stored data");
    }
  }, [navigate]);

  // ✅ Fetch assigned works
  const fetchAssignedWorks = async (employeeId) => {
    if (!employeeId) {
      console.error("🚨 fetchAssignedWorks: Employee ID is undefined, skipping request.");
      return;
    }

    try {
      console.log(`📡 Fetching works for Employee ID: ${employeeId}`);
      const res = await axios.get(`http://localhost:5000/works/employee/${employeeId}`, {
        withCredentials: true,
        timeout: 10000, // ⏳ Increase timeout to 10s
      });

      if (res.status === 200) {
        console.log("✅ Assigned works fetched successfully:", res.data);
        setWorks(res.data);
      } else {
        console.warn("⚠️ Unexpected response status:", res.status);
      }
    } catch (err) {
      console.error("🚨 Error fetching assigned works:", err.response?.data || err.message);
    }
  };

  // ✅ Navigate to Work Details Page
  const handleViewDetails = (workId) => {
    navigate(`/work-details/${workId}`);
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center p-6">
      {employee ? (
        <>
          {/* ✅ Welcome Section */}
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Welcome, {employee.name}!
          </h1>
          <p className="text-gray-400 text-lg">Position: {employee.position}</p>
          <p className="text-gray-400 text-lg mb-6">Organization: {employee.organization}</p>

          {/* ✅ Work Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 📌 Allocated Works Card */}
            <div
              className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 transform transition hover:scale-105 flex flex-col items-center cursor-pointer"
              onClick={() => setShowModal(true)}
            >
              <Briefcase className="text-blue-400 w-12 h-12 mb-3" />
              <h2 className="text-xl font-semibold">Allocated Works</h2>
              <p className="text-gray-400 mt-2 text-sm">View your pending work assignments.</p>
              <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                View Tasks
              </button>
            </div>

            {/* 📌 Completed Works Card */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 transform transition hover:scale-105 flex flex-col items-center">
              <CheckCircle className="text-green-400 w-12 h-12 mb-3" />
              <h2 className="text-xl font-semibold">Completed Works</h2>
              <p className="text-gray-400 mt-2 text-sm">Check the tasks you've completed.</p>
              <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
                View Completed
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className="text-lg text-gray-400">Loading...</p>
      )}

      {/* ✅ Work Details Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-4/5 max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Allocated Works</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            {works.length === 0 ? (
              <p className="text-gray-400 text-center">No work assigned yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-700">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="p-3 border border-gray-700">Work Title</th>
                      <th className="p-3 border border-gray-700">Description</th>
                      <th className="p-3 border border-gray-700">Start Date</th>
                      <th className="p-3 border border-gray-700">Deadline</th>
                      <th className="p-3 border border-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {works.map((work) => (
                      <tr key={work._id} className="text-gray-300 border-b border-gray-700">
                        <td className="p-3 border border-gray-700">{work.title}</td>
                        <td className="p-3 border border-gray-700">{work.description}</td>
                        <td className="p-3 border border-gray-700">
                          {work.startDate ? new Date(work.startDate).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="p-3 border border-gray-700">
                          {work.deadline ? new Date(work.deadline).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="p-3 border border-gray-700 text-center">
                          <button
                            onClick={() => handleViewDetails(work._id)}
                            className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition flex items-center"
                          >
                            <Eye className="w-5 h-5 mr-1" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
