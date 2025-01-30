import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Checkbox, FormControlLabel, CircularProgress } from "@mui/material";
import { Group, Motorsport } from "../../../Models/Group";
import GroupService from "../../../Services/GroupService";
import { debounce } from "@mui/material";
import "./CreateGroup.less";

const CreateGroup = () => {
    const currentYear = new Date().getFullYear();
    const [groupName, setGroupName] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nameTaken, setNameTaken] = useState(false); // Tracks if name is already taken
    const [isChecking, setIsChecking] = useState(false); // Tracks if the name check is in progress
    const [isTyping, setIsTyping] = useState(false); // Tracks if the user is typing
    const navigate = useNavigate();

    // Debounced function to check if the group name exists
    const checkGroupNameAvailability = useCallback(
        debounce(async (name: string) => {
            setIsChecking(true); // Set loading state to true when checking availability
            setIsTyping(false); // Stop disabling the button once typing ends
            try {
                const exists = await GroupService.checkGroupNameExists(name);
                setNameTaken(exists); // Set the state if the name exists
            } catch (err) {
                setNameTaken(false); // Handle any errors by assuming the name is not taken
                setError("Error checking group name.");
            } finally {
                setIsChecking(false); // Reset loading state after the check is done
            }
        }, 500), // 500ms debounce delay
        []
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const groupData: any = {
            id: "",
            name: groupName,
            adminUserIds: [],
            playersIds: [],
            playersUserNames: [],
            year: currentYear,
            motorsport: Motorsport.F1,
            public: isPublic,
            open: isOpen,
        };

        try {
            const exists = await GroupService.createGroup(groupData);

            if (exists === "exists") {
                setError("A group with this name already exists. Please choose a different name.");
                return;
            }

            navigate("/groups");
        } catch (e) {
            setError("An error occurred while creating the group.");
            console.error(e);
        }
    };

    const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setGroupName(newName);

        if (newName) {
            setIsTyping(true); // Set typing flag to true when user starts typing
            checkGroupNameAvailability(newName); // Check if the name exists after every change
        }

        if (error) setError(null); // Clear the error if there's any change in the group name
    };

    return (
        <div className="create-group-container">
            <h1>Create a New Group</h1>
            {error && <p className="error-message">{error}</p>}
            {nameTaken && <p className="error-message">This group name is already taken. Please choose a different name.</p>}

            <form onSubmit={handleSubmit} className="create-group-form">
                {/* Group Name Input */}
                <div className="form-group">
                    <TextField
                        label="Group Name"
                        value={groupName}
                        onChange={handleGroupNameChange}
                        fullWidth
                        error={nameTaken || !!error}
                        helperText={nameTaken ? "This group name is already taken." : error}
                    />
                </div>

                {/* Public and Open Checkboxes */}
                <div className="form-group">
                    <FormControlLabel
                        control={<Checkbox checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />}
                        label="Open Group"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={isOpen} onChange={(e) => setIsOpen(e.target.checked)} />}
                        label="Public Group"
                    />
                </div>

                {/* Year Display */}
                <div className="form-group">
                    <p>Year: {currentYear}</p>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={nameTaken || isChecking || isTyping} // Disable if name is taken, checking is in progress, or user is typing
                >
                    {isChecking ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        "Create Group"
                    )}
                </Button>
            </form>
        </div>
    );
};

export default CreateGroup;
