import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateGroup.less";
import { Group, Motorsport } from "../../../Models/Group";
import GroupService from "../../../Services/GroupService";
import { debounce } from "@mui/material";

const CreateGroup = () => {
    const currentYear = new Date().getFullYear();
    const [groupName, setGroupName] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nameTaken, setNameTaken] = useState(false); // Tracks if name is already taken
    const [isChecking, setIsChecking] = useState(false); // Tracks if the name check is in progress
    const navigate = useNavigate();

    // Debounced function to check if the group name exists
    const checkGroupNameAvailability = useCallback(
        debounce(async (name: string) => {
            setIsChecking(true); // Set loading state to true when checking availability
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

        const groupData: Group = {
            id: "",
            name: groupName,
            adminUserIds: [],
            playersIds: [],
            playersUserNames: [],
            years: [currentYear],
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
                <div className="form-group">
                    <label>Group Name</label>
                    <input
                        type="text"
                        value={groupName}
                        onChange={handleGroupNameChange} // Use the updated handler
                        required
                    />
                </div>

                <div className="form-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                        />
                        Open Group
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={isOpen}
                            onChange={(e) => setIsOpen(e.target.checked)}
                        />
                        Public Group
                    </label>
                </div>

                <div className="form-group">
                    <label>Year</label>
                    <p>{currentYear}</p>
                </div>

                <button
                    type="submit"
                    className="submit-button"
                    disabled={nameTaken || isChecking} // Disable if name is taken or checking is in progress
                >
                    {isChecking ? "Checking..." : "Create Group"} {/* Show loading text when checking */}
                </button>
            </form>
        </div>
    );
};

export default CreateGroup;
