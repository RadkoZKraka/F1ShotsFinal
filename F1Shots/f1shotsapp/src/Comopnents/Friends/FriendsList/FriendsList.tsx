import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Paper, Grid, Collapse, Box } from "@mui/material";
import UserCard from "../../Cards/User/UserCard";
import { Friend } from "../../../Models/Friend"; // Import the UserCard component

interface FriendsListProps {
    friends: Friend[];
}

const FriendsList: React.FC<FriendsListProps> = ({ friends }) => {
    const [isExpanded, setIsExpanded] = useState(true); // State for toggling visibility
    const navigate = useNavigate();

    const handleToggle = () => {
        setIsExpanded((prev) => !prev); // Toggle the expanded state
    };

    return (
        <Box sx={{ maxWidth: "1200px", margin: "0 auto", padding: 3 }}>
            <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleToggle}
                    sx={{
                        marginBottom: 2,
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        fontSize: "16px",
                        textTransform: "none",
                    }}
                >
                    {isExpanded ? "Hide Friends" : "Show Friends"}
                </Button>

                <Collapse in={isExpanded}>
                    <Box>
                        {friends.length > 0 ? (
                            <Grid container spacing={3}>
                                {friends.map((friend) => (
                                    <Grid item xs={12} sm={6} md={4} key={friend.id}>
                                        <UserCard username={friend.username} />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Typography variant="h6" color="textSecondary" align="center" sx={{ marginTop: 2 }}>
                                No friends found.
                            </Typography>
                        )}
                    </Box>
                </Collapse>
            </Paper>
        </Box>
    );
};

export default FriendsList;
