import React, { useState, useRef, useEffect } from 'react';
import axios from "../utils/axios"
import { MessageSquare, X, Mic, Send, Volume2, Loader2, StopCircle } from 'lucide-react';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Namaste! I am your AI Legal Assistant. You can speak to me in Hindi, Marathi, or English.", sender: "bot" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Inside your AIChatbot.jsx component
useEffect(() => {
  const handleOpenChatbot = () => {
    setIsOpen(true); // Assuming `isOpen` is your state that controls the chatbot window visibility
  };

  window.addEventListener('open-global-chatbot', handleOpenChatbot);
  
  return () => {
    window.removeEventListener('open-global-chatbot', handleOpenChatbot);
  };
}, []);


  // --- 1. SPEECH TO TEXT (STT) ---
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser. Please use Google Chrome.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-IN'; // Default to Indian English (it detects Hindi/Marathi mixed well)
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      handleSend(transcript); // Auto-send after speaking
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // --- 2. TEXT TO SPEECH (TTS) ---
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop previous
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to match voice to detected language loosely (optional refinement)
      // utterance.lang = 'hi-IN'; 
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // --- 3. SEND MESSAGE ---
  const handleSend = async (textOverride) => {
    const text = textOverride || inputText;
    if (!text.trim()) return;

    // Add User Message
    const userMsg = { text, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      // Call Backend
      const res = await axios.post('/ai/chat', { message: text });
      const botReply = res.data.reply;

      // Add Bot Message
      const botMsg = { text: botReply, sender: "bot" };
      setMessages((prev) => [...prev, botMsg]);
      
      // Auto-speak the response for accessibility
      speakText(botReply);

    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { text: "Sorry, I encountered an error.", sender: "bot" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* TOGGLE BUTTON */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-stone-900 text-white p-4 rounded-full shadow-xl hover:bg-black hover:scale-110 transition-all flex items-center gap-2"
        >
          <MessageSquare size={24} />
          <span className="font-bold pr-2"> Rightmate </span>
        </button>
      )}

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="bg-white w-[350px] h-[500px] rounded-2xl shadow-2xl border border-stone-300 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          
          {/* HEADER */}
          <div className="bg-stone-900 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="font-serif font-bold">Rightmate</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-stone-300"><X size={20} /></button>
          </div>

          {/* MESSAGES AREA */}
          <div className="flex-1 p-4 overflow-y-auto bg-stone-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div 
                  className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed shadow-sm ${
                    msg.sender === "user" 
                      ? "bg-stone-800 text-white rounded-br-none" 
                      : "bg-white border border-stone-200 text-stone-800 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-stone-200 p-3 rounded-xl rounded-bl-none flex items-center gap-2">
                  <Loader2 className="animate-spin text-stone-400" size={16} />
                  <span className="text-xs text-stone-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* CONTROLS (TTS STATUS) */}
          {isSpeaking && (
            <div className="bg-yellow-50 px-4 py-1 flex justify-between items-center text-xs text-yellow-700 border-t border-yellow-100">
              <span className="flex items-center gap-2"><Volume2 size={12} className="animate-pulse"/> Speaking...</span>
              <button onClick={stopSpeaking}><StopCircle size={14} className="hover:text-red-600"/></button>
            </div>
          )}

          {/* INPUT AREA */}
          <div className="p-3 bg-white border-t border-stone-200">
            <div className="flex items-center gap-2 bg-stone-100 rounded-full px-2 py-1 border border-stone-200">
              
              {/* MIC BUTTON */}
              <button 
                onClick={startListening}
                className={`p-2 rounded-full transition-colors ${
                  isListening ? "bg-red-500 text-white animate-pulse" : "bg-white text-stone-600 hover:text-stone-900"
                }`}
                title="Speak Question"
              >
                <Mic size={20} />
              </button>

              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Listening..." : "Type or speak..."}
                className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2 text-stone-800"
                disabled={isListening}
              />

              {/* SEND BUTTON */}
              <button 
                onClick={() => handleSend()}
                className="p-2 bg-stone-900 text-white rounded-full hover:bg-black transition-transform active:scale-95"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-[10px] text-center text-stone-400 mt-2">
              Supports Hindi, Marathi & English
            </p>
          </div>

        </div>
      )}
    </div>
  );
}