import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppContent } from "../context/AppContext";
import Sidebar from "../components/Sidebar";
import { GlobalContext } from "../context/GlobalContext";

// Icons component
const Icons = {
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  ),
  Send: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Bot: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  ),
  Loader: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
  Warning: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Crown: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z" />
      <path d="M4 22h16" />
    </svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  ChevronRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
};

// Typewriter effect component
const TypeWriter = ({ text }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (currentIndex < text.length) {
      intervalRef.current = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 15);
      return () => clearTimeout(intervalRef.current);
    }
  }, [currentIndex, text]);

  useEffect(() => {
    setDisplayText("");
    setCurrentIndex(0);
    return () => clearTimeout(intervalRef.current);
  }, [text]);

  return (
    <div className="whitespace-pre-wrap">
      <span dangerouslySetInnerHTML={{ __html: displayText }} />
      {currentIndex < text.length && (
        <span className="inline-block w-2 h-4 bg-current animate-blink"></span>
      )}
    </div>
  );
};

// Parse markdown-like bold text
const parseBoldText = (text) => {
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
};

const ChatPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { userData } = useContext(AppContent);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [visibleSuggestions, setVisibleSuggestions] = useState([]);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [chatLimits, setChatLimits] = useState({
    dailyCount: 0,
    dailyLimit: 2,
    isPremium: false,
    isTrial: false,
  });
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const chatContainerRef = useRef(null);
  const BASE_URL = import.meta.env?.VITE_BACKEND_URL;
  const { checkPremiumStatus } = useContext(GlobalContext);

  const MESSAGE_CHAR_LIMIT = 1000;
  const DEFAULT_SUGGESTIONS = [
    "How can I improve my savings rate?",
    "What bills do I have coming up this week?",
    "Where should I invest my excess cash?",
    "How can I save more money each month?",
    "Am I on track to meet my financial goals?",
  ];

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchSuggestions(),
          fetchChatLimits(),
          fetchChatHistory(),
          checkPremiumStatus(),
        ]);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Something went wrong while loading your chat. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, []);

  // Periodically refresh chat limits
  useEffect(() => {
    const interval = setInterval(() => {
      fetchChatLimits();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const maxDefaultSuggestions = 3;
    if (suggestions.length <= maxDefaultSuggestions) {
      setVisibleSuggestions(suggestions);
    } else {
      setVisibleSuggestions(
        showAllSuggestions
          ? suggestions
          : suggestions.slice(0, maxDefaultSuggestions)
      );
    }
  }, [suggestions, showAllSuggestions]);

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/userchat/history?limit=1`);
      if (response.data.success && response.data.chats?.length > 0) {
        setMessages(response.data.chats[0].messages);
      } else {
        addInitialGreeting();
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      addInitialGreeting();
    }
  };

  const addInitialGreeting = () => {
    const greeting = `Hello ${userData?.name || "there"}! I'm your personal financial assistant. I'm here to help you with your financial data and provide personalized responses based on your specific financial situation. Ask me anything about your income, expenses, budget, or financial goals! Try one of the suggestions below to get started.`;
    setMessages([{ content: greeting, role: "assistant", typing: true }]);
  };

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/userchat/suggestions`);
      if (response.data.success && response.data.suggestions?.length > 0) {
        setSuggestions(response.data.suggestions);
      } else {
        setSuggestions(DEFAULT_SUGGESTIONS);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions(DEFAULT_SUGGESTIONS);
    }
  };

  const fetchChatLimits = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/userchat/limits`);
      if (response.data.success) {
        setChatLimits(response.data.limits);
      }
    } catch (error) {
      console.error("Error fetching chat limits:", error);
    }
  };

  const checkChatLimits = () => {
    if (chatLimits.isPremium) return true;
    if (chatLimits.dailyCount >= chatLimits.dailyLimit) {
      toast.error(`You've reached your daily chat limit of ${chatLimits.dailyLimit}. Upgrade to premium for unlimited access!`);
      setShowPremiumModal(true);
      return false;
    }
    return true;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    if (inputMessage.length > MESSAGE_CHAR_LIMIT) {
      toast.error(`Message exceeds ${MESSAGE_CHAR_LIMIT} character limit.`);
      return;
    }

    if (!checkChatLimits()) {
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setMessages((prev) => [...prev, { content: userMessage, role: "user" }]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/api/userchat/chat`, {
        message: userMessage,
      });

      if (response.data.success) {
        setMessages((prev) => [
          ...prev,
          { content: response.data.message, role: "assistant", typing: true },
        ]);
        await fetchChatLimits();
      } else {
        toast.error("Failed to get response from AI");
        setMessages((prev) => [
          ...prev,
          {
            content: "Sorry, I couldn't process your request. Please try again.",
            role: "assistant",
            typing: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      if (error.response?.status === 403) {
        toast.error("You've reached your daily chat limit.");
        setShowPremiumModal(true);
      } else {
        toast.error("Error communicating with AI assistant");
        setMessages((prev) => [
          ...prev,
          {
            content: "Sorry, there was an error processing your request. Please try again later.",
            role: "assistant",
            typing: true,
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    document.getElementById("chat-input").focus();
  };

  const toggleSuggestions = () => {
    setShowAllSuggestions(!showAllSuggestions);
  };

  const closeModal = () => {
    setShowPremiumModal(false);
  };

  const redirectToPremium = () => {
    window.location.href = "/upgrade";
  };

  const getLimitsDisplay = () => {
    if (chatLimits.isPremium) return "Unlimited chats";
    if (chatLimits.isTrial) return `${chatLimits.dailyCount}/${chatLimits.dailyLimit} chats today (Trial)`;
    return `${chatLimits.dailyCount}/${chatLimits.dailyLimit} chats today`;
  };

  function formatDateTime(isoString) {
    let date = new Date(isoString);

    if (isNaN(date.getTime())) {
      date = new Date();
    }

    const istOffset = 0; // IST is UTC+5:30
    const localTime = new Date(date.getTime() + istOffset * 60000);

    const formattedDate = localTime.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const formattedTime = localTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return `<i>${formattedDate} : ${formattedTime}</i>`;
  }

  return (
    <>
      <Sidebar onToggle={setIsSidebarCollapsed} />
      <div
        className={`flex-1 p-6 overflow-y-auto transition-all duration-300 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl flex flex-col h-[85vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Icons.Bot />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Financial Advisor AI</h1>
                    <p className="text-sm text-blue-100">
                      Personalized advice for your finances
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="bg-white/10 rounded-lg px-3 py-1 mb-1 flex items-center justify-end">
                    <span
                      className={
                        chatLimits.isPremium ? "text-green-300" : "text-yellow-300"
                      }
                    >
                      {chatLimits.isPremium
                        ? "Premium User"
                        : chatLimits.isTrial
                        ? "Trial User"
                        : "Free User"}
                    </span>
                    {chatLimits.isPremium && (
                      <Icons.Crown className="h-4 w-4 ml-1 text-yellow-300" />
                    )}
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1">
                    <span
                      className={
                        !chatLimits.isPremium &&
                        chatLimits.dailyCount >= chatLimits.dailyLimit
                          ? "text-red-300"
                          : "text-blue-100"
                      }
                    >
                      {getLimitsDisplay()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Container */}
            <div className="flex-grow overflow-hidden">
              <div
                ref={chatContainerRef}
                className="p-4 space-y-4 overflow-y-auto h-full"
                style={{ scrollBehavior: "smooth" }}
              >
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    } mb-4`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-none shadow-sm"
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        {message.role === "assistant" ? (
                          <div className="p-1 bg-white rounded-full mr-2">
                            <Icons.Bot className="h-4 w-4 text-blue-600" />
                          </div>
                        ) : (
                          <div className="p-1 bg-blue-500 rounded-full ml-2 order-2">
                            <Icons.User className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <span className={`font-medium ${message.role === "user" ? "order-1 mr-2" : ""}`}>
                          {message.role === "user"
                            ? userData?.name || "You"
                            : "AI Assistant"}
                        </span>
                      </div>
                      {message.typing && message.role === "assistant" ? (
                        <TypeWriter text={parseBoldText(message.content)} />
                      ) : (
                        <div
                          className="whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: parseBoldText(
                              message.content + "<br>" + formatDateTime(message.timestamp || new Date())
                            ),
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] p-3 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-white rounded-full">
                          <Icons.Bot className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-medium">AI Assistant</span>
                        <div className="flex space-x-1 ml-2">
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {messages.length === 0 && !isLoading && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="bg-blue-100 text-blue-800 p-4 rounded-lg inline-flex items-center mb-4">
                        <Icons.Sparkles />
                        <span className="ml-2 font-medium">
                          Welcome to your Financial Advisor!
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Start by asking a question or select a suggestion above.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {suggestions.slice(0, 4).map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-3 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 transition-colors text-left flex items-center"
                          >
                            <Icons.ChevronRight className="mr-1 flex-shrink-0" />
                            <span>{suggestion}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Limit Warning */}
            {!chatLimits.isPremium &&
              chatLimits.dailyCount >= chatLimits.dailyLimit && (
                <div className="bg-yellow-50 border-t border-yellow-200 p-3">
                  <div className="flex items-center justify-between text-yellow-800 text-sm">
                    <div className="flex items-center">
                      <Icons.Warning className="h-4 w-4 mr-2 text-yellow-600" />
                      <span>
                        You've reached your daily chat limit. Upgrade to premium for
                        unlimited chats!
                      </span>
                    </div>
                    <button
                      onClick={() => setShowPremiumModal(true)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>
              )}

            {/* Suggestions Bar */}
            {visibleSuggestions.length > 0 && (
              <div className="bg-gray-50 border-b border-gray-200 p-3">
                <div className="flex flex-wrap gap-2">
                  {visibleSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm hover:bg-blue-100 transition-colors whitespace-nowrap flex items-center"
                    >
                      <Icons.ChevronRight />
                      <span className="ml-1">{suggestion}</span>
                    </button>
                  ))}
                  {suggestions.length > 3 && (
                    <button
                      onClick={toggleSuggestions}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors flex items-center"
                    >
                      {showAllSuggestions ? "Show Less" : "Show More"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t p-4 bg-gray-50 rounded-b-2xl">
              <form
                onSubmit={handleSendMessage}
                className="flex flex-col w-full space-y-2"
              >
                <div className="flex w-full space-x-2">
                  <input
                    id="chat-input"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about your finances..."
                    className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={
                      isLoading ||
                      (!chatLimits.isPremium &&
                        chatLimits.dailyCount >= chatLimits.dailyLimit)
                    }
                  />
                  <button
                    type="submit"
                    disabled={
                      isLoading ||
                      !inputMessage.trim() ||
                      (!chatLimits.isPremium &&
                        chatLimits.dailyCount >= chatLimits.dailyLimit)
                    }
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[50px]"
                  >
                    {isLoading ? (
                      <Icons.Loader className="h-5 w-5" />
                    ) : (
                      <Icons.Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span className={chatLimits.isPremium ? "hidden" : ""}>
                    {chatLimits.isTrial
                      ? `Trial: ${chatLimits.dailyCount}/${chatLimits.dailyLimit} daily messages`
                      : `Free: ${chatLimits.dailyCount}/${chatLimits.dailyLimit} daily messages`}
                  </span>
                  <span
                    className={
                      inputMessage.length > MESSAGE_CHAR_LIMIT
                        ? "text-red-600"
                        : ""
                    }
                  >
                    {inputMessage.length}/{MESSAGE_CHAR_LIMIT} characters
                  </span>
                </div>
              </form>
            </div>
          </div>

          {/* Premium Upsell Modal */}
          {showPremiumModal && (
            <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-full mb-4">
                    <Icons.Crown className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Upgrade to Premium
                  </h3>
                  <p className="text-gray-600 mt-2">
                    {chatLimits.isTrial
                      ? `As a trial user, you're limited to ${chatLimits.dailyLimit} chats per day.`
                      : `As a free user, you're limited to ${chatLimits.dailyLimit} chats per day.`}{" "}
                    Upgrade to Premium for unlimited AI assistance and personalized
                    financial insights!
                  </p>
                </div>
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={redirectToPremium}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center justify-center"
                  >
                    <Icons.Crown className="h-5 w-5 mr-2" />
                    Unlock Unlimited Chats
                  </button>
                  <button
                    onClick={closeModal}
                    className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          )}

          <ToastContainer position="bottom-right" />
        </div>
      </div>
    </>
  );
};

export default ChatPage;