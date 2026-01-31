// Home page with Telegram-like chat UI
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { SocketProvider, useSocket } from "../../contexts/SocketContext";
import { ChatSidebar } from "../chat/ChatSidebar";
import { ChatArea } from "../chat/ChatArea";
import { CreateChatModal } from "../chat/CreateChatModal";

function ChatApp() {
  const { user, logout } = useAuth();
  const { setCurrentChatId } = useSocket();
  const navigate = useNavigate();
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);

  async function onLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const handleNewPersonalChat = () => {
    setShowPersonalModal(true);
  };

  const handleNewGroupChat = () => {
    setShowGroupModal(true);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
            <span>C</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Chat App</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0">
          <ChatSidebar
            onSelectChat={handleSelectChat}
            onCreatePersonal={handleNewPersonalChat}
            onCreateGroup={handleNewGroupChat}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 min-h-0">
          <ChatArea />
        </div>
      </div>

      {/* Modals */}
      <CreateChatModal
        isOpen={showPersonalModal}
        onClose={() => setShowPersonalModal(false)}
        type="personal"
      />
      <CreateChatModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        type="group"
      />
    </div>
  );
}

export function Home() {
  return (
    <SocketProvider>
      <ChatApp />
    </SocketProvider>
  );
}
