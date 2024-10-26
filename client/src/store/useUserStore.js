import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
    user: null,
    loading: false,
    checkingAuth: true,

    signup: async ({ name, email, password, confirmPassword }) => {
        set({ loading: true });

        if (password !== confirmPassword) {
            set({ loading: false });
            return toast.error("Passwords do not match");
        }

        try {
            const res = await axios.post("/auth/signup", { name, email, password });
            set({ user: res.data, loading: false });
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },

    login: async (email, password) => {
        set({ loading: true });

        try {
            const res = await axios.post("/auth/login", { email, password });
            set({ user: res.data, loading: false });
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },

    logout: async () => {
        try {
            await axios.post("/auth/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            set({ user: null });
        }
    },

    checkAuth: async () => {
        set({ checkingAuth: true });
        try {
            const response = await axios.get("/auth/profile");
            set({ user: response.data, checkingAuth: false });
        } catch (error) {
            console.log(error.message);
            set({ checkingAuth: false, user: null });
        }
    },

    refreshToken: async () => {
        // Keep this check to prevent refresh attempts during initial auth check
        if (get().checkingAuth) return null;
        
        try {
            const response = await axios.post("/auth/refresh_token");
            return response.data;
        } catch (error) {
            set({ user: null });
            throw error;
        }
    }
}));

let refreshPromise = null;
let failedQueue = [];

const processFailedQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    
    failedQueue = [];
};

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Don't attempt refresh if we're still checking initial auth
        if (useUserStore.getState().checkingAuth) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (refreshPromise) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => axios(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            try {
                refreshPromise = useUserStore.getState().refreshToken();
                const data = await refreshPromise;
                
                if (!data) {  // If refresh token returns null (during checkAuth)
                    return Promise.reject(error);
                }
                
                processFailedQueue(null, data);
                return axios(originalRequest);
            } catch (refreshError) {
                processFailedQueue(refreshError, null);
                useUserStore.getState().logout();
                return Promise.reject(refreshError);
            } finally {
                refreshPromise = null;
            }
        }
        
        return Promise.reject(error);
    }
);