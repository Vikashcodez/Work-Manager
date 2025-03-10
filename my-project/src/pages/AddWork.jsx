import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar, Users, FileText, PlusCircle, Send, Check, ArrowRight, Trash2 } from "lucide-react";

export default function AddWork() {
  const navigate = useNavigate();
  const [stage, setStage] = useState(1);
  const [employees, setEmployees] = useState([]);
  const [workData, setWorkData] = useState({
    title: "",
    description: "",
    startDate: "",
    deadline: "",
    workDescription: "",
    assignedEmployee: "",
    stages: [],
    newStage: ""
  });
  const [errors, setErrors] = useState({});

  // Fetch Employees from Database
  useEffect(() => {
    axios.get("http://localhost:5000/employees", { withCredentials: true })
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error("Error fetching employees:", err));
  }, []);
  // Handle Form Changes
  const handleChange = (e) => {
    setWorkData({ ...workData, [e.target.name]: e.target.value });
    // Clear error for this field if any
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  // Handle Stage Addition
  const addStage = () => {
    if (!workData.newStage) {
      setErrors({ ...errors, newStage: "Please enter a stage name" });
      return;
    }
    
    setWorkData({
      ...workData,
      stages: [...workData.stages, workData.newStage],
      newStage: ""
    });
  };

  // Remove a stage
  const removeStage = (index) => {
    const updatedStages = [...workData.stages];
    updatedStages.splice(index, 1);
    setWorkData({ ...workData, stages: updatedStages });
  };

  // Validate current stage
  const validateStage = () => {
    const newErrors = {};
    
    if (stage === 1) {
      if (!workData.title) newErrors.title = "Title is required";
      if (!workData.description) newErrors.description = "Description is required";
    } else if (stage === 2) {
      if (!workData.startDate) newErrors.startDate = "Start date is required";
      if (!workData.deadline) newErrors.deadline = "Deadline is required";
      if (!workData.workDescription) newErrors.workDescription = "Work details are required";
      if (workData.startDate && workData.deadline && new Date(workData.startDate) > new Date(workData.deadline)) {
        newErrors.deadline = "Deadline cannot be before start date";
      }
    } else if (stage === 3) {
      if (!workData.assignedEmployee) newErrors.assignedEmployee = "Please select an employee";
      if (workData.stages.length === 0) newErrors.stages = "Please add at least one stage";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle stage navigation
  const goToNextStage = () => {
    if (validateStage()) {
      setStage(stage + 1);
    }
  };

  const goToPrevStage = () => {
    setStage(stage - 1);
  };

  // Submit Work Data to Database
  const handleSubmit = async () => {
    if (!workData.assignedEmployee || workData.assignedEmployee === "undefined") {
      setErrors({ assignedEmployee: "Please select an employee" });
      return;
    }
  
    console.log("📤 Sending Work Data:", workData); // Debugging
  
    try {
      await axios.post("http://localhost:5000/works/add", workData, { withCredentials: true });
      navigate("/dashboard", { state: { notification: "Work added successfully!" } });
    } catch (err) {
      console.error("🚨 Error submitting work:", err.response?.data || err.message);
      setErrors({ submit: "Failed to add work. Please try again." });
    }
  };
  
  
  return (
    <div className="min-h-screen  text-white flex flex-col items-center p-6">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center mb-8">Create New Work Assignment</h1>
        
        {/* Live Timeline */}
        <div className="relative mb-12">
          {/* Progress Bar */}
          <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-700 -translate-y-1/2 rounded-full">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((stage - 1) / 2) * 100}%` }}
            ></div>
          </div>
          
          {/* Timeline Steps */}
          <div className="flex justify-between items-center relative">
            <div 
              onClick={() => stage > 1 && setStage(1)}
              className={`w-16 h-16 rounded-full flex flex-col items-center justify-center z-10 cursor-pointer transition-all duration-300
                ${stage >= 1 ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-400"}
                ${stage > 1 ? "scale-90 hover:scale-100" : "scale-100"}`}
            >
              <FileText className={`h-6 w-6 ${stage === 1 ? "" : "mb-1"}`} />
              {stage === 1 && <span className="text-xs mt-1">Details</span>}
              {stage > 1 && <Check className="h-4 w-4 mt-1" />}
            </div>
            
            <div 
              onClick={() => stage > 2 && setStage(2)}
              className={`w-16 h-16 rounded-full flex flex-col items-center justify-center z-10 cursor-pointer transition-all duration-300
                ${stage >= 2 ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-400"}
                ${stage > 2 ? "scale-90 hover:scale-100" : "scale-100"}`}
            >
              <Calendar className={`h-6 w-6 ${stage === 2 ? "" : "mb-1"}`} />
              {stage === 2 && <span className="text-xs mt-1">Schedule</span>}
              {stage > 2 && <Check className="h-4 w-4 mt-1" />}
            </div>
            
            <div 
              className={`w-16 h-16 rounded-full flex flex-col items-center justify-center z-10 cursor-pointer transition-all duration-300
                ${stage >= 3 ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-400"}`}
            >
              <Users className="h-6 w-6" />
              {stage === 3 && <span className="text-xs mt-1">Assign</span>}
            </div>
          </div>
        </div>
        
        {/* Form Card */}
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 transition-all duration-300">
          {/* Stage 1: Work Details */}
          {stage === 1 && (
            <>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <FileText className="h-6 w-6 mr-2 text-blue-400" /> 
                Work Details
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Work Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={workData.title}
                    placeholder="Enter a descriptive title" 
                    className={`w-full p-3 bg-gray-700 border-2 ${errors.title ? 'border-red-500' : 'border-gray-600'} rounded-lg focus:outline-none focus:border-blue-500 transition-colors`} 
                    onChange={handleChange} 
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Description</label>
                  <textarea 
                    name="description" 
                    value={workData.description}
                    placeholder="Provide a detailed description of the work" 
                    className={`w-full p-3 bg-gray-700 border-2 ${errors.description ? 'border-red-500' : 'border-gray-600'} rounded-lg focus:outline-none focus:border-blue-500 transition-colors min-h-32`}
                    onChange={handleChange} 
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button 
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center transition-colors" 
                  onClick={goToNextStage}
                >
                  Next <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </>
          )}

          {/* Stage 2: Work Schedule */}
          {stage === 2 && (
            <>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-blue-400" /> 
                Work Schedule
              </h2>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Start Date</label>
                    <input 
                      type="date" 
                      name="startDate" 
                      value={workData.startDate}
                      className={`w-full p-3 bg-gray-700 border-2 ${errors.startDate ? 'border-red-500' : 'border-gray-600'} rounded-lg focus:outline-none focus:border-blue-500 transition-colors`}
                      onChange={handleChange} 
                    />
                    {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Deadline</label>
                    <input 
                      type="date" 
                      name="deadline" 
                      value={workData.deadline}
                      className={`w-full p-3 bg-gray-700 border-2 ${errors.deadline ? 'border-red-500' : 'border-gray-600'} rounded-lg focus:outline-none focus:border-blue-500 transition-colors`}
                      onChange={handleChange} 
                    />
                    {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Work Details</label>
                  <textarea 
                    name="workDescription" 
                    value={workData.workDescription}
                    placeholder="Provide detailed instructions and expectations" 
                    className={`w-full p-3 bg-gray-700 border-2 ${errors.workDescription ? 'border-red-500' : 'border-gray-600'} rounded-lg focus:outline-none focus:border-blue-500 transition-colors min-h-32`}
                    onChange={handleChange} 
                  />
                  {errors.workDescription && <p className="text-red-500 text-sm mt-1">{errors.workDescription}</p>}
                </div>
              </div>
              
              <div className="mt-8 flex justify-between">
                <button 
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors" 
                  onClick={goToPrevStage}
                >
                  Back
                </button>
                <button 
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center transition-colors" 
                  onClick={goToNextStage}
                >
                  Next <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </>
          )}

          {/* Stage 3: Assign Work & Add Stages */}
          {stage === 3 && (
            <>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Users className="h-6 w-6 mr-2 text-blue-400" /> 
                Assignment & Stages
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Assign To</label>
                  <select 
                    name="assignedEmployee" 
                    value={workData.assignedEmployee}
                    className={`w-full p-3 bg-gray-700 border-2 ${errors.assignedEmployee ? 'border-red-500' : 'border-gray-600'} rounded-lg focus:outline-none focus:border-blue-500 transition-colors appearance-none`}
                    onChange={handleChange}
                  >
                    <option value="">Select an employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.position})
                      </option>
                    ))}
                  </select>
                  {errors.assignedEmployee && <p className="text-red-500 text-sm mt-1">{errors.assignedEmployee}</p>}
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Work Stages</label>
                  {errors.stages && <p className="text-red-500 text-sm mb-2">{errors.stages}</p>}
                  
                  <div className="flex">
                    <input
                      type="text"
                      name="newStage"
                      value={workData.newStage}
                      placeholder="Enter a stage (e.g., Planning, Development)"
                      className={`flex-1 p-3 bg-gray-700 border-2 ${errors.newStage ? 'border-red-500' : 'border-gray-600'} rounded-l-lg focus:outline-none focus:border-blue-500 transition-colors`}
                      onChange={handleChange}
                    />
                    <button 
                      className="px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-r-lg flex items-center transition-colors" 
                      onClick={addStage}
                    >
                      <PlusCircle className="h-5 w-5" />
                    </button>
                  </div>
                  {errors.newStage && <p className="text-red-500 text-sm mt-1">{errors.newStage}</p>}
                  
                  {/* Display Added Stages */}
                  <div className="mt-3 space-y-2">
                    {workData.stages.length === 0 ? (
                      <p className="text-gray-400 italic">No stages added yet</p>
                    ) : (
                      workData.stages.map((stage, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg group">
                          <div className="flex items-center">
                            <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full text-xs mr-3">
                              {index + 1}
                            </span>
                            <span>{stage}</span>
                          </div>
                          <button 
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeStage(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              {errors.submit && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
                  {errors.submit}
                </div>
              )}
              
              <div className="mt-8 flex justify-between">
                <button 
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors" 
                  onClick={goToPrevStage}
                >
                  Back
                </button>
                <button 
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center transition-colors" 
                  onClick={handleSubmit}
                >
                  <Send className="h-5 w-5 mr-2" /> Submit Work
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}