import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Send, 
  Paperclip, 
  MoreVertical, 
  Phone, 
  Video,
  Check,
  CheckCheck
} from "lucide-react";

const initialConversations = [
  {
    id: 1,
    name: "أ. محمد الفايد",
    role: "teacher",
    lastMessage: "السلام عليكم، بخصوص واجب الرياضيات...",
    time: "10:30 ص",
    unread: 2,
    online: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher1"
  },
  {
    id: 2,
    name: "إدارة المدرسة",
    role: "admin",
    lastMessage: "تم تحديث موعد اجتماع أولياء الأمور",
    time: "أمس",
    unread: 0,
    online: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
  },
  {
    id: 3,
    name: "ولي أمر الطالب خالد",
    role: "parent",
    lastMessage: "هل يمكن تحديد موعد للمقابلة؟",
    time: "أمس",
    unread: 0,
    online: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Parent1"
  },
  {
    id: 4,
    name: "غرفة المعلمين - عام",
    role: "group",
    lastMessage: "أ. سناء: الجدول الجديد متاح الآن",
    time: "منذ يومين",
    unread: 5,
    online: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Group"
  }
];

const initialMessages = [
  { id: 1, sender: "me", text: "السلام عليكم أستاذ محمد", time: "10:00 ص", status: "read" },
  { id: 2, sender: "other", text: "وعليكم السلام ورحمة الله، تفضل", time: "10:05 ص", status: "read" },
  { id: 3, sender: "me", text: "بخصوص واجب الرياضيات، هل يمكن تسليمه غداً؟", time: "10:06 ص", status: "read" },
  { id: 4, sender: "other", text: "نعم لا بأس، لكن يفضل اليوم إذا أمكن", time: "10:10 ص", status: "read" },
  { id: 5, sender: "me", text: "تمام، شكراً جزيلاً لك", time: "10:11 ص", status: "delivered" },
];

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState(initialConversations[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      sender: "me",
      text: newMessage,
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      status: "delivered"
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Chat List */}
      <Card className="w-80 flex flex-col border-border/50 shadow-sm">
        <div className="p-4 border-b border-border/50">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="بحث في الرسائل..." className="pr-9 bg-muted/50" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {initialConversations.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedChat.id === chat.id ? "bg-accent" : "hover:bg-muted/50"
                }`}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback>{chat.name[0]}</AvatarFallback>
                  </Avatar>
                  {chat.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm truncate">{chat.name}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{chat.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary">
                    {chat.unread}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Window */}
      <Card className="flex-1 flex flex-col border-border/50 shadow-sm">
        {/* Header */}
        <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/20">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={selectedChat.avatar} />
              <AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-sm">{selectedChat.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {selectedChat.online ? <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> : null}
                {selectedChat.online ? "متصل الآن" : "غير متصل"}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon">
              <Phone size={18} />
            </Button>
            <Button variant="ghost" size="icon">
              <Video size={18} />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical size={18} />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                    msg.sender === "me"
                      ? "bg-primary text-primary-foreground rounded-bl-none"
                      : "bg-muted text-foreground rounded-br-none"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <div className={`flex items-center gap-1 justify-end mt-1 text-[10px] ${
                    msg.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}>
                    <span>{msg.time}</span>
                    {msg.sender === "me" && (
                      msg.status === "read" ? <CheckCheck size={12} /> : <Check size={12} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-border/50 bg-muted/20">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Paperclip size={20} />
            </Button>
            <Input 
              placeholder="اكتب رسالتك هنا..." 
              className="flex-1 bg-background border-border/50"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button size="icon" className="rounded-full" onClick={handleSendMessage}>
              <Send size={18} className="ml-0.5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
