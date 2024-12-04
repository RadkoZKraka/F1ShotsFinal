import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Register from "./Register"; // Import the Register component
import './Login.less';  // Importing LESS styles

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showRegister, setShowRegister] = useState(false); // State to toggle between login and register
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.post("https://localhost:44388/api/auth/login", {
                email,
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
        <div style={styles.container}>
            {showRegister ? (
                <>
                    <Register />
                    <button style={styles.toggleButton} onClick={() => setShowRegister(false)}>
                        Already have an account? Login here
                    </button>
                </>
            ) : (
                <>
                    <form onSubmit={handleSubmit}>
                        <h2>Login</h2>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Login</button>
                        {errorMessage && <p>{errorMessage}</p>}
                    </form>
                    <button style={styles.toggleButton} onClick={() => setShowRegister(true)}>
                        Don't have an account? Register here
                    </button>
                </>
            )}
        </div>
    );
};

export default Login;

const styles: { container: React.CSSProperties; toggleButton: React.CSSProperties } = {
    container: {
        textAlign: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
    },
    toggleButton: {
        marginTop: "10px",
        padding: "10px 20px",
        fontSize: "16px",
        backgroundColor: "#28a745",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
};
