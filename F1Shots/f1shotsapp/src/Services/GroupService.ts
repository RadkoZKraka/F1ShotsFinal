import axios, {AxiosError} from "axios";
import {Group} from "../Models/Group";

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
            console.error("Error fetching public groups:", err);
            throw err;
        }
    }
    async getPublicGroupsByUsername(username: string | any): Promise<any[]> {
        try {
            const response = await this.apiClient.get(`/public-group/${username}`);
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
        try {
            await this.apiClient.delete(`/${groupId}`);
        } catch (error) {
            console.error("Error deleting group:", error);
            throw new Error("Failed to delete group");
        }
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

    async checkGroupRelation(groupName: string  | undefined) {
        try {
            const response = await this.apiClient.get(`/check-group-relation/${groupName}`);
            return response.data;
        } catch (error) {
            console.error("Error checking group name:", error);
            return false;
        }
    }

    async confirmGroupJoinRequest(notificationGuid: string) {
        try {
            await this.apiClient.get(`/confirm-join-group/${notificationGuid}`);

        } catch (error) {
            console.error("Error checking group name:", error);
            return false;
        }
    }

    async rejectGroupJoinRequest(notificationGuid: string) {
        try {
            await this.apiClient.get(`/reject-join-group/${notificationGuid}`);

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

    async banUserFromGroup(groupId: string, username: string) {
        try {
            const response = await this.apiClient.post(`/ban-from-group/${groupId}/${username}`);
            return response.data;
        } catch (error) {
            console.error("Error checking group relations:", error);
            return false;
        }
    }

    async getBannedUsers(groupId: string | undefined) {
        try {
            const response = await this.apiClient.get(`/banned-users/${groupId}`);
            return response.data;
        } catch (error) {
            console.error("Error getting banned users:", error);
            return false;
        }
        
    }

    async unbanUserFromGroup(groupId: string, userId: string) {
        try {
            const response = await this.apiClient.post(`/unban-from-group/${groupId}/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Error unbanning user:", error);
            return false;
        }
    }

    async cancelGroupInvite(notificationGuid: string) {
        try {
            await this.apiClient.post(`/cancel-group-invite/${notificationGuid}`);
        } catch (error) {
            console.error("Error cancelling group invite:", error);
            return false;
        }
    }

    async banGroup(groupId: string | undefined) {
        try {
            await this.apiClient.post(`/ban-group/${groupId}`);
        } catch (error) {
            console.error("Error banning the group:", error);
            return false;
        }
    }

    async leaveGroup(groupId: string | undefined) {
        try {
            await this.apiClient.post(`/leave-group/${groupId}`);
        } catch (error) {
            console.error("Error leaving the group:", error);
            return false;
        }
    }

    async unbanGroup(groupId: string) {
        try {
            await this.apiClient.post(`/unban-group/${groupId}`);
        } catch (error) {
            console.error("Error unbanning group:", error);
            return false;
        }
    }

    async getBannedGroupsByUser() {
        try {
            const response = await this.apiClient.post(`/banned-groups`);
            return response.data;
        } catch (error) {
            console.error("Error getting banned groups:", error);
            return false;
        }
    }

    async cancelGroupJoinRequest(groupId: string) {
        try {
            const response = await this.apiClient.post(`/cancel-group-join-request/${groupId}`);
            return response.data;
        } catch (error) {
            console.error("Error getting banned groups:", error);
            return false;
        }
    }

    async cancelGroupInviteByGroupIdAndFriendId(groupId: string, friendId: string) {
        try {
            await this.apiClient.post(`/cancel-group-invite/${groupId}/${friendId}`);
        } catch (error) {
            console.error("Error cancelling group invite:", error);
            return false;
        }
    }

    async checkGroupRelationOfUser(username: string, groupId: string) {
        try {
            const response = await this.apiClient.post(`/check-relation-user/${username}/${groupId}`);
            return response.data;
        } catch (error) {
            console.error("Error getting banned groups:", error);
            return false;
        }
    }
}


export default new GroupService();
