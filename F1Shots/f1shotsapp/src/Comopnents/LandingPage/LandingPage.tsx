import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const LandingPage = () => {
    const [user, setUser] = useState<User | null>(null);
    const [userGroups, setUserGroups] = useState<Group[] | null>(null);
    const [friends, setFriends] = useState<Friend[] | null>(null);
    const [publicProfiles, setPublicProfiles] = useState<Friend[] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userData, friends, publicProfiles, myGroups] = await Promise.all([
                    ProfileService.getUserProfile(),
                    FriendshipService.getAllFriends(),
                    ProfileService.getPublicProfiles(),
                    GroupService.getMyGroups(),
                ]);
                setUser(userData);
                setFriends(friends);
                setPublicProfiles(publicProfiles);
                setUserGroups(myGroups);
            } catch (err) {
                console.error("Failed to fetch data:", err);
                navigate("/login");
            }
        };

        fetchData();
    }, [navigate]);

    const handleFriendAdded = () => {
        // Only spread if friends is not null
        if (friends) {
            setFriends([...friends]); // Example, adapt as needed
        } else {
            // If friends is null, initialize it with the new friend
            setFriends(null);
        }
    };


    return (
        <Container className="landing-page">
            {user ? (
                <>
                    <Typography variant="h4" className="welcome-text">
                        Welcome, {user.username}!
                    </Typography>

                    <Paper className="card">
                        <Typography variant="h5" className="section-title">
                            My Groups
                        </Typography>
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
                        <Typography variant="h5" className="section-title">
                            My Friends
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            className="action-button"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Search for Friends
                        </Button>
                        {friends ? (
                            <FriendsList friends={friends} />
                        ) : (
                            <CircularProgress className="loader" />
                        )}
                    </Paper>

                    <Paper className="card">
                        <Typography variant="h5" className="section-title">
                            Public Profiles
                        </Typography>
                        {publicProfiles ? (
                            <PublicProfilesList publicProfiles={publicProfiles} />
                        ) : (
                            <CircularProgress className="loader" />
                        )}
                    </Paper>

                    {/* Use the AddFriendModal component */}
                    <AddFriendModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onFriendAdded={handleFriendAdded}
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
