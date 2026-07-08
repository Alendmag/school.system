import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, Paperclip, MoveVertical as MoreVertical, Phone, Video, Check, CheckCheck, Users } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  teacher: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  admin: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  parent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  group: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
};

const ROLE_LABELS: Record<string, string> = {
  teacher: "معلم",
  admin: "إدارة",
  parent: "ولي أمر",
  group: "مجموعة",
};

const conversations = [
  {
    id: 1, name: "أ. محمد الفايد", role: "teacher",
    lastMessage: "السلام عليكم، بخصوص واجب الرياضيات...",
    time: "10:30 ص", unread: 2, online: true,
  },
  {
    id: 2, name: "إدارة المدرسة", role: "admin",
    lastMessage: "تم تحديث موعد اجتماع أولياء الأمور",
    time: "أمس", unread: 0, online: false,
  },
  {
    id: 3, name: "ولي أمر الطالب خالد", role: "parent",
    lastMessage: "هل يمكن تحديد موعد للمقابلة؟",
    time: "أمس", unread: 0, online: true,
  },
  {
    id: 4, name: "غرفة المعلمين — عام", role: "group",
    lastMessage: "أ. سناء: الجدول الجديد متاح الآن",
    time: "منذ يومين", unread: 5, online: false,
  },
];

const initialMessages = [
  { id: 1, sender: "me", text: "السلام عليكم أستاذ محمد", time: "10:00 ص", status: "read" },
  { id: 2, sender: "other", text: "وعليكم السلام ورحمة الله، تفضل", time: "10:05 ص", status: "read" },
  { id: 3, sender: "me", text: "بخصوص واجب الرياضيات، هل يمكن تسليمه غداً؟", time: "10:06 ص", status: "read" },
  { id: 4, sender: "other", text: "نعم لا بأس، لكن يفضل اليوم إذا أمكن", time: "10:10 ص", status: "read" },
  { id: 5, sender: "me", text: "تمام، شكراً جزيلاً لك", time: "10:11 ص", status: "delivered" },
];

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return parts[0][0] + parts[1][0];
  return name.substring(0, 2);
}

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState(conversations[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filtered = conversations.filter(c =>
    c.name.includes(searchQuery) || c.lastMessage.includes(searchQuery)
  );

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      sender: "me",
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      status: "delivered",
    }]);
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex gap-0 h-[calc(100vh-7rem)] rounded-lg border border-border overflow-hidden shadow-sm bg-card">
      {/* Conversations sidebar */}
      <div className="w-72 flex flex-col border-l border-border bg-card shrink-0">
        {/* Search */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="بحث في المحادثات..."
              className="pr-8 h-8 text-[12px] bg-muted/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Conversation list */}
        <ScrollArea className="flex-1">
          <div className="py-1">
            {filtered.map((chat) => {
              const isActive = selectedChat.id === chat.id;
              return (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-right transition-colors ${
                    isActive
                      ? "bg-primary/8 border-r-2 border-primary"
                      : "hover:bg-muted/50 border-r-2 border-transparent"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold ${ROLE_COLORS[chat.role]}`}>
                      {chat.role === "group" ? <Users size={14} /> : getInitials(chat.name)}
                    </div>
                    {chat.online && (
                      <span className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-card rounded-full" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-[13px] font-medium truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                        {chat.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">{chat.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{chat.lastMessage}</p>
                  </div>

                  {/* Unread badge */}
                  {chat.unread > 0 && (
                    <span className="shrink-0 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                      {chat.unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="h-14 px-4 border-b border-border flex items-center justify-between shrink-0 bg-card">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${ROLE_COLORS[selectedChat.role]}`}>
              {selectedChat.role === "group" ? <Users size={13} /> : getInitials(selectedChat.name)}
            </div>
            <div>
              <p className="text-[13px] font-semibold leading-tight">{selectedChat.name}</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                {selectedChat.online && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />}
                <span>{selectedChat.online ? "متصل الآن" : "غير متصل"}</span>
                <span className="text-border mx-1">·</span>
                <span>{ROLE_LABELS[selectedChat.role]}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Phone size={15} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Video size={15} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <MoreVertical size={15} />
            </Button>
          </div>
        </div>

        {/* Messages area */}
        <ScrollArea className="flex-1 px-4 py-3">
          <div className="space-y-2 max-w-2xl mx-auto">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[68%] px-3.5 py-2 rounded-2xl text-[13px] leading-relaxed ${
                    msg.sender === "me"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  <p>{msg.text}</p>
                  <div className={`flex items-center gap-1 mt-0.5 ${
                    msg.sender === "me" ? "justify-start text-primary-foreground/60" : "justify-end text-muted-foreground"
                  } text-[10px]`}>
                    {msg.sender === "me" && (
                      msg.status === "read"
                        ? <CheckCheck size={11} />
                        : <Check size={11} />
                    )}
                    <span>{msg.time}</span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="px-4 py-3 border-t border-border bg-card shrink-0">
          <div className="flex items-center gap-2 max-w-2xl mx-auto">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground shrink-0">
              <Paperclip size={15} />
            </Button>
            <Input
              placeholder="اكتب رسالتك... (Enter للإرسال)"
              className="flex-1 h-9 text-[13px] bg-muted/40 border-border/60"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              size="icon"
              className="h-9 w-9 rounded-full shrink-0"
              onClick={handleSend}
              disabled={!newMessage.trim()}
            >
              <Send size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
