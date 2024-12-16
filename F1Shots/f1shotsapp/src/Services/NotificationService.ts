import axios from "axios";

const baseUrl = "https://localhost:44388/api";

const getAuthToken = () => {
    // Retrieve the token from localStorage, sessionStorage, or any other source
    return localStorage.getItem("authToken"); // Adjust this as needed
};

export class NotificationService {
    static async markAsRead(notificationId: string) {
        try {
            const token = getAuthToken();
            await axios.post(
                `${baseUrl}/notification/mark-as-read`,
                { notificationId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error("Failed to mark as read:", error);
            throw error;
        }
    }

    static async confirmFriendRequest(notificationId: string, friendId: string) {
        try {
            const token = getAuthToken();
            await axios.post(
                `${baseUrl}/friendship/confirm`,
                { friendId, notificationId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error("Failed to confirm friend request:", error);
            throw error;
        }
    }

    static async rejectFriendRequest(notificationId: string, friendId: string) {
        try {
            const token = getAuthToken();
            await axios.post(
                `${baseUrl}/friendship/reject`,
                { notificationId, friendId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error("Failed to reject friend request:", error);
            throw error;
        }
    }
}
