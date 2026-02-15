import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, User, Minimize2, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useMatchStore } from "./store";
import cn from "classnames";

export function ChatWidget() {
  const {
    matchStatus,
    setMatchStatus,
    matchedUser,
    messages,
    sendMessage,
    chatOpen,
    setChatOpen,
    reset,
  } = useMatchStore();
  const { t } = useTranslation();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage(input);
    setInput("");
  };

  if (matchStatus === "idle") return null;

  return (
    <div className="fixed bottom-4 right-4 z-[95] flex flex-col items-end pointer-events-none">
      <div className="pointer-events-auto">
        <AnimatePresence mode="wait">
          {/* Searching State */}
          {matchStatus === "searching" && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-black/90 text-white p-4 rounded-2xl shadow-2xl border border-white/10 w-72 flex items-center gap-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                <Loader2 className="animate-spin text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-sm">{t("match.searching")}</h3>
                <p className="text-xs text-white/50">
                  {t("match.searchingDesc")}
                </p>
              </div>
              <button
                onClick={() => reset()}
                className="ml-auto text-white/40 hover:text-white"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}

          {/* Matched / Chat State */}
          {matchStatus === "matched" && (
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.9 }}
              animate={{
                y: chatOpen ? 0 : 0,
                opacity: 1,
                scale: 1,
                height: chatOpen ? "auto" : "60px",
              }}
              className={cn(
                "bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300",
                chatOpen
                  ? "w-80 h-[400px]"
                  : "w-72 h-16 flex items-center px-4 cursor-pointer hover:bg-white/5",
              )}
              onClick={() => !chatOpen && setChatOpen(true)}
            >
              {/* Header */}
              <div
                className={cn(
                  "bg-black/50 p-3 flex items-center justify-between border-b border-white/5",
                  !chatOpen && "bg-transparent border-none w-full p-0",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                    {matchedUser?.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      {matchedUser?.name}
                    </h3>
                    {chatOpen && (
                      <p className="text-[10px] text-green-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>{" "}
                        {t("match.online")}
                      </p>
                    )}
                    {!chatOpen && (
                      <p className="text-xs text-green-400">
                        {t("match.matchFound")}
                      </p>
                    )}
                  </div>
                </div>

                {chatOpen && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatOpen(false);
                      }}
                      className="p-1.5 hover:bg-white/10 rounded-full text-white/60 hover:text-white"
                    >
                      <Minimize2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        reset();
                      }}
                      className="p-1.5 hover:bg-white/10 rounded-full text-white/60 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Chat Area */}
              {chatOpen && (
                <>
                  <div className="flex-1 h-[280px] overflow-y-auto p-4 space-y-3 bg-black/20">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex w-full",
                          msg.sender === "me" ? "justify-end" : "justify-start",
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] px-3 py-2 rounded-2xl text-sm break-words",
                            msg.sender === "me"
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-white/10 text-white rounded-bl-none",
                          )}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <form
                    onSubmit={handleSend}
                    className="p-3 border-t border-white/10 bg-black/40 flex gap-2"
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t("match.inputPlaceholder")}
                      className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="text-blue-500 hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
