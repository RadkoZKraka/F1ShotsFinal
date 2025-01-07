import axios from "axios";

class FriendshipService {
    private apiClient;

    constructor() {
        this.apiClient = axios.create({
            baseURL: "https://localhost:44388/api/friendship",
        });

        // Attach the token to every request
        this.apiClient.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem("authToken");
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                console.error("Error attaching token to request:", error);
                return Promise.reject(error);
            }
        );
    }

    async getAllFriends(): Promise<any[]> {
        try {
            const response = await this.apiClient.get("/all");
            return response.data;
        } catch (err) {
            console.error("Error fetching friends:", err);
            throw err;
        }
    }

    async getFriendshipStatus(username: string) {
        try {
            const response = await this.apiClient.get(`/check-friend-request/${username}`);

            return response.data;
        } catch (err) {
            console.error("Error checking friend request:", err);
            throw err;
        }
    }

    async addFriend(username: string): Promise<void> {
        try {
            await this.apiClient.post("/add", {friendUsername: username});
        } catch (err) {
            console.error("Error sending friend request:", err);
            throw err;
        }
    }

    async confirmFriendRequest(username: string, notificationId : string): Promise<void> {
        try {
            await this.apiClient.post("/confirm", {friendUsername: username, notificationId: notificationId});
        } catch (err) {
            console.error("Error confirming friend request:", err);
            throw err;
        }
    }

    async rejectFriendRequest(friendId: string, notificationId: string): Promise<void> {
        try {
            await this.apiClient.post("/reject", {friendId: friendId, notificationId: notificationId});
        } catch (err) {
            console.error("Error rejecting friend request:", err);
            throw err;
        }
    }

    async banUser(username: string) {
        try {
            await this.apiClient.post(`/ban/${username}`);
        } catch (err) {
            console.error("Error banning profile:", err);
            throw err;
        }
    }

    async unbanUser(username: string) {
        try {
            await this.apiClient.post(`/unban/${username}`);
        } catch (err) {
            console.error("Error unbanning profile:", err);
            throw err;
        }
    }

    async getFriendsInvited(groupId: string | undefined) {
        try {
            const response = await this.apiClient.get(`/friends-invited/${groupId}`);
            return response.data;
        } catch (err) {
            console.error("Error sending friend request:", err);
            throw err;
        }
    }


    async deleteFriend(username: string) {
        try {
            const response = await this.apiClient.post(`/delete-friend/${username}`);
            return response.data;
        } catch (err) {
            console.error("Error sending friend request:", err);
            throw err;
        }
    }

    async getBannedUsers() {
        try {
            const response = await this.apiClient.get(`/banned-users`);
            return response.data;
        } catch (err) {
            console.error("Error getting banned users:", err);
            throw err;
        }
    }

    async cancelFriendRequest(username: string) {
        try {
            const response = await this.apiClient.post(`/cancel-request/${username}`);
            return response.data;
        } catch (err) {
            console.error("Error getting banned users:", err);
            throw err;
        }
    }
}

export default new FriendshipService();
