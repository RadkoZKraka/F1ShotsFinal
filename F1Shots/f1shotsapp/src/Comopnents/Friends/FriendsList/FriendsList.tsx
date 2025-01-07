import React, { useState } from "react";
import { Button, Typography, Paper, Grid, Collapse, Box } from "@mui/material";
import UserCard from "../../Cards/User/UserCard";
import { Friend } from "../../../Models/Friend"; // Import the UserCard component
import './FriendsList.less';

interface FriendsListProps {
    friends: Friend[];
}

const FriendsList: React.FC<FriendsListProps> = ({ friends }) => {
    const [isExpanded, setIsExpanded] = useState(true); // State for toggling visibility

    const handleToggle = () => {
        setIsExpanded((prev) => !prev); // Toggle the expanded state
    };

    return (
        <Box className="friends-list-container">
            <Paper elevation={6} className="friends-paper">
                {/* Header section */}
                <Box className="friends-header">
                    <Typography variant="h5" className="friends-header-title">
                        Friends List
                    </Typography>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleToggle}
                        className="toggle-button"
                        sx={{ width: 'auto' }}
                    >
                        {isExpanded ? "Hide Friends" : "Show Friends"}
                    </Button>
                </Box>

                {/* Friends grid */}
                <Collapse in={isExpanded}>
                    <Box className="friends-grid">
                        {friends.length > 0 ? (
                            <Grid container spacing={4}>
                                {friends.map((friend) => (
                                    <Grid item xs={12} sm={6} md={4} key={friend.id} className="friend-card">
                                        <UserCard username={friend.username} />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Typography variant="h6" color="textSecondary" className="no-friends">
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
