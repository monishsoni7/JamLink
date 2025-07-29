import { axiosInstance } from "@/lib/axios";
import { Message, User } from "@/types";
import { create } from "zustand";
import { io } from "socket.io-client";

interface ChatStore {
	users: User[];
	isLoading: boolean;
	error: string | null;
	socket: any;
	isConnected: boolean;
	onlineUsers: Set<string>;
	onlineUsersWithTime: Map<string, number>;
	signInTimes: Record<string, number>;
	userActivities: Map<string, string>;
	messages: Message[];
	selectedUser: User | null;

	fetchUsers: () => Promise<void>;
	initSocket: (userId: string) => void;
	disconnectSocket: () => void;
	sendMessage: (receiverId: string, senderId: string, content: string) => void;
	fetchMessages: (userId: string) => Promise<void>;
	setSelectedUser: (user: User | null) => void;
}

const baseURL = import.meta.env.MODE === "development" ? "http://localhost:5000" : import.meta.env.VITE_API_BASE_URL;
const socket = io(baseURL, {
	autoConnect: false,
	withCredentials: true,
});

export const useChatStore = create<ChatStore>((set, get) => ({
	users: [],
	isLoading: false,
	error: null,
	socket,
	isConnected: false,
	onlineUsers: new Set(),
	onlineUsersWithTime: new Map(),
	signInTimes: {},
	userActivities: new Map(),
	messages: [],
	selectedUser: null,

	setSelectedUser: (user) => set({ selectedUser: user }),

	fetchUsers: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/users");
			const users = response.data;
			const signInTimesMap = new Map<string, number>();
			users.forEach((user: any) => {
				if (user.createdAt) {
					signInTimesMap.set(user.clerkId, new Date(user.createdAt).getTime());
				} else {
					signInTimesMap.set(user.clerkId, 0);
				}
			});
			const signInTimesObj: Record<string, number> = {};
			signInTimesMap.forEach((value, key) => {
				signInTimesObj[key] = value;
			});
			set({ users, signInTimes: signInTimesObj });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	initSocket: (userId) => {
		if (!get().isConnected) {
			socket.auth = { userId };
			socket.connect();

			socket.emit("user_connected", userId);

			socket.on("users_online", (users: string[]) => {
				set({ onlineUsers: new Set(users) });
			});

			socket.on("activities", (activities: [string, string][]) => {
				set({ userActivities: new Map(activities) });
			});

			socket.on("user_connected", (userId: string) => {
				set((state) => {
					const newOnlineUsers = new Set([...state.onlineUsers, userId]);
					const newOnlineUsersWithTime = new Map(state.onlineUsersWithTime);
					const newSignInTimes = { ...state.signInTimes };
					if (!newOnlineUsersWithTime.has(userId)) {
						newOnlineUsersWithTime.set(userId, Date.now());
					}
					if (!(userId in newSignInTimes)) {
						newSignInTimes[userId] = Date.now();
					}
					return { onlineUsers: newOnlineUsers, onlineUsersWithTime: newOnlineUsersWithTime, signInTimes: newSignInTimes };
				});
			});

			socket.on("user_disconnected", (userId: string) => {
				set((state) => {
					const newOnlineUsers = new Set(state.onlineUsers);
					newOnlineUsers.delete(userId);
					const newOnlineUsersWithTime = new Map(state.onlineUsersWithTime);
					newOnlineUsersWithTime.delete(userId);
					return { onlineUsers: newOnlineUsers, onlineUsersWithTime: newOnlineUsersWithTime };
				});
			});

			socket.on("receive_message", (message: Message) => {
				const selectedUser = get().selectedUser;
				if (selectedUser && (message.senderId === selectedUser.clerkId || message.receiverId === selectedUser.clerkId)) {
					set((state) => ({ messages: [...state.messages, message] }));
				}
			});

			socket.on("message_sent", (message: Message) => {
				const selectedUser = get().selectedUser;
				if (selectedUser && (message.senderId === selectedUser.clerkId || message.receiverId === selectedUser.clerkId)) {
					set((state) => ({ messages: [...state.messages, message] }));
				}
			});

			socket.on("activity_updated", ({ userId, activity }) => {
				set((state) => {
					const newActivities = new Map(state.userActivities);
					newActivities.set(userId, activity);
					return { userActivities: newActivities };
				});
			});

			set({ isConnected: true });
		}
	},

	disconnectSocket: () => {
		if (get().isConnected) {
			socket.disconnect();
			set({ isConnected: false });
		}
	},

	sendMessage: async (receiverId, senderId, content) => {
		const socket = get().socket;
		if (!socket) return;
		socket.emit("send_message", { receiverId, senderId, content });
	},

	fetchMessages: async (userId: string) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/users/messages/${userId}`);
			set({ messages: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},
}));
