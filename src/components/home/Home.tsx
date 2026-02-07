// Home page with modern chat UI
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { SocketProvider, useSocket } from "../../contexts/SocketContext";
import { ChatSidebar } from "../chat/ChatSidebar";
import { ChatArea } from "../chat/ChatArea";
import { CreateChatModal } from "../chat/CreateChatModal";

function ChatApp() {
  const { user, logout } = useAuth();
  const { setCurrentChatId, currentChatId, isConnected, isLoadingChats } = useSocket();
  const navigate = useNavigate();
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Show loading screen when app is initializing
  const isInitializing = !isConnected || isLoadingChats;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop, always show sidebar
      if (!mobile) {
        setShowSidebar(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show sidebar on mobile when no chat is selected
  useEffect(() => {
    if (isMobile && !currentChatId) {
      setShowSidebar(true);
    }
  }, [currentChatId, isMobile]);

  async function onLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    // On mobile, hide sidebar when chat is selected
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const shouldShowSidebar = !isMobile || showSidebar || !currentChatId;

  const handleNewPersonalChat = () => {
    setShowPersonalModal(true);
  };

  const handleNewGroupChat = () => {
    setShowGroupModal(true);
  };

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f0f2f5]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#0088cc] border-t-transparent rounded-full animate-spin"></div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Loading ChatHub...</h3>
          <p className="text-sm text-gray-600">Connecting to server</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[#f0f2f5]">
      {/* Sidebar - Hidden on mobile when chat is open */}
      <div className={`${shouldShowSidebar ? 'flex' : 'hidden'} md:flex ${isMobile && !currentChatId ? 'w-full' : 'w-full md:w-96 lg:w-[420px]'} flex-shrink-0 h-full transition-all duration-300 ease-in-out`}>
        <ChatSidebar
          onSelectChat={handleSelectChat}
          onCreatePersonal={handleNewPersonalChat}
          onCreateGroup={handleNewGroupChat}
          onLogout={onLogout}
          user={user}
        />
      </div>

      {/* Chat Area - Hidden on mobile when sidebar is shown */}
      <div className={`flex-1 min-w-0 flex flex-col relative ${isMobile && !currentChatId ? 'hidden' : ''}`}>
        <ChatArea 
          onBack={isMobile && currentChatId && !shouldShowSidebar ? () => setShowSidebar(true) : undefined}
        />
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
