import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Group } from "../../../Models/Group";
import GroupService from "../../../Services/GroupService";
import {
    Container,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Button,
    Alert,
    IconButton,
    Box
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material"; // Import the ArrowBack icon
import GroupMembers from "../GroupMembers/GroupMembers";
import ProfileService from "../../../Services/ProfileService";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const GroupPage: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>(); // Get groupId from the URL
    const navigate = useNavigate();
    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any | null>(null);

    // Ensure groupId is a string
    const validGroupId = groupId || ""; // Provide an empty string as fallback if undefined

    // Fetch group details and friends list when the component mounts
    useEffect(() => {
        const fetchGroupDetails = async () => {
            if (!validGroupId) {
                setError("Group ID is missing.");
                setLoading(false);
                return;
            }

            try {
                const groupData = await GroupService.getGroupByIdAsync(validGroupId);
                // If groupData is null or undefined, show unauthorized error
                if (!groupData) {
                    setError("You are not authorized to view this group.");
                } else {
                    setGroup(groupData);
                    const currentUserData = await ProfileService.getUserProfile();
                    setCurrentUser(currentUserData);
                }
            } catch (err) {
                setError("Failed to fetch group details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchGroupDetails();
    }, [validGroupId]);

    const isAdmin = currentUser && group && group.adminUserIds.includes(currentUser.id);

    if (loading) {
        return (
            <Container maxWidth="sm">
                <CircularProgress color="primary" sx={{ display: "block", margin: "20px auto" }} />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm">
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!group) {
        return <p>Group not found.</p>;
    }

    const admins = group.adminUserIds.map((id, index) => ({
        id,
        username: group.adminUserIds[index],
    }));



    const players = group.playersIds.map((id, index) => ({
        id,
        username: group.playersUserNames[index],
    }));

    return (
        <Container maxWidth="md" sx={{ padding: "2rem" }}>
            <Paper sx={{ padding: 3, marginBottom: 3, borderRadius: 2, boxShadow: 3 }}>
                {/* Back Arrow Button */}
                <IconButton
                    onClick={() => navigate(`/groups`)}
                    edge="start"
                    sx={{
                        marginBottom: "1rem",
                        display: "inline-flex",
                        alignItems: "center",
                    }}
                >
                    <ArrowBackIcon />
                </IconButton>

                <Typography variant="h3" gutterBottom align="center" sx={{ fontWeight: 600 }}>
                    {group.name}
                </Typography>

                <Box sx={{ marginBottom: 2 }}>
                    <List>
                        <ListItem>
                            <ListItemText primary="Public Group" secondary={group.public ? "Yes" : "No"} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Open Group" secondary={group.open ? "Yes" : "No"} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Years" secondary={group.years.join(", ")} />
                        </ListItem>
                    </List>
                </Box>

                {/* Group Members Section with constrained width */}
                <Box sx={{ marginBottom: 2, maxWidth: "900px", margin: "0 auto", width:"auto" }}>
                    <GroupMembers admins={admins} players={players} />
                </Box>

                {/* Group Action Buttons */}
                <Box sx={{ textAlign: "center", marginTop: 3 }}>
                    {isAdmin && (
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => navigate(`/group/edit/${validGroupId}`)}
                            sx={{
                                padding: "0.8rem 2rem",
                                fontSize: "1.1rem",
                                borderRadius: "30px",
                                boxShadow: 3,
                                "&:hover": {
                                    backgroundColor: "#d32f2f",
                                },
                            }}
                        >
                            Edit Group
                        </Button>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default GroupPage;
