import React, {useEffect, useState} from "react";
import axios from "axios";
import NotificationCard from '../Cards/Notification/NotificationCard';
import {Notification as NotificationModel, NotificationStatus, NotificationType} from "../../Models/Notification"; // Import the model

const NotificationPage: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationModel[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showUnread, setShowUnread] = useState(true); // State for the unread filter
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get("https://localhost:44388/api/Notification/all", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                // Destructure the response to get the arrays

                const {notifications, notificationIds, groupIds, userIds, senderUserIds} = response.data;
                
                // Map the notifications array using the corresponding notificationIds and userIds
                const mappedNotifications: NotificationModel[] = notifications.map((notification: any, index: number) => ({
                    notificationId: notificationIds[index], // Use notificationIds for the ID
                    userId: userIds[index],     // Use userIds for the userId
                    senderUserId: senderUserIds[index],     // Use userIds for the userId
                    groupId: groupIds[index],     // Use userIds for the userId
                    message: notification.message,
                    type: notification.type,
                    status: notification.status,
                    createdAt: notification.createdAt,
                }));
                // Update the state with the mapped notifications
                setNotifications(mappedNotifications);
            } catch (err) {
                console.error("Error fetching notifications:", err);
                setError("Failed to fetch notifications.");
            }
        };


        fetchNotifications();
    }, [token]);

    // Filter notifications based on the unread state
    const filteredNotifications = notifications.filter((notification) => {
        if (showUnread) {
            return notification.status === NotificationStatus.Unread;  // Only show unread notifications
        }
        return true; // Show all notifications if the filter is off
    });

    const removeNotification = (notificationId: string) => {
        setNotifications((prevNotifications) =>
            prevNotifications.filter((notif) => notif.notificationId !== notificationId)
        );
    };

    return (
        <div>
            <h2>All Notifications</h2>

            {/* Switch to filter unread notifications */}
            <div className="filterSwitch">
                <label>
                    <input
                        type="checkbox"
                        checked={showUnread}
                        onChange={() => setShowUnread(!showUnread)} // Toggle the filter state
                    />
                    Show Unread Notifications Only
                </label>
            </div>

            {error && <p style={{color: "red"}}>{error}</p>}

            {filteredNotifications.length > 0 ? (
                <div className="notificationList">
                    {filteredNotifications.map((notification) => (
                        <NotificationCard key={notification.notificationId} notification={notification} removeNotification={removeNotification}/>
                    ))}
                </div>
            ) : (
                <p>No notifications available.</p>
            )}
        </div>
    );
};

export default NotificationPage;
