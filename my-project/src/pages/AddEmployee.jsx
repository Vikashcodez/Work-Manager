import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AddEmployee() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    position: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/employees/add", {
        method: "POST",
        credentials: "include", // ✅ Sends cookies (important for authentication)
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to add employee");
  
      alert("Employee added successfully");
    } catch (error) {
      console.error("🚨 Error:", error);
      alert(error.message);
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  text-white">
      <div className="bg-gray-800 p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-bold text-center">Add Employee</h2>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input type="text" name="name" placeholder="Employee Name" className="w-full p-2 border rounded bg-gray-700" onChange={handleChange} required />
          <input type="text" name="employeeId" placeholder="Employee ID" className="w-full p-2 border rounded bg-gray-700" onChange={handleChange} required />
          <input type="text" name="position" placeholder="Employee Position" className="w-full p-2 border rounded bg-gray-700" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Employee Email" className="w-full p-2 border rounded bg-gray-700" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" className="w-full p-2 border rounded bg-gray-700" onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" className="w-full p-2 border rounded bg-gray-700" onChange={handleChange} required />
          <button type="submit" className="w-full mt-4 bg-blue-500 text-white p-2 rounded">
            Add Employee
          </button>
        </form>
      </div>
    </div>
  );
}
