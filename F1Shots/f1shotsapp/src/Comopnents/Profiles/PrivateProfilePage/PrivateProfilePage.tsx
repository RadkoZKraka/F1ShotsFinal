import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileService from "../../../Services/ProfileService";
import { User } from "../../../Models/User";
import "./PrivateProfilePage.less";
import { useAuth } from "../../../Contexts/AuthContext";
import BannedGroupsModal from "../../Modals/BannedGroupsModal";
import BannedUsersByUserModal from "../../Modals/BannedUsersByUserModal"; // Import the Banned component
import axios from "axios";
import { Button, Modal, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Backdrop, Fade } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RequestsSentModal from "../../Modals/RequestsSentModal";

const PrivateProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<User | null>(null);
    const [isBannedModalOpen, setBannedModalOpen] = useState(false);
    const [isBannedGroupsModalOpen, setBannedGroupsModalOpen] = useState(false);
    const [requests, setRequests] = useState<any[]>([]); // Holds friend and group join requests
    const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false); // Modal state for requests
    const { setToken } = useAuth();
    const navigate = useNavigate();

    // Fetch the profile data when the component mounts
    useEffect(() => {
        const fetchProfile = async () => {
            const profileData = await ProfileService.getUserProfile();
            setProfile(profileData);
        };

        fetchProfile();
    }, []);

    // Fetch friend and group join requests
    const fetchRequests = async () => {
        try {
            const response = await  ProfileService.getRequests();
            console.log(response)
            setRequests(response);
        } catch (error) {
            console.error("Error fetching requests", error);
        }
    };
    

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

    const openBannedGroupsModal = () => {
        setBannedGroupsModalOpen(true);
    };

    const closeBannedGroupsModal = () => {
        setBannedGroupsModalOpen(false);
    };

    const openRequestsModal = () => {
        setIsRequestsModalOpen(true);
        fetchRequests();
    };

    const closeRequestsModal = () => {
        setIsRequestsModalOpen(false);
    };

    const cancelRequest = async (requestId: string) => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                navigate("/login");
                return;
            }

            await axios.delete(`https://localhost:44388/api/user/requests/${requestId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Re-fetch the requests after cancellation
            fetchRequests();
        } catch (error) {
            console.error("Error cancelling request", error);
        }
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
                <button className="navbarButton" onClick={() => navigate("/settings")}>Settings</button>
                <button className="navbarButton bannedUsersButton" onClick={openBannedModal}>Banned Users</button>
                <button className="navbarButton bannedGroupsButton" onClick={openBannedGroupsModal}>Banned Groups</button>
                <button className="navbarButton checkRequestsButton" onClick={openRequestsModal}>Check Requests</button> {/* New Button */}
                <button className="navbarButton logoutButton" onClick={handleLogout}>Logout</button>
            </div>

            {/* Banned Users Modal */}
            {isBannedModalOpen && <BannedUsersByUserModal onClose={closeBannedModal} />}

            {/* Banned Groups Modal */}
            {isBannedGroupsModalOpen && <BannedGroupsModal onClose={closeBannedGroupsModal} />}

            {/* Requests Modal */}
            <RequestsSentModal
                isRequestsModalOpen={isRequestsModalOpen}
                closeRequestsModal={closeRequestsModal}
                requests={requests}
            />


        </div>
    );
};

export default PrivateProfilePage;
