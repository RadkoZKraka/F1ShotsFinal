import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Typography, TextField, Button, CircularProgress, Box, Paper, Grid } from "@mui/material";

import "./GroupEdit.less";
import GroupService from "../../../Services/GroupService";
import { Group } from "../../../Models/Group";

const GroupEdit = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [groupName, setGroupName] = useState<string>("");

    // Fetch group details based on the groupId from params
    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const fetchedGroup = await GroupService.getGroupByIdAsync(groupId!);
                setGroup(fetchedGroup);
                setGroupName(fetchedGroup.name);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch group details.");
                setLoading(false);
            }
        };

        fetchGroup();
    }, [groupId]);

    const handleSaveChanges = async () => {
        try {
            // await GroupService.updateGroup(groupId!, { name: groupName });
            navigate(`/groups/${groupId}`); // Navigate to the group detail page after save
        } catch (err) {
            setError("Failed to update group.");
        }
    };

    if (loading) {
        return (
            <Box className="loading-state" display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="sm" className="group-edit">
            <Paper elevation={3} sx={{ padding: 4 }}>
                <Typography variant="h4" className="title" gutterBottom textAlign="center">
                    Edit Group
                </Typography>

                {error && <Typography color="error" variant="body2" gutterBottom>{error}</Typography>}

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            label="Group Name"
                            variant="outlined"
                            fullWidth
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            margin="normal"
                            InputProps={{
                                style: { fontSize: '16px' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Group Description"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={4}
                            margin="normal"
                            InputProps={{
                                style: { fontSize: '16px' }
                            }}
                        />
                    </Grid>
                </Grid>

                <Box className="action-buttons" mt={3}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveChanges}
                        disabled={!groupName.trim()}
                        fullWidth
                        sx={{
                            padding: "12px 0",
                            fontSize: "16px",
                            backgroundColor: "#3f51b5",
                            '&:hover': {
                                backgroundColor: "#303f9f",
                            }
                        }}
                    >
                        Save Changes
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default GroupEdit;
