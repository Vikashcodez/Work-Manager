import { useState, useEffect } from "react";

export default function AddEmployee() {
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    position: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [employees, setEmployees] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showTablePopup, setShowTablePopup] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ✅ Fetch all employees
  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost:5000/employees", {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!res.ok) throw new Error(`Server Error: ${res.status}`);
  
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("🚨 Error fetching employees:", err.message);
    }
  };

  // ✅ Handle form input changes
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/employees/add", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to add employee");

      alert("Employee added successfully");
      setShowAddPopup(false);
      fetchEmployees();
    } catch (error) {
      console.error("🚨 Error:", error);
      setError(error.message);
    }
  };

  // ✅ Delete Employee
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      const res = await fetch(`http://localhost:5000/employees/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to delete employee");

      alert("Employee deleted successfully");
      fetchEmployees();
    } catch (error) {
      console.error("🚨 Error deleting employee:", error);
      alert(error.message);
    }
  };

  // ✅ Block / Unblock Employee
  const handleBlockToggle = async (id, isBlocked) => {
    const confirmMsg = isBlocked
      ? "Are you sure you want to unblock this employee?"
      : "Are you sure you want to block this employee?";
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`http://localhost:5000/employees/block/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: !isBlocked }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to update employee status");

      alert(isBlocked ? "Employee unblocked successfully" : "Employee blocked successfully");
      fetchEmployees();
    } catch (error) {
      console.error("🚨 Error blocking/unblocking employee:", error);
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
        Employee Management
      </h1>

      {/* ✅ Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Employee Card */}
        <div
          className="group relative bg-gray-800 p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={() => setShowAddPopup(true)}
        >
          <h2 className="text-xl font-semibold text-center">Add Employee</h2>
          <p className="text-gray-400 text-center mt-2">Register a new employee.</p>
        </div>

        {/* Show Employees Card */}
        <div
          className="group relative bg-gray-800 p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={() => setShowTablePopup(true)}
        >
          <h2 className="text-xl font-semibold text-center">Show Employees</h2>
          <p className="text-gray-400 text-center mt-2">View all added employees.</p>
        </div>
      </div>

      {/* ✅ Add Employee Popup */}
      {showAddPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96 relative">
            <button
              onClick={() => setShowAddPopup(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold text-center mb-4">Add Employee</h2>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" name="name" placeholder="Employee Name" onChange={handleChange} required />
              <input type="text" name="employeeId" placeholder="Employee ID" onChange={handleChange} required />
              <input type="text" name="position" placeholder="Employee Position" onChange={handleChange} required />
              <input type="email" name="email" placeholder="Employee Email" onChange={handleChange} required />
              <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
              <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />
              <button type="submit" className="w-full mt-4 bg-blue-500 text-white p-2 rounded">Add Employee</button>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Show Employees Popup */}
      {showTablePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-4/5 relative">
            <button onClick={() => setShowTablePopup(false)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
              ✖
            </button>
            <h2 className="text-xl font-bold text-center mb-4">Employee List</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs uppercase bg-gray-700 text-gray-300">
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp._id} className="border-b border-gray-700 hover:bg-gray-900">
                      <td>{emp.employeeId}</td>
                      <td>{emp.name}</td>
                      <td>{emp.position}</td>
                      <td>{emp.email}</td>
                      <td>
                        <button onClick={() => handleDelete(emp._id)} className="text-red-500 px-2">🗑 Delete</button>
                        <button onClick={() => handleBlockToggle(emp._id, emp.blocked)} className="text-yellow-500 px-2">
                          {emp.blocked ? "🔓 Unblock" : "🔒 Block"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
