import { useState, useEffect } from "react";
import { Search, Plus, Users, AlertCircle, CheckCircle, MoreHorizontal, X, Edit, Archive, Unlock, Lock } from "lucide-react";

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
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Auto-hide notifications after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Display notification helper
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
  };

  // Fetch all employees
  const fetchEmployees = async () => {
    setIsLoading(true);
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
      showNotification(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing again
    if (error) setError("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
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

      showNotification("Employee added successfully");
      setShowAddPopup(false);
      setFormData({
        name: "",
        employeeId: "",
        position: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      fetchEmployees();
    } catch (error) {
      console.error("🚨 Error:", error);
      setError(error.message);
      showNotification(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Employee
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    setIsLoading(true);
    
    try {
      const res = await fetch(`http://localhost:5000/employees/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to delete employee");

      showNotification("Employee deleted successfully");
      fetchEmployees();
    } catch (error) {
      console.error("🚨 Error deleting employee:", error);
      showNotification(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Block / Unblock Employee
  const handleBlockToggle = async (id, isBlocked) => {
    const confirmMsg = isBlocked
      ? "Are you sure you want to unblock this employee?"
      : "Are you sure you want to block this employee?";
    if (!window.confirm(confirmMsg)) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/employees/block/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: !isBlocked }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to update employee status");

      showNotification(isBlocked ? "Employee unblocked successfully" : "Employee blocked successfully");
      fetchEmployees();
    } catch (error) {
      console.error("🚨 Error blocking/unblocking employee:", error);
      showNotification(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Left Sidebar */}
      <div className="w-16 lg:w-64 bg-gray-800 flex flex-col">
        <div className="p-4 flex items-center justify-center lg:justify-start">
          <div className="h-8 w-8 bg-blue-500 rounded flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h1 className="ml-3 text-xl font-bold text-white hidden lg:block">Emplyoees Details</h1>
        </div>
        
        <nav className="mt-8 flex-1">
          <div className="px-2">
            <div className="flex flex-col space-y-1">
              <button 
                className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-gray-700 text-white group"
                onClick={() => setShowAddPopup(true)}
              >
                <Plus className="mr-3 h-5 w-5" />
                <span className="hidden lg:block">Add Employee</span>
              </button>
              
              <button 
                className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white group"
                onClick={() => setShowTablePopup(true)}
              >
                <Users className="mr-3 h-5 w-5" />
                <span className="hidden lg:block">View Employees</span>
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Employee Management</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-6">
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setShowAddPopup(true)}
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Employee</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Register a new employee to the system</p>
                  </div>
                </div>
              </div>
            </div>

            <div 
              className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setShowTablePopup(true)}
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">View Employees</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage existing employees</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Employees</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {employees.filter(emp => !emp.blocked).length} Active / {employees.length} Total
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Employee Activity</h3>
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {employees.slice(0, 5).map((emp) => (
                  <li key={emp._id}>
                    <div className="px-4 py-4 flex items-center sm:px-6">
                      <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <div className="flex text-sm">
                            <p className="font-medium text-blue-600 dark:text-blue-400 truncate">{emp.name}</p>
                            <p className="ml-1 flex-shrink-0 font-normal text-gray-500">@{emp.employeeId}</p>
                          </div>
                          <div className="mt-2 flex">
                            <div className="flex items-center text-sm text-gray-500">
                              <p>{emp.position}</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex-shrink-0 sm:mt-0">
                          <div className="flex overflow-hidden">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              emp.blocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                            }`}>
                              {emp.blocked ? "Blocked" : "Active"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>

      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded shadow-lg flex items-center z-50 ${
          notification.type === "error" ? "bg-red-500" : "bg-green-500"
        }`}>
          <span className="text-white">{notification.message}</span>
          <button 
            onClick={() => setNotification({...notification, show: false})}
            className="ml-3 text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="h-4 w-4 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="h-4 w-4 bg-blue-500 rounded-full animate-pulse delay-100"></div>
              <div className="h-4 w-4 bg-blue-500 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
     
      {showAddPopup && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 sm:mx-0 sm:h-10 sm:w-10">
                    <Plus className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Add New Employee
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Fill in the details to add a new employee to the system.
                      </p>
                    </div>

                    {error && (
                      <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                              {error}
                            </h3>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Employee ID
                        </label>
                        <input
                          type="text"
                          name="employeeId"
                          id="employeeId"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="EMP001"
                          value={formData.employeeId}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Position
                        </label>
                        <input
                          type="text"
                          name="position"
                          id="position"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Software Engineer"
                          value={formData.position}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="john.doe@company.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          id="password"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Employee'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-500"
                  onClick={() => setShowAddPopup(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show Employees Table Modal */}
      {showTablePopup && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Employee Directory
                </h3>
                <button
                  type="button"
                  className="rounded-md p-1 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none"
                  onClick={() => setShowTablePopup(false)}
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-center mb-4">
                  <div className="flex-1">
                    <div className="relative max-w-xs">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {filteredEmployees.length} {filteredEmployees.length === 1 ? 'employee' : 'employees'} found
                    </span>
                  </div>
                </div>
                
                <div className="shadow overflow-x-auto border-b border-gray-200 dark:border-gray-700 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Employee ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Position
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((emp) => (
                          <tr key={emp._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {emp.employeeId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {emp.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {emp.position}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {emp.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                emp.blocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                              }`}>
                                {emp.blocked ? "Blocked" : "Active"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="relative inline-block text-left group">
                                <button
                                  type="button"
                                  className="inline-flex justify-center w-full px-2 py-1 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 focus:outline-none"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                                <div className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block">
                                  <div className="py-1">
                                    <button
                                      onClick={() => handleBlockToggle(emp._id, emp.blocked)}
                                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                      {emp.blocked ? (
                                        <span className="flex items-center">
                                          <Unlock className="mr-2 h-4 w-4 text-green-500" />
                                          Unblock
                                        </span>
                                      ) : (
                                        <span className="flex items-center">
                                          <Lock className="mr-2 h-4 w-4 text-yellow-500" />
                                          Block
                                        </span>
                                      )}
                                    </button>
                                    <button
                                      onClick={() => handleDelete(emp._id)}
                                      className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                      <span className="flex items-center">
                                        <Archive className="mr-2 h-4 w-4" />
                                        Delete
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                            {isLoading ? (
                              <div className="flex justify-center items-center">
                                <div className="loader"></div>
                                <span className="ml-2">Loading employees...</span>
                              </div>
                            ) : (
                              <div className="py-8">
                                <div className="flex justify-center">
                                  <Users className="h-12 w-12 text-gray-400" />
                                </div>
                                <p className="mt-2 text-base">No employees found</p>
                                {searchTerm && (
                                  <p className="text-sm mt-1">
                                    Try adjusting your search or filter to find what you're looking for.
                                  </p>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-500"
                  onClick={() => setShowTablePopup(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for loader animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .loader {
          border: 2px solid rgba(59, 130, 246, 0.2);
          border-radius: 50%;
          border-top: 2px solid rgba(59, 130, 246, 1);
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}