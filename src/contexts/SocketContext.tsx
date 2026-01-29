// Socket.IO context provider
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "../utils/tokenManager";
import { API_BASE_URL } from "../utils/constants";

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  messageType: string;
  createdAt: string;
  sender: {
    id: string;
    email: string;
    username: string | null;
  };
}

export interface Chat {
  id: string;
  type: "private" | "group";
  name: string;
  members: string[];
  lastMessage: Message | null;
  lastMessageAt: string | null;
  createdAt: string;
}

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  messages: Record<string, Message[]>; // chatId -> messages
  chats: Chat[];
  currentChatId: string | null;
  setCurrentChatId: (chatId: string | null) => void;
  sendMessage: (chatId: string, content: string) => void;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  refreshChats: () => Promise<void>;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      return;
    }

    const socketUrl = API_BASE_URL.replace("/api", "");
    const newSocket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    // Handle new messages
    newSocket.on("new_message", (data: { message: Message }) => {
      setMessages((prev) => {
        const chatMessages = prev[data.message.chatId] || [];
        return {
          ...prev,
          [data.message.chatId]: [...chatMessages, data.message],
        };
      });
    });

    // Handle chat updates
    newSocket.on("chat_updated", (data: { chatId: string; lastMessage: Message | null; lastMessageAt: string | null }) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === data.chatId
            ? {
                ...chat,
                lastMessage: data.lastMessage,
                lastMessageAt: data.lastMessageAt,
              }
            : chat
        )
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Load chats on mount and when socket connects
  const refreshChats = async () => {
    try {
      const token = getAccessToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/chats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setChats(data.chats);
        }
      }
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  };

  useEffect(() => {
    if (isConnected) {
      refreshChats();
    }
  }, [isConnected]);

  // Load messages for current chat
  useEffect(() => {
    if (!currentChatId || !isConnected) return;

    const loadMessages = async () => {
      try {
        const token = getAccessToken();
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/messages/chat/${currentChatId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setMessages((prev) => ({
              ...prev,
              [currentChatId]: data.messages,
            }));
          }
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    loadMessages();
  }, [currentChatId, isConnected]);

  // Join chat when currentChatId changes
  useEffect(() => {
    if (socket && currentChatId) {
      socket.emit("join_chat", { chatId: currentChatId });
    }
  }, [socket, currentChatId]);

  const sendMessage = (chatId: string, content: string) => {
    if (socket && content.trim()) {
      socket.emit("send_message", {
        chatId,
        content: content.trim(),
        messageType: "text",
      });
    }
  };

  const joinChat = (chatId: string) => {
    if (socket) {
      socket.emit("join_chat", { chatId });
    }
  };

  const leaveChat = (chatId: string) => {
    if (socket) {
      socket.emit("leave_chat", { chatId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        messages,
        chats,
        currentChatId,
        setCurrentChatId,
        sendMessage,
        joinChat,
        leaveChat,
        refreshChats,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}