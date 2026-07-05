import { Link, useLocation } from "wouter";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Settings,
  LogOut,
  School,
  Building2,
  Library,
  Bus,
  FileText,
  CreditCard,
  Shield,
  Heart
} from "lucide-react";
import { UserRole } from "@/lib/types";

export function Sidebar() {
  const { institution, institutionType, currentUser } = useApp();
  const [location] = useLocation();

  const menuItems = [
    {
      title: "لوحة التحكم",
      icon: LayoutDashboard,
      path: "/",
      roles: ["admin", "teacher", "student", "parent"]
    },
    {
      title: "شؤون الطلاب",
      icon: Users,
      path: "/students",
      roles: ["admin", "teacher"]
    },
    {
      title: "المعلمين والموظفين",
      icon: GraduationCap,
      path: "/teachers",
      roles: ["admin"]
    },
    {
      title: "الفصول والمواد",
      icon: BookOpen,
      path: "/academics",
      roles: ["admin", "teacher"]
    },
    {
      title: "جدول الحصص",
      icon: Calendar,
      path: "/schedule",
      roles: ["admin", "teacher", "student"]
    },
    {
      title: "الامتحانات والنتائج",
      icon: FileText,
      path: "/grades",
      roles: ["admin", "teacher", "student", "parent"]
    },
    {
      title: "الرسوم والمصروفات",
      icon: CreditCard,
      path: "/finance",
      roles: ["admin", "parent"]
    },
    {
      title: "الواجبات والأنشطة",
      icon: FileText,
      path: "/homework",
      roles: ["admin", "teacher", "student", "parent"]
    },
    {
      title: "التواصل والرسائل",
      icon: Users,
      path: "/messages",
      roles: ["admin", "teacher", "student", "parent"]
    },
    {
      title: "التقارير والإحصائيات",
      icon: FileText,
      path: "/reports",
      roles: ["admin"]
    },
    {
      title: "المكتبة المدرسية",
      icon: Library,
      path: "/library",
      roles: ["admin", "teacher", "student"]
    },
    {
      title: "حركة النقل",
      icon: Bus,
      path: "/transport",
      roles: ["admin", "parent"]
    },
    {
      title: "الأمن والصلاحيات",
      icon: Shield,
      path: "/security",
      roles: ["admin"]
    },
    {
      title: "العيادة المدرسية",
      icon: Heart,
      path: "/health",
      roles: ["admin", "teacher", "student"]
    },
    {
      title: "المرافق والصيانة",
      icon: Building2,
      path: "/maintenance",
      roles: ["admin"]
    },
    {
      title: "إعدادات النظام",
      icon: Settings,
      path: "/settings",
      roles: ["admin"]
    }
  ];

  const filteredMenu = menuItems.filter(item => 
    currentUser && item.roles.includes(currentUser.role as UserRole)
  );

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-sidebar border-l border-sidebar-border fixed right-0 top-0 z-30 transition-all duration-300 ease-in-out">
      <div className="h-16 flex items-center gap-3 px-6 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <School size={20} />
        </div>
        <h1 className="font-bold text-lg text-sidebar-foreground truncate">
          {institution.name}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {filteredMenu.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}>
                <item.icon size={18} />
                <span>{item.title}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors cursor-pointer text-destructive hover:text-destructive">
          <LogOut size={18} />
          <span className="text-sm font-medium">تسجيل الخروج</span>
        </div>
      </div>
    </aside>
  );
}
