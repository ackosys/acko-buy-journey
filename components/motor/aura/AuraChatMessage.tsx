'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { ChatMessage as ChatMessageType } from '@/lib/types';


interface AuraChatMessageProps {
  message: ChatMessageType;
  onEdit?: (stepId: string) => void;
  animate?: boolean;
}

export default function AuraChatMessage({ message, onEdit, animate = false }: AuraChatMessageProps) {
  const [showEdit, setShowEdit] = useState(false);

  if (message.type === 'system') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center my-4"
      >
        <span
          className="text-[12px] font-medium px-4 py-1.5 rounded-full"
          style={{ color: 'var(--aura-text-muted)', background: 'var(--aura-surface)', border: '1px solid var(--aura-border)' }}
        >
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
              background: 'linear-gradient(0deg, #5920C5 0%, #7C47E1 100%)',
              borderRadius: '20px 4px 20px 20px',
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
              className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-colors"
              style={{ background: 'var(--aura-surface-2)', border: '1px solid var(--aura-border-strong)' }}
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

  const wordList = useMemo(() => {
    const result: { text: string; para: number }[] = [];
    message.content.split('\n\n').forEach((para, pi) => {
      para.split(' ').forEach(word => {
        if (word) result.push({ text: word, para: pi });
      });
    });
    return result;
  }, [message.content]);

  const [visibleCount, setVisibleCount] = useState(animate ? 0 : wordList.length);

  useEffect(() => {
    if (!animate || visibleCount >= wordList.length) return;
    const t = setTimeout(() => setVisibleCount(c => c + 1), 55);
    return () => clearTimeout(t);
  }, [animate, visibleCount, wordList.length]);

  useEffect(() => {
    if (!animate) setVisibleCount(wordList.length);
  }, [animate, wordList.length]);

  const paragraphCount = message.content.split('\n\n').length;
  const visibleByPara: string[][] = Array.from({ length: paragraphCount }, () => []);
  wordList.slice(0, visibleCount).forEach(w => visibleByPara[w.para].push(w.text));
  const visibleParagraphs = visibleByPara.filter(p => p.length > 0);
  const isTypingOut = animate && visibleCount < wordList.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
      className="flex mb-4"
    >
      <div className="max-w-[80%]">
        <div
          style={{
            background: 'var(--aura-surface)',
            color: 'var(--aura-bot-text)',
            border: '1px solid var(--aura-border)',
            borderRadius: '4px 20px 20px 20px',
            boxShadow: '0 4px 12px var(--aura-shadow)',
            padding: '12px 16px',
          }}
        >
          {visibleParagraphs.map((words, i) => (
            <p key={i} className={`text-[15px] leading-relaxed ${i > 0 ? 'mt-2' : ''}`}>
              {words.join(' ')}
              {isTypingOut && i === visibleParagraphs.length - 1 && (
                <span className="inline-block w-[2px] h-[1em] align-middle ml-[2px] rounded-full bg-[#A855F7] animate-pulse" />
              )}
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
      className="flex mb-4"
    >
      <div
        className="flex items-center gap-1.5"
        style={{
          background: 'var(--aura-surface)',
          border: '1px solid var(--aura-border)',
          borderRadius: '4px 20px 20px 20px',
          boxShadow: '0 4px 12px var(--aura-shadow)',
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
