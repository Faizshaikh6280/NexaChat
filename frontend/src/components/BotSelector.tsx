"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Bot } from "lucide-react";
import { listBots } from "@/lib/api";

interface BotItem {
  bot_id: string;
  company_name: string;
}

interface BotSelectorProps {
  selectedBotId: string;
  onBotChange: (botId: string, companyName: string) => void;
}

export default function BotSelector({ selectedBotId, onBotChange }: BotSelectorProps) {
  const [bots, setBots] = useState<BotItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const data = await listBots();
        setBots(data);
        // Auto-select first bot if nothing is selected
        if (!selectedBotId && data.length > 0) {
          onBotChange(data[0].bot_id, data[0].company_name);
        }
      } catch (e) {
        console.error("Failed to fetch bots:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchBots();
  }, []);

  if (loading) {
    return (
      <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 animate-pulse">
        <div className="h-10 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  if (bots.length === 0) {
    return (
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
        <Bot size={18} className="text-amber-600" />
        <p className="text-sm text-amber-800 font-medium">
          No chatbots created yet. Go to{" "}
          <a href="/bots" className="underline font-semibold hover:text-amber-900">
            My Chatbots
          </a>{" "}
          to create one first.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        Select Chatbot
      </label>
      <div className="relative">
        <select
          value={selectedBotId}
          onChange={(e) => {
            const bot = bots.find((b) => b.bot_id === e.target.value);
            if (bot) onBotChange(bot.bot_id, bot.company_name);
          }}
          className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 pr-10 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
        >
          {bots.map((bot) => (
            <option key={bot.bot_id} value={bot.bot_id}>
              {bot.company_name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </div>
  );
}
