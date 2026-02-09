// Chat sidebar component
import { useSocket } from "../../hooks/useSocket";
import { useState } from "react";

interface ChatSidebarProps {
  onSelectChat: (chatId: string) => void;
  onCreatePersonal: () => void;
  onCreateGroup: () => void;
  onLogout: () => void;
  user: { id: string; email: string; username?: string | null } | null;
}

export function ChatSidebar({ onSelectChat, onCreatePersonal, onCreateGroup, onLogout, user }: ChatSidebarProps) {
  const { chats, currentChatId, isLoadingChats } = useSocket();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white border-r border-gray-200/50">
      {/* Header */}
      <div className="flex-shrink-0 bg-[#0088cc] text-white px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">ChatHub</h2>
          <div className="flex gap-1">
            <button
              onClick={onCreatePersonal}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title="New Personal Chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <button
              onClick={onCreateGroup}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title="New Group Chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                title="Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.username || user?.email}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 text-sm bg-white/20 backdrop-blur-sm text-white placeholder:text-white/70 rounded-lg border border-white/30 focus:outline-none focus:bg-white/30 focus:border-white/50 transition-all"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {isLoadingChats ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-[#0088cc] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500">Loading chats...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 mb-1">
              {searchQuery ? "No chats found" : "No chats yet"}
            </p>
            {!searchQuery && (
              <p className="text-xs text-gray-400">Start a conversation to get started!</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 active:bg-gray-100 ${
                  currentChatId === chat.id ? "bg-blue-50/50 border-l-4 border-l-[#0088cc]" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#0088cc] to-[#00a8e8] text-white flex items-center justify-center font-semibold text-lg shadow-sm">
                    {chat.type === "group" ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                    ) : (
                      <span>{chat.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{chat.name}</h3>
                      {chat.lastMessageAt && (
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTime(chat.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage.senderId === user?.id ? (
                          <span className="text-gray-500">You: </span>
                        ) : null}
                        {chat.lastMessage.content}
                      </p>
                    )}
                    {!chat.lastMessage && (
                      <p className="text-xs text-gray-400 italic">No messages yet</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
