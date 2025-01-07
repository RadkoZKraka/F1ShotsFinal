import React, { useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    DialogActions,
    Grid,
    Modal,
    Typography,
} from "@mui/material";
import UserCard from "../Cards/User/UserCard";
import GroupService from "../../Services/GroupService";

interface AddUserModalProps {
    open: boolean;
    onClose: () => void;
    groupId: string;
    friends: any[];
    groupRelations: any[]; // Updated
    alreadyAddedUsers: any[];
    addingUser: boolean;
    setAddingUser: React.Dispatch<React.SetStateAction<boolean>>;
    addError: string | null;
    setAddError: React.Dispatch<React.SetStateAction<string | null>>;
}


const AddUserModal: React.FC<AddUserModalProps> = ({
                                                       open,
                                                       onClose,
                                                       groupId,
                                                       friends,
                                                       groupRelations,
                                                       alreadyAddedUsers,
                                                       addingUser,
                                                       setAddingUser,
                                                       addError,
                                                       setAddError,
                                                   }) => {
    const handleAddUser = async (friendUsername: string) => {
        if (!friendUsername || !groupId) return;
        setAddingUser(true);
        setAddError(null);
        try {
            await GroupService.addUserToGroup(groupId, friendUsername);
            onClose();
        } catch (err) {
            setAddError("Failed to add user to the group.");
            console.error(err);
        } finally {
            setAddingUser(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    padding: 3,
                    backgroundColor: "white",
                    borderRadius: 2,
                    width: "80%",
                    maxWidth: "600px",
                    margin: "auto",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)", // Center the modal
                }}
            >
                <Typography variant="h6" gutterBottom>
                    Send invitation to group.
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Friends:
                </Typography>
                <Grid container spacing={3}>
                    {friends.map((friend) => {
                        // Find the group relation where either `userToBeInvitedId` or `userRequestingJoinId` matches the friend ID
                        const groupRelation = groupRelations.find(
                            (relation) =>
                                relation.userToBeInvitedId === friend.id ||
                                relation.userRequestingJoinId === friend.id
                        );

                        // Check if the friend is already added to the group
                        const isAlreadyAdded = alreadyAddedUsers.some(
                            (user) => user.id === friend.id
                        );

                        // Determine button text and disabled state
                        let buttonText = "Invite";
                        let isButtonDisabled = addingUser || isAlreadyAdded;
                        
                        if (groupRelation) {
                            switch (groupRelation.status) {
                                case 0: // InvitePending
                                    buttonText = "Invite Already Sent";
                                    isButtonDisabled = true;
                                    break;
                                case 1: // Accepted
                                    buttonText = "User sent a join request";
                                    isButtonDisabled = true;
                                    break;
                                case 2: // Accepted
                                    buttonText = "Already in Group";
                                    isButtonDisabled = true;
                                    break;
                                case 3: // Accepted
                                    buttonText = "User rejected invite";
                                    isButtonDisabled = true;
                                    break;
                                case 4: // Accepted
                                    buttonText = "User rejected invite";
                                    isButtonDisabled = true;
                                    break;
                                case 5: // Banned
                                    buttonText = "User banned";
                                    isButtonDisabled = true;
                                    break;
                                case 6: // Banned
                                    buttonText = "Group banned by user";
                                    isButtonDisabled = true;
                                    break;
                                case 7 || null || undefined: // Banned
                                    buttonText = "Invite";
                                    isButtonDisabled = false;
                                    break;
                                default:
                                    break;
                            }
                        }

                        return (
                            <Grid item xs={12} sm={6} md={4} key={friend.id}>
                                <UserCard username={friend.username} />
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => handleAddUser(friend.username)}
                                    disabled={isButtonDisabled}
                                    sx={{ marginTop: 1 }}
                                >
                                    {addingUser ? <CircularProgress size={24} /> : buttonText}
                                </Button>
                            </Grid>
                        );
                    })}
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
                    <Button onClick={onClose} color="secondary" disabled={addingUser}>
                        Cancel
                    </Button>
                </DialogActions>
            </Box>
        </Modal>
    );
};

export default AddUserModal;
