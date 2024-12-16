import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Paper,
} from "@mui/material";
import GroupService from "../../../Services/GroupService"; // Import GroupService

import "./GroupsPage.less";

const GroupsPage: React.FC = () => {
    const [groups, setGroups] = useState<any[]>([]); // Group list state
    const [error, setError] = useState<string | null>(null); // Error state
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const fetchedGroups = await GroupService.getMyGroups();
                setGroups(fetchedGroups);
            } catch (err) {
                setError("Failed to fetch groups.");
                console.error(err);
            }
        };

        fetchGroups();
    }, []);

    const handleCreateGroup = () => {
        navigate("/create-group"); // Redirect to the create group page
    };

    const handleCreateFirstGroup = () => {
        navigate("/create-group"); // Redirect to create group if there are no groups
    };

    const handleGroupClick = (groupId: string) => {
        navigate(`/group/${groupId}`); // Navigate to the group page using the group's ID
    };

    return (
        <div className="groups-page-container">
            <h2>Your Groups</h2>
            {error && <p className="error-message">{error}</p>}

            {/* Display groups in a table format */}
            <div className="groups-list">
                {!Array.isArray(groups) || groups.length === 0 ? (
                    <Typography variant="h6" color="textSecondary" align="center">
                        No groups found.
                    </Typography>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Group Name</strong></TableCell>
                                    <TableCell><strong>Public</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {groups.map((group) => (
                                    <TableRow
                                        key={group.id}
                                        hover
                                        onClick={() => handleGroupClick(group.id)} // Add the click handler to the row
                                        style={{ cursor: "pointer" }} // Make the row clickable
                                    >
                                        <TableCell>{group.name}</TableCell>
                                        <TableCell>{group.public ? "Yes" : "No"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </div>

            {/* Button for creating a group */}
            {!Array.isArray(groups) || groups.length === 0 ? (
                <Button
                    onClick={handleCreateFirstGroup}
                    variant="contained"
                    color="primary"
                    className="create-first-group-button"
                >
                    Create your first group!
                </Button>
            ) : (
                <Button
                    onClick={handleCreateGroup}
                    variant="contained"
                    color="primary"
                    className="create-group-button"
                >
                    Create New Group
                </Button>
            )}
        </div>
    );
};

export default GroupsPage;
