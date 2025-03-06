import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, CheckCircle } from "lucide-react";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const storedEmployee = JSON.parse(localStorage.getItem("user"));
    if (!storedEmployee || storedEmployee.role !== "employee") {
      navigate("/login"); // Redirect if not logged in as employee
    }
    setEmployee(storedEmployee);
  }, [navigate]);

  return (
    <div className="min-h-screen  text-white flex flex-col items-center p-6">
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
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 transform transition hover:scale-105 flex flex-col items-center">
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
    </div>
  );
}
