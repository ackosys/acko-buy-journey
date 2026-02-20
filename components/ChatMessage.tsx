'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface ChatMessageProps {
  message: {
    id: string;
    type: 'bot' | 'user' | 'system';
    content: string;
    timestamp: number;
    editable?: boolean;
    stepId?: string;
  };
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
        <span className="text-label-md px-4 py-1.5 rounded-full" style={{ color: 'var(--motor-text-muted)', background: 'var(--motor-surface)', border: '1px solid var(--motor-border)' }}>
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
          <div className="px-4 py-2.5 chat-bubble-user shadow-lg" style={{ background: 'var(--motor-user-bubble-bg, #FFFFFF)', color: 'var(--motor-user-bubble-text, #1C0B47)' }}>
            <p className="text-body-md font-medium">{message.content}</p>
          </div>
          {message.editable && showEdit && onEdit && message.stepId && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => onEdit(message.stepId!)}
              className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-colors"
              style={{ background: 'var(--motor-surface)', border: '1px solid var(--motor-border-strong)' }}
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

  // Bot message — frosted glass on dark
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
      className="flex mb-4"
    >
      <div className="max-w-[85%]">
        <div className="backdrop-blur-sm px-4 py-3 chat-bubble-bot" style={{ background: 'var(--motor-surface)', border: '1px solid var(--motor-border)' }}>
          {message.content.split('\n\n').map((paragraph, i) => (
            <p key={i} className={`text-body-md ${i > 0 ? 'mt-2' : ''}`} style={{ color: 'var(--motor-bot-text)' }}>
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
      className="flex mb-4"
    >
      <div className="backdrop-blur-sm px-4 py-3 chat-bubble-bot flex items-center gap-1.5" style={{ background: 'var(--motor-surface)', border: '1px solid var(--motor-border)' }}>
        <span className="w-2 h-2 bg-purple-400 rounded-full animate-typing" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-purple-400 rounded-full animate-typing" style={{ animationDelay: '200ms' }} />
        <span className="w-2 h-2 bg-purple-400 rounded-full animate-typing" style={{ animationDelay: '400ms' }} />
      </div>
    </motion.div>
  );
}
