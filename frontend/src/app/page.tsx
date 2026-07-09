"use client";

import { Activity, MessageSquare, Database, Users, Palette, Code, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const stats = [
    { name: "Conversations", value: "0", icon: MessageSquare, color: "blue" },
    { name: "Indexed Pages", value: "6", icon: Database, color: "emerald" },
    { name: "Active Users", value: "0", icon: Users, color: "violet" },
    { name: "Resolution Rate", value: "—", icon: Activity, color: "amber" },
  ];

  const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
    blue:    { bg: "bg-blue-50",    text: "text-blue-700",    icon: "text-blue-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "text-emerald-600" },
    violet:  { bg: "bg-violet-50",  text: "text-violet-700",  icon: "text-violet-600" },
    amber:   { bg: "bg-amber-50",   text: "text-amber-700",   icon: "text-amber-600" },
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor your chatbot performance at a glance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colors = colorMap[stat.color];
          return (
            <div key={stat.name} className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2 ${colors.bg} rounded-lg`}>
                  <Icon size={18} className={colors.icon} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.name}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Quick Actions - 3 cols */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { href: "/knowledge", icon: Database, title: "Add Knowledge Source", desc: "Crawl a website or upload documents", color: "blue" },
              { href: "/appearance", icon: Palette, title: "Customize Chatbot", desc: "Change colors, name, and welcome message", color: "violet" },
              { href: "/embed", icon: Code, title: "Embed on Website", desc: "Get the code snippet for your site", color: "emerald" },
            ].map((action) => {
              const ActionIcon = action.icon;
              const colors = colorMap[action.color];
              return (
                <Link key={action.href} href={action.href} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                  <div className={`p-2.5 ${colors.bg} rounded-lg group-hover:scale-105 transition-transform`}>
                    <ActionIcon size={18} className={colors.icon} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">{action.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
                  </div>
                  <ArrowUpRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity - 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="flex flex-col items-center justify-center h-56 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={22} className="text-gray-300" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">No conversations yet</h3>
            <p className="text-xs text-gray-500 mt-1.5 max-w-[200px] leading-relaxed">
              Conversations from your embedded chatbot will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
