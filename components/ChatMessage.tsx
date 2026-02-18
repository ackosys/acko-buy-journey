'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/lib/types';

/* ── Heart Avatar — Red heart in white circle ── */
function HeartAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg shadow-purple-900/20 flex-shrink-0">
      <svg className="w-4.5 h-4.5" width="18" height="18" viewBox="0 0 24 24" fill="#EF4444" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    </div>
  );
}

interface ChatMessageProps {
  message: ChatMessageType;
  onEdit?: (stepId: string) => void;
}

export default function ChatMessage({ message, onEdit }: ChatMessageProps) {
  const [showEdit, setShowEdit] = useState(false);

  if (message.type === 'system') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center my-4"
      >
        <span className="text-label-md text-purple-300/60 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
          {message.content}
        </span>
      </motion.div>
    );
  }

  if (message.type === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.215, 0.61, 0.355, 1] }}
        className="flex justify-end mb-4 group"
        onMouseEnter={() => message.editable && setShowEdit(true)}
        onMouseLeave={() => setShowEdit(false)}
      >
        <div className="relative max-w-[85%]">
          <div className="bg-white text-[#1C0B47] px-4 py-2.5 chat-bubble-user shadow-lg shadow-purple-900/10">
            <p className="text-body-md font-medium">{message.content}</p>
          </div>
          {message.editable && showEdit && onEdit && message.stepId && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => onEdit(message.stepId!)}
              className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/10 border border-white/20 rounded-full flex items-center justify-center shadow-md hover:bg-white/20 transition-colors"
              title="Edit this answer"
            >
              <svg className="w-3 h-3 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }

  // Bot message — glass card on dark with heart avatar
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
      className="flex gap-3 mb-4"
    >
      {/* Heart Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        <HeartAvatar />
      </div>

      {/* Message — frosted glass on dark */}
      <div className="max-w-[85%]">
        <div className="bg-white/10 backdrop-blur-sm px-4 py-3 chat-bubble-bot border border-white/10">
          {message.content.split('\n\n').map((paragraph, i) => (
            <p key={i} className={`text-body-md text-white/90 ${i > 0 ? 'mt-2' : ''}`}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Typing Indicator ── */
export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-3 mb-4"
    >
      <div className="flex-shrink-0">
        <HeartAvatar />
      </div>
      <div className="bg-white/10 backdrop-blur-sm px-4 py-3 chat-bubble-bot flex items-center gap-1.5 border border-white/10">
        <span className="w-2 h-2 bg-purple-400 rounded-full animate-typing" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-purple-400 rounded-full animate-typing" style={{ animationDelay: '200ms' }} />
        <span className="w-2 h-2 bg-purple-400 rounded-full animate-typing" style={{ animationDelay: '400ms' }} />
      </div>
    </motion.div>
  );
}
