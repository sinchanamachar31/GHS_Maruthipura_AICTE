import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/dashboardlayout";
import "../styles/login.css";

const preparatoryRoutes = {
  P1: "/preparatory/P1",
  P2: "/preparatory/P2",
  P3: "/preparatory/P3"
};

function PreparatoryLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (normalizedUsername === "preparatorylogin" && normalizedPassword === "12345") {
      navigate(preparatoryRoutes.P1);
    } else {
      alert("Invalid Preparatory credentials");
    }
  };

  return (
    <DashboardLayout>
      <div className="login-container">
        <div className="login-card">
          <h1>📘 Preparatory Login</h1>
          <h3>Enter Preparatory credentials</h3>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default PreparatoryLogin;
