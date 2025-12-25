import { useState } from "react";
import { Button, Input, Label } from "@fluentui/react-components";
import background from "./assets/background.jpg";
import { apiPost } from "./api/client";

const inputStyle = { width: "100%" };

export default function Signup({ goToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setError("");

    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      // ✅ REAL SIGNUP (backend)
      await apiPost("/auth/signup", { name, email, password });

      alert("Signup successful ✅ Please login now.");
      goToLogin();
    } catch (err) {
      setError(err.message || "Signup failed");
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
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Sign Up
        </h2>

        {error && (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        )}

        <Label>Name</Label>
        <Input
          style={inputStyle}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Label style={{ marginTop: "12px" }}>Email</Label>
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

        <Button
          appearance="primary"
          style={{ width: "100%", marginTop: "20px" }}
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Account"}
        </Button>

        <p style={{ textAlign: "center", marginTop: "16px" }}>
          Already have an account?{" "}
          <span
            style={{ color: "#2563eb", cursor: "pointer" }}
            onClick={goToLogin}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
