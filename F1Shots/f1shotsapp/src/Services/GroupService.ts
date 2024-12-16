import axios, {AxiosError} from "axios";
import {Group} from "../Models/Group";

class GroupService {
    private apiClient;

    constructor() {
        this.apiClient = axios.create({
            baseURL: "https://localhost:44388/api/group",
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
    async getGroupByIdAsync(groupId : string): Promise<Group> {
        try {
            const response = await this.apiClient.get(`/${groupId}`);
            return response.data;
        } catch (err) {
            console.error("Error fetching group:", err);
            throw err;
        }
    }
    async getMyGroups(): Promise<any[]> {
        try {
            const response = await this.apiClient.get("/mygroups");
            if (response.data === "No groups found for the user.") {
                return [];
            }
            return response.data;
        } catch (err) {
            console.error("Error fetching groups:", err);
            throw err;
        }
    }    
    async getPublicGroups(): Promise<any[]> {
        try {
            const response = await this.apiClient.get("/public-groups");
            return response.data;
        } catch (err) {
            console.error("Error fetching groups:", err);
            throw err;
        }
    }

    async createGroup(groupData: Group): Promise<string> {
        try {
            await this.apiClient.post("", groupData);
        } catch (err: unknown) {
            // Type assertion to AxiosError
            const axiosError = err as AxiosError;

            if (axiosError.response && axiosError.response.status === 409) {
                return "exists";
            } else {
                // Handle other errors
                console.error("Error creating group:", axiosError);
                throw axiosError;
            }
            
        }
        return 'created';
    }

    async addUserToGroup(groupId: string, username: string) {
        try {
            await axios.post("https://localhost:44388/api/group/add-user", {
                groupId,
                username,
            });
        } catch (error) {
            throw error;
        }
    }

    async updateGroup(s: string, param2: { name: string; description: any }) {
        
    }
}

export default new GroupService();
