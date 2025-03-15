import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function EditWork() {
  const { id } = useParams(); // Get work ID from URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedEmployee: "",
    startDate: "",
    deadline: "",
    status: "",
  });

  const [employees, setEmployees] = useState([]); // List of employees for assignment
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWorkDetails();
    fetchEmployees();
  }, []);

  // ✅ Fetch Work Details
  const fetchWorkDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/works/${id}`, { withCredentials: true });
      if (res.status === 200) {
        setFormData({
          title: res.data.title,
          description: res.data.description,
          assignedEmployee: res.data.assignedEmployee?._id || "",
          startDate: res.data.startDate.split("T")[0], // Format date
          deadline: res.data.deadline.split("T")[0], // Format date
          status: res.data.status,
        });
      }
    } catch (err) {
      console.error("🚨 Error fetching work details:", err.response?.data || err.message);
      setError("Failed to load work details.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Employees for Assignment
  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/employees", { withCredentials: true });
      if (res.status === 200) {
        setEmployees(res.data);
      }
    } catch (err) {
      console.error("🚨 Error fetching employees:", err.response?.data || err.message);
    }
  };

  // ✅ Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5000/works/update/${id}`, formData, { withCredentials: true });

      if (res.status === 200) {
        alert("Work updated successfully!");
        navigate("/dashboard"); // Redirect to Dashboard
      }
    } catch (err) {
      console.error("🚨 Error updating work:", err.response?.data || err.message);
      alert("Failed to update work.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold text-center mb-4">Edit Work</h2>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" name="title" placeholder="Work Title" className="w-full p-2 border rounded bg-gray-700" value={formData.title} onChange={handleChange} required />
            
            <textarea name="description" placeholder="Description" className="w-full p-2 border rounded bg-gray-700" value={formData.description} onChange={handleChange} required></textarea>
            
            <select name="assignedEmployee" className="w-full p-2 border rounded bg-gray-700" value={formData.assignedEmployee} onChange={handleChange} required>
              <option value="">Assign Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>

            <input type="date" name="startDate" className="w-full p-2 border rounded bg-gray-700" value={formData.startDate} onChange={handleChange} required />

            <input type="date" name="deadline" className="w-full p-2 border rounded bg-gray-700" value={formData.deadline} onChange={handleChange} required />

            <select name="status" className="w-full p-2 border rounded bg-gray-700" value={formData.status} onChange={handleChange} required>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <button type="submit" className="w-full mt-4 bg-blue-500 text-white p-2 rounded">
              Update Work
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
