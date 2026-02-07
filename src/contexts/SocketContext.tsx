// Socket.IO context provider
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "../utils/tokenManager";
import { API_BASE_URL, SOCKET_URL } from "../utils/constants";

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  messageType: string;
  editedAt?: string | null;
  isDeleted?: boolean;
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
  isLoadingChats: boolean;
  isLoadingMessages: Record<string, boolean>; // chatId -> loading state
  messages: Record<string, Message[]>; // chatId -> messages
  chats: Chat[];
  currentChatId: string | null;
  setCurrentChatId: (chatId: string | null) => void;
  sendMessage: (chatId: string, content: string) => void;
  editMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  refreshChats: () => Promise<void>;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      return;
    }

    // Validate socket URL before connecting
    if (!SOCKET_URL || SOCKET_URL.includes("undefined") || SOCKET_URL.includes("null")) {
      console.error("Invalid Socket URL:", SOCKET_URL);
      console.error("REACT_APP_API_URL:", process.env.REACT_APP_API_URL);
      return;
    }

    console.log("Connecting to Socket.IO at:", SOCKET_URL);
    const newSocket = io(SOCKET_URL, {
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

    // Handle socket errors
    newSocket.on("error", (error: { message: string }) => {
      console.error("Socket error:", error);
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

    // Handle message edited
    newSocket.on("message_edited", (data: { message: Message }) => {
      setMessages((prev) => {
        const chatMessages = prev[data.message.chatId] || [];
        return {
          ...prev,
          [data.message.chatId]: chatMessages.map((msg) =>
            msg.id === data.message.id ? data.message : msg
          ),
        };
      });
    });

    // Handle message deleted
    newSocket.on("message_deleted", (data: { message: Message }) => {
      setMessages((prev) => {
        const chatMessages = prev[data.message.chatId] || [];
        return {
          ...prev,
          [data.message.chatId]: chatMessages.map((msg) =>
            msg.id === data.message.id ? data.message : msg
          ),
        };
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Load chats on mount and when socket connects
  const refreshChats = async () => {
    try {
      setIsLoadingChats(true);
      const token = getAccessToken();
      if (!token) {
        setIsLoadingChats(false);
        return;
      }

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
    } finally {
      setIsLoadingChats(false);
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
        setIsLoadingMessages((prev) => ({ ...prev, [currentChatId]: true }));
        const token = getAccessToken();
        if (!token) {
          setIsLoadingMessages((prev) => ({ ...prev, [currentChatId]: false }));
          return;
        }

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
      } finally {
        setIsLoadingMessages((prev) => ({ ...prev, [currentChatId]: false }));
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

  const editMessage = (messageId: string, content: string) => {
    if (!socket || !isConnected) {
      console.error("Socket not connected. Cannot edit message.");
      return;
    }
    if (!content.trim()) {
      console.error("Content is required to edit message.");
      return;
    }
    console.log("Emitting edit_message:", { messageId, content: content.trim() });
    socket.emit("edit_message", {
      messageId,
      content: content.trim(),
    });
  };

  const deleteMessage = (messageId: string) => {
    if (!socket || !isConnected) {
      console.error("Socket not connected. Cannot delete message.");
      return;
    }
    console.log("Emitting delete_message:", { messageId });
    socket.emit("delete_message", {
      messageId,
    });
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
        isLoadingChats,
        isLoadingMessages,
        messages,
        chats,
        currentChatId,
        setCurrentChatId,
        sendMessage,
        editMessage,
        deleteMessage,
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