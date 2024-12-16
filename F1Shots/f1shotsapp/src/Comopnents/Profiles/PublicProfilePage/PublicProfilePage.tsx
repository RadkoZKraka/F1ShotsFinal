import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Button, Typography, Container, Paper, CircularProgress } from "@mui/material";
import GroupList from "../../Groups/GroupList/GroupList";
import FriendshipService from "../../../Services/FriendshipService"; // Import FriendshipService

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
    const [profile, setProfile] = useState<any>(null);
    const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus | null>(null);
    const [publicGroups, setPublicGroups] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

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
                    const status = await FriendshipService.getFriendshipStatus(username);
                    setFriendshipStatus(status);
                }
            } catch (err) {
                setError("Failed to fetch friendship status.");
            }
        };

        const fetchPublicGroups = async () => {
            try {
                const groupsResponse = await axios.get(`https://localhost:44388/api/group/public-group/${username}`);
                setPublicGroups(groupsResponse.data);
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
                await FriendshipService.confirmFriendRequest(username);
                setFriendshipStatus(FriendshipStatus.Friends);
            }
        } catch (err) {
            setError("Failed to confirm friend request.");
        }
    };

    const handleRejectFriendRequest = async () => {
        try {
            if (username) {
                await FriendshipService.rejectFriendRequest(username);
                setFriendshipStatus(FriendshipStatus.None);
            }
        } catch (err) {
            setError("Failed to reject friend request.");
        }
    };

    const handleUnbanUser = async () => {
        try {
            if (username) {
                // Uncomment if the unban API is implemented
                // await FriendshipService.unbanUser(username);
                setFriendshipStatus(FriendshipStatus.None);
            }
        } catch (err) {
            setError("Failed to unban user.");
        }
    };

    const handleBanUser = async () => {
        try {
            if (username) {
                // Implement the ban logic in your backend
                await FriendshipService.banUser(username);
                setFriendshipStatus(FriendshipStatus.UserBanned); // Update status after banning
            }
        } catch (err) {
            setError("Failed to ban user.");
        }
    };

    return (
        <Container maxWidth="lg" className="public-profile-container">
            <Paper className="profile-paper">
                <Typography variant="h4" gutterBottom>
                    Public Profile: {username}
                </Typography>
                {error && (
                    <Typography variant="body1" color="error" className="error-message">
                        {error}
                    </Typography>
                )}
                <Typography variant="h6" gutterBottom>
                    Public Groups
                </Typography>
                {publicGroups.length > 0 ? (
                    <GroupList groups={publicGroups} />
                ) : (
                    <Typography variant="body1">No public groups found for this user.</Typography>
                )}

                <div className="friend-action-container">
                    {friendshipStatus === null ? (
                        <CircularProgress color="primary" />
                    ) : friendshipStatus === FriendshipStatus.Sent ? (
                        <Typography variant="body1">Friend request sent!</Typography>
                    ) : friendshipStatus === FriendshipStatus.Received ? (
                        <div className="friend-request-actions">
                            <Typography variant="body1" paragraph>
                                Friend request received! You can confirm or reject it below:
                            </Typography>
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
                    ) : friendshipStatus === FriendshipStatus.ThatsYou ? (
                        <Typography variant="body1">You are already friends!</Typography>
                    ) : friendshipStatus === FriendshipStatus.Friends ? (
                        <Typography variant="body1">You are friends!</Typography>
                    ) : friendshipStatus === FriendshipStatus.Banned ? (
                        <div className="banned-actions">
                            <Typography variant="body1" paragraph>
                                You have been banned from interacting with this user. You can unban them below:
                            </Typography>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleUnbanUser}
                                className="unban-button"
                            >
                                Unban
                            </Button>
                        </div>
                    ) : friendshipStatus === FriendshipStatus.UserBanned ? (
                        <Typography variant="body1">User is banned. You cannot interact with them.</Typography>
                    ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddFriend}
                            className="add-friend-button"
                        >
                            Add Friend
                        </Button>
                    )}

                    {/* Ban user button */}
                    {friendshipStatus !== FriendshipStatus.UserBanned && friendshipStatus !== FriendshipStatus.Banned && (
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleBanUser}
                            className="ban-button"
                        >
                            Ban User
                        </Button>
                    )}
                </div>
            </Paper>
        </Container>
    );
};

export default PublicProfilePage;
