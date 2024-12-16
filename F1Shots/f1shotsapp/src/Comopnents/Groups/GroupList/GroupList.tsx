import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper } from "@mui/material";
import { Group } from "../../../Models/Group"; // Import the Group interface

interface GroupListProps {
    groups: Group[];
}

const GroupList: React.FC<GroupListProps> = ({ groups = [] }) => {
    const [isExpanded, setIsExpanded] = useState(true); // State for toggling visibility
    const navigate = useNavigate(); // Hook for navigation

    const handleToggle = () => {
        setIsExpanded((prev) => !prev); // Toggle the expanded state
    };

    // Handle the click on a group name to navigate to the GroupPage
    const handleGroupClick = (groupId: string) => {
        navigate(`/group/${groupId}`); // Navigate to the GroupPage with the group ID
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            <Button
                variant="contained"
                color="primary"
                onClick={handleToggle}
                style={{ marginBottom: "20px" }}
            >
                {isExpanded ? "Hide Groups" : "Show Groups"}
            </Button>

            {isExpanded && (
                <TableContainer component={Paper}>
                    {!Array.isArray(groups) || groups.length === 0 ? (
                        <Typography variant="h6" color="textSecondary" align="center">
                            No Groups found.
                        </Typography>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Group Name</strong></TableCell>
                                    <TableCell><strong>Public</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {groups.map((group) => (
                                    <TableRow key={group.id} hover onClick={() => handleGroupClick(group.id)} style={{ cursor: "pointer" }}>
                                        <TableCell>{group.name}</TableCell>
                                        <TableCell>{group.public ? "Yes" : "No"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>
            )}
        </div>
    );
};

export default GroupList;
