'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, User, Bot } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hello! I'm Chinedu, your personal property broker. \n\nTell me what you're looking for (e.g., \"3-bed in Lekki under 5m\") or ask me about a specific area.",
};

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages: aiMessages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  // Combine welcome message with AI messages
  const getMessageContent = (message: typeof aiMessages[0]) => {
    return message.parts
      .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
      .map((part) => part.text)
      .join('');
  };

  const allMessages: ChatMessage[] = [
    WELCOME_MESSAGE,
    ...aiMessages.map((msg) => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: getMessageContent(msg),
    })),
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages, isOpen]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
          isOpen ? 'bg-slate-800 rotate-90' : 'bg-emerald-600 hover:bg-emerald-700'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="p-4 bg-emerald-900 text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Bot className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Chinedu AI</h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Online • Powered by Gemini
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {allMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-slate-200' : 'bg-emerald-100'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-5 h-5 text-slate-600" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={onSubmit} className="p-4 bg-white border-t border-slate-100">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Chinedu..."
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 text-[10px] text-center text-slate-400">
              AI can make mistakes. Verify info with agents.
            </div>
          </form>
        </div>
      )}
    </>
  );
}
