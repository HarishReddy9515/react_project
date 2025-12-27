import { useEffect, useState } from "react";
import Login from "./login";
import Signup from "./Signup";
import Dashboard from "./dashboard";
import Chat from "./chat";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  function handleLoginSuccess() {
    setIsLoggedIn(true);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setShowChat(false);
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

  if (showChat) {
    return <Chat goBack={() => setShowChat(false)} />;
  }

  return (
    <Dashboard
      onLogout={handleLogout}
      openChat={() => setShowChat(true)}
    />
  );
}
