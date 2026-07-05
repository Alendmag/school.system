import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Moon, 
  Sun, 
  Languages, 
  Search,
  Menu,
  Check,
  Clock,
  CreditCard,
  MessageSquare,
  UserCircle
} from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/lib/types";

// Mock Notifications Data
const notifications = [
  {
    id: 1,
    title: "رسالة جديدة",
    description: "تلقيت رسالة جديدة من ولي أمر الطالب أحمد",
    time: "منذ 5 دقائق",
    icon: MessageSquare,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    read: false
  },
  {
    id: 2,
    title: "استحقاق مالي",
    description: "تم إصدار فاتورة القسط الثاني لـ 45 طالب",
    time: "منذ ساعة",
    icon: CreditCard,
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    read: false
  },
  {
    id: 3,
    title: "تأخر عن الحضور",
    description: "تأخر 12 طالب عن الطابور الصباحي اليوم",
    time: "منذ ساعتين",
    icon: Clock,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    read: true
  }
];

export function Header() {
  const { 
    toggleTheme, 
    theme, 
    toggleLanguage, 
    language, 
    currentUser,
    setCurrentUser,
    setInstitutionType,
    institutionType
  } = useApp();

  const handleRoleChange = (role: UserRole) => {
    if (!currentUser) return;
    setCurrentUser({
      ...currentUser,
      role: role
    });
  };

  const getRoleName = (role: string) => {
    switch(role) {
      case 'admin': return 'مدير النظام';
      case 'teacher': return 'معلم';
      case 'student': return 'طالب';
      case 'parent': return 'ولي أمر';
      default: return role;
    }
  };

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 md:hidden">
        <Button variant="ghost" size="icon">
          <Menu size={20} />
        </Button>
      </div>

      <div className="hidden md:flex items-center max-w-md w-full bg-muted/50 rounded-full px-4 py-1.5 border border-border focus-within:border-primary/50 focus-within:bg-background transition-all">
        <Search size={18} className="text-muted-foreground" />
        <input 
          type="text" 
          placeholder={language === 'ar' ? "بحث في النظام..." : "Search..."}
          className="bg-transparent border-none outline-none px-3 text-sm w-full placeholder:text-muted-foreground/70"
        />
      </div>

      <div className="flex items-center gap-2 mr-auto">
        <Button variant="ghost" size="icon" onClick={toggleLanguage} className="rounded-full">
          <Languages size={20} />
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </Button>

        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 font-arabic" align="end">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>الإشعارات</span>
              <Badge variant="secondary" className="font-normal">{notifications.filter(n => !n.read).length} غير مقروء</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex gap-3 p-3 cursor-pointer items-start">
                  <div className={`p-2 rounded-full ${notification.bgColor} ${notification.color} mt-0.5`}>
                    <notification.icon size={16} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm font-medium leading-none ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.description}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70">
                      {notification.time}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  )}
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="w-full text-center text-primary justify-center cursor-pointer">
              عرض كل الإشعارات
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 ml-2">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                <AvatarFallback>US</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 font-arabic" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser?.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px]">{getRoleName(currentUser?.role || '')}</Badge>
                  <p className="text-xs leading-none text-muted-foreground">{currentUser?.email}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-2">
              <UserCircle size={14} /> تبديل الصلاحية (للمعاينة)
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup value={currentUser?.role} onValueChange={(val) => handleRoleChange(val as UserRole)}>
              <DropdownMenuRadioItem value="admin">مدير النظام (Admin)</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="teacher">معلم (Teacher)</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="student">طالب (Student)</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="parent">ولي أمر (Parent)</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>الملف الشخصي</DropdownMenuItem>
            <DropdownMenuItem>الإعدادات</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
