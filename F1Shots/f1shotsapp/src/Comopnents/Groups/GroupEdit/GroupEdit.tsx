import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Container,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Box,
    Paper,
    Checkbox,
    FormControlLabel,
    List,
    ListItem,
    Divider,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupService from "../../../Services/GroupService";
import { Group } from "../../../Models/Group";
import AddUserModal from "../../Modals/AddUserModal";
import FriendshipService from "../../../Services/FriendshipService";
import "./GroupEdit.less";
import UserCard from "../../Cards/User/UserCard";
import BannedUsersModal from "../../Modals/BannedUsersModal";
import { useAuth } from "../../../Contexts/AuthContext";
import ProfileService from "../../../Services/ProfileService";
import { User } from "../../../Models/User";

const GroupEdit = () => {
    const [currentUser, setCurrentUser] = useState<User>();
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [groupName, setGroupName] = useState<string>("");
    const [isPublic, setIsPublic] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [admins, setAdmins] = useState<string[]>([]);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [friends, setFriends] = useState<any[]>([]);
    const [groupRelations, setGroupRelations] = useState<any[]>([]);
    const [addingUser, setAddingUser] = useState<boolean>(false);
    const [addError, setAddError] = useState<string | null>(null);
    const [groupNameExists, setGroupNameExists] = useState<boolean>(false);
    const [bannedUsers, setBannedUsers] = useState<{ id: string; username: string }[]>([]);
    const [openBannedModal, setOpenBannedModal] = useState<boolean>(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState(""); // State for input validation

    const [changesSaved, setChangesSaved] = useState<boolean>(false);
    const [initialGroupName, setInitialGroupName] = useState<string | null>(null);
    const [initialIsPublic, setInitialIsPublic] = useState<boolean>(false);
    const [initialIsOpen, setInitialIsOpen] = useState<boolean>(false);
    const [initialAdmins, setInitialAdmins] = useState<string[]>([]);

    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

    const [isCheckingGroupName, setIsCheckingGroupName] = useState<boolean>(false);
    const [groupNameCheckLoading, setGroupNameCheckLoading] = useState<boolean>(false);

    const [openKickDialog, setOpenKickDialog] = useState<boolean>(false);
    const [userToKick, setUserToKick] = useState<{ id: string; username: string } | null>(null);


    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const currentUser = await ProfileService.getUserProfile();

                setCurrentUser(currentUser);
                const fetchedGroup = await GroupService.getGroupByIdAsync(groupId!);

                setGroup(fetchedGroup);
                setGroupName(fetchedGroup.name);
                setInitialGroupName(fetchedGroup.name);
                setIsPublic(fetchedGroup.public);
                setInitialIsPublic(fetchedGroup.public);
                setIsOpen(fetchedGroup.open);
                setInitialIsOpen(fetchedGroup.open);
                setAdmins(fetchedGroup.adminUserIds);
                setInitialAdmins(fetchedGroup.adminUserIds);

                const friendsData = await FriendshipService.getAllFriends();
                setFriends(friendsData);

                const groupRelations = await GroupService.getGroupRelations(groupId);
                setGroupRelations(groupRelations.groupRelations);

                const bannedUsersData = await GroupService.getBannedUsers(groupId);
                setBannedUsers(bannedUsersData);

                setLoading(false);
            } catch (err) {
                setError("Failed to fetch group details.");
                setLoading(false);
            }
        };

        fetchGroup();
    }, [groupId]);

    useEffect(() => {
        if (groupName !== initialGroupName) {
            setIsCheckingGroupName(true); // Start immediate validation state

            const debounceTimeout = setTimeout(() => {
                const checkIfGroupNameExists = async () => {
                    if (groupName.trim()) {
                        setGroupNameCheckLoading(true); // Start loading state
                        try {
                            const exists = await GroupService.checkGroupNameExists(groupName);
                            setGroupNameExists(exists);
                        } catch (error) {
                            setError("Error checking group name.");
                        } finally {
                            setGroupNameCheckLoading(false); // End loading state
                            setIsCheckingGroupName(false); // End immediate validation state
                        }
                    } else {
                        setGroupNameExists(false); // Reset state if name is empty
                        setIsCheckingGroupName(false); // End immediate validation state
                    }
                };

                checkIfGroupNameExists();
            }, 500); // 500ms debounce

            return () => {
                clearTimeout(debounceTimeout); // Cleanup timeout on every change of `groupName`
                setIsCheckingGroupName(false); // Ensure state is reset on cleanup
            };
        }
    }, [groupName, initialGroupName]);

    const players =
        group?.playersIds.map((id, index) => ({
            id,
            username: group?.playersUserNames[index],
        })) || [];

    const alreadyAddedUsers = [
        ...admins.map((adminId) => ({ id: adminId, username: "Unknown" })),
        ...players,
    ].filter((value, index, self) =>
        index === self.findIndex((t) => t.id === value.id)
    ).map((user) => {
        const player = players.find((player) => player.id === user.id);
        return {
            ...user,
            username: player ? player.username : user.username,
        };
    });

    // Function to remove a user from the group
    const handleKickClick = (user: { id: string; username: string }) => {
        setUserToKick(user);
        setOpenKickDialog(true);
    };

    const confirmRemoveUser = async () => {
        if (!userToKick) return;

        try {
            await GroupService.removePlayerFromGroup(groupId!, userToKick.id);

            // Remove the user from the group dynamically
            setGroupRelations((prevRelations) =>
                prevRelations.filter((relation) => relation.userToBeInvitedId !== userToKick.id)
            );
            setAdmins((prevAdmins) => prevAdmins.filter((adminId) => adminId !== userToKick.id));
            setGroup((prevGroup) => {
                if (!prevGroup) return prevGroup;
                return {
                    ...prevGroup,
                    playersIds: prevGroup.playersIds.filter((id) => id !== userToKick.id),
                    playersUserNames: prevGroup.playersUserNames.filter(
                        (_, index) => prevGroup.playersIds[index] !== userToKick.id
                    ),
                };
            });
            setError(null); // Reset any previous error
        } catch (err) {
            setError("Failed to remove user from the group.");
        } finally {
            setOpenKickDialog(false); // Close the confirmation dialog
            setUserToKick(null); // Reset the user to kick
        }
    };

    const handleSaveChanges = async () => {
        if (admins.length === 0) {
            setError("You must select at least one admin.");
            return;
        }

        try {
            await GroupService.updateGroup(groupId!, {
                name: groupName,
                public: isPublic,
                open: isOpen,
                adminUserIds: admins,
            });

            // Reset initial values to reflect the saved ones
            setInitialGroupName(groupName);
            setInitialIsPublic(isPublic);
            setInitialIsOpen(isOpen);
            setInitialAdmins(admins);

            setChangesSaved(true); // Mark the changes as saved
            navigate(`/group/edit/${groupId}`);
        } catch (err) {
            setError("Failed to update group.");
        }
    };

    useEffect(() => {
        setChangesSaved(false); // Reset changesSaved when any field is modified
    }, [groupName, isPublic, isOpen, admins]);

    const handleAdminToggle = (userId: string) => {
        // Check if the current user is the only admin
        if (admins.length === 1 && admins[0] === currentUser?.id && userId === currentUser?.id) {
            // Prevent unchecking if the current user is the only admin
            return;
        }

        setAdmins((prevAdmins) => {
            if (prevAdmins.includes(userId)) {
                return prevAdmins.filter((id) => id !== userId);
            } else {
                return [...prevAdmins, userId];
            }
        });
    };

    const handleDeleteGroup = async () => {
        try {
            await GroupService.deleteGroup(groupId!);
            navigate("/groups");
        } catch (err) {
            setError("Failed to delete group.");
        }
    };

    const isSaveDisabled = () => {
        return (
            groupName.trim() === "" || // Disable if group name is empty
            isCheckingGroupName || // Disable during immediate validation
            groupNameCheckLoading || // Disable when group name check is in progress
            groupNameExists || // Disable when group name already exists
            changesSaved || // Disable after changes are saved
            (
                groupName === initialGroupName &&
                isPublic === initialIsPublic &&
                isOpen === initialIsOpen &&
                JSON.stringify(admins) === JSON.stringify(initialAdmins)
            ) // Disable if no changes are made
        );
    };

    const handleChangeRelation = (friendUsername: string, isCancel: boolean) => {
        setGroupRelations((prevRelations) => {
            console.log("previous relations", prevRelations);

            // Check if the friend already exists in the relations array
            const updatedRelations = prevRelations.map((relation) => {
                // If relation exists for the friend, update its status
                if (relation.userToBeInvitedId === friendUsername) {
                    return isCancel
                        ? { ...relation, status: 7 } // Banned/Rejected status if canceled
                        : { ...relation, status: 0 }; // Update to invite pending if invited
                }
                return relation;
            });

            // If the relation doesn't exist, add a new one with all required fields
            const existingRelation = updatedRelations.some((r) => r.userToBeInvitedId === friendUsername);

            if (!existingRelation) {
                updatedRelations.push({
                    userRequestingJoinId: "", // or use the valid requesting join ID here
                    userToBeInvitedId: friendUsername,
                    status: isCancel ? 5 : 0,  // Banned/Rejected if canceled, Invited if added
                });
            }

            console.log("updated relations", updatedRelations);
            return updatedRelations;
        });
    };

    if (loading) {
        return (
            <Box className="loading-state" display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="sm" className="group-edit">
            <Paper elevation={3} className="group-edit-paper">
                <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                    <IconButton onClick={() => navigate(`/group/${groupId}`)} edge="start">
                        <ArrowBackIcon />
                    </IconButton>
                </Box>

                <Typography variant="h4" gutterBottom className="title">
                    Edit Group
                </Typography>
                {error && <Typography color="error" variant="body2">{error}</Typography>}
                {groupNameExists && <Typography color="error" variant="body2">Group name already exists.</Typography>}

                <Box className="form-section">
                    <TextField
                        label="Group Name"
                        variant="outlined"
                        fullWidth
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        margin="normal"
                        className="group-name-input"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Public Group"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isOpen}
                                onChange={(e) => setIsOpen(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Open Group"
                    />

                    <Typography variant="h6" gutterBottom>
                        Manage Users
                    </Typography>
                    <List>
                        {players.map((player) => (
                            <React.Fragment key={player.id}>
                                <ListItem className="admin-list-item">
                                    <UserCard username={player.username} />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={admins.includes(player.id)}
                                                onChange={() => handleAdminToggle(player.id)}
                                                color="primary"
                                                disabled={admins.length === 1 && admins[0] === currentUser?.id && player.id === currentUser?.id} // Disable checkbox if current user is the only admin
                                            />
                                        }
                                        label="Admin"
                                    />
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleKickClick(player)} // Open confirmation dialog
                                        sx={{ width: "auto" }}
                                        disabled={player.id === currentUser?.id} // Disable the button for the current user
                                    >
                                        Kick
                                    </Button>
                                </ListItem>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>

                    <Box className="action-buttons">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSaveChanges}
                            disabled={isSaveDisabled()}
                            fullWidth
                        >
                            {groupNameCheckLoading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                "Save Changes"
                            )}
                        </Button>

                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => setOpenModal(true)}
                            fullWidth
                        >
                            Add User
                        </Button>

                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => setOpenDeleteDialog(true)}
                            fullWidth
                        >
                            Delete Group
                        </Button>

                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => setOpenBannedModal(true)}
                            fullWidth
                        >
                            View Banned Users
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <AddUserModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                groupId={groupId!}
                friends={friends}
                groupRelations={groupRelations}
                alreadyAddedUsers={alreadyAddedUsers}
                addingUser={addingUser}
                setAddingUser={setAddingUser}
                addError={addError}
                setAddError={setAddError}
                onChangeRelation={handleChangeRelation} // Pass the callback here
            />

            <BannedUsersModal
                open={openBannedModal}
                onClose={() => setOpenBannedModal(false)}
                currentUsername={currentUser!.username}
                groupId={groupId!}
                usersBanned={bannedUsers}
                alreadyAddedUsers={alreadyAddedUsers}
                setBannedUsers={setBannedUsers}
            />

            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this group? This action cannot be undone.
                    </Typography>
                    <Typography sx={{ mt: 2 }}>
                        Please type the group name to confirm.
                    </Typography>
                    <TextField
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder={`Type "${groupName}" to confirm`}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteGroup}
                        color="error"
                        disabled={deleteConfirmation !== groupName} // Enable only if input matches group name
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openKickDialog} onClose={() => setOpenKickDialog(false)}>
                <DialogTitle>Confirm Kick</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to remove {userToKick?.username} from the group? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenKickDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmRemoveUser} color="error">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    )
}

export default GroupEdit;
