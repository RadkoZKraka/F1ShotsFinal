import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './LandingPage.less';  // Importing LESS styles

const LandingPage = () => {
    const [user, setUser] = useState<User | null>(null); // User or null when loading
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("authToken");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await axios.get("https://localhost:44388/api/user/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUser(response.data); // Now TypeScript knows the structure
            } catch (error) {
                console.error("Failed to fetch user info:", error);
                navigate("/login");
            }
        };

        fetchUser();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        navigate("/login");
    };

    return (
        <div style={styles.container}>
            {user ? (
                <>
                    <h1>Welcome, {user.username}!</h1>
                    <p>Email: {user.email}</p>
                    <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                    <button style={styles.button} onClick={handleLogout}>
                        Logout
                    </button>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default LandingPage;

const styles: { container: React.CSSProperties; button: React.CSSProperties } = {
    container: {
        textAlign: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
    },
    button: {
        padding: "10px 20px",
        fontSize: "16px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
};

interface User {
    username: string;
    email: string;
    createdAt: string; // or Date if you're converting it
}
