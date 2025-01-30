import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    Container,
    Typography,
    Box,
} from "@mui/material";
import "./SettingsPage.less";

const SettingsPage = () => {
    const [userProfile, setUserProfile] = useState<any | null>(null);
    const [newUsername, setNewUsername] = useState<string>("");
    const [newEmail, setNewEmail] = useState<string>("");
    const [oldPassword, setOldPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
    const [isPublic, setIsPublic] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const [usernameError, setUsernameError] = useState<string>("");
    const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);
    const [isChanged, setIsChanged] = useState<boolean>(false);

    useEffect(() => {
        setIsChanged(false); // Ensure button is disabled while fetching
        const fetchUserProfile = async () => {
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

                const data = response.data;
                setUserProfile(data);
                setNewUsername(data.username);
                setNewEmail(data.email);
                setIsPublic(data.public ?? false);
                setIsOpen(data.open ?? false);
                // Here we can set isChanged based on initial state if needed, but since no changes are made yet, it remains false.
            } catch (err) {
                setError("Failed to fetch user profile.");
                console.error(err);
            }
        };

        fetchUserProfile();
    }, [navigate]);

    const checkUsernameAvailability = async (username: string) => {
        setIsCheckingUsername(true);
        setUsernameError("");
        try {
            if (username.length > 2 && username !== userProfile?.username) {
                const response = await axios.get(
                    `https://localhost:44388/api/auth/check-username?username=${username}`
                );
                if (response.data.isTaken) {
                    setUsernameError("Username is already taken.");
                }
            }
        } catch (error) {
            setUsernameError("Error checking username availability.");
        } finally {
            setIsCheckingUsername(false);
        }
    };

    useEffect(() => {
        if (newUsername !== userProfile?.username) {
            const delayDebounce = setTimeout(() => {
                checkUsernameAvailability(newUsername);
            }, 500);
            return () => clearTimeout(delayDebounce);
        }
    }, [newUsername, userProfile?.username]);

    useEffect(() => {
        if (userProfile) {
            const hasChanges =
                newUsername !== userProfile.username ||
                newEmail !== userProfile.email ||
                isPublic !== userProfile.public ||
                isOpen !== userProfile.open ||
                Boolean(newPassword) ||
                Boolean(confirmNewPassword);
            
            setIsChanged(hasChanges);
        } else {
            setIsChanged(false); // No user profile loaded yet, no changes can be detected
        }
    }, [
        newUsername,
        newEmail,
        isPublic,
        isOpen,
        oldPassword,
        newPassword,
        confirmNewPassword,
        userProfile,
    ]);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewUsername(value);

        // Immediately set isCheckingUsername to true to disable the button
        setIsCheckingUsername(true);
        setUsernameError(""); // Clear any previous errors

        // Update isChanged state
        setIsChanged(
            value !== userProfile?.username ||
            newEmail !== userProfile?.email ||
            isPublic !== userProfile?.public ||
            isOpen !== userProfile?.open ||
            Boolean(newPassword) ||
            Boolean(confirmNewPassword)
        );

        // Check username availability only if it's changed
        if (value !== userProfile?.username) {
            const delayDebounce = setTimeout(() => {
                checkUsernameAvailability(value).finally(() => {
                    // Always set to false after check, whether successful or not
                    setIsCheckingUsername(false);
                });
            }, 500);
            return () => clearTimeout(delayDebounce);
        } else {
            // If no change, immediately set back to false if it was true before
            setIsCheckingUsername(false);
        }
    };

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
                open: isOpen,
            };

            await axios.put("https://localhost:44388/api/user/profile", updatedProfile, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (oldPassword && newPassword) {
                await axios.put(
                    "https://localhost:44388/api/user/change-password",
                    { oldPassword, newPassword },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            alert("Profile updated successfully!");
            setOldPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setIsChanged(false);

            const response = await axios.get("https://localhost:44388/api/user/profile", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUserProfile(response.data);
            setIsPublic(response.data.public ?? false);
            setIsOpen(response.data.open ?? false);
        } catch (err) {
            setError("Failed to update profile.");
            console.error(err);
        }
    };

    const isButtonDisabled = !isChanged || !!usernameError || isCheckingUsername || newPassword !== confirmNewPassword;

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
                        <Typography>
                            <strong>Username:</strong> {userProfile.username}
                        </Typography>
                        <Typography>
                            <strong>Email:</strong> {userProfile.email}
                        </Typography>
                        <Typography>
                            <strong>Public Profile:</strong>{" "}
                            {userProfile.public ? "Yes" : "No"}
                        </Typography>
                        <Typography>
                            <strong>Profile Open:</strong> {userProfile.open ? "Yes" : "No"}
                        </Typography>
                    </Box>

                    <form onSubmit={handleProfileUpdate} className="settings-form">
                        <TextField
                            label="New Username"
                            variant="outlined"
                            fullWidth
                            value={newUsername}
                            onChange={handleUsernameChange}
                            error={!!usernameError}
                            helperText={usernameError}
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
                            disabled={isButtonDisabled}
                        >
                            {isCheckingUsername ? "Checking Username..." : "Update Profile"}
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
