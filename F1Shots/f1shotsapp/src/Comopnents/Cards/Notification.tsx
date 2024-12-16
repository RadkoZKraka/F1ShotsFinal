import React, { useState } from "react";
import axios from "axios";
import "./Notification.less";
import { Notification as NotificationModel, NotificationStatus, NotificationType } from "../../Models/Notification"; // Import the model

interface NotificationProps {
    notification: NotificationModel; // Use the Notification type from the model
}

const Notification: React.FC<NotificationProps> = ({ notification }) => {
    const { id, userIds, senderUserId , message, type, status, createdAt } = notification;
    const [notificationStatus, setNotificationStatus] = useState(status); // Local state for the notification status

    // Format date to a more readable format
    const formattedDate = new Date(createdAt).toLocaleString();

    // Define styles based on notification type and status
    const notificationClass = type === NotificationType.FriendRequest ? "notificationFriendRequest" : "notificationGeneric";
    const statusClass = notificationStatus === NotificationStatus.Unread ? "statusUnread" : "statusRead";

    // Check if the message contains "has sent you a friend request"
    const isFriendRequest = message.toLowerCase().includes("has sent you a friend request");

    const handleMarkRead = () => {
        setNotificationStatus(NotificationStatus.Read);
        // Here you could make an API call to mark the notification as read if needed
    };

    const handleConfirmRequest = async () => {
        try {
            const response = await axios.post(
                `https://localhost:44388/api/Friendship/confirm`, // API endpoint for confirming the friend request
                {
                    notificationId: id, // Pass the notification ID
                    friendId: senderUserId, // Pass the friend ID
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    },
                }
            );

            if (response.status === 200) {
                setNotificationStatus(NotificationStatus.Read);
            }
        } catch (err) {
            console.error("Error confirming friend request:", err);
        }
    };

    const handleRejectRequest = async () => {
        try {
            const response = await axios.post(
                `https://localhost:44388/api/Friendship/reject`, // API endpoint for rejecting the friend request
                {
                    notificationId: id, // Pass the notification ID
                    friendId: userIds[0], // Pass the friend ID
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    },
                }
            );

            if (response.status === 200) {
                setNotificationStatus(NotificationStatus.Read);
            }
        } catch (err) {
            console.error("Error rejecting friend request:", err);
        }
    };

    return (
        <div className={`notification ${notificationClass} ${statusClass}`}>
            <p className="notificationMessage">{message}</p>
            <span className="notificationDate">{formattedDate}</span>

            {/* Only show these buttons if it's a friend request notification */}
            {isFriendRequest && (
                <div className="notificationButtons">
                    <button className="notificationButton" onClick={handleMarkRead}>Mark Read</button>
                    <button className="notificationButton" onClick={handleConfirmRequest}>Confirm</button>
                    <button className="notificationButton" onClick={handleRejectRequest}>Reject</button>
                </div>
            )}
        </div>
    );
};

export default Notification;
