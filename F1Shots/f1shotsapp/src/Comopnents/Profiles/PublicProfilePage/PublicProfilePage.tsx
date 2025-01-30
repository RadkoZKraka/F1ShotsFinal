import React, { useEffect, useState } from "react";
import {useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import {Button, Typography, Container, Paper, Menu, MenuItem, IconButton, Box} from "@mui/material";
import GroupList from "../../Groups/GroupList/GroupList";
import FriendshipService from "../../../Services/FriendshipService";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GroupService from "../../../Services/GroupService";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export enum FriendshipStatus {
    None = 0,
    Received = 1,
    Sent = 2,
    ThatsYou = 3,
    Friends = 4,
    Banned = 5,
    UserBanned = 6, // New status for when the user is banned
}

const PublicProfilePage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [notificationId, setNotificationId] = useState<any>(null);
    const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus | null>(null);
    const [publicGroups, setPublicGroups] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileResponse = await axios.get(`https://localhost:44388/api/user/profile/${username}`);
                setProfile(profileResponse.data);
            } catch (err) {
                setError("Failed to fetch profile.");
                console.error(err);
            }
        };

        const fetchFriendshipStatus = async () => {
            try {
                if (username) {
                    const data = await FriendshipService.getFriendshipStatus(username);
                    setNotificationId(data.notificationId);
                    setFriendshipStatus(data.status);
                }
            } catch (err) {
                setError("Failed to fetch friendship status.");
            }
        };

        const fetchPublicGroups = async () => {
            try {
                // const groupsResponse = await axios.get(`https://localhost:44388/api/group/public-group/${username}`);
                const groupsResponse = await GroupService.getPublicGroupsByUsername(username);
                setPublicGroups(groupsResponse);
            } catch (err) {
                setError("Failed to fetch public groups.");
                console.error(err);
            }
        };

        if (username) {
            fetchProfile();
            fetchFriendshipStatus();
            fetchPublicGroups();
        }
    }, [username]);

    const handleAddFriend = async () => {
        try {
            if (username) {
                await FriendshipService.addFriend(username);
                setFriendshipStatus(FriendshipStatus.Sent);
            }
        } catch (err) {
            setError("Failed to send friend request.");
        }
    };

    const handleConfirmFriendRequest = async () => {
        try {
            if (username) {
                await FriendshipService.confirmFriendRequest(username, notificationId);
                setFriendshipStatus(FriendshipStatus.Friends);
            }
        } catch (err) {
            setError("Failed to confirm friend request.");
        }
    };

    const handleRejectFriendRequest = async () => {
        try {
            if (username) {
                await FriendshipService.rejectFriendRequest(username, notificationId);
                setFriendshipStatus(FriendshipStatus.None);
            }
        } catch (err) {
            setError("Failed to reject friend request.");
        }
    };

    const handleUnbanUser = async () => {
        try {
            if (username) {
                await FriendshipService.unbanUser(username);
                setFriendshipStatus(FriendshipStatus.None);
            }
        } catch (err) {
            setError("Failed to unban user.");
        }
    };

    const handleBanUser = async () => {
        try {
            if (username) {
                await FriendshipService.banUser(username);
                setFriendshipStatus(FriendshipStatus.UserBanned); // Update status after banning
            }
        } catch (err) {
            setError("Failed to ban user.");
        }
    };

    const handleDeleteFriend = async () => {
        try {
            if (username) {
                await FriendshipService.deleteFriend(username);
                setFriendshipStatus(FriendshipStatus.None); // Update status after deleting friend
            }
        } catch (err) {
            setError("Failed to delete friend.");
        }
    };

    const handleCancelFriendRequest = async () => {
        try {
            if (username) {
                await FriendshipService.cancelFriendRequestByUsername(username);
                setFriendshipStatus(FriendshipStatus.None); // Reset status to None after canceling
            }
        } catch (err) {
            setError("Failed to cancel friend request.");
        }
    };

    const handleBack = () => {
        navigate(-1); // Navigate to the previously visited page
    };

    const getFriendshipStatusText = () => {
        switch (friendshipStatus) {
            case FriendshipStatus.Friends:
                return "You are friends!";
            case FriendshipStatus.None:
                return "Not friends yet.";
            case FriendshipStatus.ThatsYou:
                return "That's your public profile!";
            case FriendshipStatus.Sent:
                return "Friend request sent!";
            case FriendshipStatus.Received:
                return "Friend request received!";
            case FriendshipStatus.Banned:
                return "You are banned from interacting with this user.";
            case FriendshipStatus.UserBanned:
                return "You banned this user. You cannot interact with them.";
            default:
                return "Error loading friendship status.";
        }
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Container maxWidth="lg" className="public-profile-container">
            <Paper className="profile-paper">

                <Box sx={{marginBottom: 1}}>
                    <IconButton
                        onClick={handleBack}
                        edge="start"
                        sx={{
                            marginBottom: "1rem",
                            display: "inline-flex",
                            alignItems: "center",
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                </Box>
                <div className="profile-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <Typography variant="h4" gutterBottom>
                            {username}
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: "1rem", color: "gray" }}>
                            Public Profile
                        </Typography>
                    </div>

                    {friendshipStatus !== FriendshipStatus.Banned && (
                        <IconButton
                            edge="end"
                            aria-label="options"
                            onClick={handleMenuClick}
                            aria-controls={openMenu ? 'profile-menu' : undefined}
                            aria-haspopup="true"
                            size="small"
                            sx={{
                                padding: 0,
                                minWidth: 'auto',
                                borderRadius: '50%',
                                width: 32,
                            }}
                        >
                            <MoreVertIcon />
                        </IconButton>
                    )}
                    <Menu
                        id="profile-menu"
                        anchorEl={anchorEl}
                        open={openMenu}
                        onClose={handleMenuClose}
                        
                    >
                        {friendshipStatus !== FriendshipStatus.UserBanned ? (
                            <MenuItem onClick={handleBanUser} disabled={friendshipStatus === FriendshipStatus.ThatsYou}>Ban User</MenuItem>
                        ) : (
                            <MenuItem onClick={handleUnbanUser}>Unban User</MenuItem>
                        )}
                        {friendshipStatus === FriendshipStatus.Friends && (
                            <MenuItem onClick={handleDeleteFriend}>
                                Remove from Friends
                            </MenuItem>
                        )}
                    </Menu>
                </div>

                {friendshipStatus !== null && (
                    <Typography variant="body1" sx={{ fontSize: "1rem", color: "gray" }}>
                        {getFriendshipStatusText()}
                    </Typography>
                )}

                {error && (
                    <Typography variant="body1" color="error" className="error-message">
                        {error}
                    </Typography>
                )}

                {friendshipStatus !== FriendshipStatus.Banned && (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Public Groups
                        </Typography>
                        {publicGroups.length > 0 ? (
                            <GroupList groups={publicGroups} />
                        ) : (
                            <Typography variant="body1">No public groups found for this user.</Typography>
                        )}
                    </>
                )}

                <div className="friend-action-container">
                    {friendshipStatus === FriendshipStatus.None && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddFriend}
                            className="add-friend-button"
                        >
                            Add Friend
                        </Button>
                    )}

                    {friendshipStatus === FriendshipStatus.Sent && (
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleCancelFriendRequest}
                            className="cancel-request-button"
                        >
                            Cancel Friend Request
                        </Button>
                    )}

                    {friendshipStatus === FriendshipStatus.Received && (
                        <div className="friend-request-actions">
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleConfirmFriendRequest}
                                className="confirm-button"
                            >
                                Confirm
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleRejectFriendRequest}
                                className="reject-button"
                            >
                                Reject
                            </Button>
                        </div>
                    )}
                </div>
            </Paper>
        </Container>
    );
};

export default PublicProfilePage;
