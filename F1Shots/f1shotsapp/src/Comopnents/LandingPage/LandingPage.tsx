import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    Button,
    CircularProgress,
    Box,
    Paper,
} from "@mui/material";

import GroupList from "../Groups/GroupList/GroupList";
import FriendsList from "../Friends/FriendsList/FriendsList";
import PublicProfilesList from "../Profiles/PublicProfilesList/PublicProfilesList";
import { User } from "../../Models/User";
import { Group } from "../../Models/Group";
import { Friend } from "../../Models/Friend";

import "./LandingPage.less";
import ProfileService from "../../Services/ProfileService";
import FriendshipService from "../../Services/FriendshipService";
import GroupService from "../../Services/GroupService";
import AddFriendModal from "../Modals/AddFriendModal";
import RequestJoinModal from "../Modals/RequestJoinModal"; // Import the new modal
import { RefreshContext } from "../Layout/Layout";
import PublicGroupsList from "../Groups/PublicGroupsList/PublicGroupsList"; // Import the context

const LandingPage = () => {
    const [user, setUser] = useState<User | null>(null);
    const [userGroups, setUserGroups] = useState<Group[] | null>(null);
    const [friends, setFriends] = useState<Friend[] | null>(null);
    const [publicProfiles, setPublicProfiles] = useState<Friend[] | null>(null);
    const [publicGroups, setPublicGroups] = useState<Group[] | null>(null);
    const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
    const [isRequestJoinModalOpen, setIsRequestJoinModalOpen] = useState(false); // State for the new modal
    const [addError, setAddError] = useState<string | null>(null); // Error state for the join request modal
    const navigate = useNavigate();

    // Consume RefreshContext
    const { refreshCounter } = useContext(RefreshContext);

    const fetchData = async () => {
        try {
            const [userData, friends, publicProfiles, publicGroups, myGroups] = await Promise.all([
                ProfileService.getUserProfile(),
                FriendshipService.getAllFriends(),
                ProfileService.getPublicProfiles(),
                GroupService.getPublicGroups(),
                GroupService.getMyGroups(),
            ]);
            setUser(userData);
            setFriends(friends);
            setPublicProfiles(publicProfiles);
            setPublicGroups(publicGroups)
            setUserGroups(myGroups);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            navigate("/login");
        }
    };

    // Refetch data on initial load and whenever refreshCounter changes
    useEffect(() => {
        fetchData();
    }, [navigate, refreshCounter]);

    const handleFriendAdded = () => {
        if (friends) {
            setFriends([...friends]);
        } else {
            setFriends(null);
        }
    };

    const handleJoinRequested = () => {
        fetchData(); // Refetch groups after the request
    };

    return (
        <Container className="landing-page">
            {user ? (
                <>
                    <Typography variant="h4" className="welcome-text">
                        Welcome, {user.username}!
                    </Typography>

                    <Paper className="card">
                        <Box className="section-header">
                            <Typography variant="h5" className="section-title">
                                <Link to="/groups" style={{ textDecoration: "none", color: "inherit" }}>
                                    My Groups
                                </Link>
                            </Typography>
                            <Box className="action-buttons">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    className="action-button"
                                    onClick={() => setIsRequestJoinModalOpen(true)} // Open the modal
                                >
                                    Request to Join a Group
                                </Button>
                            </Box>
                        </Box>
                        {userGroups ? (
                            userGroups.length > 0 ? (
                                <GroupList groups={userGroups} />
                            ) : (
                                <Box className="empty-state">
                                    <Typography>You don't have any groups yet.</Typography>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => navigate("/create-group")}
                                    >
                                        Add Your First Group
                                    </Button>
                                </Box>
                            )
                        ) : (
                            <CircularProgress className="loader" />
                        )}
                    </Paper>

                    <Paper className="card">
                        <Box className="section-header">
                            <Typography variant="h5" className="section-title">
                                <Link to="/friends" style={{ textDecoration: "none", color: "inherit" }}>
                                    My Friends
                                </Link>
                            </Typography>
                            <Box className="action-buttons">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    className="action-button"
                                    onClick={() => setIsAddFriendModalOpen(true)}
                                >
                                    Search for Friends
                                </Button>
                            </Box>
                        </Box>
                        {friends ? (
                            <FriendsList friends={friends} />
                        ) : (
                            <CircularProgress className="loader" />
                        )}
                    </Paper>

                    <Paper className="card">
                        <Typography variant="h5" className="section-title">
                            <Link to="/public-profiles" style={{ textDecoration: "none", color: "inherit" }}>
                                Public Profiles
                            </Link>
                        </Typography>
                        {publicProfiles ? (
                            <PublicProfilesList publicProfiles={publicProfiles} />
                        ) : (
                            <CircularProgress className="loader" />
                        )}
                    </Paper>

                    <Paper className="card">
                        <Typography variant="h5" className="section-title">
                            <Link to="/public-groups" style={{ textDecoration: "none", color: "inherit" }}>
                                Public Groups
                            </Link>
                        </Typography>
                        {publicGroups ? (
                            <PublicGroupsList publicGroups={publicGroups} />
                        ) : (
                            <CircularProgress className="loader" />
                        )}
                    </Paper>


                    {/* AddFriendModal */}
                    <AddFriendModal
                        isOpen={isAddFriendModalOpen}
                        onClose={() => {
                            setIsAddFriendModalOpen(false);
                            fetchData();
                        }}
                        onFriendAdded={handleFriendAdded}
                        username={user.username}
                    />

                    {/* RequestJoinModal */}
                    <RequestJoinModal
                        isOpen={isRequestJoinModalOpen}
                        onClose={() => setIsRequestJoinModalOpen(false)} // Close modal
                        onJoinRequested={handleJoinRequested} // Handle after a successful join
                        addError={addError} // Handle error
                        setAddError={setAddError} // Manage error state
                    />
                </>
            ) : (
                <Box className="loading-state">
                    <CircularProgress />
                </Box>
            )}
        </Container>
    );
};

export default LandingPage;
