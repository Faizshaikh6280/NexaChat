'use client';

import { useState, useRef, useEffect } from 'react';
import { chatWithBot } from '@/lib/api';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Hi! Ask me anything about the company.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await chatWithBot(userMessage, 'preview-bot-id');
      setMessages(prev => [...prev, { role: 'bot', text: res.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-indigo-600 text-white p-4 font-bold text-lg flex justify-between items-center shadow-sm">
            <span>AI Assistant</span>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-indigo-200">
              ✕
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`max-w-[85%] p-3 rounded-xl text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white self-end rounded-br-sm' 
                    : 'bg-white text-gray-800 border border-gray-100 self-start rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="bg-white border border-gray-100 text-gray-400 p-3 rounded-xl text-sm self-start max-w-[85%] rounded-bl-sm shadow-sm">
                <span className="animate-pulse">Typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..." 
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
            />
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-indigo-600 text-white px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition transform hover:scale-110 active:scale-95"
        >
          💬
        </button>
      )}
    </div>
  );
}
