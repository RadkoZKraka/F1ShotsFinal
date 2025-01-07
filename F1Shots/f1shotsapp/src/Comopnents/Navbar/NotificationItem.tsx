import React from "react";
import {Button, Stack} from "@mui/material";
import {Notification, NotificationType} from "../../Models/Notification";
import {NotificationService} from "../../Services/NotificationService";
import {log} from "node:util";

interface NotificationItemProps {
    notification: Notification;
    userId?: string;
    onActionCompleted: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({notification, userId, onActionCompleted}) => {
    const toggleRead = async () => {
        try {
            await NotificationService.toggleRead(notification.notificationId);
            onActionCompleted();
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const handleConfirmFriendRequest = async () => {
        try {
            if (userId == null) {
                console.error("User ID is null");
                return;
            }
            
            await NotificationService.confirmFriendRequest(notification.senderUserId);
            onActionCompleted();
        } catch (error) {
            console.error("Failed to confirm friend request:", error);
        }
    };
    const handleRejectFriendRequest = async () => {
        try {
            if (userId == null) {
                console.error("User ID is null");
                return;
            }
            await NotificationService.rejectFriendRequest(notification.senderUserId);
            onActionCompleted();
        } catch (error) {
            console.error("Failed to reject friend request:", error);
        }
    };

    const handleConfirmGroupInviteRequest = async () => {
        try {
            await NotificationService.confirmGroupInviteRequest(notification.groupId);
            onActionCompleted();
        } catch (error) {
            console.error("Failed to confirm group invite request:", error);
        }
    }

    const handleRejectGroupInviteRequest = async () => {
        try {
            await NotificationService.rejectGroupInviteRequest(notification.groupId);
            onActionCompleted();
        } catch (error) {
            console.error("Failed to reject group invite request:", error);
        }
    }

    const handleConfirmGroupJoinRequest = async () => {
        try {
            await NotificationService.confirmGroupJoinRequest(notification.groupId);
            onActionCompleted();
        } catch (error) {
            console.error("Failed to confirm group join request:", error);
        }
    }

    const handleRejectGroupJoinRequest = async () => {
        try {
            await NotificationService.rejectGroupJoinRequest(notification.groupId);
            onActionCompleted();
        } catch (error) {
            console.error("Failed to reject group join request:", error);
        }
    }

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
                {notification.type === NotificationType.GroupInviteRequest && (
                    <>
                        <Button variant="contained" color="primary" size="small"
                                onClick={handleConfirmGroupInviteRequest}>
                            Confirm
                        </Button>
                        <Button variant="outlined" color="secondary" size="small"
                                onClick={handleRejectGroupInviteRequest}>
                            Reject
                        </Button>
                    </>
                )}
                {notification.type === NotificationType.GroupJoinRequest && (
                    <>
                        <Button variant="contained" color="primary" size="small"
                                onClick={handleConfirmGroupJoinRequest}>
                            Confirm
                        </Button>
                        <Button variant="outlined" color="secondary" size="small"
                                onClick={handleRejectGroupJoinRequest}>
                            Reject
                        </Button>
                    </>
                )}
                <Button variant="text" size="small" onClick={toggleRead}>
                    Mark as Read
                </Button>
            </Stack>
        </li>
    );
};

export default NotificationItem;
