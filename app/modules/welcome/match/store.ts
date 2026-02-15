import { create, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "~/lib/supabase";
import {
  requestNotificationPermission,
  sendNotification,
} from "~/lib/notification";
import i18next from "~/i18n";

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  languages: string[];
}

export interface ChatMessage {
  id: string;
  sender: "me" | "them";
  text: string;
  timestamp: number;
}

interface MatchState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;

  matchStatus: "idle" | "searching" | "matched" | "partner_disconnected";
  setMatchStatus: (
    status: "idle" | "searching" | "matched" | "partner_disconnected",
  ) => void;

  userProfile: UserProfile;
  setUserProfile: (profile: Partial<UserProfile>) => void;

  matchedUser: UserProfile | null;
  setMatchedUser: (user: UserProfile | null) => void;

  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;

  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;

  startSearching: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  disconnect: () => Promise<void>;
  findNewMatch: () => Promise<void>;
  rehydrate: () => void;
  reset: () => void;
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const SYSTEM_MSG_DISCONNECT = "SYSTEM_MSG:DISCONNECT";

export const useMatchStore = create<MatchState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),

      matchStatus: "idle",
      setMatchStatus: (status) => set({ matchStatus: status }),

      userProfile: {
        name: "",
        email: "",
        languages: [],
      },
      setUserProfile: (profile) =>
        set((state) => ({ userProfile: { ...state.userProfile, ...profile } })),

      matchedUser: null,
      setMatchedUser: (user) => set({ matchedUser: user }),

      chatOpen: false,
      setChatOpen: (open) => set({ chatOpen: open }),

      messages: [],
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),

      startSearching: async () => {
        const { userProfile } = get();

        // Request permission early
        await requestNotificationPermission();

        set({ matchStatus: "searching" });

        try {
          // 1. Insert user into match_pool
          const { data: userData, error: insertError } = await supabase
            .from("match_pool")
            .insert([
              {
                name: userProfile.name,
                email: userProfile.email,
                languages: userProfile.languages,
                status: "waiting",
              },
            ])
            .select()
            .single();

          if (insertError) throw insertError;

          // Update local profile with ID
          set((state) => ({
            userProfile: { ...state.userProfile, id: userData.id },
          }));

          // Store Push Subscription if available
          if ("serviceWorker" in navigator) {
            navigator.serviceWorker.ready.then(async (registration) => {
              try {
                // Check for existing subscription
                let subscription =
                  await registration.pushManager.getSubscription();

                // If not subscribed, subscribe
                if (!subscription) {
                  // Note: In a real app, you need a VAPID public key here
                  const publicKey =
                    "BF-kzb6E-XKMXt9dWNi5QvCh-vSXypL_NgdPdgcRmmnfGpyHDHksjXA01tjGSslsOWjDMidgwfC-VWmOkZ8vYPI";
                  subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey),
                  });
                }

                if (subscription) {
                  // Send subscription to backend
                  await supabase.from("push_subscriptions").insert({
                    user_id: userData.id,
                    subscription: subscription,
                  });
                }
              } catch (err) {
                console.error("Failed to subscribe to push", err);
              }
            });
          }

          // 2. Try to find a match immediately using RPC
          const { data: matchIdData, error: matchError } = await supabase.rpc(
            "find_match",
            {
              user_id: userData.id,
              user_languages: userProfile.languages,
            },
          );

          if (matchError) {
            console.error("Match RPC error:", matchError);
            // Continue waiting if RPC fails (fallback to realtime)
          }

          // If RPC returned a match immediately
          if (matchIdData && matchIdData.length > 0) {
            // Fetch matched user details
            const matchedUserId = matchIdData[0].matched_user_id; // RPC returns a table
            const { data: matchedUser } = await supabase
              .from("match_pool")
              .select("*")
              .eq("id", matchedUserId)
              .single();

            if (matchedUser) {
              set({
                matchStatus: "matched",
                matchedUser: {
                  id: matchedUser.id,
                  name: matchedUser.name,
                  email: matchedUser.email,
                  languages: matchedUser.languages,
                },
                chatOpen: true,
              });

              sendNotification("Match Found!", {
                body: `You matched with ${matchedUser.name}!`,
              });

              // Subscribe to messages
              subscribeToMessages(userData.id, matchedUser.id, get, set);
              return;
            }
          }

          // 3. If no immediate match, subscribe to changes on my row
          const channel = supabase
            .channel(`match_pool:${userData.id}`)
            .on(
              "postgres_changes",
              {
                event: "UPDATE",
                schema: "public",
                table: "match_pool",
                filter: `id=eq.${userData.id}`,
              },
              async (payload) => {
                const newRow = payload.new;
                if (newRow.status === "matched" && newRow.matched_with_id) {
                  // Fetch matched user details
                  const { data: matchedUser } = await supabase
                    .from("match_pool")
                    .select("*")
                    .eq("id", newRow.matched_with_id)
                    .single();

                  if (matchedUser) {
                    set({
                      matchStatus: "matched",
                      matchedUser: {
                        id: matchedUser.id,
                        name: matchedUser.name,
                        email: matchedUser.email,
                        languages: matchedUser.languages,
                      },
                      chatOpen: true,
                    });

                    sendNotification("Match Found!", {
                      body: `You matched with ${matchedUser.name}!`,
                    });

                    // Subscribe to messages
                    subscribeToMessages(userData.id, matchedUser.id, get, set);

                    // Unsubscribe from match pool
                    supabase.removeChannel(channel);
                  }
                }
              },
            )
            .subscribe();
        } catch (error) {
          console.error("Error searching for match:", error);
          set({ matchStatus: "idle" });
          alert("Failed to start searching. Please try again.");
        }
      },

      sendMessage: async (text: string) => {
        const { userProfile, matchedUser } = get();
        if (!userProfile.id || !matchedUser?.id) return;

        // Optimistic update
        const tempId = Date.now().toString();
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: tempId,
              sender: "me",
              text,
              timestamp: Date.now(),
            },
          ],
        }));

        try {
          await supabase.from("messages").insert([
            {
              sender_id: userProfile.id,
              receiver_id: matchedUser.id,
              content: text,
            },
          ]);
        } catch (error) {
          console.error("Error sending message:", error);
          // Remove optimistic message on error? Or show error state
        }
      },

      disconnect: async () => {
        const { userProfile, matchedUser } = get();

        // 1. Update backend status
        if (userProfile.id) {
          try {
            await supabase
              .from("match_pool")
              .update({
                status: "disconnected",
                matched_with_id: null,
              })
              .eq("id", userProfile.id);

            // Also notify the other user by sending a system message (optional, but handled via realtime usually)
            // Or rely on realtime update on match_pool if we were listening to partner's status
            // For now, let's just send a "system" message to the chat
            if (matchedUser?.id) {
              await supabase.from("messages").insert([
                {
                  sender_id: userProfile.id,
                  receiver_id: matchedUser.id,
                  content: SYSTEM_MSG_DISCONNECT,
                },
              ]);
            }
          } catch (err) {
            console.error("Error disconnecting:", err);
          }
        }

        // 2. Reset local state
        get().reset();
      },

      findNewMatch: async () => {
        // Reset state but keep profile
        get().reset();
        // Start searching immediately
        await get().startSearching();
      },

      rehydrate: () => {
        const state = get();
        const { userProfile, matchStatus, matchedUser } = state;

        // Re-subscribe if we were searching or matched
        if (matchStatus === "searching" && userProfile.id) {
          // Re-subscribe to match_pool
          const channel = supabase
            .channel(`match_pool:${userProfile.id}`)
            .on(
              "postgres_changes",
              {
                event: "UPDATE",
                schema: "public",
                table: "match_pool",
                filter: `id=eq.${userProfile.id}`,
              },
              async (payload) => {
                const newRow = payload.new;
                if (newRow.status === "matched" && newRow.matched_with_id) {
                  // Fetch matched user details
                  const { data: matchedUser } = await supabase
                    .from("match_pool")
                    .select("*")
                    .eq("id", newRow.matched_with_id)
                    .single();

                  if (matchedUser) {
                    set({
                      matchStatus: "matched",
                      matchedUser: {
                        id: matchedUser.id,
                        name: matchedUser.name,
                        email: matchedUser.email,
                        languages: matchedUser.languages,
                      },
                      chatOpen: true,
                    });

                    sendNotification("Match Found!", {
                      body: `You matched with ${matchedUser.name}!`,
                    });

                    // Subscribe to messages
                    subscribeToMessages(
                      userProfile.id!,
                      matchedUser.id,
                      get,
                      set,
                    );

                    // Unsubscribe from match pool
                    supabase.removeChannel(channel);
                  }
                }
              },
            )
            .subscribe();
        } else if (
          matchStatus === "matched" &&
          userProfile.id &&
          matchedUser?.id
        ) {
          // Re-subscribe to messages
          subscribeToMessages(userProfile.id, matchedUser.id, get, set);
        }
      },

      reset: () =>
        set({
          matchStatus: "idle",
          matchedUser: null,
          chatOpen: false,
          messages: [],
          // Keep user profile for convenience
        }),
    }),
    {
      name: "match-storage", // name of the item in the storage (must be unique)
      partialize: (state) => ({
        // Only persist these fields
        userProfile: state.userProfile,
        matchStatus: state.matchStatus,
        matchedUser: state.matchedUser,
        chatOpen: state.chatOpen,
        messages: state.messages,
      }),
    },
  ),
);

