// Modal for creating personal or group chats
import { useState, useEffect } from "react";
import { useSocket } from "../../hooks/useSocket";
import { getAccessToken } from "../../utils/tokenManager";
import { API_BASE_URL } from "../../utils/constants";
import { useNavigate } from "react-router-dom";

// Use the centralized API_BASE_URL constant
const getApiBaseUrl = () => API_BASE_URL;

interface CreateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "personal" | "group";
}

interface User {
  id: string;
  email: string;
  username: string | null;
  createdAt?: string;
}

export function CreateChatModal({ isOpen, onClose, type }: CreateChatModalProps) {
  const { refreshChats, setCurrentChatId } = useSocket();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]); // Store full user objects
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectedUsers([]);
      setGroupName("");
      setUsers([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchQuery.trim()) {
      const searchUsers = async () => {
        try {
          const token = getAccessToken();
          if (!token) {
            navigate("/login");
            return;
          }

          const response = await fetch(`${getApiBaseUrl()}/users/search?query=${encodeURIComponent(searchQuery)}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.status === 401) {
            // Token expired, redirect to login
            navigate("/login");
            return;
          }

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              // Filter out already selected users from search results
              const selectedIds = selectedUsers.map(u => u.id);
              const filteredUsers = data.users.filter((user: User) => !selectedIds.includes(user.id));
              setUsers(filteredUsers);
            }
          }
        } catch (error) {
          console.error("Error searching users:", error);
        }
      };

      const timeoutId = setTimeout(searchUsers, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setUsers([]);
    }
  }, [searchQuery, isOpen, selectedUsers, navigate]);

  const handleCreateChat = async () => {
    if (type === "personal" && selectedUsers.length !== 1) {
      alert("Please select exactly one user for personal chat");
      return;
    }

    if (type === "group") {
      if (selectedUsers.length < 2) {
        alert("A group chat must have at least 2 other members (3 total including you)");
        return;
      }
      if (!groupName.trim()) {
        alert("Please enter a group name");
        return;
      }
    }

    setIsLoading(true);
    try {
      const token = getAccessToken();
      if (!token) {
        navigate("/login");
        return;
      }

      const endpoint = type === "personal" ? "/chats/personal" : "/chats/group";
      const body = type === "personal" 
        ? { otherUserId: selectedUsers[0].id }
        : { memberIds: selectedUsers.map(u => u.id), name: groupName.trim() };

      const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.status === 401) {
        // Token expired, redirect to login
        navigate("/login");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await refreshChats();
          
          // If chat already exists, redirect to it
          if (data.existing && data.chat) {
            setCurrentChatId(data.chat.id);
          } else if (data.chat) {
            // New chat created, open it
            setCurrentChatId(data.chat.id);
          }
          
          onClose();
        }
      } else {
        const error = await response.json();
        alert(error.message || "Failed to create chat");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      alert("Failed to create chat");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUser = (user: User) => {
    if (type === "personal") {
      setSelectedUsers([user]);
    } else {
      setSelectedUsers((prev) => {
        const isSelected = prev.some(u => u.id === user.id);
        if (isSelected) {
          return prev.filter((u) => u.id !== user.id);
        } else {
          return [...prev, user];
        }
      });
    }
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0088cc] to-[#00a8e8] text-white px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {type === "personal" ? "New Personal Chat" : "New Group Chat"}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {type === "group" && (
            <>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs text-blue-700">
                  <strong className="font-semibold">Note:</strong> A group chat requires at least 3 members (you + 2 others)
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  placeholder="Enter group name..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0088cc] focus:border-[#0088cc] transition-all"
                />
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0088cc] focus:border-[#0088cc] transition-all"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Selected ({selectedUsers.length} {selectedUsers.length === 1 ? "member" : "members"})
                {type === "group" && (
                  <span className={`ml-2 text-xs font-medium ${selectedUsers.length < 2 ? "text-red-500" : "text-green-600"}`}>
                    {selectedUsers.length < 2 
                      ? `(Need ${2 - selectedUsers.length} more)` 
                      : "✓ Ready"}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <span
                    key={user.id}
                    className="px-3 py-1.5 bg-gradient-to-r from-[#0088cc] to-[#00a8e8] text-white rounded-full text-sm flex items-center gap-2 shadow-sm"
                  >
                    {user.username || user.email}
                    <button
                      onClick={() => removeSelectedUser(user.id)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      type="button"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto mb-4 space-y-2">
            {users.length === 0 && searchQuery ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-500">No users found</p>
              </div>
            ) : (
              users.map((user) => {
                const isSelected = selectedUsers.some(u => u.id === user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleUser(user)}
                    className={`p-3 cursor-pointer rounded-xl border transition-all ${
                      isSelected
                        ? "bg-blue-50 border-[#0088cc] shadow-sm"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0088cc] to-[#00a8e8] text-white flex items-center justify-center font-semibold text-sm shadow-sm">
                          {(user.username || user.email || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">{user.username || user.email}</p>
                          {user.username && <p className="text-xs text-gray-500">{user.email}</p>}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#0088cc] flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-white transition-colors font-medium text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateChat}
            disabled={
              isLoading || 
              (type === "personal" 
                ? selectedUsers.length !== 1 
                : selectedUsers.length < 2 || !groupName.trim())
            }
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#0088cc] to-[#00a8e8] text-white rounded-xl hover:from-[#0077b3] hover:to-[#0099cc] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
