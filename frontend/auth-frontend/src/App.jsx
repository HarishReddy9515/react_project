import { useEffect, useState } from "react";
import Login from "./login";
import Signup from "./Signup";
import Dashboard from "./dashboard";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // 🔁 Restore session on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  function handleLoginSuccess() {
    setIsLoggedIn(true);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
  }

  if (!isLoggedIn) {
    return showSignup ? (
      <Signup goToLogin={() => setShowSignup(false)} />
    ) : (
      <Login
        onLoginSuccess={handleLoginSuccess}
        goToSignup={() => setShowSignup(true)}
      />
    );
  }

  return <Dashboard onLogout={handleLogout} />;
}
