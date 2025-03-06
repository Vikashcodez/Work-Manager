import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // ✅ Clear errors before submitting

    try {
      const res = await axios.post("http://localhost:5000/auth/login", formData, {
        withCredentials: true, // ✅ Sends cookies
      });

      console.log("Login Response:", res.data); // ✅ Debugging

      if (!res.data.user) {
        throw new Error("Invalid login response. Please try again.");
      }

      // ✅ Store user data & role
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // ✅ Redirect based on role
      if (res.data.user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/employee-dashboard"); // New Employee Dashboard
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      setError(err.response?.data?.msg || "Login failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold">Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-2 border rounded mt-2"
            onChange={handleChange}
            required
          />
          <button type="submit" className="w-full mt-4 bg-blue-500 text-white p-2 rounded">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
