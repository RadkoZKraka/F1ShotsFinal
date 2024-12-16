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
    async getFriendshipStatus(username: string): Promise<number> {
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
            await this.apiClient.post("/add", { friendUsername: username });
        } catch (err) {
            console.error("Error sending friend request:", err);
            throw err;
        }
    }

    async confirmFriendRequest(username: string): Promise<void> {
        try {
            await this.apiClient.post("/confirm", { friendUsername: username });
        } catch (err) {
            console.error("Error confirming friend request:", err);
            throw err;
        }
    }

    async rejectFriendRequest(username: string): Promise<void> {
        try {
            await this.apiClient.post("/reject", { friendUsername: username });
        } catch (err) {
            console.error("Error rejecting friend request:", err);
            throw err;
        }
    }

    async banUser(username: string) {
        
    }
}

export default new FriendshipService();
