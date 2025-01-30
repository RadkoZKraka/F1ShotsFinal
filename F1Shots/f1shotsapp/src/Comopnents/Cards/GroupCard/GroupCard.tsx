import React, { useState } from "react";
import { Card, CardContent, Typography, Chip, Divider, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Group } from "../../../Models/Group"; // Adjust the path to your Group interface
import UserCard from "../../Cards/User/UserCard"; // UserCard component
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook

interface GroupCardProps {
    id: string;
    name: string;
    playerCount: number;
    playersUserNames: string[]; // Add playersUserNames array to display player names
    years: number[];
    isPublic: boolean;
    isOpen: boolean;
}

const GroupCard: React.FC<GroupCardProps> = ({
                                                 id,
                                                 name,
                                                 playerCount,
                                                 playersUserNames,
                                                 years,
                                                 isPublic,
                                                 isOpen,
                                             }) => {
    const navigate = useNavigate(); // Hook to navigate to group details
    const [openModal, setOpenModal] = useState(false); // State to control the modal visibility

    const handleNavigateToGroup = () => {
        if (!openModal) {
            navigate(`/group/${id}`); // Navigate to the group's detail page if modal is not open
        }
    };

    const handleOpenModal = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the click from navigating to the group
        setOpenModal(true); // Open the modal when button is clicked
    };

    const handleCloseModal = () => {
        setOpenModal(false); // Close the modal when done
    };

    const handleCardClick = (e: React.MouseEvent) => {
        handleNavigateToGroup(); // Navigate to the group detail when clicking anywhere on the card except the modal button
    };

    return (
        <Card
            sx={{ display: "flex", flexDirection: "column", height: "100%", cursor: "pointer" }}
            onClick={handleCardClick} // Make the entire card clickable
        >
            <CardContent>
                <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
                    {name}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, marginTop: 1 }}>
                    <Chip label={`${playerCount} ${playerCount === 1 ? 'Player' : 'Players'}`} color="primary" size="small" />
                    <Chip label={`Year${years.length === 1 ? '' : 's'}: ${years.join(", ")}`} color="secondary" size="small" />
                </Box>

                <Divider sx={{ margin: "10px 0" }} />

                <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Chip
                        label={isPublic ? "Public" : "Private"}
                        color={isPublic ? "success" : "error"}
                        size="small"
                        sx={{ marginBottom: 1 }}
                    />
                    <Chip
                        label={isOpen ? "Open" : "Closed"}
                        color={isOpen ? "primary" : "warning"}
                        size="small"
                    />
                </Box>

                {/* Button to open the modal with player list */}
                <Box sx={{ padding: 2, display: "flex", justifyContent: "flex-start" }}>
                    <Button variant="outlined" onClick={handleOpenModal}>
                        View Players
                    </Button>
                </Box>
            </CardContent>

            {/* Modal (Dialog) to show players */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle>Players</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {playersUserNames.map((player, index) => (
                            <UserCard key={index} username={player} />
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default GroupCard;
