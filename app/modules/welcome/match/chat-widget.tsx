import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, User, Minimize2, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useMatchStore } from "./store";
import cn from "classnames";

const SYSTEM_MSG_DISCONNECT = "SYSTEM_MSG:DISCONNECT";

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
    disconnect,
    findNewMatch,
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
    <div className="fixed bottom-0 right-0 z-[95] flex flex-col items-end pointer-events-none w-full sm:w-auto sm:bottom-4 sm:right-4">
      <div className="pointer-events-auto w-full sm:w-auto">
        <AnimatePresence mode="wait">
          {/* Searching State */}
          {matchStatus === "searching" && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-black text-white p-6 rounded-none sm:shadow-[0_0_30px_rgba(255,255,255,0.1)] border-t sm:border border-white w-full sm:w-72 flex items-center gap-4 h-24 sm:h-auto"
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
                className="ml-auto text-white/40 hover:text-white transition-colors p-2"
              >
                <X size={20} />
              </button>
            </motion.div>
          )}

          {/* Matched / Chat State */}
          {(matchStatus === "matched" ||
            matchStatus === "partner_disconnected") && (
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.9 }}
              animate={{
                y: chatOpen ? 0 : 0,
                opacity: 1,
                scale: 1,
                height: chatOpen ? "100%" : "60px", // Full height on mobile when open
              }}
              className={cn(
                "bg-black border-t sm:border border-white rounded-none sm:shadow-[0_0_30px_rgba(255,255,255,0.1)] overflow-hidden transition-all duration-300",
                chatOpen
                  ? "w-full h-[100dvh] sm:w-80 sm:h-[450px] fixed sm:relative bottom-0 left-0 sm:inset-auto" // Fullscreen mobile
                  : "w-full sm:w-72 h-16 flex items-center px-4 cursor-pointer hover:bg-white/5",
              )}
              onClick={() => !chatOpen && setChatOpen(true)}
            >
              {/* Header */}
              <div
                className={cn(
                  "bg-black p-4 flex items-center justify-between border-b border-white/20 shrink-0",
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
                        {matchStatus === "partner_disconnected" ? (
                          <span className="text-red-500 font-bold">
                            {t("match.status.disconnected")}
                          </span>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 bg-white rounded-none animate-pulse"></span>{" "}
                            {t("match.online")}
                          </>
                        )}
                      </p>
                    )}
                    {!chatOpen && (
                      <p className="text-[10px] text-white/50 uppercase tracking-wider">
                        {matchStatus === "partner_disconnected"
                          ? t("match.status.disconnectedTitle")
                          : t("match.matchFound")}
                      </p>
                    )}
                  </div>
                </div>

                {chatOpen && (
                  <div className="flex items-center gap-4 sm:gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatOpen(false);
                      }}
                      className="text-white/60 hover:text-white transition-colors p-2 sm:p-0"
                    >
                      <Minimize2 size={20} className="sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (matchStatus === "partner_disconnected") {
                          reset();
                        } else {
                          disconnect();
                        }
                      }}
                      className="text-white/60 hover:text-white transition-colors p-2 sm:p-0"
                    >
                      <X size={20} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Chat Area */}
              {chatOpen && (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black relative h-full">
                    {messages.map((msg) => {
                      if (msg.text === SYSTEM_MSG_DISCONNECT) {
                        return (
                          <div
                            key={msg.id}
                            className="flex justify-center py-2"
                          >
                            <span className="text-[10px] text-white/40 uppercase tracking-widest border border-white/10 px-2 py-1">
                              {t("match.partnerLeft")}
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex w-full",
                            msg.sender === "me"
                              ? "justify-end"
                              : "justify-start",
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
                      );
                    })}

                    {matchStatus === "partner_disconnected" && (
                      <div className="flex justify-center py-4">
                        <p className="text-xs text-white/40 uppercase tracking-wider">
                          {t("match.partnerLeft")}
                        </p>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <form
                    onSubmit={handleSend}
                    className="p-4 border-t border-white/20 bg-black flex gap-3 shrink-0 mb-safe"
                  >
                    {matchStatus === "partner_disconnected" ? (
                      <button
                        type="button"
                        onClick={() => findNewMatch()}
                        className="w-full bg-white text-black font-bold text-xs uppercase tracking-[0.2em] py-4 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 rounded-none min-h-[44px]"
                      >
                        {t("match.findNew")}
                      </button>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder={t("match.inputPlaceholder")}
                          className="flex-1 bg-transparent text-xs text-white placeholder:text-white/30 focus:outline-none uppercase tracking-wide font-['iCiel_Novecento_sans'] min-h-[44px]"
                        />
                        <button
                          type="submit"
                          disabled={!input.trim()}
                          className="text-white hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-2"
                        >
                          <Send size={20} />
                        </button>
                      </>
                    )}
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
