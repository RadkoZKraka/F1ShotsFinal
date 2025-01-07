import React, {useState, useRef} from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Fade,
    Typography,
} from "@mui/material";
import GroupService from "../../Services/GroupService";

export enum GroupRelationStatus {
    InvitePending = 0,
    JoinPending = 1,
    Accepted = 2,
    InviteRejected = 3,
    JoinRejected = 4,
    Banned = 5,
    GroupBanned = 6,
    None = 7,
}

interface RequestJoinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onJoinRequested: () => void;
    addError: string | null;
    setAddError: React.Dispatch<React.SetStateAction<string | null>>;
}

const RequestJoinModal: React.FC<RequestJoinModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               onJoinRequested,
                                                               addError,
                                                               setAddError,
                                                           }) => {
    const [joinGroupName, setJoinGroupName] = useState<string>(""); // Store group name input
    const [successMessage, setSuccessMessage] = useState<string | null>(null); // Store success message
    const inputRef = useRef<HTMLInputElement>(null);

    const handleRequestJoin = async () => {
        setAddError(null);
        setSuccessMessage(null); // Clear success message when starting a new request
        if (!joinGroupName.trim()) {
            setAddError("Please enter a valid group name.");
            return;
        }

        try {
            // Check current relation status of the user with the group
            const groupRelation = await GroupService.checkGroupRelation(joinGroupName);
            // Handle different relation statuses
            switch (groupRelation.status) {
                case GroupRelationStatus.InvitePending:
                    setAddError("You have an invitation pending for this group.");
                    return;
                case GroupRelationStatus.JoinPending:
                    setAddError("Your join request is already pending.");
                    return;
                case GroupRelationStatus.Accepted:
                    setAddError("You are already a member of this group.");
                    return;
                case GroupRelationStatus.JoinRejected:
                    setAddError("Your previous join request was rejected. You cannot request to join again.");
                    return;
                case GroupRelationStatus.Banned:
                    setAddError("You have been banned from this group.");
                    return;
                case GroupRelationStatus.GroupBanned:
                    setAddError("You are banned this group.");
                    return;
                case 405:
                case GroupRelationStatus.None:
                case GroupRelationStatus.InviteRejected:
                    // Proceed with the join request if the relation status is "None"
                    await GroupService.requestGroupJoin(joinGroupName);
                    setSuccessMessage("Join request sent successfully!"); // Show success message
                    onJoinRequested(); // Callback after successful request
                    return;
                case 404:
                case undefined:
                    setAddError("Group not found, is not open to join or you are already in that group.");
                    return;
                default:
                    setAddError("An unexpected error occurred.");
                    return;
            }
        } catch (err) {
            setAddError("Failed to send join request.");
            console.error(err);
        }
    };

    const handleEntered = () => {
        setJoinGroupName(""); // Clear input field when modal opens
        setAddError(null); // Clear error
        setSuccessMessage(null); // Clear success message
        inputRef.current?.focus(); // Focus the text box
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
            handleRequestJoin();
        } else if (event.key === "Escape") {
            onClose();
        }
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
            <DialogTitle>Request to Join Group</DialogTitle>
            <DialogContent>
                <Typography variant="body1" gutterBottom>
                    Please enter the name of the group you want to join.
                </Typography>

                {successMessage && (
                    <Typography variant="body1" color="success.main" gutterBottom>
                        {successMessage}
                    </Typography>
                )}

                <TextField
                    fullWidth
                    label="Group Name"
                    value={joinGroupName}
                    onChange={(e) => setJoinGroupName(e.target.value)}
                    error={!!addError}
                    helperText={addError}
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
                    onClick={handleRequestJoin}
                    disabled={!joinGroupName.trim()}
                >
                    Send Request
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RequestJoinModal;
