"use client";

import { useEffect, useState } from "react";

const FALLBACK_MESSAGES = [
  "Free shipping on orders above Rs 999",
  "7 Day easy return",
  "10% Off On Orders Above Rs 1999",
];

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchAnnouncement = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/storefront/settings`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch announcement settings");
        }

        const data = await response.json();
        const saved = data?.announcement;

        if (cancelled) return;

        if (!saved) {
          setAnnouncement({
            enabled: true,
            messages: FALLBACK_MESSAGES,
            bgColor: "#ec4899",
            textColor: "#ffffff",
          });
          return;
        }

        const messages =
          Array.isArray(saved.messages) && saved.messages.length
            ? saved.messages
                .map((message) => String(message).trim())
                .filter(Boolean)
            : saved.text?.trim()
              ? [saved.text.trim()]
              : FALLBACK_MESSAGES;

        setAnnouncement({
          enabled: saved.enabled !== false,
          messages,
          bgColor: saved.bgColor || "#ec4899",
          textColor: saved.textColor || "#ffffff",
        });
      } catch (error) {
        console.error("FETCH ANNOUNCEMENT ERROR:", error);

        if (!cancelled) {
          // Keep the bar hidden if the API cannot be reached.
          setAnnouncement(null);
        }
      } finally {
        if (!cancelled) {
          setSettingsLoaded(true);
        }
      }
    };

    fetchAnnouncement();

    return () => {
      cancelled = true;
    };
  }, []);

  // Don't render fallback messages while settings are loading.
  if (!settingsLoaded || !announcement || !announcement.enabled) {
    return null;
  }

  if (announcement.messages.length === 0) {
    return null;
  }

  const MessageGroup = ({ groupKey }) => (
    <div className="announcement-group" key={groupKey}>
      {announcement.messages.map((message, index) => (
        <div key={`${groupKey}-${index}`} className="announcement-item">
          <span className="msg-text">{message}</span>
          <span className="msg-dot" aria-hidden="true" />
        </div>
      ))}
    </div>
  );

  return (
    <div
      className="announcement-root"
      style={{
        backgroundColor: announcement.bgColor,
        color: announcement.textColor,
      }}
      aria-label="Store announcements"
    >
      <div className="announcement-track">
        <div className="announcement-scroll">
          <MessageGroup groupKey="first" />
          <MessageGroup groupKey="second" />
          <MessageGroup groupKey="third" />
          <MessageGroup groupKey="fourth" />
        </div>
      </div>
    </div>
  );
}