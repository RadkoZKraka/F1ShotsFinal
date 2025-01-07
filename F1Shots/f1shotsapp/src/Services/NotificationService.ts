import axios from "axios";

const baseUrl = "https://localhost:44388/api";

const getAuthToken = () => {
    // Retrieve the token from localStorage, sessionStorage, or any other source
    return localStorage.getItem("authToken"); // Adjust this as needed
};

export class NotificationService {
    static async toggleRead(notificationId: string) {
        try {
            const token = getAuthToken();
            await axios.post(
                `${baseUrl}/notification/toggle-read/${notificationId}`,
                {},
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

    static async confirmFriendRequest(friendId: string) {
        try {
            const token = getAuthToken();
            await axios.post(
                `${baseUrl}/friendship/confirm/${friendId}`,
                {},

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

    static async rejectFriendRequest(friendId: string) {
        try {
            const token = getAuthToken();
            await axios.post(
                `${baseUrl}/friendship/reject/${friendId}`,
                {},
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

    static async confirmGroupInviteRequest(groupId: string) {
        try {
            const token = getAuthToken();
            await axios.post(
                `${baseUrl}/group/confirm-invite/${groupId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error("Failed to confirm group invite request:", error);
            throw error;
        }
    }

    static async rejectGroupInviteRequest(groupId: string) {
        try {
            const token = getAuthToken();
            await axios.post(
                `${baseUrl}/group/reject-invite/${groupId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error("Failed to reject group invite request:", error);
            throw error;
        }
    }

    static async confirmGroupJoinRequest(groupId: string) {
        try {
            const token = getAuthToken();
            await axios.post(
                `${baseUrl}/group/confirm-join-group/${groupId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error("Failed to confirm group join request:", error);
            throw error;
        }
    }

    static async rejectGroupJoinRequest(groupId: string) {
        try {
            const token = getAuthToken();
            await axios.post(
                `${baseUrl}/group/reject-join-group/${groupId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error("Failed to reject group join request:", error);
            throw error;
        }
    }

    static async getFriendRequestNotification(friendUsername: string) {
        try {
            const token = getAuthToken();
            await axios.get(
                `${baseUrl}/notification/get-friend-request`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    data: { friendUsername }
                }
            );
        } catch (error) {
            console.error("Failed to reject friend request:", error);
            throw error;
        }
    }

    static async deleteNotification(notificationId: string) {
        try {
            const token = getAuthToken();
            await axios.delete(
                `${baseUrl}/notification/${notificationId}`,
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
