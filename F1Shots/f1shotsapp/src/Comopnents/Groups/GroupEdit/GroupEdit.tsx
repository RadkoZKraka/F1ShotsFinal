import React, {useState, useEffect, useRef} from "react";
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
    DialogTitle
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupService from "../../../Services/GroupService";
import { Group } from "../../../Models/Group";
import AddUserModal from "../../Modals/AddUserModal";
import FriendshipService from "../../../Services/FriendshipService";
import "./GroupEdit.less";
import UserCard from "../../Cards/User/UserCard";

const GroupEdit = () => {
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

    // State for delete confirmation dialog
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

    const [initialGroupName, setInitialGroupName] = useState<string | null>(null); // Track the initial group name

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const fetchedGroup = await GroupService.getGroupByIdAsync(groupId!);
                setGroup(fetchedGroup);
                setGroupName(fetchedGroup.name);
                setInitialGroupName(fetchedGroup.name);
                setIsPublic(fetchedGroup.public);
                setIsOpen(fetchedGroup.open);
                setAdmins(fetchedGroup.adminUserIds);

                const friendsData = await FriendshipService.getAllFriends();
                setFriends(friendsData);

                const groupRelations = await GroupService.getGroupRelations(groupId);
                console.log(groupRelations.groupRelations);
                setGroupRelations(groupRelations.groupRelations); // Ensure this state is initialized

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
            const debounceTimeout = setTimeout(() => {
                const checkIfGroupNameExists = async () => {
                    if (groupName.trim()) {
                        try {
                            const exists = await GroupService.checkGroupNameExists(groupName);
                            setGroupNameExists(exists);
                        } catch (error) {
                            setError("Error checking group name.");
                        }
                    }
                };

                checkIfGroupNameExists();
            }, 500); // 500ms debounce

            return () => {
                clearTimeout(debounceTimeout); // Cleanup timeout on every change of `groupName`
            };
        }
    }, [groupName, initialGroupName]);

    const players = group?.playersIds.map((id, index) => ({
        id,
        username: group?.playersUserNames[index],
    })) || [];

    const alreadyAddedUsers = [
        ...admins.map((adminId) => ({ id: adminId, username: "Unknown" })),
        ...players,
    ]
        .filter((value, index, self) =>
            index === self.findIndex((t) => t.id === value.id)
        )
        .map((user) => {
            const player = players.find((player) => player.id === user.id);
            return {
                ...user,
                username: player ? player.username : user.username,
            };
        });

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
            navigate(`/group/edit/${groupId}`);
        } catch (err) {
            setError("Failed to update group.");
        }
    };

    const handleAdminToggle = (userId: string) => {
        setAdmins((prevAdmins) => {
            if (prevAdmins.includes(userId)) {
                return prevAdmins.filter((id) => id !== userId);
            } else {
                return [...prevAdmins, userId];
            }
        });
    };

    const handleRemovePlayer = async (userId: string) => {
        if (group?.playersIds.length === 1) {
            setError("You cannot remove the last player from the group.");
            return;
        }

        try {
            await GroupService.removePlayerFromGroup(groupId!, userId);
            setGroup((prevGroup) => {
                if (!prevGroup) return prevGroup;
                const updatedPlayersIds = prevGroup.playersIds.filter((id) => id !== userId);
                const updatedPlayersUserNames = prevGroup.playersUserNames.filter(
                    (_, index) => prevGroup.playersIds[index] !== userId
                );
                return {
                    ...prevGroup,
                    playersIds: updatedPlayersIds,
                    playersUserNames: updatedPlayersUserNames,
                };
            });
        } catch (err) {
            setError("Failed to remove player from group.");
        }
    };

    const handleDeleteGroup = async () => {
        try {
            await GroupService.deleteGroup(groupId!);
            navigate("/groups");
        } catch (err) {
            setError("Failed to delete group.");
        }
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

                <Typography variant="h4" gutterBottom className="title" style={{ marginLeft: 16 }}>
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
                                checked={isPublic !== undefined ? isPublic : false}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Public Group"
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isOpen !== undefined ? isOpen : false}
                                onChange={(e) => setIsOpen(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Open Group"
                    />

                    <Typography variant="h6" gutterBottom>
                        Manage Admins
                    </Typography>
                    <List>
                        {group?.playersUserNames?.map((username, index) => (
                            <React.Fragment key={group.playersIds[index]}>
                                <ListItem className="admin-list-item">
                                    <UserCard username={username} />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={admins.includes(group.playersIds[index])}
                                                onChange={() => handleAdminToggle(group.playersIds[index])}
                                                color="primary"
                                            />
                                        }
                                        label="Admin"
                                    />
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => handleRemovePlayer(group.playersIds[index])}
                                        className="remove-btn"
                                    >
                                        Remove
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
                            disabled={!groupName.trim() || groupNameExists}
                            fullWidth
                        >
                            Save Changes
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
                            sx={{ marginTop: 2 }}
                        >
                            Delete Group
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <AddUserModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                groupId={groupId!}
                friends={friends}
                groupRelations={groupRelations} // Updated
                alreadyAddedUsers={alreadyAddedUsers}
                addingUser={addingUser}
                setAddingUser={setAddingUser}
                addError={addError}
                setAddError={setAddError}
            />


            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this group? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteGroup} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default GroupEdit;
