import { useState, useEffect } from "react";
import { Box, Typography, IconButton, Snackbar, Alert } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NavBar from "../components/layout/NavBar";
import ChatSidebar from "../components/aiassistant/ChatSidebar";
import ChatMessages from "../components/aiassistant/ChatMessages";
import ChatInput from "../components/aiassistant/ChatInput";
import { aiAssistantService } from "../services/aiAssistantAPI";

const generateUniqueId = (prefix = "") =>
  `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

function AIAssistant() {
  // State
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState(null);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const response = await aiAssistantService.getChats();
      if (response.success) {
        setChats(response.data);
      }
    } catch (error) {
      setError("Failed to load chats");
    }
  };

  const handleNewChat = async () => {
    try {
      setIsLoading(true);
      const response = await aiAssistantService.createChat();
      if (response.success && response.data) {
        const newChat = response.data;
        setChats((prev) => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
        setMessages([]);
      }
    } catch (error) {
      setError("Failed to create chat");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSelect = async (chatId) => {
    try {
      setCurrentChatId(chatId);
      setIsLoading(true);
      const response = await aiAssistantService.getChatDetails(chatId);
      if (response.success && response.data) {
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      setError("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (messageContent) => {
    let chatId = currentChatId;

    // Auto-create chat if none selected
    if (!chatId) {
      const response = await aiAssistantService.createChat();
      if (response.success && response.data) {
        chatId = response.data.id;
        setCurrentChatId(chatId);
        setChats((prev) => [response.data, ...prev]);
      } else {
        setError("Failed to create chat");
        return;
      }
    }

    // Optimistic UI update
    const tempMessage = {
      id: generateUniqueId("temp_"),
      content: messageContent,
      role: "user",
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      setIsLoading(true);
      const response = await aiAssistantService.sendMessage(
        chatId,
        messageContent
      );

      if (response.success && response.data) {
        const { chat_title, user_message, assistant_message } = response.data;

        // Update title if it's the first message
        if (chat_title) {
          setChats((prev) =>
            prev.map((c) => (c.id === chatId ? { ...c, title: chat_title } : c))
          );
        }

        // Replace temp message with real messages
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== tempMessage.id);
          return [...filtered, user_message, assistant_message];
        });
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
        setError("Failed to send message");
      }
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      setError("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async (chatIdToDelete) => {
    try {
      const response = await aiAssistantService.deleteChat(chatIdToDelete);
      if (response.success) {
        setChats((prev) => prev.filter((chat) => chat.id !== chatIdToDelete));
        if (currentChatId === chatIdToDelete) {
          setCurrentChatId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      setError("Failed to delete chat");
    }
  };

  const handleEditTitle = async (chatId) => {
    const newTitle = prompt("Enter new chat title:");
    if (newTitle && newTitle.trim()) {
      try {
        const response = await aiAssistantService.updateChat(chatId, {
          title: newTitle.trim(),
        });
        if (response.success) {
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === chatId ? { ...chat, title: newTitle.trim() } : chat
            )
          );
        }
      } catch (error) {
        setError("Failed to update title");
      }
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f5f5f5",
      }}
    >
      <NavBar />

      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: sidebarOpen ? 280 : 0,
            transition: "width 0.3s",
            overflow: "hidden",
            borderRight: "1px solid #e0e0e0",
            bgcolor: "white",
          }}
        >
          <ChatSidebar
            chats={chats}
            currentChatId={currentChatId}
            onChatSelect={handleChatSelect}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            onEditChat={handleEditTitle}
            isLoading={isLoading}
          />
        </Box>

        {/* Main Chat Area */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            bgcolor: "white",
          }}
        >
          {/* Toggle Sidebar Button */}
          <Box sx={{ p: 1, borderBottom: "1px solid #e0e0e0" }}>
            <IconButton onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MenuIcon />
            </IconButton>
          </Box>

          {currentChatId ? (
            <>
              <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
                <ChatMessages messages={messages} isLoading={isLoading} />
              </Box>
              <Box sx={{ borderTop: "1px solid #e0e0e0" }}>
                <ChatInput
                  onSendMessage={handleSendMessage}
                  disabled={isLoading}
                />
              </Box>
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                p: 4,
              }}
            >
              <Box>
                <Typography variant="h4" gutterBottom sx={{ color: "#666" }}>
                  Welcome to AI Assistant
                </Typography>
                <Typography variant="body1" sx={{ color: "#999", mb: 3 }}>
                  Start a new conversation or select a chat from the sidebar
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Error Notification */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AIAssistant;
