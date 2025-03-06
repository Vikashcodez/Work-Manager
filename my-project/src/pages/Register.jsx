import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    organization: "",
    position: "",
    address: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
  
    try {
      const res = await axios.post("http://localhost:5000/auth/register", formData);
      console.log("Response:", res.data);
      navigate("/login");
    } catch (err) {
      console.error("Error response:", err.response);
      setError(err.response?.data?.msg || "Registration failed");
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold">Create Account</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-4">
          <input type="email" name="email" placeholder="Email" className="w-full p-2 border rounded" onChange={handleChange} required />
          <input type="text" name="organization" placeholder="Organization Name" className="w-full p-2 border rounded mt-2" onChange={handleChange} required />
          <input type="text" name="position" placeholder="Your Position" className="w-full p-2 border rounded mt-2" onChange={handleChange} required />
          <input type="text" name="address" placeholder="Organization Address" className="w-full p-2 border rounded mt-2" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" className="w-full p-2 border rounded mt-2" onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" className="w-full p-2 border rounded mt-2" onChange={handleChange} required />
          <button type="submit" className="w-full mt-4 bg-green-500 text-white p-2 rounded">Create Account</button>
        </form>
      </div>
    </div>
  );
}
