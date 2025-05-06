import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";

// Import pages
import HomePage from './pages/HomePage';
import TournamentAdminPage from './pages/TournamentAdminPage';
import GuestPage from './pages/GuestPage';
import LoginPage from './pages/LoginPage'; // Import LoginPage

// Import base styles (assuming create-react-app structure)
import './App.css'; // You might need to create/adjust this

function App() {
  // Basic state for login status (replace with context/state management)
  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/guest">Guest View</Link>
            </li>
            <li>
              <Link to="/admin">Tournament Admin</Link>
            </li>
            <li>
              <Link to="/login">Login</Link> {/* Add Login link */}
            </li>
            {/* Add Logout link conditionally based on login state */}
          </ul>
        </nav>

        <hr />

        <Routes>
          <Route path="/admin" element={<TournamentAdminPage />} />
          <Route path="/guest" element={<GuestPage />} />
          <Route path="/login" element={<LoginPage />} /> {/* Add Login route */}
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

