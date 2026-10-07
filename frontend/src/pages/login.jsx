import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

import { login } from "../services/authservices";

function Login() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {

        e.preventDefault();

        if (!username.trim()) {
            alert("Enter Username");
            return;
        }

        if (!password.trim()) {
            alert("Enter Password");
            return;
        }

        try {

            setLoading(true);

            await login(username.trim(), password);

            navigate("/dashboard");

        } catch (error) {

            console.error(error);

            alert("Invalid Username or Password");

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="login-container">

            <div className="login-card">

                <h1>GHS Maruthipura</h1>

                <h3>Student Management System</h3>

                <form onSubmit={handleLogin}>

                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging In..." : "Login"}
                    </button>

                </form>

            </div>

        </div>

    );

}

export default Login;