"use client";

import { useEffect, useState } from "react";
import { Check, Plus, Trash2, RefreshCw } from "lucide-react";

const DEFAULT_MESSAGES = [
  "Free shipping on orders above Rs 999",
  "7 Day easy return",
  "10% Off On Orders Above Rs 1999",
];

const DEFAULT_ANNOUNCEMENT = {
  text: "",
  messages: DEFAULT_MESSAGES,
  enabled: true,
  bgColor: "#ec4899",
  textColor: "#ffffff",
};

export default function AnnouncementManager() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [notice, setNotice] = useState("");
  const [announcement, setAnnouncement] = useState(DEFAULT_ANNOUNCEMENT);
  const [newMessage, setNewMessage] = useState("");

  const updateAnnouncement = (updates) => {
    setAnnouncement((current) => ({ ...current, ...updates }));
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setFetching(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/storefront/settings`,
          { cache: "no-store" }
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Unable to load settings");

        const saved = data?.announcement || {};
        const messages =
          Array.isArray(saved.messages) && saved.messages.length
            ? saved.messages
            : saved.text
              ? [saved.text]
              : DEFAULT_MESSAGES;

        setAnnouncement({
          ...DEFAULT_ANNOUNCEMENT,
          ...saved,
          messages,
        });
      } catch (error) {
        console.error("FETCH ANNOUNCEMENT SETTINGS ERROR:", error);
        setNotice(error.message || "Unable to load announcement settings");
      } finally {
        setFetching(false);
      }
    };

    fetchSettings();
  }, []);

  const addMessage = () => {
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    setAnnouncement((current) => ({
      ...current,
      messages: [...current.messages, trimmed],
    }));
    setNewMessage("");
    setNotice("");
  };

  const updateMessage = (index, value) => {
    setAnnouncement((current) => ({
      ...current,
      messages: current.messages.map((message, i) =>
        i === index ? value : message
      ),
    }));
  };

  const removeMessage = (index) => {
    setAnnouncement((current) => ({
      ...current,
      messages: current.messages.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    const messages = announcement.messages
      .map((message) => message.trim())
      .filter(Boolean);

    if (announcement.enabled && messages.length === 0) {
      setNotice("Add at least one message or disable the announcement bar.");
      return;
    }

    setLoading(true);
    setNotice("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/storefront/settings`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            announcement: {
              ...announcement,
              text: messages[0] || "",
              messages,
            },
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save announcement");

      setAnnouncement((current) => ({
        ...current,
        messages,
        text: messages[0] || "",
      }));
      setNotice("Announcement bar settings saved successfully.");
    } catch (error) {
      console.error("SAVE ANNOUNCEMENT SETTINGS ERROR:", error);
      setNotice(error.message || "Unable to save announcement settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl space-y-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Announcement Bar
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Add, edit, remove, and reorder the messages shown in your storefront announcement strip.
          </p>
        </div>

        <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={announcement.enabled}
            onChange={(e) => updateAnnouncement({ enabled: e.target.checked })}
            className="h-4 w-4 accent-slate-900"
          />
          Enabled
        </label>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Live preview
          </label>
          <span className="text-[10px] text-slate-400">
            {announcement.messages.length} message(s)
          </span>
        </div>
        <div
          className="w-full overflow-hidden rounded-lg px-4 py-3 text-center text-xs font-semibold tracking-wide"
          style={{
            backgroundColor: announcement.enabled ? announcement.bgColor : "#e2e8f0",
            color: announcement.enabled ? announcement.textColor : "#64748b",
          }}
        >
          {announcement.enabled
            ? announcement.messages.filter((message) => message.trim()).join("  •  ") ||
              "Add an announcement message below"
            : "Announcement bar is disabled"}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800">Messages</h4>
          <span className="text-[10px] text-slate-400">Each row is one rotating message</span>
        </div>

        {announcement.messages.map((message, index) => (
          <div key={index} className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
              {index + 1}
            </span>
            <input
              type="text"
              value={message}
              onChange={(e) => updateMessage(index, e.target.value)}
              maxLength={180}
              aria-label={`Announcement message ${index + 1}`}
              placeholder="Enter announcement message"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-slate-900"
            />
            <button
              type="button"
              onClick={() => removeMessage(index)}
              title="Remove message"
              aria-label={`Remove message ${index + 1}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-rose-100 text-rose-600 transition hover:bg-rose-50"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}

        <form
          className="flex min-w-0 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addMessage();
          }}
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            maxLength={180}
            placeholder="Write a new message..."
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-slate-900"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={14} />
            Add
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Background color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={announcement.bgColor}
              onChange={(e) => updateAnnouncement({ bgColor: e.target.value })}
              className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
            />
            <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs font-bold text-slate-700">
              {announcement.bgColor.toUpperCase()}
            </span>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Text color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={announcement.textColor}
              onChange={(e) => updateAnnouncement({ textColor: e.target.value })}
              className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
            />
            <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs font-bold text-slate-700">
              {announcement.textColor.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {notice && (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          {notice}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => window.location.reload()}
          disabled={loading || fetching}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={14} />
          Reload saved settings
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || fetching}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-slate-800 disabled:bg-slate-300"
        >
          <Check size={14} />
          {loading ? "Saving..." : "Save announcement"}
        </button>
      </div>
    </div>
  );
}