// Helper function to subscribe to messages
async function subscribeToMessages(
  myId: string,
  partnerId: string,
  get: StoreApi<MatchState>["getState"],
  set: StoreApi<MatchState>["setState"],
) {
  // 1. Fetch full history first
  const { data: history, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${myId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${myId})`,
    )
    .order("created_at", { ascending: true });

  if (!error && history) {
    set({
      messages: history.map((msg) => ({
        id: msg.id,
        sender: msg.sender_id === myId ? "me" : "them",
        text: msg.content,
        timestamp: new Date(msg.created_at).getTime(),
      })),
    });
  }

  // 2. Subscribe to incoming messages
  const channel = supabase
    .channel(`messages:${myId}:${partnerId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `receiver_id=eq.${myId}`, // Listen for messages sent TO me
      },
      (payload) => {
        // Verify sender is the matched user (security check)
        if (payload.new.sender_id === partnerId) {
          set((state: MatchState) => ({
            messages: [
              ...state.messages,
              {
                id: payload.new.id,
                sender: "them",
                text: payload.new.content,
                timestamp: new Date(payload.new.created_at).getTime(),
              },
            ],
          }));

          // Send notification if chat is not open or window is blurred
          if (document.hidden || !get().chatOpen) {
            // Check if it's a system message
            if (payload.new.content === SYSTEM_MSG_DISCONNECT) {
              sendNotification(i18next.t("match.status.disconnectedTitle"), {
                body: i18next.t("match.partnerLeft"),
              });
              // Reset state for the receiver as well
              // Instead of resetting completely, we mark as partner_disconnected
              set((state: MatchState) => ({
                matchStatus: "partner_disconnected",
                // We keep matchedUser and messages to show the history
                chatOpen: true,
              }));
            } else {
              sendNotification(i18next.t("match.newMessage"), {
                body: payload.new.content,
              });
            }
          } else if (payload.new.content === SYSTEM_MSG_DISCONNECT) {
            // If chat IS open, still handle the disconnect logic
            // Don't alert, just update UI
            set((state: MatchState) => ({
              matchStatus: "partner_disconnected",
              chatOpen: true,
            }));
          }
        }
      },
    )
    .subscribe();
}
