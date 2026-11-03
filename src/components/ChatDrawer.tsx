import React, { useState } from 'react';
import { ChatMessage } from '../types/game';
import { MessageSquare, Send, X, Smile } from 'lucide-react';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string, isQuickMsg?: boolean) => void;
  currentUserId: string;
}

const QUICK_EMOJIS = ['👍', '🔥', '👏', '♠️', '😮', '😂', '🎯', '👑'];
const QUICK_PHRASES = [
  'Good trick!',
  'Well played!',
  'Trumped!',
  'Nice bid!',
  'Oops!',
  'GG!',
  'Watch this!',
  'Tough luck!',
];

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  currentUserId,
}) => {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), false);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xs h-full bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 border-l border-amber-400/30 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-3 bg-black/40 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-amber-300">Table Chat & Reactions</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Reactions Bar */}
        <div className="p-2 border-b border-white/10 bg-black/20">
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onSendMessage(emoji, true)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-lg active:scale-90 transition shrink-0"
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1 mt-1.5">
            {QUICK_PHRASES.map((phrase) => (
              <button
                key={phrase}
                onClick={() => onSendMessage(phrase, true)}
                className="px-2 py-0.5 rounded-full bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-500/30 text-[10px] text-emerald-200 active:scale-95 transition"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-slate-500 text-xs italic">
              No messages yet. Send a quick reaction or message!
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 mb-0.5 px-1">
                    {msg.senderName}
                  </span>
                  <div
                    className={`max-w-[85%] px-3 py-1.5 rounded-xl text-xs break-words shadow-sm ${
                      isMe
                        ? 'bg-amber-500 text-slate-950 font-medium rounded-br-none'
                        : 'bg-white/10 text-slate-100 rounded-bl-none border border-white/5'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-2.5 bg-black/40 border-t border-white/10 flex gap-1.5">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type message..."
            maxLength={80}
            className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
