"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Database, Palette, Code, Settings, Zap } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Knowledge Base", href: "/knowledge", icon: Database },
    { name: "Appearance", href: "/appearance", icon: Palette },
    { name: "Embed Chatbot", href: "/embed", icon: Code },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight tracking-tight">NexaChat</h1>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">AI Platform</p>
          </div>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Main Menu</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive 
                  ? "bg-blue-50 text-blue-700 font-semibold" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium transition-all">
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}
