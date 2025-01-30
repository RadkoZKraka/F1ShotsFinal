import React, { useState } from 'react';
import { Box, Button, CircularProgress, Grid, Modal, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GroupService from "../../Services/GroupService";
import FriendshipService from "../../Services/FriendshipService";

interface RequestsSentModalProps {
    isRequestsModalOpen: boolean;
    closeRequestsModal: () => void;
    requests: any[];
}

const RequestsSentModal: React.FC<RequestsSentModalProps> = ({
                                                                 isRequestsModalOpen,
                                                                 closeRequestsModal,
                                                                 requests,
                                                             }) => {
    const [loading, setLoading] = useState(false);

    // Handle cancel request logic inside the modal
    const handleCancelRequest = async (request: any) => {
        setLoading(true);

        try {
            if (request.type === "Group") {
                await cancelGroupRequest(request.groupId);
            } else if (request.type === "User") {
                await cancelUserRequest(request.InitiationUserId);
            }

            closeRequestsModal();
        } catch (error) {
            console.error("Failed to cancel request:", error);
        } finally {
            setLoading(false);
        }
    };

    const cancelGroupRequest = async (groupId: string) => {
        await GroupService.cancelGroupJoinRequest(groupId);
    };

    const cancelUserRequest = async (userId: string) => {
        await FriendshipService.cancelFriendRequest(userId);
    };

    return (
        <Modal open={isRequestsModalOpen} onClose={closeRequestsModal}>
            <Box
                sx={{
                    padding: 4,
                    backgroundColor: "white",
                    borderRadius: 3,
                    width: "90%",
                    maxWidth: "600px",
                    margin: "auto",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    boxShadow: 24,
                }}
            >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", textAlign: "center", marginBottom: 3 }}>
                    Pending Requests
                </Typography>

                {requests.length > 0 ? (
                    <Grid container spacing={2}>
                        {requests.map((request, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                                <Box
                                    sx={{
                                        border: "1px solid #ccc",
                                        borderRadius: 2,
                                        padding: 2,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography variant="body1">
                                        {request.type === "Group"
                                            ? `Request to Join Group: ${request.groupName}`
                                            : `Friend Request from ${request.InitiationUserId}`}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => handleCancelRequest(request)}
                                        sx={{ marginTop: 2 }}
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center", width: "100%" }}>
                        No requests found.
                    </Typography>
                )}

                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", marginTop: 3 }}>
                        <CircularProgress />
                    </Box>
                )}

                <Box sx={{ marginTop: 3, display: "flex", justifyContent: "center" }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={closeRequestsModal}
                        sx={{
                            padding: "10px 20px",
                            fontSize: "16px",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                        }}
                    >
                        Close
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default RequestsSentModal;
