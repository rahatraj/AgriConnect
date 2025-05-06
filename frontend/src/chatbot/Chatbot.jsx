import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { fetchBotResponse } from "./chatbotApi.jsx";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMsg = { role: "user", content: newMessage };
    setMessages((prev) => [...prev, userMsg]);
    setNewMessage("");
    setLoading(true);

    const botReply = await fetchBotResponse(newMessage);
    setMessages((prev) => [...prev, { role: "bot", content: botReply }]);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-[500px] sm:h-[550px] w-full bg-white border border-gray-300 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-base-200 px-4 py-2 border-b">
        <h2 className="text-lg font-semibold text-center">🤖 AgriConnect Chatbot</h2>
      </div>

      {/* Scrollable Chat Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-4"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
          >
            <div
              className={`chat-bubble ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-black"
              } whitespace-pre-wrap`}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat chat-start">
            <div className="chat-bubble bg-gray-100 text-black">Typing...</div>
          </div>
        )}
      </div>

      {/* Fixed Input Box */}
      <div className="border-t px-3 py-2 bg-base-100">
        <div className="flex items-center gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="textarea textarea-bordered w-full resize-none"
            placeholder="Ask something like 'What is bidding in AgriConnect?'"
          />
          <button
            onClick={sendMessage}
            className="btn btn-primary"
            disabled={loading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
