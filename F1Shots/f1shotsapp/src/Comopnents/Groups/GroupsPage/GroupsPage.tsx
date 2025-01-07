import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Box, Grid, Paper } from "@mui/material";
import GroupService from "../../../Services/GroupService"; // Import GroupService

import "./GroupsPage.less";
import GroupList from "../GroupList/GroupList";

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

    const handleCreateFirstGroup = () => {
        navigate("/create-group"); // Redirect to create group if there are no groups
    };

    const handleCreateGroup = () => {
        navigate("/create-group"); // Redirect to the create group page
    };

    return (
        <Box className="groups-page-container" sx={{ padding: "2rem", backgroundColor: "#f9f9f9" }}>
            <Typography variant="h3" gutterBottom align="center" sx={{ fontWeight: 600 }}>
                Your Groups
            </Typography>
            {error && (
                <Typography
                    variant="body1"
                    color="error"
                    align="center"
                    sx={{ marginBottom: "1rem", fontWeight: "bold" }}
                >
                    {error}
                </Typography>
            )}

            {/* Display the GroupList component and pass the groups data */}
            <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} sm={10} md={8}>
                    {!Array.isArray(groups) || groups.length === 0 ? (
                        <Paper sx={{ padding: "2rem", textAlign: "center", backgroundColor: "#e1f5fe" }}>
                            <Typography variant="h5" color="textSecondary" align="center" sx={{ marginBottom: "1rem" }}>
                                No groups found.
                            </Typography>
                            <Button
                                onClick={handleCreateFirstGroup}
                                variant="contained"
                                color="primary"
                                sx={{ padding: "1rem 2rem", fontSize: "1.1rem" }}
                            >
                                Create your first group!
                            </Button>
                        </Paper>
                    ) : (
                        <GroupList groups={groups} />
                    )}
                </Grid>
            </Grid>

            {/* Button for creating a group */}
            {Array.isArray(groups) && groups.length > 0 && (
                <Grid container justifyContent="center" sx={{ marginTop: "2rem" }}>
                    <Grid item>
                        <Button
                            onClick={handleCreateGroup}
                            variant="contained"
                            color="secondary"
                            sx={{
                                padding: "1rem 2rem",
                                fontSize: "1.1rem",
                                borderRadius: "30px",
                                boxShadow: 3,
                            }}
                        >
                            Create New Group
                        </Button>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default GroupsPage;
