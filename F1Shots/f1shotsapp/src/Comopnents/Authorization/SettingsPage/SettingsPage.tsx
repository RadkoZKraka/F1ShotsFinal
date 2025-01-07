import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Checkbox, FormControlLabel, Container, Typography, Box } from "@mui/material";
import './SettingsPage.less';

const SettingsPage = () => {
    const [userProfile, setUserProfile] = useState<any | null>(null);
    const [newUsername, setNewUsername] = useState<string>("");
    const [newEmail, setNewEmail] = useState<string>("");
    const [oldPassword, setOldPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
    const [isPublic, setIsPublic] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);  // New state for isOpen
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem("authToken");
                if (!token) {
                    navigate("/login");
                    return;
                }

                // Fetch user profile
                const response = await axios.get("https://localhost:44388/api/user/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = response.data;
                setUserProfile(data);
                setNewUsername(data.username);
                setNewEmail(data.email);
                setIsPublic(data.public ?? false); // Set isPublic state
                setIsOpen(data.open ?? false); // Set isOpen state
            } catch (err) {
                setError("Failed to fetch user profile.");
                console.error(err);
            }
        };

        fetchUserProfile();
    }, [navigate]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmNewPassword) {
            setError("New passwords do not match.");
            return;
        }

        setError(null);

        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                navigate("/login");
                return;
            }

            const updatedProfile = {
                username: newUsername,
                email: newEmail,
                public: isPublic,
                open: isOpen,  // Include isOpen in the update
            };

            // Update user profile
            await axios.put("https://localhost:44388/api/user/profile", updatedProfile, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Update password only if both old and new passwords are provided
            if (oldPassword && newPassword) {
                await axios.put(
                    "https://localhost:44388/api/user/change-password",
                    { oldPassword, newPassword },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            alert("Profile updated successfully!");

            // Clear password fields
            setOldPassword("");
            setNewPassword("");
            setConfirmNewPassword("");

            // Re-fetch the updated profile to update the UI
            const response = await axios.get("https://localhost:44388/api/user/profile", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUserProfile(response.data);
            setIsPublic(response.data.public ?? false);
            setIsOpen(response.data.open ?? false);  // Update isOpen value
        } catch (err) {
            setError("Failed to update profile.");
            console.error(err);
        }
    };

    return (
        <Container className="settings-page-container">
            <Typography variant="h4" gutterBottom>
                Settings
            </Typography>
            {error && <Typography className="error-text">{error}</Typography>}

            {userProfile ? (
                <>
                    <Box className="profile-info">
                        <Typography variant="h6">Current Profile</Typography>
                        <Typography><strong>Username:</strong> {userProfile.username}</Typography>
                        <Typography><strong>Email:</strong> {userProfile.email}</Typography>
                        <Typography><strong>Public Profile:</strong> {userProfile.public ? "Yes" : "No"}</Typography>
                        <Typography><strong>Profile Open:</strong> {userProfile.open ? "Yes" : "No"}</Typography> {/* Display isOpen */}
                    </Box>

                    <form onSubmit={handleProfileUpdate} className="settings-form">
                        <TextField
                            label="New Username"
                            variant="outlined"
                            fullWidth
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className="form-field"
                        />
                        <TextField
                            label="New Email"
                            variant="outlined"
                            fullWidth
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="form-field"
                        />
                        <TextField
                            label="Old Password"
                            type="password"
                            variant="outlined"
                            fullWidth
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="form-field"
                        />
                        <TextField
                            label="New Password"
                            type="password"
                            variant="outlined"
                            fullWidth
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="form-field"
                        />
                        <TextField
                            label="Confirm New Password"
                            type="password"
                            variant="outlined"
                            fullWidth
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="form-field"
                        />
                        {newPassword && confirmNewPassword && newPassword !== confirmNewPassword && (
                            <Typography className="error-text">Passwords do not match.</Typography>
                        )}

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                    name="public-profile"
                                    color="primary"
                                />
                            }
                            label="Public Profile"
                            className="form-field"
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isOpen}
                                    onChange={(e) => setIsOpen(e.target.checked)}
                                    name="open-profile"
                                    color="primary"
                                />
                            }
                            label="Open Profile"
                            className="form-field"
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            className="submit-button"
                            disabled={newPassword !== confirmNewPassword}
                        >
                            Update Profile
                        </Button>
                    </form>
                </>
            ) : (
                <Typography>Loading...</Typography>
            )}
        </Container>
    );
};

export default SettingsPage;
