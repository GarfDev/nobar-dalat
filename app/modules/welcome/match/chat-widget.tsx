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
              className="bg-black text-white p-6 rounded-none shadow-[0_0_30px_rgba(255,255,255,0.1)] border border-white w-72 flex items-center gap-4"
            >
              <div className="relative">
                <Loader2 className="animate-spin text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider font-['iCiel_Novecento_sans']">
                  {t("match.searching")}
                </h3>
                <p className="text-[10px] text-white/50 uppercase tracking-wide">
                  {t("match.searchingDesc")}
                </p>
              </div>
              <button
                onClick={() => reset()}
                className="ml-auto text-white/40 hover:text-white transition-colors"
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
                "bg-black border border-white rounded-none shadow-[0_0_30px_rgba(255,255,255,0.1)] overflow-hidden transition-all duration-300",
                chatOpen
                  ? "w-80 h-[450px]"
                  : "w-72 h-16 flex items-center px-4 cursor-pointer hover:bg-white/5",
              )}
              onClick={() => !chatOpen && setChatOpen(true)}
            >
              {/* Header */}
              <div
                className={cn(
                  "bg-black p-4 flex items-center justify-between border-b border-white/20",
                  !chatOpen && "bg-transparent border-none w-full p-0",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white flex items-center justify-center text-black font-bold text-xs rounded-none">
                    {matchedUser?.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-white uppercase tracking-widest font-['iCiel_Novecento_sans']">
                      {matchedUser?.name}
                    </h3>
                    {chatOpen && (
                      <p className="text-[10px] text-white/50 uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-none animate-pulse"></span>{" "}
                        {t("match.online")}
                      </p>
                    )}
                    {!chatOpen && (
                      <p className="text-[10px] text-white/50 uppercase tracking-wider">
                        {t("match.matchFound")}
                      </p>
                    )}
                  </div>
                </div>

                {chatOpen && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatOpen(false);
                      }}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <Minimize2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        reset();
                      }}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Chat Area */}
              {chatOpen && (
                <>
                  <div className="flex-1 h-[330px] overflow-y-auto p-4 space-y-4 bg-black">
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
                            "max-w-[85%] px-4 py-3 text-xs leading-relaxed uppercase tracking-wide border",
                            msg.sender === "me"
                              ? "bg-white text-black border-white"
                              : "bg-transparent text-white border-white/30",
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
                    className="p-4 border-t border-white/20 bg-black flex gap-3"
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t("match.inputPlaceholder")}
                      className="flex-1 bg-transparent text-xs text-white placeholder:text-white/30 focus:outline-none uppercase tracking-wide font-['iCiel_Novecento_sans']"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="text-white hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send size={16} />
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
