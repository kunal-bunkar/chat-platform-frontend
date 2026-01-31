// Chat info modal component - shows members for groups or status for private chats
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { API_BASE_URL } from "../../utils/constants";
import { getAccessToken } from "../../utils/tokenManager";

interface Member {
  id: string;
  email: string;
  username: string | null;
  isOnline: boolean;
}

interface ChatInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  chatType: "private" | "group";
  chatName: string;
}

export function ChatInfoModal({ isOpen, onClose, chatId, chatType, chatName }: ChatInfoModalProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && chatId) {
      fetchMembers();
    }
  }, [isOpen, chatId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAccessToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/chats/${chatId}/members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMembers(data.members);
        } else {
          setError("Failed to load members");
        }
      } else {
        setError("Failed to load members");
      }
    } catch (err) {
      console.error("Error fetching members:", err);
      setError("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const formatLastSeen = (isOnline: boolean) => {
    if (isOnline) {
      return "Online";
    }
    return "Offline";
  };

  if (!isOpen) return null;

  // For private chats, show the other user's status
  if (chatType === "private") {
    const otherMember = members.find((m) => m.id !== user?.id);
    if (!otherMember && !loading) {
      return null;
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{chatName}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : otherMember ? (
              <div className="space-y-6">
                {/* User Avatar */}
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-2xl mb-4">
                    {otherMember.username?.charAt(0).toUpperCase() || otherMember.email.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {otherMember.username || otherMember.email}
                  </h3>
                </div>

                {/* Status */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <div className="flex items-center gap-2">
                      {otherMember.isOnline ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-sm text-green-600 font-medium">Online</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          <span className="text-sm text-gray-500">Offline</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Email</span>
                    <span className="text-sm text-gray-600">{otherMember.email}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // For group chats, show all members
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{chatName}</h2>
              <p className="text-sm text-gray-500 mt-1">{members.length} members</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => {
                const isCurrentUser = member.id === user?.id;
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                        {member.username?.charAt(0).toUpperCase() || member.email.charAt(0).toUpperCase()}
                      </div>
                      {member.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.username || member.email}
                          {isCurrentUser && <span className="text-gray-500 ml-1">(You)</span>}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{member.email}</p>
                    </div>
                    {member.isOnline && (
                      <span className="text-xs text-green-600 font-medium">Online</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
