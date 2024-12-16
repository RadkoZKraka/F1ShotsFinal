import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
} from "@mui/material";
import FriendshipService from "../../Services/FriendshipService";

interface AddFriendModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFriendAdded: () => void;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ isOpen, onClose, onFriendAdded }) => {
    const [searchFriendUsername, setSearchFriendUsername] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const handleSearchFriend = async () => {
        try {
            await FriendshipService.addFriend(searchFriendUsername);
            setError(null);
            setSearchFriendUsername("");
            onFriendAdded();  // Notify the parent component that a friend was added
            onClose(); // Close the modal
        } catch (err) {
            setError("Failed to send friend request.");
            console.error(err);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose}>
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
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" color="primary" onClick={handleSearchFriend}>
                    Send Request
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddFriendModal;
