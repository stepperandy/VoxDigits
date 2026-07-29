import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Bot, X, Send, Loader2, Plus, HelpCircle, Minimize2, ChevronDown } from "lucide-react";
import MessageBubble from "@/components/agent/MessageBubble";
import ReactMarkdown from "react-markdown";
import ModelSelector from "@/components/ModelSelector";

const AGENT_NAME = "customer_support";

// System prompt used for the direct InvokeLLM path (non-auto models).
const SYSTEM_PROMPT = `You are the VoxTelefony customer support assistant, embedded in the app. Be concise, friendly, and helpful. Never make up pricing or features.

APP OVERVIEW — VoxTelefony is a telecom platform offering:
- Virtual Phone Numbers (US, CA, GB, AU and more) with SMS and Voice
- eSIM plans for international travel data
- In-app SMS inbox and dialer
- Credits-based billing; call forwarding, auto-reply, voicemail

QUICK FACTS:
- US numbers ~$4.99/mo, CA ~$5.99, GB ~$6.99, AU ~$7.99
- Buy numbers via the Buy Virtual Number page (pay with credits or Stripe)
- Buy eSIMs via Buy eSIM; QR code is emailed and shown in My eSIMs
- SMS ~$0.01–0.05/msg; calls billed per minute by destination
- View SMS in SMS Inbox; make calls in the Dialer
- Manage subscriptions in Subscription Manager; submit tickets in Support

If unsure, direct the user to submit a support ticket. The user's current page may be provided at the start of their message.`;

const PAGE_LABELS = {
  "/": "Home page",
  "/Home": "Home page",
  "/ESimStore": "eSIM Store",
  "/VirtualNumbers": "Virtual Numbers Store",
  "/Dashboard": "Dashboard",
  "/SMSInbox": "SMS Inbox",
  "/Dialer": "Dialer",
  "/ESimDashboard": "My eSIMs",
  "/ServicesDashboard": "My Services",
  "/Credits": "Credits page",
  "/BuyCredits": "Buy Credits",
  "/NumberSettings": "Number Settings",
  "/Preferences": "Preferences",
  "/UserTickets": "My Support Tickets",
  "/LoyaltyProgram": "Rewards & Loyalty",
  "/SubscriptionManager": "Subscription Manager",
  "/PhoneNumberPorting": "Phone Number Porting",
  "/ESimActivationGuide": "eSIM Activation Guide",
  "/AboutUs": "About VoxTelefony",
};

const QUICK_QUESTIONS = [
  "How do I activate my eSIM?",
  "How do virtual numbers work?",
  "How do I add credits?",
  "Why isn't my eSIM working?",
  "How does call forwarding work?",
  "Can I port my number?",
];

export default function AIAssistantWidget({ currentPageName }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const [selectedModel, setSelectedModel] = useState("auto");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentPage = PAGE_LABELS[window.location.pathname] || (currentPageName || window.location.pathname.replace("/", ""));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return () => unsub();
  }, [conversation?.id]);

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, minimized]);

  const startConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: AGENT_NAME,
      metadata: { name: `Support - ${currentPage}` },
    });
    setConversation(conv);
    setMessages([]);
    return conv;
  };

  const openChat = async () => {
    setOpen(true);
    setMinimized(false);
    if (selectedModel === "auto" && !conversation) await startConversation();
  };

  const resetChat = async () => {
    setShowQuick(true);
    if (selectedModel === "auto") {
      const conv = await startConversation();
      setConversation(conv);
    } else {
      setConversation(null);
      setMessages([]);
    }
  };

  const changeModel = async (id) => {
    setSelectedModel(id);
    setShowQuick(true);
    setMessages([]);
    if (id === "auto") {
      const conv = await startConversation();
      setConversation(conv);
    } else {
      setConversation(null);
    }
  };

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;

    setInput("");
    setShowQuick(false);
    setSending(true);

    const isFirst = messages.filter((m) => m.role === "user").length === 0;
    const contextPrefix = isFirst ? `[User is on: ${currentPage}]\n` : "";
    const userContent = contextPrefix + msg;

    if (selectedModel === "auto") {
      // Agent flow (preserves entity tools)
      let conv = conversation;
      if (!conv) conv = await startConversation();
      await base44.agents.addMessage(conv, { role: "user", content: userContent });
    } else {
      // Direct InvokeLLM flow with the selected model
      const newHistory = [...messages, { role: "user", content: userContent }];
      setMessages(newHistory);
      const historyText = newHistory
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n\n");
      const prompt = `${SYSTEM_PROMPT}\n\n${historyText}\n\nAssistant:`;
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt,
          model: selectedModel,
        });
        const reply = typeof res === "string" ? res : (res?.content || JSON.stringify(res));
        setMessages([...newHistory, { role: "assistant", content: reply }]);
      } catch (e) {
        setMessages([
          ...newHistory,
          { role: "assistant", content: "Sorry, I ran into an error with that model. Please try again or switch to Auto mode." },
        ]);
      }
    }

    setSending(false);
  };

  return (
    <div className="fixed bottom-44 md:bottom-6 right-4 z-[60] flex flex-col items-end gap-3">
      {open && (
        <div
          className={`w-[340px] sm:w-[380px] bg-[#0d1f35] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden transition-all duration-200 ${
            minimized ? "h-14" : "h-[520px]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-white/8 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">VoxTelefony Assistant</p>
              {!minimized && <p className="text-xs text-cyan-400/70 truncate">📍 {currentPage}</p>}
            </div>
            {!minimized && (
              <ModelSelector value={selectedModel} onChange={changeModel} />
            )}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={resetChat} title="New conversation" className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-white/5 transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setMinimized(!minimized)} className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-white/5 transition-colors">
                {minimized ? <ChevronDown className="w-3.5 h-3.5 rotate-180" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-white/5 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.length === 0 && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <div className="bg-[#1a2d45] border border-white/8 rounded-2xl rounded-bl-none px-3.5 py-2.5 text-sm text-gray-200 max-w-[82%]">
                        <p>Hi! 👋 I'm your VoxTelefony assistant.</p>
                        <p className="mt-1 text-gray-400 text-xs">I can see you're on <strong className="text-cyan-400">{currentPage}</strong>. How can I help?</p>
                      </div>
                    </div>
                    {showQuick && (
                      <div className="ml-9 space-y-1.5">
                        {QUICK_QUESTIONS.map((q) => (
                          <button
                            key={q}
                            onClick={() => sendMessage(q)}
                            className="w-full text-left text-xs text-gray-300 bg-white/5 hover:bg-cyan-500/10 hover:text-cyan-300 border border-white/8 hover:border-cyan-500/30 px-3 py-2 rounded-xl transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <MessageBubble key={idx} message={msg} />
                ))}

                {sending && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="bg-[#1a2d45] border border-white/8 rounded-2xl rounded-bl-none px-3.5 py-2.5">
                      <div className="flex gap-1.5 items-center">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-white/8 p-3 flex-shrink-0">
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                    }}
                    placeholder="Ask me anything…"
                    rows={1}
                    className="flex-1 bg-[#18233f] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none placeholder-gray-600"
                    style={{ maxHeight: "100px", overflowY: "auto" }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={sending || !input.trim()}
                    className="w-9 h-9 flex-shrink-0 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors"
                  >
                    {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-center text-[10px] text-gray-600 mt-2">Powered by VoxDigits AI</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => open ? setOpen(false) : openChat()}
        className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full shadow-lg shadow-cyan-500/25 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      >
        {open ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>
    </div>
  );
}