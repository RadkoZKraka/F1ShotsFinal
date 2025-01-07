import React, {useState, useEffect} from 'react';
import {Modal, Box, Typography, Button, CircularProgress} from '@mui/material';
import './Banned.less';
import axios from 'axios';
import UserCard from "../Cards/User/UserCard";
import FriendshipService from "../../Services/FriendshipService";

interface BannedUser {
    username: string;
    admin: boolean;
}

interface BannedProps {
    onClose: () => void;
}

const Banned: React.FC<BannedProps> = ({onClose}) => {
    const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
    const [loading, setLoading] = useState(false);

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

    const handleUnban = (username: string) => async () => {
        try {
            await FriendshipService.unbanUser(username);
            setBannedUsers((prev) => prev.filter((user) => user.username !== username));
        } catch (error) {
            console.error('Error unbanning user:', error);
        }
    };

    useEffect(() => {
        fetchBannedUsers();
    }, []);

    return (
        <Modal open={true} onClose={onClose}>
            <Box className="banned-modal">
                <Typography variant="h5" className="banned-modal-title">
                    Banned Users
                </Typography>

                {loading ? (
                    <div className="loading-spinner">
                        <CircularProgress/>
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
                                    <UserCard username={user.username} admin={user.admin}/>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={handleUnban(user.username)}
                                        className="unban-button"
                                        sx={{width: 'auto'}}
                                    >
                                        Unban
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                <div className="modal-actions">
                    <Button variant="outlined" onClick={onClose} className="close-button">
                        Close
                    </Button>
                </div>
            </Box>
        </Modal>
    );
};

export default Banned;