"use client";

import { useState } from "react";
import { Check, Copy, Code, ExternalLink } from "lucide-react";
import BotSelector from "@/components/BotSelector";

export default function Embed() {
  const [selectedBotId, setSelectedBotId] = useState("");
  const [selectedBotName, setSelectedBotName] = useState("");
  const [copied, setCopied] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const snippetCode = selectedBotId
    ? `<script src="${apiUrl}/static/widget.js" data-bot-id="${selectedBotId}"></script>`
    : "<!-- Select a chatbot above to generate the embed code -->";

  const copyToClipboard = () => {
    if (!selectedBotId) return;
    navigator.clipboard.writeText(snippetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Embed Chatbot</h1>
        <p className="text-sm text-gray-500 mt-1">
          Add the AI chatbot to any website with a single line of code.
        </p>
      </div>

      <BotSelector
        selectedBotId={selectedBotId}
        onBotChange={(id, name) => {
          setSelectedBotId(id);
          setSelectedBotName(name);
        }}
      />

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Code size={18} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Embed Code {selectedBotName ? `for "${selectedBotName}"` : ""}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Copy and paste this snippet before the closing <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">&lt;/body&gt;</code> tag on your website.
            </p>
          </div>
        </div>

        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
            {snippetCode}
          </pre>
          {selectedBotId && (
            <button
              onClick={copyToClipboard}
              className="absolute top-3 right-3 flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">How it Works</h2>
        <div className="space-y-4">
          {[
            {
              step: "1",
              title: "Create a Chatbot",
              desc: 'Go to "My Chatbots" and create a new chatbot for your company.',
            },
            {
              step: "2",
              title: "Train with Knowledge",
              desc: "Go to Knowledge Base, select your bot, and crawl your website or upload documents.",
            },
            {
              step: "3",
              title: "Customize Appearance",
              desc: "Go to Appearance to change your chatbot's name, color, and welcome message.",
            },
            {
              step: "4",
              title: "Embed on Your Website",
              desc: "Copy the code snippet above and paste it into your website's HTML.",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center">
                {item.step}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
