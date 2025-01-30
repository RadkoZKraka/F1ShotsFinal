import React, { useState, useEffect, useRef } from 'react';
import { Modal, Box, Typography, Button, CircularProgress, TextField } from '@mui/material';
import './BannedUsersByUserModal.less';
import FriendshipService from "../../Services/FriendshipService";
import UserCard from "../Cards/User/UserCard";

interface BannedUser {
    username: string;
    admin: boolean;
}

interface BannedProps {
    onClose: () => void;
}

const BannedUsersByUserModal: React.FC<BannedProps> = ({ onClose }) => {
    const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [userToBan, setUserToBan] = useState<string>(""); // State for the username to ban
    const [banLoading, setBanLoading] = useState(false); // State to manage the ban button loading
    const [error, setError] = useState<string | null>(null); // Error message for banning a user
    const inputRef = useRef<HTMLInputElement>(null); // Ref for the username input field

    // Fetch banned users on component mount
    const fetchBannedUsers = async () => {
        setLoading(true);
        try {
            const response = await FriendshipService.getBannedUsers();
            setBannedUsers(response);
        } catch (error) {
            console.error('Error fetching banned users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle unbanning a user
    const handleUnban = (username: string) => async () => {
        try {
            await FriendshipService.unbanUser(username);
            setBannedUsers((prev) => prev.filter((user) => user.username !== username));
        } catch (error) {
            console.error('Error unbanning user:', error);
        }
    };

    // Handle banning a user by their username
    const handleBanUser = async () => {
        if (!userToBan.trim()) {
            setError("Username cannot be empty.");
            return;
        }

        setBanLoading(true);
        setError(null);

        try {
            await FriendshipService.banUser(userToBan);
            setBannedUsers((prev) => [...prev, { username: userToBan, admin: false }]); // Add new banned user to the list
            setUserToBan(""); // Clear the textbox after banning
        } catch (error) {
            setError("Failed to ban user. Please try again.");
            console.error(error);
        } finally {
            setBanLoading(false);
        }
    };

    // Focus on the textbox when the modal opens
    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 100); // Delay to ensure modal is rendered

        fetchBannedUsers(); // Fetch the banned users on mount

        return () => clearTimeout(timer); // Clean up the timeout when the component unmounts
    }, []);

    return (
        <Modal open={true} onClose={onClose}>
            <Box className="banned-modal">
                <Typography variant="h5" className="banned-modal-title">
                    Banned Users
                </Typography>

                {loading ? (
                    <div className="loading-spinner">
                        <CircularProgress />
                    </div>
                ) : (
                    <div className="user-list">
                        {bannedUsers.length === 0 ? (
                            <Typography variant="body1" className="no-users-message">
                                No banned users found.
                            </Typography>
                        ) : (
                            bannedUsers.map((user) => (
                                <div key={user.username} className="banned-user-card">
                                    <UserCard username={user.username} admin={user.admin} />
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={handleUnban(user.username)}
                                        className="unban-button"
                                        sx={{ width: 'auto' }}
                                    >
                                        Unban
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                <div className="ban-user-section">
                    <Typography variant="h6">Ban a User</Typography>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Enter username"
                        value={userToBan}
                        onChange={(e) => setUserToBan(e.target.value)}
                        margin="normal"
                        inputRef={inputRef} // Reference to focus the input
                        error={!!error}
                        helperText={error}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleBanUser}
                        disabled={banLoading || !userToBan.trim()}
                        sx={{ marginTop: 2 }}
                    >
                        {banLoading ? <CircularProgress size={24} /> : "Ban User"}
                    </Button>
                </div>

                <div className="modal-actions">
                    <Button variant="outlined" onClick={onClose} className="close-button">
                        Close
                    </Button>
                </div>
            </Box>
        </Modal>
    );
};

export default BannedUsersByUserModal;
