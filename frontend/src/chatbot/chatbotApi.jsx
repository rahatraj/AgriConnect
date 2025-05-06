import axios from "axios"

export const fetchBotResponse = async (question) => {
  try {
    const response = await axios.post("https://agriconnect-chatbot.onrender.com/chat", {
      question: question,
    });

    return response.data.response || "No response from chatbot.";
  } catch (err) {
    console.error("Error from chatbot:", err);
    return "Error connecting to chatbot. Please try again later.";
  }
};
