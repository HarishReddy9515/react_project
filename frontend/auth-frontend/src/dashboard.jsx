import { useEffect, useState } from "react";
import { Button, Card, Text, Input } from "@fluentui/react-components";
import background from "./assets/background.jpg";
import { apiGet, apiPut } from "./api/client";

export default function Dashboard({ onLogout, openChat }) {
  const role = localStorage.getItem("role"); // "admin" or "user"
  const isAdmin = role === "admin";

  const [profile, setProfile] = useState(null); // will be loaded from backend
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // Frontend-only extra fields (until you add them in DB)
  const [education, setEducation] = useState(
    "MS in Computer Science – Auburn University at Montgomery"
  );
  const [skills, setSkills] = useState("Python, Java, React, FastAPI, AWS");
  const [summary, setSummary] = useState(
    "Recent CS graduate with strong full-stack and cloud background."
  );

  useEffect(() => {
    const loadMe = async () => {
      setError("");
      setMsg("");
      setLoading(true);

      try {
        const me = await apiGet("/users/me", { auth: true });
        setProfile(me);
      } catch (err) {
        setError(err.message || "Failed to load profile. Please login again.");
      } finally {
        setLoading(false);
      }
    };

    loadMe();
  }, []);

  function handleEditClick() {
    setMsg("");
    if (!isAdmin) {
      setError("❌ Access Denied: Only admin can edit profile");
      return;
    }
    setEditMode(true);
    setError("");
  }

  async function handleSave() {
    setError("");
    setMsg("");

    if (!isAdmin) {
      setError("❌ Access Denied: Only admin can edit profile");
      return;
    }

    try {
      // Backend currently supports updating ONLY the name
      const updated = await apiPut(
        "/users/me",
        { name: profile.name },
        { auth: true }
      );
      setProfile(updated);

      setEditMode(false);
      setMsg("✅ Profile updated successfully");
    } catch (err) {
      setError(err.message || "Update failed");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "auto",
          background: "rgba(255,255,255,0.9)",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
        }}
      >
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text size={700} weight="bold">
            Dashboard ({isAdmin ? "Admin" : "User"})
          </Text>
          <Button appearance="secondary" onClick={onLogout}>
            Logout
          </Button>
        </div>

        {error && <p style={{ color: "red", marginTop: "12px" }}>{error}</p>}
        {msg && <p style={{ color: "green", marginTop: "12px" }}>{msg}</p>}

        {/* PROFILE CARD */}
        <Card style={{ marginTop: "24px", padding: "24px" }}>
          <Text weight="semibold" size={500}>
            Profile Information
          </Text>

          {loading ? (
            <p style={{ marginTop: "12px" }}>Loading...</p>
          ) : !profile ? (
            <p style={{ marginTop: "12px" }}>No profile loaded.</p>
          ) : editMode ? (
            <>
              {/* Backend-backed field */}
              <Input
                value={profile.name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                style={{ marginTop: "12px" }}
              />

              {/* Frontend-only fields (not saved to backend yet) */}
              <Input
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                style={{ marginTop: "12px" }}
              />
              <Input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                style={{ marginTop: "12px" }}
              />

              <Button
                appearance="primary"
                style={{ marginTop: "16px" }}
                onClick={handleSave}
              >
                Save
              </Button>
            </>
          ) : (
            <>
              <p>
                <b>Name:</b> {profile.name}
              </p>
              <p>
                <b>Email:</b> {profile.email}
              </p>
              <p>
                <b>Role:</b> {profile.role}
              </p>
              <p>
                <b>Education:</b> {education}
              </p>
              <p>
                <b>Skills:</b> {skills}
              </p>
              <p>
                <b>Summary:</b> {summary}
              </p>
            </>
          )}
        </Card>

        {/* ACTIONS */}
        <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <Button appearance="primary" onClick={handleEditClick}>
            Edit Profile
          </Button>

          <Button appearance="secondary" onClick={openChat}>
            Open Chatbot
          </Button>
        </div>
      </div>
    </div>
  );
}
