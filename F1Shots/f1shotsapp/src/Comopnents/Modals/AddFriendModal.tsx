import React, { useState, useRef } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Fade,
} from "@mui/material";
import FriendshipService from "../../Services/FriendshipService";
import {log} from "node:util";

interface AddFriendModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFriendAdded: () => void;
    username: string;
}

export enum FriendshipStatus {
    None = 0,
    Received = 1,
    Sent = 2,
    ThatsYou = 3,
    Friends = 4,
    Banned = 5,
    UserBanned = 6,
    UserDoesntExist = 7,
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({
                                                           isOpen,
                                                           onClose,
                                                           onFriendAdded,
                                                           username,
                                                       }) => {
    const [searchFriendUsername, setSearchFriendUsername] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSearchFriend = async () => {
        if (searchFriendUsername === username) {
            setError("You cannot add yourself as a friend. :)");
            return;
        }

        try {
            const data = await FriendshipService.getFriendshipStatus(searchFriendUsername);
            console.log(data.status)
            switch (data.status) {
                case FriendshipStatus.UserDoesntExist:
                    setError("User does not exist.");
                    return;
                case FriendshipStatus.Friends:
                    setError("You are already friends with this user.");
                    return;
                case FriendshipStatus.Sent:
                    setError("Friend request already sent.");
                    return;
                case FriendshipStatus.Received:
                    setError("You have a pending friend request from this user.");
                    return;
                case FriendshipStatus.Banned:
                    setError("You are banned from interacting with this user.");
                    return;
                case FriendshipStatus.UserBanned:
                    setError("You banned this user, go to settings to unban.");
                    return;
                default:
                    await FriendshipService.addFriend(searchFriendUsername);
                    setError(null);
                    setSearchFriendUsername("");
                    onFriendAdded();
                    onClose();
                    return;
            }
        } catch (err) {
            setError("Failed to send friend request.");
            console.error(err);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
            handleSearchFriend();
        } else if (event.key === "Escape") {
            onClose();
        }
    };

    const handleEntered = () => {
        setSearchFriendUsername(""); // Clear the input when the modal opens
        setError(null); // Clear error
        inputRef.current?.focus(); // Focus the text box
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            TransitionComponent={Fade}
            TransitionProps={{
                onEntered: handleEntered,
            }}
        >
            <DialogTitle>Search for Friends</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    label="Friend's Username"
                    value={searchFriendUsername}
                    onChange={(e) => setSearchFriendUsername(e.target.value)}
                    error={!!error}
                    helperText={error}
                    margin="dense"
                    inputRef={inputRef}
                    onKeyDown={handleKeyDown}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSearchFriend}
                    disabled={!searchFriendUsername.trim()}
                >
                    Send Request
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddFriendModal;
