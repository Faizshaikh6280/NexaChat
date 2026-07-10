"use client";

import { useState } from "react";
import { Globe, FileText, Cloud, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import BotSelector from "@/components/BotSelector";

export default function KnowledgeBase() {
  const [selectedBotId, setSelectedBotId] = useState("");
  const [selectedBotName, setSelectedBotName] = useState("");
  const [url, setUrl] = useState("");
  const [folderId, setFolderId] = useState("root");
  const [ingestionStatus, setIngestionStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"info" | "success" | "error">("info");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [syncingDrive, setSyncingDrive] = useState(false);

  const showStatus = (message: string, type: "info" | "success" | "error" = "info") => {
    setIngestionStatus(message);
    setStatusType(type);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !selectedBotId) return;
    setLoading(true);
    showStatus(`Crawling website for "${selectedBotName}"…`, "info");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/ingest/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, bot_id: selectedBotId }),
      });
      const data = await res.json();
      showStatus(data.message || data.detail, res.ok ? "success" : "error");
    } catch {
      showStatus("Failed to reach the server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) { showStatus("Please select a file first.", "error"); return; }
    if (!selectedBotId) { showStatus("Please select a chatbot first.", "error"); return; }
    setUploading(true);
    showStatus(`Uploading document for "${selectedBotName}"…`, "info");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bot_id", selectedBotId);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/ingest/document`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      showStatus(data.message || data.detail, res.ok ? "success" : "error");
    } catch {
      showStatus("Failed to upload document.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleGDriveSync = async () => {
    if (!selectedBotId) { showStatus("Please select a chatbot first.", "error"); return; }
    setSyncingDrive(true);
    showStatus(`Syncing Google Drive for "${selectedBotName}"…`, "info");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/ingest/gdrive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bot_id: selectedBotId, folder_id: folderId }),
      });
      const data = await res.json();
      showStatus(data.message || data.detail, res.ok ? "success" : "error");
    } catch {
      showStatus("Failed to sync Google Drive.", "error");
    } finally {
      setSyncingDrive(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="text-sm text-gray-500 mt-1">Train your chatbot by adding knowledge sources.</p>
      </div>

      <BotSelector
        selectedBotId={selectedBotId}
        onBotChange={(id, name) => {
          setSelectedBotId(id);
          setSelectedBotName(name);
        }}
      />

      {ingestionStatus && (
        <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 text-sm font-medium border ${
          statusType === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
          statusType === "error" ? "bg-red-50 text-red-800 border-red-200" :
          "bg-blue-50 text-blue-800 border-blue-200"
        }`}>
          {statusType === "success" && <CheckCircle size={18} />}
          {statusType === "error" && <AlertCircle size={18} />}
          {statusType === "info" && <Loader2 size={18} className="animate-spin" />}
          {ingestionStatus}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* URL Crawl */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-50 rounded-lg"><Globe size={18} className="text-blue-600" /></div>
            <h2 className="text-base font-semibold text-gray-900">Crawl Website</h2>
          </div>
          <p className="text-xs text-gray-500 mb-5 ml-11">Recursively crawl a website and extract all page content.</p>
          
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Website URL</label>
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com" required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              />
            </div>
            <button type="submit" disabled={loading || !selectedBotId}
              className="w-full bg-blue-600 text-white text-sm font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Crawling…" : "Fetch & Train"}
            </button>
          </form>
        </div>

        {/* Document Upload */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-violet-50 rounded-lg"><FileText size={18} className="text-violet-600" /></div>
            <h2 className="text-base font-semibold text-gray-900">Upload Document</h2>
          </div>
          <p className="text-xs text-gray-500 mb-5 ml-11">Upload PDF or text files to add to the knowledge base.</p>
          
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select File</label>
              <input type="file" id="file-upload" accept=".pdf,.txt,.md"
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <button type="submit" disabled={uploading || !selectedBotId}
              className="w-full bg-violet-600 text-white text-sm font-semibold py-2.5 px-4 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {uploading ? "Uploading…" : "Upload & Train"}
            </button>
          </form>
        </div>

        {/* Google Drive Integration */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-emerald-50 rounded-lg"><Cloud size={18} className="text-emerald-600" /></div>
            <h2 className="text-base font-semibold text-gray-900">Google Drive</h2>
          </div>
          <p className="text-xs text-gray-500 mb-5 ml-11">
            Sync documents directly from your Google Drive folder.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Folder ID <span className="text-gray-400 font-normal">(optional — defaults to root)</span>
              </label>
              <input
                type="text"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                placeholder="root"
                className="w-full max-w-md px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Find your folder ID in the Google Drive URL: drive.google.com/drive/folders/<strong>YOUR_FOLDER_ID</strong>
              </p>
            </div>
            <button
              onClick={handleGDriveSync}
              disabled={syncingDrive || !selectedBotId}
              className="flex items-center gap-2 bg-emerald-600 text-white text-sm font-semibold py-2.5 px-5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncingDrive ? <Loader2 size={16} className="animate-spin" /> : <Cloud size={16} />}
              {syncingDrive ? "Syncing…" : "Sync Google Drive"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
