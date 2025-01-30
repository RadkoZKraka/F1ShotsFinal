import React from "react";
import { useNavigate } from "react-router-dom";
import { Drawer, List, ListItem, ListItemText, Button, Typography, Divider } from "@mui/material";
import NotificationItem from "../NotificationItem";
import { Notification } from "../../../Models/Notification";
import { useContext } from "react";
import { RefreshContext } from "../../Layout/Layout"; // Import the context

interface NotificationDrawerProps {
    isDrawerOpen: boolean;
    closeDrawer: () => void;
    fetchNotifications: () => Promise<void>;
    userId?: string;
    markAllChecked: () => void;
    notifications: Notification[];
    error: string | null;
}



const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
                                                                   isDrawerOpen,
                                                                   closeDrawer,
                                                                   fetchNotifications,
                                                                   userId,
                                                                   markAllChecked,
                                                                   notifications,
                                                                   error,
                                                               }) => {
    const navigate = useNavigate();
    const { triggerRefresh } = useContext(RefreshContext); // Access the triggerRefresh function
    const handleViewAllNotifications = () => {
        navigate("/notifications"); // Navigate to the /notifications route
    };

    const handleMarkAllChecked = () => {
        markAllChecked(); // Clear notifications
        triggerRefresh(); // Notify the context to trigger a refresh
    };

    const handleActionCompleted = async () => {
        await fetchNotifications(); // Refresh notifications after an action
        triggerRefresh(); // Notify the context to trigger a refresh
    };

    return (
        <Drawer
            anchor="right"
            open={isDrawerOpen}
            onClose={closeDrawer}
            sx={{
                "& .MuiDrawer-paper": {
                    width: 350, // Set a fixed width for the drawer
                    maxWidth: "90%", // Ensure it doesn't exceed the viewport width
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)", // Add subtle shadow for depth
                    transition: "all 0.3s ease-in-out", // Smooth transition
                },
            }}
        >
            <div className="drawer-content">
                <Typography variant="h6" className="drawer-title">
                    Notifications
                </Typography>

                {error && <Typography color="error" className="error-message">{error}</Typography>}

                {/* Notifications List */}
                {notifications.length > 0 ? (
                    <List>
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.notificationId}
                                notification={notification}
                                userId={userId}
                                onActionCompleted={handleActionCompleted} // Refresh context when actions complete
                            />
                        ))}
                    </List>
                ) : (
                    <Typography>No new notifications.</Typography>
                )}

                {/* Divider to separate actions from the content */}
                <Divider sx={{ margin: "20px 0" }} />

                {/* Drawer Buttons */}
                <div className="drawer-buttons">
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={fetchNotifications}
                        sx={{ marginBottom: "10px" }}
                    >
                        Get unread notifications
                    </Button>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => {
                            handleViewAllNotifications();
                            closeDrawer();
                        }}
                        sx={{ marginBottom: "10px" }}
                    >
                        View All Notifications
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleMarkAllChecked} // Call the updated function
                        sx={{ marginBottom: "10px" }}
                    >
                        Mark All Checked
                    </Button>
                </div>

                {/* Close Button */}
                <Button
                    onClick={closeDrawer}
                    className="closeButton"
                    variant="text"
                    sx={{
                        alignSelf: "flex-end",
                        color: "gray",
                        fontWeight: "bold",
                        padding: "8px",
                        textTransform: "none",
                    }}
                >
                    Close
                </Button>
            </div>
        </Drawer>
    );
};

export default NotificationDrawer;
