import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Sparkles, ArrowLeft, Check, Search, Smile, Bot, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../services/socket';
import api from '../../services/api';

const QUICK_EMOJIS = ['🔥', '❤️', '😂', '👏', '🚀', '✨', '👍', '💯'];

const SUGGESTED_CONTACTS = [
  {
    id: 'suggested-ai',
    username: 'vyro.assistant',
    fullName: 'Vyro AI Assistant',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
    role: 'AI Assistant',
    badge: 'AI BOT',
    status: 'Selalu Online',
    initialGreeting: 'Halo! Saya asisten cerdas VYRO AI ✨ Ada ide konten, saran editing, atau pertanyaan platform yang ingin kamu diskusikan?',
    isAi: true,
  },
  {
    id: 'suggested-chef',
    username: 'chef.marcus',
    fullName: 'Marcus V.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    role: 'Kreator Kuliner',
    badge: 'CREATOR',
    status: 'Online',
    initialGreeting: 'Halo foodies! Suka dengan resep Wagyu A5 tadi? Kalau mau tanya tips memasak steak atau ide bumbu rahasia, langsung chat di sini ya! 🥩🔥',
    isAi: false,
  },
  {
    id: 'suggested-sarah',
    username: 'sarah.lens',
    fullName: 'Sarah Jenkins',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    role: 'Cinematographer',
    badge: 'CREATOR',
    status: 'Online',
    initialGreeting: 'Hai! Terima kasih sudah menonton video Tokyo Neon Alleyway! Mau tahu kamera atau LUT preset yang saya pakai? 🎬✨',
    isAi: false,
  },
  {
    id: 'suggested-alex',
    username: 'alex.tech',
    fullName: 'Alex Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    role: 'Tech & AI Specialist',
    badge: 'CREATOR',
    status: 'Online',
    initialGreeting: 'Yo! Ada pertanyaan seputar setup workstation cyber atau gadget AI terbaru? 💻⚡',
    isAi: false,
  },
  {
    id: 'suggested-luna',
    username: 'luna.humor',
    fullName: 'Luna AI (Humor)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    role: 'AI Persona',
    badge: 'AI HUMOR',
    status: 'Online',
    initialGreeting: 'Halo! Siap ketawa hari ini? Mau punchline receh atau roasting santai? Haha! 😂🎉',
    isAi: true,
  },
];

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const socket = getSocket();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activePartner, setActivePartner] = useState<any | null>(null);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user's conversations
  useEffect(() => {
    const fetchConvs = async () => {
      try {
        const response = await api.get('/messages/conversations');
        if (response.data.success && response.data.data.length > 0) {
          setConversations(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      }
    };
    fetchConvs();
  }, []);

  // Fetch messages when a conversation is active
  useEffect(() => {
    if (!activeConvId) return;
    const fetchMsgs = async () => {
      try {
        const response = await api.get(`/messages/${activeConvId}`);
        if (response.data.success) {
          setMessages(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };
    fetchMsgs();
  }, [activeConvId]);

  // Socket listener for real-time messages
  useEffect(() => {
    if (user?.id) {
      socket.emit('join_user', user.id);
    }

    const handleMsgReceived = (incomingMsg: any) => {
      if (incomingMsg.conversationId === activeConvId) {
        setMessages((prev) => [...prev, incomingMsg]);
      }
    };

    socket.on('message_received', handleMsgReceived);
    return () => {
      socket.off('message_received', handleMsgReceived);
    };
  }, [user, activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  // Start chat with a contact (suggested or existing)
  const handleSelectContact = (contact: any) => {
    setActivePartner(contact);

    // Check if an existing conversation exists with this partner
    const existing = conversations.find(
      (c) => c.partner?.username === contact.username || c.partner?.id === contact.id
    );

    if (existing) {
      setActiveConvId(existing.id);
    } else {
      setActiveConvId(null);
      // Preload initial welcoming message from contact
      setMessages([
        {
          id: 'init-' + Date.now(),
          text: contact.initialGreeting || `Halo @${user?.username || 'teman'}! Senang bisa terhubung denganmu di VYRO AI.`,
          createdAt: new Date().toISOString(),
          sender: {
            id: contact.id,
            username: contact.username,
            fullName: contact.fullName,
            avatarUrl: contact.avatarUrl,
          },
        },
      ]);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activePartner) return;

    const userMsgText = text;
    setText('');

    // Local optimistic message
    const optimisticMsg = {
      id: 'local-' + Date.now(),
      text: userMsgText,
      createdAt: new Date().toISOString(),
      sender: {
        id: user?.id || 'me',
        username: user?.username || 'me',
        fullName: user?.fullName || 'Me',
        avatarUrl: user?.avatarUrl,
      },
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      // If chatting with AI Assistant or AI Persona: Provide contextual smart reply
      if (activePartner.isAi || activePartner.username?.includes('ai') || activePartner.username === 'vyro.assistant') {
        setIsAiTyping(true);
        setTimeout(() => {
          let aiResponse = '';
          const lower = userMsgText.toLowerCase();

          if (lower.includes('halo') || lower.includes('hai') || lower.includes('pagi') || lower.includes('malam')) {
            aiResponse = `Halo @${user?.username || 'sobat'}! Senang bertemu denganmu. Ada ide kreatif atau video yang ingin kita bahas hari ini? ✨`;
          } else if (lower.includes('ide') || lower.includes('konten') || lower.includes('resep')) {
            aiResponse = `Untuk video trending berikutnya di VYRO AI, coba buat format vertikal 9:16 dengan hook menarik di 3 detik pertama! Misalnya: "3 Rahasia yang Jarang Diketahui Orang..." dan gunakan audio viral dengan filter Warm Gold ✨`;
          } else if (lower.includes('editor') || lower.includes('capcut') || lower.includes('edit')) {
            aiResponse = `Studio Editor VYRO AI sekarang sudah mendukung ekstrak suara dari video MP4, kustomisasi 12 font viral, dan hapus background stiker otomatis lho! Kamu bisa langsung coba di menu Video Editor 🎬`;
          } else if (lower.includes('terima kasih') || lower.includes('makasih') || lower.includes('thanks')) {
            aiResponse = `Sama-sama! Selalu semangat berkreasi di VYRO AI 🚀 Jangan ragu chat aku kapan saja!`;
          } else {
            aiResponse = `Keren banget sarannya! Konten seperti "${userMsgText}" punya potensi engagement tinggi jika dipadukan dengan hashtag trending seperti #VyroAI, #Viral, dan #CapCutEdit. Mau aku bantu buatkan caption dan sound yang pas? 💡✨`;
          }

          setMessages((prev) => [
            ...prev,
            {
              id: 'ai-reply-' + Date.now(),
              text: aiResponse,
              createdAt: new Date().toISOString(),
              sender: {
                id: activePartner.id,
                username: activePartner.username,
                fullName: activePartner.fullName,
                avatarUrl: activePartner.avatarUrl,
              },
            },
          ]);
          setIsAiTyping(false);
        }, 1100);
        return;
      }

      // Real user messaging
      if (activePartner.id && !activePartner.id.startsWith('suggested')) {
        const response = await api.post('/messages/send', {
          conversationId: activeConvId,
          recipientId: activePartner.id,
          text: userMsgText,
        });

        if (response.data.success) {
          const newMsg = response.data.data;
          setActiveConvId(newMsg.conversationId);
          socket.emit('send_direct_message', {
            recipientId: activePartner.id,
            message: newMsg,
          });
        }
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const filteredSuggested = SUGGESTED_CONTACTS.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.username.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="h-full flex bg-[#07080c] select-none overflow-hidden text-white">
      {/* LEFT COLUMN: CONVERSATION & RECOMMENDED CREATORS LIST */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-white/10 bg-[#0d0f18] flex flex-col shrink-0 ${
          activePartner ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 space-y-3 bg-[#111422]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <MessageCircle className="w-4 h-4" />
              </div>
              <h1 className="font-extrabold text-sm text-white tracking-wide">Direct Messages</h1>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
              Realtime Active
            </span>
          </div>

          {/* Search Contacts Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari kreator atau AI Companion..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-stone-400 focus:outline-none focus:border-amber-400"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Contacts & Conversations Scrollable List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
          {/* Active Conversations Section */}
          {conversations.length > 0 && (
            <div className="p-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2 py-1 block">
                Obrolan Aktif
              </span>
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectContact(conv.partner)}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                    activePartner?.username === conv.partner?.username
                      ? 'bg-amber-500/20 border border-amber-500/40'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <img
                    src={conv.partner?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${conv.partner?.username}`}
                    alt={conv.partner?.username}
                    className="w-10 h-10 rounded-full object-cover border border-amber-400/50"
                  />
                  <div className="flex-1 truncate">
                    <div className="font-bold text-xs text-white truncate">{conv.partner?.fullName}</div>
                    <div className="text-[11px] text-stone-400 truncate">
                      {conv.lastMessage?.text || `@${conv.partner?.username}`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recommended Contacts & AI Companions */}
          <div className="p-2 space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider px-2 py-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Kreator & AI Companion (Klik untuk Chat)
            </span>

            {filteredSuggested.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleSelectContact(contact)}
                className={`w-full p-2.5 rounded-2xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                  activePartner?.username === contact.username
                    ? 'bg-amber-500/20 border border-amber-500/40 shadow-sm'
                    : 'hover:bg-white/[0.04]'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={contact.avatarUrl}
                    alt={contact.username}
                    className="w-10 h-10 rounded-full object-cover border border-amber-400/60 shadow"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0d0f18]" />
                </div>

                <div className="flex-1 truncate">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white truncate">{contact.fullName}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30">
                      {contact.badge}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 block truncate">
                    {contact.role} • {contact.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: ACTIVE CHAT ROOM */}
      <div className={`flex-1 flex flex-col h-full bg-[#07080c] ${!activePartner ? 'hidden md:flex' : 'flex'}`}>
        {activePartner ? (
          <>
            {/* Chat Top Bar */}
            <div className="h-16 border-b border-white/10 px-4 md:px-6 flex items-center justify-between shrink-0 bg-[#0e111a] backdrop-blur-md">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setActivePartner(null)}
                  className="md:hidden p-1.5 rounded-lg text-stone-400 hover:text-white cursor-pointer"
                  title="Kembali ke Kontak"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative">
                  <img
                    src={activePartner.avatarUrl}
                    alt={activePartner.username}
                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shadow-md"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0e111a]" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white block">{activePartner.fullName}</span>
                    {activePartner.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        {activePartner.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold block">
                    ● Aktif Sekarang • @{activePartner.username}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar bg-gradient-to-b from-[#07080c] via-[#090b12] to-[#07080c]">
              {messages.map((msg) => {
                const isMe = msg.sender?.id === user?.id || msg.sender?.username === user?.username;
                return (
                  <div key={msg.id} className={`flex gap-2.5 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                    <img
                      src={
                        msg.sender?.avatarUrl ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.sender?.username || 'user'}`
                      }
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0 mt-1"
                    />

                    <div className="space-y-1">
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-lg ${
                          isMe
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-medium rounded-tr-none'
                            : 'bg-white/[0.06] border border-white/10 text-white rounded-tl-none backdrop-blur-md'
                        }`}
                      >
                        {msg.text}
                      </div>

                      <div
                        className={`flex items-center gap-1 text-[9px] text-stone-400 ${
                          isMe ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span>
                          {msg.createdAt
                            ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Baru saja'}
                        </span>
                        {isMe && <CheckCheck className="w-3 h-3 text-stone-400" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* AI Typing Indicator */}
              {isAiTyping && (
                <div className="flex items-center gap-2 text-stone-400 text-xs py-2">
                  <Bot className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span className="italic">{activePartner.fullName} sedang mengetik balasan...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Emoji Bar */}
            <div className="px-4 py-2 border-t border-white/5 bg-[#0a0c14] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-stone-400 mr-1 flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-amber-400" />
                Quick:
              </span>
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setText((prev) => prev + emoji)}
                  className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-transform active:scale-125 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 md:p-4 border-t border-white/10 bg-[#0e111a] flex gap-2 shrink-0">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Kirim pesan ke ${activePartner.fullName}...`}
                className="flex-1 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder-stone-400 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(245,158,11,0.35)] disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Kirim</span>
              </button>
            </form>
          </>
        ) : (
          /* Empty State: Prompt to select contact */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
              <MessageCircle className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Mulai Obrolan Langsung</h2>
              <p className="text-xs text-stone-400 max-w-sm mt-1">
                Pilih salah satu kreator atau AI Companion di sebelah kiri untuk mulai berdiskusi, bertukar ide konten, atau mengobrol santai!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
