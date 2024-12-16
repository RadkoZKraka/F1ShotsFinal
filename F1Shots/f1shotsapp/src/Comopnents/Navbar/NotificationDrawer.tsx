import React from "react";
import { useNavigate } from "react-router-dom";
import { Drawer, List, ListItem, ListItemText, Button, Typography } from "@mui/material";
import NotificationItem from "./NotificationItem"; // Import the NotificationItem component
import { Notification } from "../../Models/Notification";

interface NotificationDrawerProps {
    isDrawerOpen: boolean;
    closeDrawer: () => void;
    fetchNotifications: () => Promise<void>;
    markAllChecked: () => void;
    notifications: Notification[];
    error: string | null;
}

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
                                                                   isDrawerOpen,
                                                                   closeDrawer,
                                                                   fetchNotifications,
                                                                   markAllChecked,
                                                                   notifications,
                                                                   error,
                                                               }) => {
    const navigate = useNavigate();

    const handleViewAllNotifications = () => {
        navigate("/notifications"); // Navigate to the /notifications route
    };

    const handleActionCompleted = async () => {
        await fetchNotifications(); // Refresh notifications after an action
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
                },
            }}
        >
            <div className="drawer-content">
                <Typography variant="h6" className="drawer-title">
                    Notifications
                </Typography>
                {error && <Typography color="error">{error}</Typography>}
                {notifications.length > 0 ? (
                    <List>
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onActionCompleted={handleActionCompleted}
                            />
                        ))}
                    </List>
                ) : (
                    <Typography>No new notifications.</Typography>
                )}

                <div className="drawer-buttons">
                    <Button variant="contained" onClick={fetchNotifications}>
                        Get unread notifications
                    </Button>
                    <Button variant="outlined" onClick={() => { handleViewAllNotifications(); closeDrawer(); }}>
                        View All Notifications
                    </Button>
                    <Button variant="contained" color="primary" onClick={markAllChecked}>
                        Mark All Checked
                    </Button>
                </div>

                <Button onClick={closeDrawer} className="closeButton">
                    Close
                </Button>
            </div>
        </Drawer>
    );
};

export default NotificationDrawer;
