"use client";

import React, { useState } from "react";

export default function TopHeader() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          fontFamily: "'Open Sans', sans-serif",
          backgroundColor: "#e0e0e0",
          color: "#333",
          fontSize: "14px",
          padding: "6px 16px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span>Voiceation Gesangsunterricht in Steyr oder online 🎶</span>

          <button
            onClick={() => setVisible(false)}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "16px",
              cursor: "pointer",
              lineHeight: 1,
            }}
            aria-label="Header schließen"
          >
            ✕
          </button>
        </div>
      </div>
    </>
  );
}
