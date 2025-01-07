import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileService from "../../../Services/ProfileService";
import { User } from "../../../Models/User";
import "./PrivateProfilePage.less";
import { useAuth } from "../../../AuthContext";
import Banned from "../../Banned/Banned"; // Import the Banned component

const PrivateProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<User | null>(null);
    const [isBannedModalOpen, setBannedModalOpen] = useState(false);
    const { setToken } = useAuth();
    const navigate = useNavigate();

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    // Fetch the profile data when the component mounts
    useEffect(() => {
        const fetchProfile = async () => {
            const profileData = await ProfileService.getUserProfile();
            setProfile(profileData);
        };

        fetchProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        setToken(null);
        navigate("/login");
    };

    const openBannedModal = () => {
        setBannedModalOpen(true);
    };

    const closeBannedModal = () => {
        setBannedModalOpen(false);
    };

    if (!profile) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="private-profile-page">
            <div className="profile-header">
                <h2 className="profile-username">{profile.username}</h2>
            </div>

            <div className="profile-info">
                <h3>Basic Information</h3>
                <ul>
                    <li>Email: {profile.email}</li>
                </ul>
            </div>

            <div className="actions">
                <button className="navbarButton" onClick={() => handleNavigation("/settings")}>Settings</button>
                <button className="navbarButton bannedUsersButton" onClick={openBannedModal}>Banned Users</button>
                <button className="navbarButton logoutButton" onClick={handleLogout}>Logout</button>
            </div>

            {/* Banned Users Modal */}
            {isBannedModalOpen && <Banned onClose={closeBannedModal} />}
        </div>
    );
};

export default PrivateProfilePage;
