import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Bell, Moon, Sun, Languages, Search, CreditCard, MessageSquare, Clock, CircleUser as UserCircle, ChevronDown, Settings, LogOut, Command } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

const notifications = [
  {
    id: 1,
    title: "رسالة جديدة",
    description: "تلقيت رسالة جديدة من ولي أمر الطالب أحمد",
    time: "منذ 5 د",
    icon: MessageSquare,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    read: false
  },
  {
    id: 2,
    title: "استحقاق مالي",
    description: "تم إصدار فاتورة القسط الثاني لـ 45 طالب",
    time: "منذ ساعة",
    icon: CreditCard,
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
    read: false
  },
  {
    id: 3,
    title: "تأخر عن الحضور",
    description: "تأخر 12 طالب عن الطابور الصباحي اليوم",
    time: "منذ 2 س",
    icon: Clock,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/40",
    read: true
  }
];

const unreadCount = notifications.filter(n => !n.read).length;

export function Header() {
  const {
    toggleTheme,
    theme,
    toggleLanguage,
    currentUser,
    setCurrentUser,
  } = useApp();

  const handleRoleChange = (role: UserRole) => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, role });
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير النظام';
      case 'teacher': return 'معلم';
      case 'student': return 'طالب';
      case 'parent': return 'ولي أمر';
      default: return role;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800';
      case 'teacher': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'student': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800';
      case 'parent': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800';
      default: return '';
    }
  };

  const initials = currentUser?.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'US';

  return (
    <header className="h-14 border-b border-border bg-card sticky top-0 z-20 px-4 flex items-center justify-between gap-3 shrink-0">
      {/* Left: Search */}
      <div className="flex-1 max-w-xs">
        <button
          className="flex items-center gap-2 w-full h-8 px-3 text-sm text-muted-foreground bg-muted/60 border border-border rounded-md hover:bg-muted hover:border-border/80 transition-colors group"
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))}
        >
          <Search size={13} className="shrink-0" />
          <span className="flex-1 text-right text-xs">بحث سريع...</span>
          <kbd className="hidden sm:flex items-center gap-0.5 font-mono text-[10px] bg-background border border-border rounded px-1 py-0.5 text-muted-foreground/60">
            <Command size={9} />K
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Language */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title="تبديل اللغة"
        >
          <Languages size={15} />
        </Button>

        {/* Theme */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </Button>

        {/* Notifications */}
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground relative">
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[340px]" align="end">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
              <span className="text-sm font-semibold">الإشعارات</span>
              {unreadCount > 0 && (
                <Badge className="bg-primary/10 text-primary border-0 text-[10px] h-5 px-1.5">
                  {unreadCount} جديد
                </Badge>
              )}
            </div>
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-3 px-3 py-3 cursor-pointer hover:bg-muted/50 transition-colors",
                    !n.read && "bg-primary/[0.02]"
                  )}
                >
                  <div className={`p-1.5 rounded-md ${n.bgColor} ${n.color} mt-0.5 shrink-0`}>
                    <n.icon size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-[13px] font-medium leading-tight", n.read && "text-muted-foreground")}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{n.description}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
                  </div>
                  {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />}
                </div>
              ))}
            </div>
            <div className="px-3 py-2 border-t border-border">
              <button className="w-full text-[12px] text-primary text-center hover:underline">
                عرض كل الإشعارات
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div className="w-px h-5 bg-border mx-1" />

        {/* User Menu */}
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted transition-colors group">
              <Avatar className="h-7 w-7 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-[12px] font-semibold text-foreground">{currentUser?.name?.split(' ')[0]}</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0 rounded border font-medium mt-0.5",
                  getRoleBadgeClass(currentUser?.role || '')
                )}>
                  {getRoleName(currentUser?.role || '')}
                </span>
              </div>
              <ChevronDown size={12} className="text-muted-foreground hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60" align="end" forceMount>
            <div className="px-3 py-2.5 border-b border-border">
              <p className="text-[13px] font-semibold">{currentUser?.name}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{currentUser?.email}</p>
            </div>
            <div className="py-1">
              <DropdownMenuItem className="text-[13px] gap-2">
                <UserCircle size={14} /> الملف الشخصي
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[13px] gap-2">
                <Settings size={14} /> الإعدادات
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[11px] text-muted-foreground flex items-center gap-1.5 py-1.5">
              <UserCircle size={12} /> تبديل الصلاحية
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={currentUser?.role}
              onValueChange={(val) => handleRoleChange(val as UserRole)}
            >
              <DropdownMenuRadioItem value="admin" className="text-[13px]">مدير النظام</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="teacher" className="text-[13px]">معلم</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="student" className="text-[13px]">طالب</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="parent" className="text-[13px]">ولي أمر</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-[13px] gap-2 text-destructive focus:text-destructive">
              <LogOut size={14} /> تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
