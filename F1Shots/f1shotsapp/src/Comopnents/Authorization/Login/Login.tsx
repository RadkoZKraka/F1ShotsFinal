﻿import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./Login.less";
import Register from "../Register/Register"; // Importing LESS styles

const Login = () => {
    const [identifier, setIdentifier] = useState(""); // Combined field for email/username
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showRegister, setShowRegister] = useState(false); // State to toggle between login and register
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.post("https://localhost:44388/api/auth/login", {
                identifier, // Updated field name
                password,
            });

            if (response.status === 200) {
                localStorage.setItem("authToken", response.data.token);
                navigate("/landing");
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setErrorMessage(error.response.data.message || "Login failed.");
            } else {
                setErrorMessage("Something went wrong.");
            }
        }
    };

    return (
        <div className="login-container">
            {showRegister ? (
                <>
                    <Register />
                    <button className="toggle-button" onClick={() => setShowRegister(false)}>
                        Already have an account? Login here
                    </button>
                </>
            ) : (
                <>
                    <form onSubmit={handleSubmit}>
                        <h2>Login</h2>
                        <div className="input-group">
                            <label htmlFor="emailOrUsername">Email or Username</label>
                            <input
                                id="emailOrUsername"
                                type="text" // Allow any text input
                                placeholder="Email or Username"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        <button type="submit">Login</button>
                    </form>
                    <button className="toggle-button" onClick={() => setShowRegister(true)}>
                        Don't have an account? Register here
                    </button>
                </>
            )}
        </div>
    );
};

export default Login;