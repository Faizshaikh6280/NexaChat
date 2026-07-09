"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Save, Loader2 } from "lucide-react";

export default function Appearance() {
  const [name, setName] = useState("NexaChat Assistant");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [welcomeMessage, setWelcomeMessage] = useState("Hi there! How can I help you today?");
  
  const [status, setStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/api/config`)
      .then(res => res.json())
      .then(data => {
        if (data.name) setName(data.name);
        if (data.primary_color) setPrimaryColor(data.primary_color);
        if (data.welcome_message) setWelcomeMessage(data.welcome_message);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, primary_color: primaryColor, welcome_message: welcomeMessage }),
      });
      if (res.ok) {
        setStatus("Settings saved successfully!");
        setStatusType("success");
      } else {
        setStatus("Failed to save settings.");
        setStatusType("error");
      }
    } catch {
      setStatus("Network error.");
      setStatusType("error");
    } finally {
      setSaving(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={24} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Appearance</h1>
        <p className="text-sm text-gray-500 mt-1">Customize how the chatbot looks on your website.</p>
      </div>

      {status && (
        <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 text-sm font-medium border ${
          statusType === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"
        }`}>
          {statusType === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {status}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            {/* Bot Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Chatbot Name</label>
              <p className="text-xs text-gray-500 mb-2">Displayed in the chat window header.</p>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Primary Color</label>
              <p className="text-xs text-gray-500 mb-2">Used for the bubble, header, and user messages.</p>
              <div className="flex items-center gap-3">
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-11 h-11 p-0.5 bg-white border border-gray-300 rounded-lg cursor-pointer"
                />
                <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                  pattern="^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$" required
                  className="px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-28 font-mono"
                />
              </div>
            </div>

            {/* Welcome Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Welcome Message</label>
              <p className="text-xs text-gray-500 mb-2">The first message visitors see.</p>
              <textarea value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} required rows={3}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold py-2.5 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                <Save size={16} />
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Live Preview</h2>
          <div className="relative w-full h-[460px] border border-gray-200 rounded-2xl bg-gray-50 overflow-hidden">
            
            {/* Chat Bubble */}
            <div className="absolute bottom-3 right-3 w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-white"
              style={{ backgroundColor: primaryColor }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 2C6.477 2 2 6.03 2 11c0 2.87 1.54 5.43 3.93 7.07.19 1.13-.19 2.58-.93 3.69-.14.21-.05.5.17.62.15.08.33.07.47-.02 1.93-1.16 3.65-1.12 4.67-.97C10.84 21.72 11.41 21.8 12 21.8c5.523 0 10-4.03 10-9s-4.477-9-10-9z"/>
              </svg>
            </div>

            {/* Chat Window Preview */}
            <div className="absolute bottom-16 right-3 left-3 top-3 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
              <div className="px-4 py-3 text-white text-sm font-semibold flex justify-between items-center"
                style={{ backgroundColor: primaryColor }}>
                <span>{name}</span>
                <span className="opacity-60 text-xs">✕</span>
              </div>
              <div className="flex-1 p-3 bg-gray-50 space-y-2.5">
                <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none px-3 py-2 text-xs text-gray-800 shadow-sm max-w-[85%]">
                  {welcomeMessage}
                </div>
                <div className="px-3 py-2 rounded-lg rounded-br-none text-white text-xs shadow-sm max-w-[85%] ml-auto"
                  style={{ backgroundColor: primaryColor }}>
                  Tell me about your services
                </div>
              </div>
              <div className="p-2.5 border-t border-gray-100 bg-white flex gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-8"></div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: primaryColor }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
