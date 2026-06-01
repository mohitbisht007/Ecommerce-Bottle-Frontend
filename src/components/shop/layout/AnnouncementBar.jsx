"use client";
import React from "react";

export default function AnnouncementBar() {
  const messages = [
    "Free shipping on orders above Rs 999",
    "7 Day easy return",
    "10% Off On Orders Abover Rs 1999 "
  ];

  // Render the set multiple times to fill any screen width
  const MessageGroup = () => (
    <div className="announcement-group">
      {messages.map((msg, index) => (
        <div key={index} className="announcement-item">
          <span className="msg-text">{msg}</span>
          <span className="msg-dot"></span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="announcement-root">
      <div className="announcement-track">
        <div className="announcement-scroll">
          <MessageGroup />
          <MessageGroup />
          <MessageGroup />
          <MessageGroup />
        </div>
      </div>
    </div>
  );
}