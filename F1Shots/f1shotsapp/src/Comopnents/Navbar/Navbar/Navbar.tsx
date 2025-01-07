import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.less";
import { Badge, IconButton, Button, Box } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationDrawer from "../NotificationDrawer/NotificationDrawer";
import ProfileService from "../../../Services/ProfileService";
import {useAuth} from "../../../AuthContext";
import {User} from "../../../Models/User";
import {Notification} from "../../../Models/Notification";

const Navbar = () => {
    const navigate = useNavigate();
    const { setToken } = useAuth();
    const [profile, setProfile] = useState<User | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        setToken(null);
        navigate("/login");
    };

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const toggleDrawer = () => {
        setIsDrawerOpen((prev) => !prev);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
    };

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

    const fetchProfile = async () => {
        try {
            const userProfile = await ProfileService.getUserProfile();
            setProfile(userProfile);
        } catch (err) {
            console.error("Failed to fetch user profile:", err);
            setError("Failed to load user profile.");
        }
    };

    useEffect(() => {
        fetchNotifications();
        fetchProfile();
    }, []);

    return (
        <Box
            className="navbar"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            padding={2}
            sx={{
                width: "100%",
                boxSizing: "border-box",
                overflow: "hidden",
            }}
        >
            {/* Left section */}
            <Box className="navbarLeft" display="flex" gap={2} flexBasis="33%">
                <Button className="navbarButton" onClick={() => handleNavigation("/")}>
                    Home
                </Button>
                <Button className="navbarButton" onClick={() => handleNavigation("/groups")}>
                    Groups
                </Button>
                <Button className="navbarButton" onClick={() => handleNavigation("/friends")}>
                    Friends
                </Button>
            </Box>

            {/* Center section */}
            <Box className="navbarCenter" display="flex" justifyContent="center" flexBasis="33%">
                <Button
                    className="navbarButton profileButton"
                    onClick={() => handleNavigation(`/private-profile/${profile?.id}`)}
                >
                    {profile ? profile.username : "Loading..."}
                </Button>
            </Box>

            {/* Right section */}
            <Box className="navbarRight" display="flex" justifyContent="flex-end" gap={2} flexBasis="33%">
                <IconButton color="inherit" onClick={toggleDrawer} aria-label="notifications"
                sx={{
                    width: "auto",
                }}>
                    <Badge badgeContent={notifications.length > 0 ? "" : undefined} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
                <Button className="navbarButton logoutButton" onClick={handleLogout}
                sx={{
                    width: "auto",
                }}>
                    Logout
                </Button>
            </Box>

            {/* Notification Drawer */}
            <NotificationDrawer
                isDrawerOpen={isDrawerOpen}
                closeDrawer={closeDrawer}
                fetchNotifications={fetchNotifications}
                userId={profile?.id}
                markAllChecked={() => setNotifications([])}
                notifications={notifications}
                error={error}
            />
        </Box>
    );
};

export default Navbar;
