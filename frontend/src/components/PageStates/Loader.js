import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./States.scss";

const icons = ["📦", "🛒", "🏷️", "🚚", "📊"];

const Loader = () => {
  const [emoji, setEmoji] = useState("📦");
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "Fetching Inventory Data...",
    "Analyzing Orders...",
    "Syncing Stock Levels...",
    "Optimizing Reports...",
    "Almost Ready..."
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % icons.length;
      setEmoji(icons[i]);
      setMessageIndex(i);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="loader-card"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Glowing Orb */}
      <motion.div
        className="orb"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
      >
        <motion.span
          className="emoji"
          key={emoji}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {emoji}
        </motion.span>
      </motion.div>

      {/* Typing Loading Message */}
      <motion.p
        className="typing"
        key={messageIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {messages[messageIndex]}
      </motion.p>

      {/* Shimmer Progress Bar */}
      <div className="progress-wrapper">
        <div className="progress-shimmer"></div>
      </div>
    </motion.div>
  );
};

export default Loader;
