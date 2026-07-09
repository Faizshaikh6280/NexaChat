"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

export default function Embed() {
  const [copied, setCopied] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const snippetCode = `<script src="${apiUrl}/static/widget.js"></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Embed Chatbot</h1>
        <p className="text-sm text-gray-500 mt-1">Add NexaChat to any website with a single line of code.</p>
      </div>

      {/* Code Snippet Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 max-w-3xl">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-base font-semibold text-gray-900">Installation</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Paste this snippet before the closing <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-700">&lt;/body&gt;</code> tag of your HTML page.
        </p>
        
        <div className="relative group">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed border border-gray-800">
            <code>{snippetCode}</code>
          </pre>
          <button
            onClick={copyToClipboard}
            className={`absolute top-3 right-3 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              copied 
                ? "bg-emerald-500 text-white" 
                : "bg-gray-700 hover:bg-gray-600 text-gray-300"
            }`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 max-w-3xl">
        <h2 className="text-base font-semibold text-gray-900 mb-4">How It Works</h2>
        <div className="space-y-4">
          {[
            { step: "1", title: "Add the script", desc: "Paste the code snippet into your website's HTML." },
            { step: "2", title: "Widget loads automatically", desc: "A chat bubble appears in the bottom-right corner of your site." },
            { step: "3", title: "Connected to your data", desc: "The chatbot answers questions using your trained knowledge base." },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {item.step}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supported Platforms */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 max-w-3xl">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <ExternalLink size={16} className="text-blue-600" />
          Supported Platforms
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["WordPress", "Webflow", "Shopify", "React / Next.js", "Squarespace", "Wix", "HTML / CSS", "Vue.js"].map((platform) => (
            <div key={platform} className="flex items-center gap-2 text-sm text-gray-700 font-medium">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              {platform}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
