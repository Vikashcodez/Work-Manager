import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, UserPlus, ClipboardList } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) navigate("/login");
    setUser(storedUser);
  }, [navigate]);

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
              onClick={() => navigate("/add-employee")} // ✅ Navigate to Add Employee Form
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
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-500 opacity-10 rounded-2xl blur-xl "></div>
              <Briefcase className="h-12 w-12 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-xl font-semibold text-center">Add Works</h2>
              <p className="text-gray-400 text-center mt-2">
                Assign and manage work efficiently.
              </p>
            </div>

            {/* Work Status */}
            <div className="group relative bg-gray-800 p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-500 opacity-10 rounded-2xl blur-xl"></div>
              <ClipboardList className="h-12 w-12 text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-xl font-semibold text-center">Work Status</h2>
              <p className="text-gray-400 text-center mt-2">
                Track and update work progress easily.
              </p>
            </div>
          </div>
        </>
      ) : (
        <p className="text-lg text-gray-400">Loading...</p>
      )}
    </div>
  );
}
