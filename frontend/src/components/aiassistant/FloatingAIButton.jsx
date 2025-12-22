import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const FloatingAIButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(false);

  // Pages where the button should NOT be displayed
  const hiddenRoutes = [
    '/signin',
    '/signup',
    '/reset-password',
    '/resetpassword',
    '/resetpassword/confirm',
    '/change-password',
    '/ai-assistant',
    '/verify-email',
  ];

  // Check if current route should hide the button
  const shouldHideButton = hiddenRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  const messages = [
    '💡 Know more about diseases',
    '🩺 Get instant health insights',
    '💬 Chat with me for guidance',
    '🔍 Explore medical information',
    '❤️ Your health companion',
    ' 🌟 Discover medical tips',
    '📚 Learn about symptoms',
    '🌈 Get personalized advice',
    '🏥 Find medical information',
  ];

  // Rotate messages every 5 seconds
  useEffect(() => {
    // Don't start timers if button is hidden
    if (shouldHideButton) return;

    const messagesLength = messages.length;

    const messageInterval = setInterval(() => {
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 4000);

      setCurrentMessageIndex((prev) => (prev + 1) % messagesLength);
    }, 8000);

    // Show first message after 2 seconds
    const initialTimeout = setTimeout(() => {
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 4000);
    }, 2000);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(initialTimeout);
    };
  }, [messages.length, shouldHideButton]);

  // Don't render if on hidden route
  if (shouldHideButton) {
    return null;
  }

  const handleClick = () => {
    navigate('/ai-assistant');
  };

  const containerStyle = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const messageBubbleStyle = {
    transition: 'all 0.5s ease-out',
    transform: showMessage ? 'translateX(0) scale(1)' : 'translateX(16px) scale(0.95)',
    opacity: showMessage ? 1 : 0,
    pointerEvents: showMessage ? 'auto' : 'none',
    marginBottom: '8px',
  };

  const messageContentStyle = {
    background: 'white',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    borderRadius: '16px',
    padding: '12px 16px',
    maxWidth: '280px',
    border: '1px solid #D1FAE5',
    position: 'relative',
  };

  const messageTextStyle = {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1F2937',
    margin: 0,
  };

  const messageTailStyle = {
    position: 'absolute',
    top: '50%',
    right: '-8px',
    width: '16px',
    height: '16px',
    background: 'white',
    borderRight: '1px solid #D1FAE5',
    borderTop: '1px solid #D1FAE5',
    transform: 'translateY(-50%) rotate(45deg)',
  };

  const buttonStyle = {
    position: 'relative',
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    color: 'white',
    borderRadius: '50%',
    border: 'none',
    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
    transition: 'box-shadow 0.3s ease, transform 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: '16px',
    width: '64px',
    height: '64px',
  };

  const pulseStyle = {
    position: 'absolute',
    inset: 0,
    background: '#10B981',
    borderRadius: '50%',
    animation: 'subtlePulse 3s ease-in-out infinite',
    opacity: 0.15,
  };

  const iconContainerStyle = {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease',
  };

  return (
    <>
      <style>
        {`
          @keyframes subtlePulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.15;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.08;
            }
          }

          .floating-ai-btn:hover {
            box-shadow: 0 8px 20px rgba(5, 150, 105, 0.4);
            transform: translateY(-2px);
          }

          .floating-ai-btn:active {
            transform: translateY(0px);
            box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
          }

          .floating-ai-btn:hover .icon-container {
            transform: scale(1.1);
          }

          .sparkle-icon {
            animation: sparkle 2.5s ease-in-out infinite;
          }

          @keyframes sparkle {
            0%, 100% {
              opacity: 0.8;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.2);
            }
          }
        `}
      </style>

      <div style={containerStyle}>
        {/* Animated Message Bubble */}
        <div style={messageBubbleStyle}>
          <div style={messageContentStyle}>
            <p style={messageTextStyle}>{messages[currentMessageIndex]}</p>
            <div style={messageTailStyle}></div>
          </div>
        </div>

        {/* Floating Button */}
        <button
          onClick={handleClick}
          style={buttonStyle}
          className="floating-ai-btn"
          aria-label="Open AI Assistant"
        >
          {/* Animated Background Pulse */}
          <div style={pulseStyle}></div>

          {/* Icon Container */}
          <div style={iconContainerStyle} className="icon-container">
            <ChatIcon sx={{ fontSize: 30 }} />

            {/* Sparkle Effect */}
            <AutoAwesomeIcon
              className="sparkle-icon"
              sx={{
                fontSize: 14,
                position: 'absolute',
                top: -2,
                right: -2,
                color: '#FCD34D',
              }}
            />
          </div>
        </button>
      </div>
    </>
  );
};

export default FloatingAIButton;
