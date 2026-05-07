import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Loader2, Coins, Sparkles, MessageSquare } from 'lucide-react';
import apiClient from '../../lib/apiClient';
import { getErrorMessage } from '../../lib/utils';

const CHAT_TOKEN_COST = 0.1;

/**
 * FloatingChatbot — A floating chatbot widget rendered via React Portal.
 * Appears as a fixed icon at the bottom-right corner of every page.
 * Each chat message costs 0.1 tokens (deducted by the backend).
 *
 * Props:
 *   user  — current authenticated user (null if guest)
 *   quota — { token_balance, free_used, free_limit }
 *   onQuotaChange — callback to sync token_balance after deduction
 */
export const FloatingChatbot = ({ user, quota, onQuotaChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize greeting when opening for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          isUser: false,
          text: `Xin chào${user?.name ? ` ${user.name}` : ''}! 👋\nTôi là Trợ lý AI của The Archivist, chuyên về gốm sứ cổ. Hãy hỏi tôi bất cứ điều gì!`,
          time: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length, user?.name]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const send = useCallback(async () => {
    const q = input.trim();
    if (!q || loading) return;

    // Check auth
    if (!user) {
      setMessages((p) => [
        ...p,
        { isUser: true, text: q, time: new Date() },
        {
          isUser: false,
          text: 'Bạn cần đăng nhập để sử dụng chatbot. Mỗi câu hỏi sẽ trừ 0.1 token.',
          isError: true,
          time: new Date(),
        },
      ]);
      setInput('');
      return;
    }

    // Check balance
    const freeUsed = quota?.free_used ?? 0;
    const freeLimit = quota?.free_limit ?? 5;
    const balance = quota?.token_balance ?? 0;

    if (freeUsed >= freeLimit && balance < CHAT_TOKEN_COST) {
      setMessages((p) => [
        ...p,
        { isUser: true, text: q, time: new Date() },
        {
          isUser: false,
          text: `Tài khoản của bạn không đủ token (cần ${CHAT_TOKEN_COST} token). Vui lòng nạp thêm để tiếp tục sử dụng chatbot.`,
          isError: true,
          time: new Date(),
        },
      ]);
      setInput('');
      return;
    }

    setMessages((p) => [...p, { isUser: true, text: q, time: new Date() }]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post('/ai/chat', { question: q });
      const data = res.data?.data || res.data;
      const reply = data?.answer || data?.message || '...';
      const newBalance = data?.user_token_balance;

      setMessages((p) => [
        ...p,
        {
          isUser: false,
          text: reply,
          sources: data?.sources,
          time: new Date(),
        },
      ]);

      // Sync quota
      if (newBalance !== undefined && onQuotaChange) {
        onQuotaChange({ token_balance: newBalance });
      }
    } catch (err) {
      const status = err?.response?.status;
      let errorText;
      if (status === 402) {
        errorText = 'Tài khoản hết lượt. Vui lòng nạp thêm token để tiếp tục.';
      } else {
        errorText = getErrorMessage(err, 'Không thể kết nối AI. Vui lòng thử lại sau.');
      }
      setMessages((p) => [
        ...p,
        { isUser: false, text: errorText, isError: true, time: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, user, quota, onQuotaChange]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const tokenBalance = Number(quota?.token_balance ?? 0);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* ── Floating Button ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            id="floating-chatbot-trigger"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[9990] flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-shadow hover:shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #0F265C 0%, #1a3a7a 100%)',
            }}
            aria-label="Mở chatbot"
          >
            <MessageSquare size={22} className="text-white" />
            {/* Pulse ring */}
            <span className="absolute inset-0 animate-ping rounded-full opacity-20" style={{ background: 'linear-gradient(135deg, #0F265C 0%, #1a3a7a 100%)' }} />
            {/* Online dot */}
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="floating-chatbot-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-[9995] flex w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl shadow-2xl"
            style={{
              height: 'min(560px, calc(100vh - 6rem))',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div
              className="relative flex items-center justify-between px-5 py-4"
              style={{
                background: 'linear-gradient(135deg, #0F265C 0%, #142C6E 100%)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    The Archivist AI
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[11px] text-white/70">Online • {CHAT_TOKEN_COST} token/câu hỏi</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Token balance badge */}
                {user && (
                  <div className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 backdrop-blur-sm">
                    <Coins size={12} className="text-amber-300" />
                    <span className="text-[11px] font-semibold text-amber-100">
                      {tokenBalance.toFixed(1)}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                  aria-label="Đóng chatbot"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto p-4"
              style={{
                background: 'linear-gradient(180deg, #f8f6f0 0%, #F7F2E8 100%)',
              }}
            >
              {/* Dark mode override */}
              <style>{`
                .dark #floating-chatbot-panel .chatbot-messages-area {
                  background: linear-gradient(180deg, #0A0F1F 0%, #111827 100%) !important;
                }
              `}</style>
              <div className="chatbot-messages-area" />

              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.05 }}
                  className={'flex ' + (m.isUser ? 'justify-end' : 'justify-start')}
                >
                  {/* Bot avatar */}
                  {!m.isUser && (
                    <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy/10 dark:bg-white/10">
                      <Sparkles size={13} className="text-navy dark:text-ceramic" />
                    </div>
                  )}
                  <div
                    className={
                      'max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ' +
                      (m.isUser
                        ? 'rounded-br-md bg-navy text-white dark:bg-ceramic dark:text-navy-dark'
                        : m.isError
                        ? 'rounded-bl-md border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300'
                        : 'rounded-bl-md bg-white text-navy-dark shadow-sm dark:bg-dark-surface dark:text-dark-text')
                    }
                  >
                    {m.text}
                    {/* Sources */}
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-2 border-t border-black/5 pt-1.5 text-[10px] text-muted dark:border-white/10 dark:text-dark-text-muted">
                        📚 {m.sources.join(' • ')}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy/10 dark:bg-white/10">
                    <Sparkles size={13} className="text-navy dark:text-ceramic" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-[13px] text-muted shadow-sm dark:bg-dark-surface dark:text-dark-text-muted">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Đang suy nghĩ...</span>
                    <div className="flex gap-0.5">
                      <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-navy/30 dark:bg-white/30" style={{ animationDelay: '0ms' }} />
                      <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-navy/30 dark:bg-white/30" style={{ animationDelay: '150ms' }} />
                      <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-navy/30 dark:bg-white/30" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input area */}
            <div
              className="flex items-center gap-2 border-t px-3 py-3"
              style={{
                borderColor: 'rgba(0,0,0,0.06)',
                background: '#fff',
              }}
            >
              {/* Dark mode inline style override */}
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={user ? 'Hỏi về gốm sứ...' : 'Đăng nhập để sử dụng chatbot'}
                disabled={loading || !user}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-[13px] text-navy placeholder:text-gray-400 focus:border-navy/30 focus:bg-white focus:outline-none dark:border-dark-stroke dark:bg-dark-surface-alt dark:text-dark-text dark:placeholder:text-dark-text-muted dark:focus:border-ceramic/50"
              />
              <button
                type="button"
                onClick={send}
                disabled={loading || !input.trim() || !user}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-all hover:shadow-md disabled:opacity-40 disabled:shadow-none"
                style={{
                  background: loading || !input.trim() || !user
                    ? '#9CA3AF'
                    : 'linear-gradient(135deg, #0F265C 0%, #1a3a7a 100%)',
                }}
                aria-label="Gửi tin nhắn"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>

            {/* Cost notice */}
            <div className="flex items-center justify-center gap-1 border-t border-gray-100 bg-gray-50/80 px-3 py-1.5 dark:border-dark-stroke dark:bg-dark-surface">
              <Coins size={10} className="text-amber-500" />
              <span className="text-[10px] text-muted dark:text-dark-text-muted">
                Mỗi câu hỏi trừ {CHAT_TOKEN_COST} token
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
};

export default FloatingChatbot;
