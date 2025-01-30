import axios, {AxiosError} from "axios";
import {Group} from "../Models/Group";
import {GroupPortfolio} from "../Models/GroupPortfolio";

class GroupPortfolioService {

    private apiClient;

    constructor() {
        this.apiClient = axios.create({
            baseURL: "https://localhost:44388/api/groupportfolio", // Correct base URL
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
    
    async GetGroupPortfolio(groupId: string): Promise<GroupPortfolio> {
        try {
            const response = await this.apiClient.get(`/${groupId}`);
            return response.data;
        } catch (err) {
            console.error("Error fetching group portfolio:", err);
            throw err;
        }
    }
    
}

export default new GroupPortfolioService();