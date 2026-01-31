// Chat area component (Telegram-like)
import { useSocket } from "../../hooks/useSocket";
import { useAuth } from "../../hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import { ChatInfoModal } from "./ChatInfoModal";
import { API_BASE_URL } from "../../utils/constants";
import { getAccessToken } from "../../utils/tokenManager";

export function ChatArea() {
  const { currentChatId, messages, sendMessage, isConnected, chats } = useSocket();
  const { user } = useAuth();
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessages = currentChatId ? messages[currentChatId] || [] : [];

  const currentChat = currentChatId
    ? chats.find((c) => c.id === currentChatId)
    : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Fetch online status for private chats
  useEffect(() => {
    if (currentChatId && currentChat?.type === "private") {
      fetchOtherUserStatus();
    }
  }, [currentChatId, currentChat?.type]);

  const fetchOtherUserStatus = async () => {
    if (!currentChatId || !currentChat || currentChat.type !== "private") return;

    try {
      const token = getAccessToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/chats/${currentChatId}/members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.members) {
          const otherMember = data.members.find((m: any) => m.id !== user?.id);
          setOtherUserOnline(otherMember?.isOnline ?? false);
        }
      }
    } catch (error) {
      console.error("Error fetching user status:", error);
    }
  };

  const handleSend = () => {
    if (inputMessage.trim() && currentChatId) {
      sendMessage(currentChatId, inputMessage);
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  if (!currentChatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a chat to start messaging</h3>
          <p className="text-sm text-gray-500">Choose a conversation from the sidebar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-full min-h-0">
      {/* Chat Header - Clickable */}
      <div 
        className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setShowChatInfo(true)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
            {currentChat?.type === "group" ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            ) : (
              <span>{currentChat?.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{currentChat?.name}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              {currentChat?.type === "group" ? (
                `${currentChat.members.length} members`
              ) : (
                <>
                  {otherUserOnline !== null && (
                    <>
                      <span className={`w-2 h-2 rounded-full ${otherUserOnline ? "bg-green-500" : "bg-gray-400"}`}></span>
                      {otherUserOnline ? "Online" : "Offline"}
                    </>
                  )}
                  {otherUserOnline === null && "Loading..."}
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0">
        {!isConnected && (
          <div className="text-center text-sm text-yellow-600 mb-4">
            Reconnecting...
          </div>
        )}
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {chatMessages.map((message) => {
              const isOwnMessage = message.senderId === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      isOwnMessage
                        ? "bg-blue-500 text-white rounded-br-sm"
                        : "bg-white text-gray-900 rounded-bl-sm border border-gray-200"
                    }`}
                  >
                    {!isOwnMessage && currentChat?.type === "group" && (
                      <p className="text-xs font-semibold mb-1 opacity-75">
                        {message.sender.username || message.sender.email}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || !isConnected}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Info Modal */}
      {currentChatId && currentChat && (
        <ChatInfoModal
          isOpen={showChatInfo}
          onClose={() => setShowChatInfo(false)}
          chatId={currentChatId}
          chatType={currentChat.type}
          chatName={currentChat.name}
        />
      )}
    </div>
  );
}
