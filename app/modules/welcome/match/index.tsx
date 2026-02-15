import { AnimatePresence, motion } from "framer-motion";
import { Users, Wine } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { ChatWidget } from "./chat-widget";
import { MatchModal } from "./match-modal";
import { useMatchStore } from "./store";

export function MatchFeature() {
  const { t } = useTranslation();
  const { isOpen, setIsOpen, matchStatus, rehydrate } = useMatchStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Rehydrate subscriptions when the app loads
    rehydrate();

    // Small timeout to ensure client-side hydration is complete
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, [rehydrate]);

  // Hide FAB if searching or matched
  const showFab = matchStatus === "idle";

  if (!mounted) return null;

  return createPortal(
    <>
      <MatchModal />
      <ChatWidget />
    </>,
    document.body,
  );
}
