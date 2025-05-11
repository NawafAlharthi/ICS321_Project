import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

// Import pages
import HomePage from "./pages/HomePage";
import TournamentAdminPage from "./pages/TournamentAdminPage";
import GuestPage from "./pages/GuestPage";
import LoginPage from "./pages/LoginPage"; // Import LoginPage

// Import base styles
import "./App.css";

// NavLink component for active state
const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
        isActive
          ? "text-indigo-600 border-indigo-500"
          : "text-gray-500 hover:text-indigo-600 border-transparent hover:border-gray-300"
      }`}
    >
      {children}
    </Link>
  );
};

function AppContent() {
  const [user, setUser] = useState(null); // user: {role: 'admin'|'guest', username: string}
  const location = useLocation();
  const navigate = useNavigate();

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    navigate("/login");
  };

  // If not logged in, always show LoginPage (no navbar)
  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  // If logged in as admin, show only TournamentAdminPage with logout
  if (user.role === "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow"
            >
              Logout
            </button>
          </div>
          <TournamentAdminPage />
        </main>
      </div>
    );
  }

  // If logged in as guest, show only GuestPage with logout
  if (user.role === "guest") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow"
            >
              Logout
            </button>
          </div>
          <GuestPage />
        </main>
      </div>
    );
  }

  // fallback (should not happen)
  return null;
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
