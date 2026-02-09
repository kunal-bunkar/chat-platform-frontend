// Chat area component
import { useSocket } from "../../hooks/useSocket";
import { useAuth } from "../../hooks/useAuth";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ChatInfoModal } from "./ChatInfoModal";
import { API_BASE_URL } from "../../utils/constants";
import { getAccessToken } from "../../utils/tokenManager";

interface ChatAreaProps {
  onBack?: () => void;
}

export function ChatArea({ onBack }: ChatAreaProps = {}) {
  const { currentChatId, messages, sendMessage, editMessage, deleteMessage, isConnected, chats, isLoadingMessages } = useSocket();
  const { user } = useAuth();
  const [inputMessage, setInputMessage] = useState("");
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState<boolean | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessages = useMemo(() => currentChatId ? messages[currentChatId] || [] : [], [currentChatId, messages]);

  const currentChat = currentChatId
    ? chats.find((c) => c.id === currentChatId)
    : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const fetchOtherUserStatus = useCallback(async () => {
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
  }, [currentChatId, currentChat, user?.id]);

  // Fetch online status for private chats
  useEffect(() => {
    if (currentChatId && currentChat?.type === "private") {
      fetchOtherUserStatus();
    }
  }, [currentChatId, currentChat?.type, fetchOtherUserStatus]);

  const handleSend = () => {
    if (inputMessage.trim() && currentChatId) {
      if (editingMessageId) {
        // Editing existing message
        editMessage(editingMessageId, inputMessage.trim());
        setEditingMessageId(null);
        setInputMessage("");
      } else {
        // Sending new message
        sendMessage(currentChatId, inputMessage);
        setInputMessage("");
      }
    }
  };


  const handleEdit = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setInputMessage(currentContent);
    // Scroll to input area
    setTimeout(() => {
      const inputElement = document.querySelector('textarea[placeholder="Type a message..."]') as HTMLTextAreaElement;
      inputElement?.focus();
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setInputMessage("");
  };

  const handleDelete = (messageId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isConnected) {
      console.error("Socket not connected. Cannot delete message.");
      alert("Connection lost. Please refresh the page.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this message?")) {
      console.log("Deleting message:", messageId, "isConnected:", isConnected);
      deleteMessage(messageId);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const backgroundPattern = "data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 100 0 L 0 0 0 100' fill='none' stroke='%23ffffff' stroke-width='0.5' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E";

  if (!currentChatId) {
    return (
      <div 
        className="flex-1 flex items-center justify-center bg-[#e5ddd5] h-full min-h-0"
        style={{ backgroundImage: `url("${backgroundPattern}")` }}
      >
        <div className="text-center px-4">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-[#0088cc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Welcome to ChatHub</h3>
          <p className="text-sm text-gray-600">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 flex flex-col bg-[#e5ddd5] h-full min-h-0"
      style={{ backgroundImage: `url("${backgroundPattern}")` }}
    >
      {/* Chat Header */}
      <div 
        className="flex-shrink-0 px-4 py-3 bg-white border-b border-gray-200/50 cursor-pointer hover:bg-gray-50/50 transition-colors shadow-sm"
        onClick={() => setShowChatInfo(true)}
      >
        <div className="flex items-center gap-3">
          {/* Mobile back button */}
          {onBack && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBack();
              }}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors -ml-2"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0088cc] to-[#00a8e8] text-white flex items-center justify-center font-semibold shadow-sm">
            {currentChat?.type === "group" ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            ) : (
              <span>{currentChat?.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{currentChat?.name}</h3>
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowChatInfo(true);
            }}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 min-h-0">
        {!isConnected && (
          <div className="text-center text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 mb-4 mx-auto max-w-md">
            Reconnecting...
          </div>
        )}
        {currentChatId && isLoadingMessages[currentChatId] ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-[#0088cc] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 text-sm">Loading messages...</p>
            </div>
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">No messages yet</p>  
              <p className="text-xs text-gray-500">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1 max-w-4xl mx-auto">
            {chatMessages.map((message, index) => {
              const isOwnMessage = message.senderId === user?.id;
              const isHovered = hoveredMessageId === message.id;
              const prevMessage = index > 0 ? chatMessages[index - 1] : null;
              const showAvatar = !isOwnMessage && currentChat?.type === "group" && 
                (prevMessage === null || prevMessage.senderId !== message.senderId);

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} group items-end gap-2`}
                  onMouseEnter={() => setHoveredMessageId(message.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  {showAvatar && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0088cc] to-[#00a8e8] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0 shadow-sm">
                      {(message.sender.username || message.sender.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  {!showAvatar && currentChat?.type === "group" && !isOwnMessage && (
                    <div className="w-8 flex-shrink-0" />
                  )}
                  <div className="relative max-w-[70%] md:max-w-md lg:max-w-lg">
                    <div
                      className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                        message.isDeleted === true
                          ? "bg-gray-200/80 text-gray-500 italic"
                          : isOwnMessage
                          ? "bg-[#0088cc] text-white rounded-br-sm"
                          : "bg-white text-gray-900 rounded-bl-sm"
                      }`}
                    >
                      {!isOwnMessage && currentChat?.type === "group" && message.isDeleted !== true && (
                        <p className="text-xs font-semibold mb-1.5 text-[#0088cc]">
                          {message.sender.username || message.sender.email}
                        </p>
                      )}
                      <p className={`text-sm whitespace-pre-wrap break-words leading-relaxed ${
                        message.isDeleted === true ? "" : isOwnMessage ? "text-white" : "text-gray-900"
                      }`}>
                        {message.isDeleted === true ? "This message was deleted" : message.content}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5 justify-end">
                        <p
                          className={`text-xs ${
                            isOwnMessage ? "text-white/70" : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                        {message.editedAt && message.isDeleted !== true && (
                          <span
                            className={`text-xs ${
                              isOwnMessage ? "text-white/70" : "text-gray-500"
                            }`}
                          >
                            (edited)
                          </span>
                        )}
                        {isOwnMessage && (
                          <svg className={`w-3.5 h-3.5 ${isOwnMessage ? "text-white/70" : "text-gray-500"}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    {/* Edit/Delete buttons */}
                    {isOwnMessage && message.isDeleted !== true && isHovered && (
                      <div className="absolute -top-10 right-0 flex items-center gap-1 bg-white rounded-lg shadow-xl border border-gray-200 p-1 z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEdit(message.id, message.content);
                          }}
                          className="p-2 rounded hover:bg-gray-100 transition-colors"
                          title="Edit message"
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(message.id, e);
                          }}
                          className="p-2 rounded hover:bg-gray-100 transition-colors"
                          title="Delete message"
                        >
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 px-4 py-3 bg-white border-t border-gray-200/50 shadow-lg">
        {editingMessageId && (
          <div className="mb-2 flex items-center justify-between px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-xs text-blue-700 flex items-center gap-2 font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editing message
            </span>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-100 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                } else if (e.key === "Escape" && editingMessageId) {
                  e.preventDefault();
                  handleCancelEdit();
                }
              }}
              placeholder={editingMessageId ? "Edit your message..." : "Type a message..."}
              rows={1}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0088cc] focus:border-[#0088cc] resize-none transition-all"
              style={{ maxHeight: "120px" }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || !isConnected}
            className="p-2.5 rounded-full bg-[#0088cc] text-white hover:bg-[#0077b3] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm flex-shrink-0"
            title={editingMessageId ? "Save changes" : "Send message"}
          >
            {editingMessageId ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
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
