import { useState } from "react";
import { Button, Input, Label } from "@fluentui/react-components";
import background from "./assets/background.jpg";
import { apiPost } from "./api/client";

const inputStyle = { width: "100%" };

export default function Login({ onLoginSuccess, goToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");

    if (!email || !password) {
      setError("Email and Password are required");
      return;
    }

    try {
      setLoading(true);

      // ✅ REAL AUTH (backend)
      const data = await apiPost("/auth/login", { email, password });

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);

      onLoginSuccess(); // your App will read role/token from localStorage
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255,255,255,0.9)",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h2>

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        <Label>Email</Label>
        <Input
          style={inputStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Label style={{ marginTop: "12px" }}>Password</Label>
        <Input
          type="password"
          style={inputStyle}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <Button
            appearance="primary"
            style={{ width: "100%" }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </div>

        <p style={{ textAlign: "center", marginTop: "16px" }}>
          Don’t have an account?{" "}
          <span
            style={{ color: "#2563eb", cursor: "pointer" }}
            onClick={goToSignup}
          >
            Sign up
          </span>
        </p>

        {/* Optional hint for testing */}
        {/* <p style={{ textAlign: "center", marginTop: "10px", fontSize: "12px", color: "#666" }}>
          Use your real backend accounts (admin@example.com / Admin@12345)
        </p> */}
      </div>
    </div>
  );
}
