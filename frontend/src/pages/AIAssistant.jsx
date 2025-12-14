import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Drawer,
  useMediaQuery,
  useTheme,
  Alert,
  Snackbar,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import NavBar from "../components/layout/NavBar";
import ChatSidebar from "../components/aiassistant/ChatSidebar";
import ChatMessages from "../components/aiassistant/ChatMessages";
import ChatInput from "../components/aiassistant/ChatInput";
import { aiAssistantService } from "../services/aiAssistantAPI";

// Helper function to generate unique IDs
const generateUniqueId = (prefix = "") => {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

function AIAssistant() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State management
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageLoading, setmessageLoading] = useState(false);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [chatMessageLoading, setChatMessageLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [error, setError] = useState(null);

  // Load chats on component mount
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    setSidebarLoading(true);
    setIsLoading(true);
    try {
      const response = await aiAssistantService.getChats();
      console.log("API response getchats:", response);
      if (response.success) {
        setChats(response.data);
      } else {
        console.warn("API not available");
        setChats([]);
        setError("Unable to load chats. Please check your connection.");
      }
    } catch (error) {
      console.warn("Backend not available:", error);
      setChats([]);
      setError(
        "Backend service is currently unavailable. Please try again later."
      );
    } finally {
      setSidebarLoading(false);
      setIsLoading(false);
    }
  };
  const handleNewChat = useCallback(async () => {
    try {
      setSidebarLoading(true);
      setIsLoading(true);
      const response = await aiAssistantService.createChat();
      console.log("API response createChat:", response);
      if (response.success && response.data) {
        const newChat = response.data;
        setChats((prev) => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
        setMessages([]);
        console.log("New chat created:", newChat);
        if (isMobile) setSidebarOpen(false);
      } else {
        setError("Failed to create new chat");
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
      setError("Failed to create new chat");
    } finally {
      setSidebarLoading(false);
      setIsLoading(false);
    }
  }, [isMobile]);

  const handleChatSelect = async (chatId) => {
    try {
      setCurrentChatId(chatId);
      setChatMessageLoading(true);
      setIsLoading(true);
      setMessages([]);

      const response = await aiAssistantService.getChatDetails(chatId);
      console.log("API response getChatDetails:", response);

      if (response.success && response.data) {
        const chatData = response.data;
        const messages = chatData.messages || [];
        console.log("Loading messages for chat:", chatId, messages);
        setMessages(messages);
      } else {
        console.warn(
          "Could not load chat from backend:",
          response.error || "Unknown error"
        );
        setMessages([]);
        setError("Failed to load chat messages");
      }

      if (isMobile) setSidebarOpen(false);
    } catch (error) {
      console.error("Error loading chat:", error);
      setMessages([]);
      setError("Failed to load chat messages");
      if (isMobile) setSidebarOpen(false);
    } finally {
      setChatMessageLoading(false);
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (messageContent) => {
    let chatId = currentChatId;
    setmessageLoading(true);
    setIsLoading(true);

    // Auto-create chat if none selected
    if (!chatId) {
      try {
        const response = await aiAssistantService.createChat();
        if (response.success && response.data) {
          chatId = response.data.id;
          setCurrentChatId(chatId);
          setChats((prev) => [response.data, ...prev]);
        } else {
          setError("Failed to create new chat");
          setmessageLoading(false);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        setError("Failed to create new chat");
        setmessageLoading(false);
        setIsLoading(false);
        return;
      }
    }

    // Create optimistic user message UI
    const userMessage = {
      id: generateUniqueId("user_"),
      content: messageContent,
      is_from_user: true,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await aiAssistantService.sendMessage(
        chatId,
        messageContent
      );
      console.log("API response sendMessage:", response);

      if (response.success && response.data) {
        const { chat_id, chat_title, user_message, assistant_message } =
          response.data;

        // Update chat title if returned (first message auto-title)
        if (chat_title) {
          setChats((prev) =>
            prev.map((c) =>
              c.id === chat_id ? { ...c, title: chat_title } : c
            )
          );
        }

        // Replace optimistic message with server messages
        setMessages((prev) => {
          const withoutTemp = prev.filter((msg) => msg.id !== userMessage.id);
          const newMessages = [...withoutTemp];

          if (user_message) {
            newMessages.push({
              ...user_message,
              id: user_message.id || generateUniqueId("server_user_"),
              is_from_user: user_message.role === "user",
            });
          }

          if (assistant_message) {
            newMessages.push({
              ...assistant_message,
              id: assistant_message.id || generateUniqueId("server_ai_"),
              is_from_user: assistant_message.role === "user",
            });
          }

          return newMessages;
        });
      } else {
        console.warn("Backend API failed");
        setError("Failed to send message");
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      }
    } catch (error) {
      console.warn("Backend not available:", error);
      setError("Backend service is currently unavailable");
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setmessageLoading(false);
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (files, prompt = "") => {
    let chatId = currentChatId;
    setmessageLoading(true);
    setIsLoading(true);

    // Auto-create chat if none selected
    if (!chatId) {
      try {
        const response = await aiAssistantService.createChat();
        if (response.success && response.data) {
          chatId = response.data.id;
          setCurrentChatId(chatId);
          setChats((prev) => [response.data, ...prev]);
        } else {
          setError("Failed to create new chat");
          setmessageLoading(false);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        setError("Failed to create new chat");
        setmessageLoading(false);
        setIsLoading(false);
        return;
      }
    }

    // Process each file sequentially
    const fileArray = Array.isArray(files) ? files : [files];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const filePrompt = i === 0 ? prompt : ""; // Only use prompt for first file

      try {
        const response = await aiAssistantService.uploadImage(
          chatId,
          file,
          filePrompt
        );
        console.log(
          `API response uploadImage (${i + 1}/${fileArray.length}):`,
          response
        );

        if (response.success && response.data) {
          const { user_message, assistant_message, file_info } = response.data;

          // Add both messages to the chat
          setMessages((prev) => {
            const newMessages = [...prev];

            if (user_message) {
              newMessages.push({
                ...user_message,
                id: user_message.id || generateUniqueId("server_user_"),
                is_from_user: user_message.role === "user",
              });
            }

            if (assistant_message) {
              newMessages.push({
                ...assistant_message,
                id: assistant_message.id || generateUniqueId("server_ai_"),
                is_from_user: assistant_message.role === "user",
              });
            }

            return newMessages;
          });

          successCount++;
        } else {
          console.warn(`File upload failed for ${file.name}:`, response.error);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        errorCount++;
      }
    }

    // Show summary message
    if (errorCount > 0) {
      setError(
        `Uploaded ${successCount} of ${fileArray.length} files. ${errorCount} failed.`
      );
    }

    // Reload chats to update last_message_at
    if (successCount > 0) {
      loadChats();
    }

    setmessageLoading(false);
    setIsLoading(false);
  };

  const handleDeleteChat = async (chatIdToDelete) => {
    setIsLoading(true);
    setSidebarLoading(true);
    try {
      const response = await aiAssistantService.deleteChat(chatIdToDelete);

      if (response.success) {
        setChats((prev) => prev.filter((chat) => chat.id !== chatIdToDelete));

        if (currentChatId === chatIdToDelete) {
          setCurrentChatId(null);
          setMessages([]);
        }
      } else {
        setError(response.error || "Failed to delete chat");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      setError("Failed to delete chat");
    } finally {
      setIsLoading(false);
      setSidebarLoading(false);
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
        } else {
          setError(response.error || "Failed to update chat title");
        }
      } catch (error) {
        console.error("Error updating chat title:", error);
        setError("Failed to update chat title");
      }
    }
  };
  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen]);

  // Enhanced animations and transitions
  useEffect(() => {
    const handleKeyboard = (e) => {
      // Keyboard shortcuts for better UX
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "n":
            e.preventDefault();
            handleNewChat();
            break;
          case "/":
            e.preventDefault();
            // Focus on input if chat is open
            if (currentChatId) {
              const inputElement = document.querySelector(
                'textarea, input[type="text"]'
              );
              inputElement?.focus();
            }
            break;
          case "b":
            e.preventDefault();
            handleToggleSidebar();
            break;
        }
      }

      // ESC to close sidebar on mobile
      if (e.key === "Escape" && isMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyboard);
    return () => document.removeEventListener("keydown", handleKeyboard);
  }, [
    currentChatId,
    isMobile,
    sidebarOpen,
    handleNewChat,
    handleToggleSidebar,
  ]);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(135deg, #f0f9ff 0%, #e8f4f8 50%, #e1f0f7 100%)",
        position: "relative",
      }}
    >
      <NavBar />

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          background: "#ffffff",
          margin: { xs: 0, md: 2 },
          borderRadius: { xs: 0, md: "12px" },
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Sidebar */}
        {isMobile ? (
          <Drawer
            anchor="left"
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            PaperProps={{
              sx: {
                width: 280,
                background: "#f8fafc",
              },
            }}
          >
            <ChatSidebar
              chats={chats}
              currentChatId={currentChatId}
              onChatSelect={handleChatSelect}
              onNewChat={handleNewChat}
              onDeleteChat={handleDeleteChat}
              onEditChat={handleEditTitle}
              isLoading={sidebarLoading}
            />
          </Drawer>
        ) : (
          <Box
            sx={{
              width: sidebarOpen ? 280 : 0,
              transition: "width 0.3s ease",
              overflow: "hidden",
              background: "#f8fafc",
              borderRight: sidebarOpen ? "1px solid #e2e8f0" : "none",
            }}
          >
            <ChatSidebar
              chats={chats}
              currentChatId={currentChatId}
              onChatSelect={handleChatSelect}
              onNewChat={handleNewChat}
              onDeleteChat={handleDeleteChat}
              onEditChat={handleEditTitle}
              isLoading={sidebarLoading}
            />
          </Box>
        )}

        {/* Main Chat Area */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {currentChatId ? (
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#ffffff",
                borderRadius: { xs: 0, md: "8px" },
                overflow: "hidden",
              }}
            >
              <ChatMessages
                messages={messages}
                isLoading={chatMessageLoading}
                loadingMessage={messageLoading}
              />
              <ChatInput
                onSendMessage={handleSendMessage}
                onFileUpload={handleFileUpload}
                isLoading={isLoading}
                showQuickQuestions={messages.length === 0}
              />
            </Paper>
          ) : (
            // Welcome Screen
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                background: "#ffffff",
                position: "relative",
                margin: { xs: 0, md: 2 },
                borderRadius: { xs: 0, md: "8px" },
                overflow: "hidden",
              }}
            >
              {/* Mobile Header with Hamburger Menu */}
              {isMobile && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 2,
                    py: 2,
                    background: "#ffffff",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <IconButton
                    onClick={handleToggleSidebar}
                    sx={{
                      color: "#0ea5e9",
                      "&:hover": { backgroundColor: "rgba(14, 165, 233, 0.1)" },
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "#0f172a",
                      ml: 2,
                    }}
                  >
                    MedAI Assistant
                  </Typography>
                </Box>
              )}

              {/* Welcome Content */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  px: 3,
                  py: 4,
                  textAlign: "center",
                }}
              >
                {/* Medical Icon */}
                <Box
                  sx={{
                    position: "relative",
                    mb: 3,
                  }}
                >
                  <MedicalServicesIcon
                    sx={{
                      fontSize: "6rem",
                      color: "#0ea5e9",
                      filter: "drop-shadow(0 4px 12px rgba(14, 165, 233, 0.3))",
                      animation: "pulse 2s ease-in-out infinite",
                      "@keyframes pulse": {
                        "0%, 100%": { transform: "scale(1)" },
                        "50%": { transform: "scale(1.05)" },
                      },
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: -10,
                      right: -10,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "#10b981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                    }}
                  >
                    ✓
                  </Box>
                </Box>

                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    background:
                      "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 1,
                    fontSize: { xs: "2rem", md: "2.75rem" },
                  }}
                >
                  MedAI Assistant
                </Typography>

                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "#0ea5e9",
                    fontWeight: 600,
                    mb: 2,
                    fontSize: "1rem",
                  }}
                >
                  🩺 Your Personal Hepatitis C Health Companion
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: "#64748b",
                    mb: 5,
                    maxWidth: 650,
                    fontSize: "1.05rem",
                    lineHeight: 1.7,
                  }}
                >
                  Get intelligent answers about diseases, upload medical images
                  or lab results for analysis guidance, and access information
                  across 15+ disease categories including HCV, Diabetes, Heart
                  Disease, Cancer, and more.
                </Typography>

                {/* Feature Cards */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(4, 1fr)",
                    },
                    gap: 2,
                    width: "100%",
                    maxWidth: 900,
                    mb: 4,
                  }}
                >
                  {[
                    {
                      icon: "🔬",
                      title: "Medical Image Analysis",
                      desc: "Get guidance on X-rays, CT scans, and MRI",
                      color: "#0ea5e9",
                    },
                    {
                      icon: "💊",
                      title: "Multi-Disease Info",
                      desc: "Learn about 15+ disease categories",
                      color: "#8b5cf6",
                    },
                    {
                      icon: "📊",
                      title: "Lab Results Help",
                      desc: "Understand blood work and test results",
                      color: "#10b981",
                    },
                    {
                      icon: "🩺",
                      title: "Health Education",
                      desc: "Evidence-based medical information",
                      color: "#f59e0b",
                    },
                  ].map((feature, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 3,
                        background: "#ffffff",
                        borderRadius: "16px",
                        border: "2px solid",
                        borderColor: `${feature.color}20`,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "relative",
                        overflow: "hidden",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: `0 12px 24px ${feature.color}25`,
                          borderColor: feature.color,
                          "& .feature-icon": {
                            transform: "scale(1.2) rotate(5deg)",
                          },
                        },
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "4px",
                          background: feature.color,
                          opacity: 0,
                          transition: "opacity 0.3s",
                        },
                        "&:hover::before": {
                          opacity: 1,
                        },
                      }}
                    >
                      <Typography
                        className="feature-icon"
                        sx={{
                          fontSize: "2.5rem",
                          mb: 1.5,
                          transition: "transform 0.3s",
                          display: "block",
                        }}
                      >
                        {feature.icon}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: "#0f172a",
                          mb: 0.5,
                          fontSize: "1rem",
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#64748b",
                          fontSize: "0.875rem",
                          lineHeight: 1.5,
                        }}
                      >
                        {feature.desc}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Alert
                  severity="info"
                  sx={{
                    mt: 4,
                    maxWidth: 700,
                    borderRadius: "12px",
                    background: "#f0f9ff",
                    border: "1px solid #bae6fd",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "#0c4a6e", fontWeight: 500 }}
                  >
                    <strong>Medical Disclaimer:</strong> MedAI provides
                    educational information and analysis guidance only. Always
                    consult qualified healthcare professionals for medical
                    diagnosis, advice, or treatment decisions.
                  </Typography>
                </Alert>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#94a3b8",
                    fontSize: "0.9rem",
                    mt: 3,
                  }}
                >
                  Start a new chat to begin your health journey
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{
            width: "100%",
            borderRadius: "8px",
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AIAssistant;
