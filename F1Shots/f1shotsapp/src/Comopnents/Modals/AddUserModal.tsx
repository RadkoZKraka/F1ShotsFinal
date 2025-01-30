import React, {useState, useEffect, useRef} from "react";
import {
    Box,
    Button,
    CircularProgress,
    DialogActions,
    Grid,
    Modal,
    Typography,
    TextField,
} from "@mui/material";
import UserCard from "../Cards/User/UserCard";
import GroupService from "../../Services/GroupService";
import {GroupRelationStatus} from "./RequestJoinModal";

interface Friend {
    id: string;
    username: string;
}

interface GroupRelation {
    userToBeInvitedId?: string;
    userRequestingJoinId?: string;
    status: number; // 0 - InvitePending, 2 - Already in Group, etc.
}

interface AddUserModalProps {
    open: boolean;
    onClose: () => void;
    groupId: string;
    friends: any[];
    groupRelations: any[];
    alreadyAddedUsers: { username: string; id: string }[];
    addingUser: boolean;
    setAddingUser: React.Dispatch<React.SetStateAction<boolean>>;
    addError: string | null;
    setAddError: React.Dispatch<React.SetStateAction<string | null>>;
    onChangeRelation: (friendUsername: string, isCancel: boolean) => void;
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
                                                       onChangeRelation,
                                                   }) => {
    const [usernameInput, setUsernameInput] = useState<string>("");
    const [inputError, setInputError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const usernameRef = useRef<string>("");

    useEffect(() => {
        if (open) {
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 100);
        }
    }, [open]);

    const handleAddUser = async (groupId: string, friendId: string, friendUsername: string) => {
        if (!friendId || !groupId) return;
        setAddingUser(true);
        setAddError(null);
        try {
            await GroupService.addUserToGroup(groupId, friendUsername);
            onChangeRelation(friendId, false);
        } catch (err) {
            setAddError("Failed to add user to the group.");
            console.error(err);
        } finally {
            setAddingUser(false);
        }
    };

    const handleCancelInviteByGroupIdAndFriendId = async (groupId: string, friendId: string) => {
        if (!friendId || !groupId) return;
        setAddingUser(true);
        setAddError(null);
        try {
            await GroupService.cancelGroupInviteByGroupIdAndFriendId(groupId, friendId);
            onChangeRelation(friendId, true);
        } catch (err) {
            setAddError("Failed to cancel invitation.");
            console.error(err);
        } finally {
            setAddingUser(false);
        }
    };

    const handleAcceptJoinRequest = async (notificationGuid: string, friendId: string) => {
        setAddingUser(true);
        setAddError(null);
        try {
            await GroupService.confirmGroupJoinRequest(notificationGuid);
            onChangeRelation(friendId, false);
        } catch (err) {
            setAddError("Failed to accept join request.");
            console.error(err);
        } finally {
            setAddingUser(false);
        }
    };


    const handleRejectJoinRequest = async (notificationGuid: string, friendId: string) => {
        setAddingUser(true);
        setAddError(null);
        try {
            await GroupService.rejectGroupJoinRequest(notificationGuid);
            onChangeRelation(friendId, true);
        } catch (err) {
            setAddError("Failed to reject join request.");
            console.error(err);
        } finally {
            setAddingUser(false);
        }
    };

    const handleAddByUsername = async (username: string) => {
        if (!username.trim()) {
            setInputError("Please enter a username.");
            return;
        }

        console.log(username)
        // Check if the user is already in groupRelations
        const relation = await GroupService.checkGroupRelationOfUser(username, groupId);



        switch (relation) {
            case 0: // 0
                console.log('test')
                setInputError("This user already has a pending invite.");
                return;
            case 1: // 1
                setInputError("This user has sent a join request. You can accept it.");
                return;
            case 2: // 2
                setInputError("This user is already in the group.");
                return;
            case 5: // 5
                setInputError("This user is banned from the group.");
                return;
            case 6: // 6
                setInputError("This user banned this group.");
                return;
            case 405:
                setInputError("User not found.");
                return;
            case 3: // 3
            case 4: // 4
            default: // Status 7 or any other case
                break; // Proceed with adding
        }

        try {
            setAddingUser(true);
            setAddError(null);

            await GroupService.addUserToGroup(groupId, username.trim());

            setInputError(null); // Clear any previous error
        } catch (err) {
            setAddError("Failed to add user to the group.");
            console.error(err);
        } finally {
            setAddingUser(false);
        }
    };


    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
            handleAddByUsername(usernameRef.current); // Pass the latest value
        } else if (event.key === "Escape") {
            setUsernameInput("");
            setInputError("")
            onClose();
        }
    };
    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        usernameRef.current = newValue; // Update the ref with the latest value
        setUsernameInput(newValue);

        if (inputError) setInputError(null); // Clear the error when the input changes
    };

    useEffect(() => {
        if (open) {
            window.addEventListener("keydown", handleKeyDown);
        } else {
            window.removeEventListener("keydown", handleKeyDown);
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    return (
        <Modal open={open} onClose={() => (
            setUsernameInput(""),onClose(), setInputError(""))}>
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
                    transform: "translate(-50%, -50%)",
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
                        const groupRelation = groupRelations.find(
                            (relation) =>
                                relation.userToBeInvitedId === friend.id ||
                                relation.userRequestingJoinId === friend.id
                        );

                        const isAlreadyAdded = alreadyAddedUsers.some(
                            (user) => user.id === friend.id
                        );

                        let buttonText = "Invite";
                        let isButtonDisabled = addingUser || isAlreadyAdded;
                        if (groupRelation) {
                            switch (groupRelation.status) {
                                case 0: // InvitePending
                                    buttonText = "Cancel Invite";
                                    isButtonDisabled = false;
                                    break;
                                case 1: // Accepted
                                    buttonText = "User sent a join request";
                                    isButtonDisabled = true;
                                    break;
                                case 2: // Already in Group
                                    buttonText = "Already in Group";
                                    isButtonDisabled = true;
                                    break;
                                case 3: // User rejected invite
                                    buttonText = "User rejected invite";
                                    isButtonDisabled = true;
                                    break;
                                case 5: // Banned
                                    buttonText = "User banned";
                                    isButtonDisabled = true;
                                    break;
                                case 7: // None
                                    buttonText = "Invite";
                                    isButtonDisabled = false;
                                    break;
                                default:
                                    break;
                            }
                        }

                        return (
                            <Grid item xs={12} sm={6} md={4} key={friend.id}>
                                <UserCard username={friend.username}/>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() =>
                                        buttonText === "Cancel Invite"
                                            ? handleCancelInviteByGroupIdAndFriendId(groupId, friend.id)
                                            : handleAddUser(groupId, friend.id, friend.username)
                                    }
                                    disabled={isButtonDisabled}
                                    sx={{marginTop: 1}}
                                >
                                    {addingUser ? <CircularProgress size={24}/> : buttonText}
                                </Button>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* New Section: Join Requests */}
                <Typography variant="h6" gutterBottom sx={{marginTop: 2}}>
                    Join Requests:
                </Typography>
                <Grid container spacing={3}>
                    {groupRelations
                        .filter((relation) => relation.status === 1) // Join request (status 1)
                        .map((relation) => {
                            const friend = friends.find(
                                (f) =>
                                    f.id === relation.userRequestingJoinId
                            );

                            if (friend) {
                                return (
                                    <Grid item xs={12} sm={6} md={4} key={friend.id}>
                                        <UserCard username={friend.username}/>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() =>
                                                handleAcceptJoinRequest(groupId, friend.id)
                                            }
                                            disabled={addingUser}
                                            sx={{marginTop: 1}}
                                        >
                                            {addingUser ? <CircularProgress size={24}/> : "Accept"}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            onClick={() =>
                                                handleRejectJoinRequest(groupId, friend.id)
                                            }
                                            disabled={addingUser}
                                            sx={{marginTop: 1, marginLeft: 1}}
                                        >
                                            {addingUser ? <CircularProgress size={24}/> : "Reject"}
                                        </Button>
                                    </Grid>
                                );
                            }
                            return null;
                        })}
                </Grid>

                <Typography variant="h6" gutterBottom sx={{marginTop: 2}}>
                    Already Added:
                </Typography>
                <Grid container spacing={3}>
                    {alreadyAddedUsers.length > 0 ? (
                        alreadyAddedUsers.map((user) => (
                            <Grid item xs={12} sm={6} md={4} key={user.id}>
                                <UserCard username={user.username}/>
                            </Grid>
                        ))
                    ) : (
                        <Typography variant="body2" color="textSecondary">
                            No users have been added to this group yet.
                        </Typography>
                    )}
                </Grid>

                <TextField
                    label="Enter Username"
                    variant="outlined"
                    fullWidth
                    value={usernameInput}
                    onChange={handleUsernameChange}
                    sx={{marginTop: 2}}
                    error={!!inputError}
                    helperText={inputError}
                    inputRef={inputRef}
                    autoFocus
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleAddByUsername(usernameRef.current)}
                    sx={{marginTop: 2}}
                    disabled={addingUser}
                >
                    {addingUser ? <CircularProgress size={24}/> : "Add by Username"}
                </Button>

                {addError && (
                    <Typography variant="body2" color="error" sx={{marginTop: 2}}>
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
