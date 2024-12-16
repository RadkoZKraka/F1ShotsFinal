import React from "react";
import { Button, Stack } from "@mui/material";
import { Notification, NotificationType } from "../../Models/Notification";
import {NotificationService} from "../../Services/NotificationService";

interface NotificationItemProps {
    notification: Notification;
    onActionCompleted: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onActionCompleted }) => {
    const handleMarkAsRead = async () => {
        try {
            await NotificationService.markAsRead(notification.id);
            onActionCompleted();
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const handleConfirmFriendRequest = async () => {
        try {
            await NotificationService.confirmFriendRequest(notification.id, notification.userIds[0]);
            onActionCompleted();
        } catch (error) {
            console.error("Failed to confirm friend request:", error);
        }
    };

    const handleRejectFriendRequest = async () => {
        try {
            await NotificationService.rejectFriendRequest(notification.id, notification.userIds[0]);
            onActionCompleted();
        } catch (error) {
            console.error("Failed to reject friend request:", error);
        }
    };

    return (
        <li className="notificationItem">
            <p>{notification.message}</p>
            <Stack direction="row" spacing={2}>
                {notification.type === NotificationType.FriendRequest && (
                    <>
                        <Button variant="contained" color="primary" size="small" onClick={handleConfirmFriendRequest}>
                            Confirm
                        </Button>
                        <Button variant="outlined" color="secondary" size="small" onClick={handleRejectFriendRequest}>
                            Reject
                        </Button>
                    </>
                )}
                <Button variant="text" size="small" onClick={handleMarkAsRead}>
                    Mark as Read
                </Button>
            </Stack>
        </li>
    );
};

export default NotificationItem;
