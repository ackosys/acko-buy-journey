'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/lib/types';

function AuraBotAvatar() {
  return (
    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-lg shadow-black/30">
      <img src="/chatbot-avatar.png" alt="ACKO" className="w-full h-full object-cover" />
    </div>
  );
}

interface AuraChatMessageProps {
  message: ChatMessageType;
  onEdit?: (stepId: string) => void;
}

export default function AuraChatMessage({ message, onEdit }: AuraChatMessageProps) {
  const [showEdit, setShowEdit] = useState(false);

  if (message.type === 'system') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center my-4"
      >
        <span className="text-[12px] font-medium text-[#94A3B8] bg-[#1E1E22] px-4 py-1.5 rounded-full border border-white/5">
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
        <div className="relative max-w-[80%]">
          <div
            className="px-4 py-3 text-white font-medium"
            style={{
              background: 'linear-gradient(135deg, #A855F7, #7E22CE)',
              borderRadius: '20px 20px 4px 20px',
              boxShadow: '0 4px 12px rgba(168,85,247,0.3)',
            }}
          >
            <p className="text-[15px]">{message.content}</p>
          </div>
          {message.editable && showEdit && onEdit && message.stepId && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => onEdit(message.stepId!)}
              className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#2D2D35] border border-white/10 rounded-full flex items-center justify-center shadow-md hover:bg-[#3D3D45] transition-colors"
              title="Edit this answer"
            >
              <svg className="w-3 h-3 text-[#C084FC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
      className="flex gap-3 mb-4"
    >
      <div className="flex-shrink-0 mt-0.5">
        <AuraBotAvatar />
      </div>

      <div className="max-w-[80%]">
        <div
          style={{
            background: '#1E1E22',
            color: '#F8FAFC',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '20px 20px 20px 4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            padding: '12px 16px',
          }}
        >
          {message.content.split('\n\n').map((paragraph, i) => (
            <p key={i} className={`text-[15px] leading-relaxed ${i > 0 ? 'mt-2' : ''}`}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function AuraTypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-3 mb-4"
    >
      <div className="flex-shrink-0">
        <AuraBotAvatar />
      </div>
      <div
        className="flex items-center gap-1.5"
        style={{
          background: '#1E1E22',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '20px 20px 20px 4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          padding: '12px 16px',
        }}
      >
        <span className="w-2 h-2 bg-[#A855F7] rounded-full animate-typing" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-[#A855F7] rounded-full animate-typing" style={{ animationDelay: '200ms' }} />
        <span className="w-2 h-2 bg-[#A855F7] rounded-full animate-typing" style={{ animationDelay: '400ms' }} />
      </div>
    </motion.div>
  );
}
