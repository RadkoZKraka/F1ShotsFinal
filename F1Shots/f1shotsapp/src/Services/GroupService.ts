import axios, {AxiosError} from "axios";
import {Group} from "../Models/Group";
import {useAuth} from "../AuthContext";

class GroupService {

    private apiClient;


    constructor() {
        this.apiClient = axios.create({
            baseURL: "https://localhost:44388/api/group", // Correct base URL
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

    async getGroupByIdAsync(groupId: string): Promise<Group> {
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
            await this.apiClient.post("https://localhost:44388/api/group/invite-user", {
                username,
                groupId,
            });
        } catch (error) {
            throw error;
        }
    }

    // Modified updateGroup method
    async updateGroup(groupId: string, updatedGroup: {
        name: string;
        public: boolean;
        open: boolean;
        adminUserIds: string[]
    }) {
        try {
            const response = await this.apiClient.put(`/${groupId}`, updatedGroup); // Corrected URL and data
            return response.data;
        } catch (error) {
            console.error("Error updating group:", error);
            throw new Error("Failed to update group");
        }
    }

    async removePlayerFromGroup(groupId: string, userId: string) {
        try {
            const response = await this.apiClient.delete(`/${groupId}/players/${userId}`);
            return response.data;
        } catch (error) {
            throw new Error("Failed to remove player from group.");
        }
    }

    async checkGroupNameExists(groupName: string): Promise<boolean> {
        // API call or database query to check if the group name exists
        // This is just an example of what it might look like:
        try {
            const response = await this.apiClient.get(`/check-name?name=${groupName}`);
            return response.data;
        } catch (error) {
            console.error("Error checking group name:", error);
            return false;
        }
    }

    async deleteGroup(groupId: string) {

    }

    async confirmGroupInvite(groupId: string) {
        try {
            const response = await this.apiClient.post(`/confirm-invite/${groupId}`);
            return response.data;
        } catch (error) {
            console.error("Error checking group name:", error);
            return false;
        }
    }

    async rejectGroupInvite(groupId: string) {
        try {
            await this.apiClient.post(`/reject-invite/${groupId}`);
        } catch (error) {
            console.error("Error checking group name:", error);
            return false;
        }
    }

    async requestGroupJoin(groupName: string) {
        try {
            await this.apiClient.post(`/request-join-group/${groupName}`);
        } catch (error) {
            console.error("Error checking group name:", error);
            return false;
        }
    }

    async checkGroupRelation(groupName: string) {
        try {
            const response = await this.apiClient.get(`/check-group-relation/${groupName}`);
            return response.data;
        } catch (error) {
            console.error("Error checking group name:", error);
            return false;
        }
    }

    async confirmGroupJoinRequest(groupId: string) {
        try {
            await this.apiClient.get(`/confirm-join-group/${groupId}`);

        } catch (error) {
            console.error("Error checking group name:", error);
            return false;
        }
    }

    async rejectGroupJoinRequest(groupId: string) {
        try {
            await this.apiClient.get(`/reject-join-group/${groupId}`);

        } catch (error) {
            console.error("Error checking group name:", error);
            return false;
        }
    }

    async getGroupRelations(groupId: string | undefined) {
        try {
            const response = await this.apiClient.get(`/group-relations/${groupId}`);
            return response.data;
        } catch (error) {
            console.error("Error checking group relations:", error);
            return false;
        }
    }
}


export default new GroupService();
