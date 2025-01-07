import React, { useState } from "react";
import axios from "axios";
import "./Notification.less";
import { useNavigate } from "react-router-dom";
import { Notification, NotificationStatus, NotificationType } from "../../../Models/Notification";
import GroupService from "../../../Services/GroupService";
import FriendshipService from "../../../Services/FriendshipService";
import { NotificationService } from "../../../Services/NotificationService";

interface NotificationProps {
    notification: Notification;
    removeNotification: (notificationId: string) => void; // Add this prop type
}

const NotificationCard: React.FC<NotificationProps> = ({ notification, removeNotification  }) => {
    const { notificationId, userIds, senderUserId, groupId, message, type, status, createdAt } = notification;
    const [notificationStatus, setNotificationStatus] = useState(status);
    const navigate = useNavigate();

    const formattedDate = new Date(createdAt).toLocaleString();

    const notificationClass =
        type === NotificationType.FriendRequest
            ? "notificationFriendRequest"
            : type === NotificationType.GroupInviteRequest
                ? "notificationGroupInvite"
                : type === NotificationType.GroupJoinRequest
                    ? "notificationGroupJoinRequest"
                    : "notificationGeneric";

    const statusClass = notificationStatus === NotificationStatus.Unread ? "statusUnread" : "statusRead";

    const isFriendRequest = notificationClass === "notificationFriendRequest";
    const isGroupInvite = notificationClass === "notificationGroupInvite";
    const isGroupJoinRequest = notificationClass === "notificationGroupJoinRequest";

    const handleMarkReadToggle = () => {
        const newStatus =
            notificationStatus === NotificationStatus.Unread ? NotificationStatus.Read : NotificationStatus.Unread;
        setNotificationStatus(newStatus);
        NotificationService.toggleRead(notificationId);
    };

    const handleConfirmRequest = async () => {
        try {
            if (isGroupInvite) {
                await GroupService.confirmGroupInvite(groupId);
            } else if (isGroupJoinRequest) {
                await GroupService.confirmGroupJoinRequest(groupId);
            } else if (isFriendRequest) {
                await FriendshipService.confirmFriendRequest(senderUserId, notificationId);
            }
            setNotificationStatus(NotificationStatus.ReadAndResponded);
        } catch (err) {
            console.error("Error rejecting request:", err);
        }
    };

    const handleRejectRequest = async () => {
        try {
            if (isGroupInvite) {
                await GroupService.rejectGroupInvite(groupId);
            } else if (isGroupJoinRequest) {
                await GroupService.rejectGroupJoinRequest(groupId);
            } else if (isFriendRequest) {
                await FriendshipService.rejectFriendRequest(senderUserId, notificationId);
            }
            setNotificationStatus(NotificationStatus.ReadAndResponded);
        } catch (err) {
            console.error("Error rejecting request:", err);
        }
    };

    const handleVisitGroup = () => {
        navigate(`/group/${notification.groupId}`);
    };

    const handleVisitUser = () => {
        const username = notification.message.split(" ")[0];
        navigate(`/public-profile/${username}`);
    };

    const handleDeleteNotification = async () => {
        try {
            await NotificationService.deleteNotification(notification.notificationId);
            removeNotification(notification.notificationId);
        } catch (err) {
            console.error("Error deleting notification:", err);
        }
    };

    return (
        <div className={`notification ${notificationClass} ${statusClass}`}>
            <button className="deleteNotificationButton" onClick={handleDeleteNotification}>X</button>
            <p className="notificationMessage">{message}</p>
            <span className="notificationDate">{formattedDate}</span>

            {(isFriendRequest || isGroupInvite || isGroupJoinRequest) && (
                <div className="notificationButtons">
                    <button
                        className="notificationButton"
                        onClick={handleMarkReadToggle}
                        disabled={notificationStatus === NotificationStatus.ReadAndResponded}
                    >
                        {notificationStatus === NotificationStatus.Unread ? "Mark Read" : "Mark Unread"}
                    </button>
                    <button
                        className="notificationButton"
                        onClick={handleConfirmRequest}
                        disabled={notificationStatus === NotificationStatus.ReadAndResponded}
                    >
                        Confirm
                    </button>
                    <button
                        className="notificationButton"
                        onClick={handleRejectRequest}
                        disabled={notificationStatus === NotificationStatus.ReadAndResponded}
                    >
                        Reject
                    </button>
                </div>
            )}

            {isFriendRequest && (
                <div className="visitUserButton">
                    <button className="notificationButton" onClick={handleVisitUser}>
                        Visit User
                    </button>
                </div>
            )}

            {(isGroupInvite || isGroupJoinRequest) && (
                <div className="visitGroupButton">
                    <button className="notificationButton" onClick={handleVisitGroup}>
                        Visit Group
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationCard;