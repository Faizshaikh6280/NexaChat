"use client";

import { useState } from "react";
import { Globe, FileText, Cloud, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function KnowledgeBase() {
  const [url, setUrl] = useState("");
  const [ingestionStatus, setIngestionStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"info" | "success" | "error">("info");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const showStatus = (message: string, type: "info" | "success" | "error" = "info") => {
    setIngestionStatus(message);
    setStatusType(type);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    showStatus("Crawling website…", "info");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/ingest/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      showStatus(data.status || data.detail, res.ok ? "success" : "error");
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
    setUploading(true);
    showStatus("Uploading document…", "info");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/ingest/document`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      showStatus(data.status || data.detail, res.ok ? "success" : "error");
    } catch {
      showStatus("Failed to upload document.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="text-sm text-gray-500 mt-1">Train your chatbot by adding knowledge sources.</p>
      </div>

      {/* Status Banner */}
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
              <input
                type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com" required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white text-sm font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Crawling…" : "Fetch & Train"}
            </button>
          </form>
        </div>

        {/* Document Upload */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-violet-50 rounded-lg"><FileText size={18} className="text-violet-600" /></div>
            <h2 className="text-base font-semibold text-gray-900">Upload Documents</h2>
          </div>
          <p className="text-xs text-gray-500 mb-5 ml-11">Upload PDF, TXT, or DOCX files to train the chatbot.</p>
          
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select File</label>
              <input type="file" id="file-upload" accept=".pdf,.txt,.docx"
                className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
            <button type="submit" disabled={uploading}
              className="w-full bg-blue-600 text-white text-sm font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {uploading ? "Uploading…" : "Upload & Train"}
            </button>
          </form>
        </div>

        {/* Integrations */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-amber-50 rounded-lg"><Cloud size={18} className="text-amber-600" /></div>
            <h2 className="text-base font-semibold text-gray-900">Integrations</h2>
          </div>
          <p className="text-xs text-gray-500 mb-5 ml-11">Connect third-party tools to automatically sync your knowledge base.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["Google Drive", "Notion", "Zendesk", "Confluence"].map((name) => (
              <button key={name} className="flex flex-col items-center justify-center p-5 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/40 transition-all group">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2.5 group-hover:bg-blue-100 transition-colors">
                  <span className="text-lg">
                    {name === "Google Drive" && "📁"}
                    {name === "Notion" && "📝"}
                    {name === "Zendesk" && "🎧"}
                    {name === "Confluence" && "📘"}
                  </span>
                </div>
                <span className="text-xs font-semibold text-gray-700">{name}</span>
                <span className="text-[10px] text-gray-400 mt-0.5">Coming soon</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
