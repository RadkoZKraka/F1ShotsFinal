import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NotificationDrawer from "./NotificationDrawer"; // Import the new NotificationDrawer component
import {Notification} from "../../Models/Notification";
import "./Navbar.less";

// Define the notification type structure

const Navbar = () => {
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false); // State for drawer visibility
    const [notifications, setNotifications] = useState<Notification[]>([]); // Store notifications (Array of Notification objects)
    const [error, setError] = useState<string | null>(null); // For error handling

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        navigate("/login");
    };

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const toggleDrawer = () => {
        setIsDrawerOpen((prev) => !prev); // Toggle drawer visibility
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false); // Close the drawer
    };

    // Fetch notifications when the component is mounted (or page is refreshed)
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.get("https://localhost:44388/api/Notification/unread", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setNotifications(response.data);
        } catch (err) {
            setError("Failed to fetch notifications.");
            console.error(err);
        }
    };

    const markAllChecked = async () => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                navigate("/login");
                return;
            }

            await axios.post(
                "https://localhost:44388/api/Notification/mark-all-checked",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // If successful, clear notifications or update the UI as needed
            setNotifications([]);
            alert("All notifications marked as checked!");
        } catch (err) {
            setError("Failed to mark notifications as checked.");
            console.error(err);
        }
    };

    // Fetch notifications when the component is mounted (or page is refreshed)
    useEffect(() => {
        fetchNotifications(); // Call fetchNotifications when the component mounts
    }, [navigate]); // Empty dependency array means this runs once when the component mounts

    return (
        <div className="navbar">
            <ul className="navbarList">
                <li className="navbarItem" onClick={() => handleNavigation("/")}>
                    Home
                </li>
                <li className="navbarItem" onClick={() => handleNavigation("/groups")}>
                    Groups
                </li>
                <li className="navbarItem" onClick={() => handleNavigation("/friends")}>
                    Friends
                </li>
            </ul>
            <div className="buttonGroup">
                <button className="navbarButton" onClick={toggleDrawer}>
                    Notifications ({notifications.length}) {/* Show the number of notifications */}
                </button>
                <button
                    className="navbarButton"
                    onClick={() => handleNavigation("/settings")}
                >
                    Settings
                </button>
                <button
                    className="navbarButton logoutButton"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>

            {/* Use the NotificationDrawer component */}
            <NotificationDrawer
                isDrawerOpen={isDrawerOpen}
                closeDrawer={closeDrawer}
                fetchNotifications={fetchNotifications} // Pass the fetchNotifications function here
                markAllChecked={markAllChecked}
                notifications={notifications}
                error={error}
            />
        </div>
    );
};

export default Navbar;
