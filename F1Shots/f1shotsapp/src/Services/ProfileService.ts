import axios from "axios";
import {User} from "../Models/User";
import {Friend} from "../Models/Friend";

class ProfileService {
    private apiClient;

    constructor() {
        this.apiClient = axios.create({
            baseURL: "https://localhost:44388/api",
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

    async getUserProfile(): Promise<User> {
        try {
            const response = await this.apiClient.get("/user/profile");
            return response.data;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    }

    async getPublicProfiles(): Promise<Friend[]> {
        try {
            const response = await this.apiClient.get("/friendship/public-profiles");
            return response.data;
        } catch (error) {
            console.error("Error fetching public profiles:", error);
            throw error;
        }
    }

    async getRequests() {
        try {
            const response = await this.apiClient.get("/user/requests");
            return response.data;
        } catch (error) {
            console.error("Error fetching public profiles:", error);
            throw error;
        }
    }
}

export default new ProfileService();
