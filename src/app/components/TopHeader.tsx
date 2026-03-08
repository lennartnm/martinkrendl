"use client";
import React, { useState } from "react";

interface TopHeaderProps {
  text?: string;
  bgColor?: string;
  textColor?: string;
}

export default function TopHeader({
  text = "Gesangsunterricht in Steyr oder online 🎶",
  bgColor = "#e0e0e0",
  textColor = "#333",
}: TopHeaderProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div style={{ backgroundColor: bgColor, color: textColor, fontSize: "14px", padding: "6px 16px", display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span>{text}</span>
        <button onClick={() => setVisible(false)} style={{ border: "none", background: "transparent", fontSize: "16px", cursor: "pointer", lineHeight: 1 }} aria-label="Header schließen">✕</button>
      </div>
    </div>
  );
}
