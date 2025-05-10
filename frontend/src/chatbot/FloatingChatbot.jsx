import { useState } from "react";
import { MessageCircle } from "lucide-react";
import Chatbot from './Chatbot.jsx'


const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {isOpen && (
        <div className="mb-2 w-[350px] sm:w-[400px] h-[550px] bg-white border rounded-xl shadow-lg overflow-hidden">
          <Chatbot />
        </div>
      )}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="btn btn-primary rounded-full shadow-lg size-14 flex items-center justify-center"
        aria-label="Open Chatbot"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
};

export default FloatingChatbot;
