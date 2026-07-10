"use client";

import { useState, useEffect } from "react";
import { Bot, Plus, Trash2, Copy, Check, Loader2, Building2 } from "lucide-react";
import { createBot, listBots, deleteBot } from "@/lib/api";

interface BotItem {
  bot_id: string;
  company_name: string;
  created_at: string | null;
}

export default function BotsPage() {
  const [bots, setBots] = useState<BotItem[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      const data = await listBots();
      setBots(data);
    } catch (e) {
      console.error("Failed to fetch bots:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    setCreating(true);
    try {
      await createBot(companyName.trim());
      setCompanyName("");
      await fetchBots();
    } catch (e) {
      console.error("Failed to create bot:", e);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (botId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the "${name}" chatbot? This cannot be undone.`)) return;
    try {
      await deleteBot(botId);
      await fetchBots();
    } catch (e) {
      console.error("Failed to delete bot:", e);
    }
  };

  const copyBotId = (botId: string) => {
    navigator.clipboard.writeText(botId);
    setCopiedId(botId);
    setTimeout(() => setCopiedId(null), 2000);
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
        <h1 className="text-2xl font-bold text-gray-900">My Chatbots</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create and manage isolated chatbots for each company. Each bot has its own knowledge base.
        </p>
      </div>

      {/* Create New Bot */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Plus size={18} className="text-blue-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Create New Chatbot</h2>
        </div>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Enter company name (e.g., Aura Fitness)"
            required
            className="flex-1 px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <button
            type="submit"
            disabled={creating}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold py-2.5 px-5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {creating ? "Creating…" : "Create Bot"}
          </button>
        </form>
      </div>

      {/* Bots List */}
      {bots.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot size={28} className="text-gray-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No chatbots yet</h3>
          <p className="text-sm text-gray-500">Create your first chatbot above to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bots.map((bot) => (
            <div
              key={bot.bot_id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-violet-50 rounded-lg">
                    <Building2 size={20} className="text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{bot.company_name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {bot.created_at ? new Date(bot.created_at).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(bot.bot_id, bot.company_name)}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete bot"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1.5 font-medium">Bot ID</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded font-mono flex-1 truncate">
                    {bot.bot_id}
                  </code>
                  <button
                    onClick={() => copyBotId(bot.bot_id)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Copy Bot ID"
                  >
                    {copiedId === bot.bot_id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
