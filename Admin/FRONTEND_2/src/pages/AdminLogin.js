import React, { useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const res = await axios.post(`${API}/login`, {
        username,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("admin", JSON.stringify(res.data.admin));
      onLogin(res.data.admin);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <h1>SAHAAY</h1>
          <p>Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <label>Username</label>
          <input
            type="text"
            placeholder="Enter admin username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="login-footer">
          <span>Demo access:</span>
          <b> admin / admin123</b>
        </div>
      </div>
    </div>
  );
}
