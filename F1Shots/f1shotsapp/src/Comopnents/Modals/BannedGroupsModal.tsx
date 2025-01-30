import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Grid, Typography, CircularProgress } from "@mui/material";
import GroupService from "../../Services/GroupService"; // Assuming you have a service for group actions

interface BannedGroupsModalProps {
    onClose: () => void;
}

const BannedGroupsModal: React.FC<BannedGroupsModalProps> = ({ onClose }) => {
    const [bannedGroups, setBannedGroups] = useState<any[]>([]); // Array to store banned groups
    const [loading, setLoading] = useState(false);
    const [groupToBan, setGroupToBan] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [banningGroup, setBanningGroup] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null); // Create a ref for the input field
    
    
    // Fetch banned groups when modal is open
    useEffect(() => {
        const fetchBannedGroups = async () => {
            setLoading(true);
            try {
                const bannedGroups = await GroupService.getBannedGroupsByUser(); // Assuming this API fetches banned groups
                console.log(bannedGroups);
                setBannedGroups(bannedGroups); // Assuming response contains a list of banned groups
            } catch (err) {
                setError("Failed to load banned groups.");
            } finally {
                setLoading(false);
            }
        };

        fetchBannedGroups();

        // Focus the input field after the modal has rendered
        const focusInput = () => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        };

        // Using a small timeout to ensure the modal has fully rendered
        const timer = setTimeout(focusInput, 100);

        return () => clearTimeout(timer); // Cleanup the timeout
    }, []);

    const handleUnbanGroup = async (groupId: string) => {
        try {
            await GroupService.unbanGroup(groupId); // Assuming unban method is available in GroupService
            setBannedGroups((prev) => prev.filter((group) => group.id !== groupId));
        } catch (err) {
            console.error("Failed to unban group:", err);
        }
    };

    const handleBanGroup = async () => {
        if (!groupToBan.trim()) {
            setError("Group name cannot be empty.");
            return;
        }

        setBanningGroup(true);
        setError(null);

        try {
            // Assuming you call a service method to ban a group
            await GroupService.banGroup(groupToBan);

            setBannedGroups((prev) => [...prev, { name: groupToBan, id: groupToBan }]); // Simulating a newly banned group
            setGroupToBan(""); // Clear input field
        } catch (err) {
            setError("Failed to ban group. Please try again.");
            console.error(err);
        } finally {
            setBanningGroup(false);
        }
    };

    return (
        <Dialog open={true} onClose={onClose}>
            <DialogContent>
                {loading ? (
                    <CircularProgress />
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Banned Groups
                        </Typography>
                        <Grid container spacing={2}>
                            {bannedGroups.length > 0 ? (
                                bannedGroups.map((group) => (
                                    <Grid item xs={12} sm={6} md={4} key={group.id}>
                                        <Typography>{group.name}</Typography>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleUnbanGroup(group.id)}
                                            fullWidth
                                        >
                                            Unban Group
                                        </Button>
                                    </Grid>
                                ))
                            ) : (
                                <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center", width: "100%" }}>
                                    No banned groups found.
                                </Typography>
                            )}
                        </Grid>

                        <Typography variant="h6" gutterBottom sx={{ marginTop: 2 }}>
                            Ban a Group by Name
                        </Typography>

                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Enter group name"
                            value={groupToBan}
                            onChange={(e) => setGroupToBan(e.target.value)}
                            margin="normal"
                            inputRef={inputRef} // Ref to focus the input field
                        />
                        {error && (
                            <Typography variant="body2" color="error" sx={{ marginTop: 1, textAlign: "center" }}>
                                {error}
                            </Typography>
                        )}
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
                <Button
                    onClick={handleBanGroup}
                    color="error"
                    disabled={banningGroup || !groupToBan.trim()}
                >
                    {banningGroup ? <CircularProgress size={24} /> : "Ban Group"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BannedGroupsModal;
