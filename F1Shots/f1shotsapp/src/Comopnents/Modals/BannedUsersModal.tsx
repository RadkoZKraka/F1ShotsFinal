import React, { useEffect, useState, useRef } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Grid,
    Modal,
    TextField,
    Typography,
} from "@mui/material";
import UserCard from "../Cards/User/UserCard";
import GroupService from "../../Services/GroupService";

interface User {
    id: string;
    username: string;
}

interface BannedUsersModalProps {
    open: boolean;
    onClose: () => void;
    groupId: string;
    usersBanned: { id: string, username: string }[];
    alreadyAddedUsers: { username: string; id: string }[];
    setBannedUsers: React.Dispatch<React.SetStateAction<User[]>>;
    currentUsername: string; // Current username of the logged-in user
}

const BannedUsersModal: React.FC<BannedUsersModalProps> = ({
                                                               open,
                                                               onClose,
                                                               groupId,
                                                               usersBanned,
                                                               alreadyAddedUsers,
                                                               setBannedUsers,
                                                               currentUsername, // Accepting currentUsername as a prop
                                                           }) => {
    const [username, setUsername] = useState("");
    const [banningUser, setBanningUser] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUsers, setCurrentUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);

            setCurrentUsers(alreadyAddedUsers);
        }
    }, [open, alreadyAddedUsers]);

    const handleBanUser = async () => {
        if (!username.trim()) {
            setError("Username cannot be empty.");
            return;
        }

        if (username === currentUsername) {
            setError("Cannot ban yourself.");
            return;
        }

        setBanningUser(true);
        setError(null);

        try {
            await GroupService.banUserFromGroup(groupId, username);

            const bannedUser = { id: username, username: username };

            if (!usersBanned.some((user) => user.id === bannedUser.id)) {
                setBannedUsers((prev) => [...prev, bannedUser]);
                setCurrentUsers((prev) =>
                    prev.filter((user) => user.id !== bannedUser.id)
                );
            }

            setUsername("");
        } catch (err) {
            setError("Failed to ban user. Please try again.");
            console.error(err);
        } finally {
            setBanningUser(false);
        }
    };

    const handleBanCurrentUser = async (userId: string, username: string) => {
        if (username === currentUsername) {
            setError("Cannot ban yourself.");
            return;
        }

        setBanningUser(true);
        try {
            await GroupService.banUserFromGroup(groupId, username);

            const bannedUser = { id: userId, username: username };

            if (!usersBanned.some((user) => user.id === bannedUser.id)) {
                setBannedUsers((prev) => [...prev, bannedUser]);
                setCurrentUsers((prev) =>
                    prev.filter((user) => user.id !== bannedUser.id)
                );
            }
        } catch (err) {
            console.error("Failed to ban user:", err);
        } finally {
            setBanningUser(false);
        }
    };

    const handleUnbanUser = async (username: string) => {
        try {
            await GroupService.unbanUserFromGroup(groupId, username);
            setBannedUsers((prev) => prev.filter((user) => user.username !== username));
        } catch (err) {
            console.error("Failed to unban user:", err);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter") {
            handleBanUser();
        } else if (event.key === "Escape") {
            onClose();
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    padding: 4,
                    backgroundColor: "white",
                    borderRadius: 3,
                    width: "90%",
                    maxWidth: "600px",
                    margin: "auto",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    boxShadow: 24,
                }}
                onKeyDown={handleKeyDown}
            >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", textAlign: "center", marginBottom: 3 }}>
                    Manage Banned Users
                </Typography>

                <Box sx={{ marginBottom: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Current Users
                    </Typography>
                    <Grid container spacing={2}>
                        {loadingUsers ? (
                            <CircularProgress />
                        ) : currentUsers.length > 0 ? (
                            currentUsers.map((user) => (
                                <Grid item xs={12} sm={6} md={4} key={user.id}>
                                    <UserCard username={user.username} />
                                    <Button
                                        variant="contained"
                                        color="error"
                                        fullWidth
                                        onClick={() => handleBanCurrentUser(user.id, user.username)}
                                        sx={{ marginTop: 1 }}
                                        disabled={user.username === currentUsername} // Disable the button if it's the current user
                                    >
                                        {user.username === currentUsername
                                            ? "Can't ban yourself"
                                            : "Ban User"}
                                    </Button>
                                </Grid>
                            ))
                        ) : (
                            <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center", width: "100%" }}>
                                No users available to ban.
                            </Typography>
                        )}
                    </Grid>
                </Box>

                <Box sx={{ marginBottom: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Banned Users List
                    </Typography>
                    <Grid container spacing={2}>
                        {usersBanned.length > 0 ? (
                            usersBanned.map((user) => (
                                <Grid item xs={12} sm={6} md={4} key={user.id}>
                                    <UserCard username={user.username} />
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        onClick={() => handleUnbanUser(user.username)}
                                        sx={{ marginTop: 1 }}
                                    >
                                        Unban User
                                    </Button>
                                </Grid>
                            ))
                        ) : (
                            <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center", width: "100%" }}>
                                No users have been banned from this group yet.
                            </Typography>
                        )}
                    </Grid>
                </Box>

                <Box>
                    <Typography variant="subtitle1" gutterBottom>
                        Ban a User by Username
                    </Typography>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        margin="normal"
                        inputRef={inputRef}
                    />
                    {error && (
                        <Typography variant="body2" color="error" sx={{ marginTop: 1, textAlign: "center" }}>
                            {error}
                        </Typography>
                    )}
                </Box>

                <Box sx={{ display: "flex", gap: 2, flexDirection: "column" }}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleBanUser}
                        disabled={banningUser || !username.trim() || username === currentUsername} // Disable if it's the current user
                        sx={{
                            padding: "10px 20px",
                            fontSize: "16px",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                        }}
                    >
                        {banningUser ? <CircularProgress size={24} /> : "Ban User"}
                    </Button>

                    <Button
                        onClick={onClose}
                        color="secondary"
                        sx={{
                            fontSize: "16px",
                            padding: "10px 20px",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                        }}
                        disabled={banningUser}
                    >
                        Close
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default BannedUsersModal;
