import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Empreg from './pages/AddEmployee'
import EmployeeDashboard from "./pages/EmployeeDashboard";
import HomePage from "./pages/Home";
import AddWork from "./pages/AddWork";
import WorkDetails from "./pages/WorkDetails";
import WorkDetail from "./pages/Works";
import EditWork from "./pages/EditWork";
function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-grow p-4">
          <Routes>
          <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-employee" element={<Empreg />} />
            <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
            <Route path="/add-work" element={<AddWork />} />
            <Route path="/work-details/:id" element={<WorkDetails />} />
            <Route path="/works-details/:id" element={<WorkDetail />} />
            <Route path="/edit-work/:id" element={<EditWork />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
