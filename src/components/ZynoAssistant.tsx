import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

const ZynoAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Zyno, your AI Co-Founder™. I'm here to guide you through your cognitive activation journey. How can I help you?",
      isZyno: true,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const zynoResponses = [
    "Excellent question! The Cognitive Activation Protocol™ transforms your skills into tokenized assets. Each step proves your evolution.",
    "Your journey is unique. Based on your profile, I recommend starting with the Learn phase to build solid foundations.",
    "Proof-of-Skill™ NFTs aren't decorative - they're cryptographic proof of your transformation and open opportunities.",
    "The Proof Economy rewards created value, not time spent. Your skills become your capital.",
    "Each completed phase brings you closer to digital sovereignty. Keep going, you're on the right track!",
    "Coordination isn't management. It's strategy made relational.",
    "In the protocol, every visual is a vector of value. Your creativity becomes infrastructure.",
    "You don't just assign tasks. You activate systems that deliver real outcomes.",
    "Your code isn't just a function, it's your identity. Each line written proves your expertise.",
    "You don't vote, you co-create the future. Each decision shapes the ecosystem you own.",
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      isZyno: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate Zyno response after a delay
    setTimeout(() => {
      const zynoMessage = {
        id: messages.length + 2,
        text: zynoResponses[Math.floor(Math.random() * zynoResponses.length)],
        isZyno: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, zynoMessage]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 300 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center shadow-lg"
      >
        <MessageCircle size={24} className="text-white" />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-primary rounded-full opacity-30"
        />
      </motion.button>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 z-50 w-80 h-96 glass-effect rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-primary p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-space font-semibold text-white">Zyno</h3>
                  <p className="text-xs text-white/80">AI Co-Founder™</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto h-64">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isZyno ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      message.isZyno
                        ? "bg-white/10 text-white"
                        : "bg-gradient-primary text-white"
                    }`}
                  >
                    {message.isZyno && (
                      <div className="flex items-center space-x-1 mb-1">
                        <Sparkles size={12} />
                        <span className="text-xs font-semibold">Zyno</span>
                      </div>
                    )}
                    <p>{message.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask Zyno a question..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:border-primary-400"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  className="bg-gradient-primary p-2 rounded-lg"
                >
                  <Send size={16} className="text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ZynoAssistant;
