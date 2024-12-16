import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // To extract the groupId and navigate back
import { Group } from "../../../Models/Group";
import GroupService from "../../../Services/GroupService"; // Import Group service
import {
    Container,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Button,
    Modal,
    Box,
    DialogActions,
    Grid,
    Alert,
} from "@mui/material";
import GroupMembers from "../GroupMembers/GroupMembers";
import UserCard from "../../Cards/User/UserCard"; // Import the UserCard component
import './GroupPage.less';
import FriendshipService from "../../../Services/FriendshipService";
import ProfileService from "../../../Services/ProfileService";

const GroupPage: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>(); // Get groupId from the URL
    const navigate = useNavigate(); // To navigate back
    const [group, setGroup] = useState<Group | null>(null); // State to store the group data
    const [loading, setLoading] = useState(true); // State to handle loading state
    const [error, setError] = useState<string | null>(null); // State to handle errors
    const [openModal, setOpenModal] = useState<boolean>(false); // Modal state
    const [friends, setFriends] = useState<any[]>([]); // List of friends to add
    const [usernameToAdd, setUsernameToAdd] = useState<string>(""); // Input for username
    const [addingUser, setAddingUser] = useState<boolean>(false); // Adding user loading state
    const [addError, setAddError] = useState<string | null>(null); // Error when adding user
    const [currentUser, setCurrentUser] = useState<any | null>(null); // State for current user

    // Fetch group details and friends list when the component mounts
    useEffect(() => {
        const fetchGroupDetails = async () => {
            if (!groupId) {
                setError("Group ID is missing.");
                setLoading(false);
                return;
            }

            try {
                const groupData = await GroupService.getGroupByIdAsync(groupId); // Fetch group by ID
                setGroup(groupData);

                // Fetch friends to add to the group (this could be from a user service)
                const friendsData = await FriendshipService.getAllFriends(); // Add method to get friends
                setFriends(friendsData);

                // Get the current logged-in user to check admin status (example of fetching current user)
                const currentUserData = await ProfileService.getUserProfile();
                setCurrentUser(currentUserData);
            } catch (err) {
                setError("Failed to fetch group details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchGroupDetails();
    }, [groupId]); // Re-fetch if the groupId changes

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => {
        setOpenModal(false);
        setUsernameToAdd("");
        setAddError(null);
    };

    const handleAddUser = async (friendId: string) => {
        if (!friendId || !groupId) return;

        setAddingUser(true);
        setAddError(null);

        try {
            await GroupService.addUserToGroup(groupId, friendId);
            handleCloseModal();
        } catch (err) {
            setAddError("Failed to add user to the group.");
            console.error(err);
        } finally {
            setAddingUser(false);
        }
    };

    // Check if the current user is an admin of the group
    const isAdmin = currentUser && group && group.adminUserIds.includes(currentUser.id);

    if (loading) {
        return (
            <Container maxWidth="sm">
                <CircularProgress color="primary" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm">
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!group) {
        return <p>Group not found.</p>;
    }

    // Map admin and player data correctly
    const admins = group.adminUserIds.map((id, index) => ({
        id,
        username: group.adminUserIds[index], // Use admin usernames
    }));

    const players = group.playersIds.map((id, index) => ({
        id,
        username: group.playersUserNames[index], // Use player usernames
    }));

    // Combine admins and players, ensuring no duplicates based on id
    const alreadyAddedUsers = [
        ...admins,
        ...players,
    ].filter((value, index, self) =>
        index === self.findIndex((t) => t.id === value.id) // Ensure no duplicates based on id
    ).map(user => {
        const player = players.find((player) => player.id === user.id);
        return {
            ...user,
            username: player ? player.username : user.username,
        };
    });

    return (
        <Container maxWidth="md" className="group-page-container">
            <Paper className="group-paper" sx={{ padding: 3, marginBottom: 3 }}>
                <Typography variant="h3" gutterBottom>
                    {group.name}
                </Typography>

                <List>
                    <ListItem>
                        <ListItemText primary="Public Group" secondary={group.public ? "Yes" : "No"} />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Open Group" secondary={group.open ? "Yes" : "No"} />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Years" secondary={group.years.join(", ")} />
                    </ListItem>
                </List>

                <GroupMembers admins={admins} players={players} />

                <div className="group-buttons">
                    <Button variant="contained" color="primary" onClick={() => navigate("/groups")} sx={{ marginRight: 2 }}>
                        Back to Groups
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={handleOpenModal}>
                        Add User
                    </Button>

                    {/* Conditionally render the "Edit Group" button if the user is an admin */}
                    {isAdmin && (
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => navigate(`/group/edit/${groupId}`)} // Navigate to edit group page
                            sx={{ marginLeft: 2 }}
                        >
                            Edit Group
                        </Button>
                    )}
                </div>
            </Paper>

            {/* Modal for adding users */}
            <Modal open={openModal} onClose={handleCloseModal}>
                <Box sx={{ padding: 3, backgroundColor: 'white', borderRadius: 2, width: '80%', maxWidth: '600px', margin: 'auto' }}>
                    <Typography variant="h6" gutterBottom>
                        Add User to {group.name}
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                        Friends:
                    </Typography>
                    <Grid container spacing={3}>
                        {friends.map((friend) => (
                            <Grid item xs={12} sm={6} md={4} key={friend.id}>
                                <UserCard username={friend.username} />
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => handleAddUser(friend.id)}
                                    disabled={addingUser || alreadyAddedUsers.some((user) => user.id === friend.id)}
                                    sx={{ marginTop: 1 }}
                                >
                                    {addingUser ? <CircularProgress size={24} /> : "Add"}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>

                    <Typography variant="h6" gutterBottom sx={{ marginTop: 2 }}>
                        Already Added:
                    </Typography>
                    <Grid container spacing={3}>
                        {alreadyAddedUsers.length > 0 ? (
                            alreadyAddedUsers.map((user) => (
                                <Grid item xs={12} sm={6} md={4} key={user.username}>
                                    <UserCard username={user.username} />
                                </Grid>
                            ))
                        ) : (
                            <Typography variant="body2" color="textSecondary">
                                No users have been added to this group yet.
                            </Typography>
                        )}
                    </Grid>

                    {addError && (
                        <Typography variant="body2" color="error" sx={{ marginTop: 2 }}>
                            {addError}
                        </Typography>
                    )}

                    <DialogActions>
                        <Button onClick={handleCloseModal} color="secondary" disabled={addingUser}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Box>
            </Modal>
        </Container>
    );
};

export default GroupPage;
