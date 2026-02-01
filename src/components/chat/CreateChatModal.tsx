// Modal for creating personal or group chats
import { useState, useEffect } from "react";
import { useSocket } from "../../hooks/useSocket";
import { getAccessToken } from "../../utils/tokenManager";
import { API_BASE_URL } from "../../utils/constants";
import { useNavigate } from "react-router-dom";

const getApiBaseUrl = () => {
  const base = API_BASE_URL || "http://localhost:5000";
  return base.includes("/api") ? base : `${base}/api`;
};

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {type === "personal" ? "New Personal Chat" : "New Group Chat"}
        </h2>

        {type === "group" && (
          <>
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> A group chat requires at least 3 members (you + 2 others)
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search users by username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {selectedUsers.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Selected ({selectedUsers.length} {selectedUsers.length === 1 ? "member" : "members"})
              {type === "group" && (
                <span className={`ml-2 text-xs ${selectedUsers.length < 2 ? "text-red-500" : "text-green-600"}`}>
                  {selectedUsers.length < 2 
                    ? `(Need ${2 - selectedUsers.length} more for group)` 
                    : "(Ready to create)"}
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <span
                  key={user.id}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                >
                  {user.username || user.email}
                  <button
                    onClick={() => removeSelectedUser(user.id)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                    type="button"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="max-h-60 overflow-y-auto mb-4">
          {users.length === 0 && searchQuery ? (
            <p className="text-sm text-gray-500 text-center py-4">No users found</p>
          ) : (
            users.map((user) => {
              const isSelected = selectedUsers.some(u => u.id === user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => toggleUser(user)}
                  className={`p-3 cursor-pointer rounded-lg mb-2 border ${
                    isSelected
                      ? "bg-blue-50 border-blue-500"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{user.username || user.email}</p>
                      {user.username && <p className="text-xs text-gray-500">{user.email}</p>}
                    </div>
                    {isSelected && (
                      <span className="text-blue-600 text-sm font-semibold">✓</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
