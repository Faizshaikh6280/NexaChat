"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Database, Palette, Code, Bot, Zap } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "My Chatbots", href: "/bots", icon: Bot },
    { name: "Knowledge Base", href: "/knowledge", icon: Database },
    { name: "Appearance", href: "/appearance", icon: Palette },
    { name: "Embed Chatbot", href: "/embed", icon: Code },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-base">NexaChat</span>
            <span className="block text-[10px] text-gray-400 font-medium uppercase tracking-widest -mt-0.5">
              AI Platform
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 pt-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
          Main Menu
        </p>
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={18} className={isActive ? "text-blue-600" : "text-gray-400"} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
