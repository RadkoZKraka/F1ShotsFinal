// AllNotificationsPage.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";

// Define the notification type structure
interface Notification {
    id: string;
    userId: string;
    message: string;
    type: string;
    status: string;
    createdAt: string;
}

const AllNotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem("authToken");
                if (!token) {
                    window.location.href = "/login";
                    return;
                }

                const response = await axios.get("https://localhost:44388/api/Notification/all", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setNotifications(response.data);
            } catch (err) {
                console.error("Error fetching notifications:", err);
                setError("Failed to fetch notifications.");
            }
        };

        fetchNotifications();
    }, []);

    return (
        <div>
            <h1>All Notifications</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {notifications.length > 0 ? (
                <ul>
                    {notifications.map((notification) => (
                        <li key={notification.id}>{notification.message}</li>
                    ))}
                </ul>
            ) : (
                <p>No notifications available.</p>
            )}
        </div>
    );
};

export default AllNotificationsPage;
