import React, { useState, useEffect } from "react";
import "./States.scss";

const icons = ["📦", "🛒", "🏷️", "🚚", "📊"];

const Loader = () => {
  const [emoji, setEmoji] = useState("📦");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % icons.length;
      setEmoji(icons[i]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-loader-card">
      {/* Glowing Orb */}
      <div className="inline-orb">
        <span className="emoji">{emoji}</span>
      </div>

      {/* Typing Message */}
      <p className="inline-typing">Fetching Inventory Data...</p>

      {/* Shimmer Bar */}
      <div className="shimmer-bar"></div>
    </div>
  );
};

export default Loader;
