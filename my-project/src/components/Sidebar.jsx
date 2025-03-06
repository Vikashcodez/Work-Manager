import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, LogIn, UserPlus, LogOut, Menu } from "lucide-react";

export default function Sidebar({ isAuthenticated, logout }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={`${isExpanded ? 'w-60' : 'w-16'} h-screen bg-gray-800 text-white p-4 transition-all duration-300 ease-in-out`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex items-center mb-6">
        {isExpanded ? (
          <h1 className="text-2xl font-bold">WorkManager</h1>
        ) : (
          <Menu className="mx-auto" size={24} />
        )}
      </div>

      <div className="space-y-4">
        <Link to="/" className="flex items-center gap-4 p-2 rounded hover:bg-gray-700">
          <Home size={20} />
          {isExpanded && <span>Dashboard</span>}
        </Link>

        {!isAuthenticated ? (
          <>
            <Link to="/login" className="flex items-center gap-4 p-2 rounded hover:bg-gray-700">
              <LogIn size={20} />
              {isExpanded && <span>Login</span>}
            </Link>
            
            <Link to="/register" className="flex items-center gap-4 p-2 rounded hover:bg-gray-700">
              <UserPlus size={20} />
              {isExpanded && <span>Create Account</span>}
            </Link>
          </>
        ) : (
          <button 
            onClick={logout} 
            className="flex items-center gap-4 p-2 rounded hover:bg-gray-700 w-full text-left"
          >
            <LogOut size={20} />
            {isExpanded && <span>Logout</span>}
          </button>
        )}
      </div>
    </div>
  );
}