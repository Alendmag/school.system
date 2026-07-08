import { Link, useLocation } from "wouter";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, GraduationCap, BookOpen, Calendar, Settings, LogOut, School, Library, Bus, FileText, CreditCard, Shield, Heart, Building2, MessageSquare, ChartBar as BarChart3, ClipboardList, ChevronRight } from "lucide-react";
import { UserRole } from "@/lib/types";

const menuGroups = [
  {
    label: "الرئيسية",
    items: [
      { title: "لوحة التحكم", icon: LayoutDashboard, path: "/", roles: ["admin", "teacher", "student", "parent"] },
    ]
  },
  {
    label: "الشؤون الأكاديمية",
    items: [
      { title: "شؤون الطلاب", icon: Users, path: "/students", roles: ["admin", "teacher"] },
      { title: "الكادر التعليمي", icon: GraduationCap, path: "/teachers", roles: ["admin"] },
      { title: "الفصول والمواد", icon: BookOpen, path: "/academics", roles: ["admin", "teacher"] },
      { title: "جدول الحصص", icon: Calendar, path: "/schedule", roles: ["admin", "teacher", "student"] },
      { title: "الامتحانات والنتائج", icon: ClipboardList, path: "/grades", roles: ["admin", "teacher", "student", "parent"] },
      { title: "الواجبات والأنشطة", icon: FileText, path: "/homework", roles: ["admin", "teacher", "student", "parent"] },
    ]
  },
  {
    label: "الإدارة والمالية",
    items: [
      { title: "الرسوم والمصروفات", icon: CreditCard, path: "/finance", roles: ["admin", "parent"] },
      { title: "التقارير والإحصائيات", icon: BarChart3, path: "/reports", roles: ["admin"] },
      { title: "التواصل والرسائل", icon: MessageSquare, path: "/messages", roles: ["admin", "teacher", "student", "parent"] },
    ]
  },
  {
    label: "الخدمات المدرسية",
    items: [
      { title: "المكتبة المدرسية", icon: Library, path: "/library", roles: ["admin", "teacher", "student"] },
      { title: "حركة النقل", icon: Bus, path: "/transport", roles: ["admin", "parent"] },
      { title: "العيادة المدرسية", icon: Heart, path: "/health", roles: ["admin", "teacher", "student"] },
      { title: "المرافق والصيانة", icon: Building2, path: "/maintenance", roles: ["admin"] },
    ]
  },
  {
    label: "النظام",
    items: [
      { title: "الأمن والصلاحيات", icon: Shield, path: "/security", roles: ["admin"] },
      { title: "إعدادات النظام", icon: Settings, path: "/settings", roles: ["admin"] },
    ]
  }
];

export function Sidebar() {
  const { institution, currentUser } = useApp();
  const [location] = useLocation();

  const userRole = currentUser?.role as UserRole;

  return (
    <aside className="hidden md:flex flex-col w-60 h-screen bg-sidebar border-l border-sidebar-border fixed right-0 top-0 z-30">
      {/* Brand Header */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-sidebar-border shrink-0">
        <div className="w-8 h-8 rounded-md bg-sidebar-primary/20 flex items-center justify-center shrink-0">
          <School size={16} className="text-sidebar-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-sidebar-accent-foreground truncate leading-tight">
            {institution.name}
          </p>
          <p className="text-[10px] text-sidebar-foreground/50 leading-tight mt-0.5">نظام إدارة المدرسة</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {menuGroups.map((group) => {
          const visibleItems = group.items.filter(item =>
            userRole && item.roles.includes(userRole)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="mb-3">
              <p className="sidebar-group-label">{group.label}</p>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = location === item.path;
                  return (
                    <Link key={item.path} href={item.path}>
                      <div className={cn(
                        "relative flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-150 cursor-pointer group",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                          : "text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                      )}>
                        {isActive && (
                          <span className="absolute right-0 top-1 bottom-1 w-0.5 bg-sidebar-primary rounded-l-full" />
                        )}
                        <item.icon
                          size={15}
                          className={cn(
                            "shrink-0 transition-colors",
                            isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                          )}
                        />
                        <span className="truncate">{item.title}</span>
                        {isActive && <ChevronRight size={12} className="mr-auto text-sidebar-primary opacity-60" />}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-sidebar-border shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-md">
          <div className="w-7 h-7 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-sidebar-primary">
              {currentUser?.name?.substring(0, 2) || 'US'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-sidebar-accent-foreground truncate leading-tight">
              {currentUser?.name}
            </p>
            <p className="text-[10px] text-sidebar-foreground/50 leading-tight">
              {currentUser?.role === 'admin' ? 'مدير النظام' :
               currentUser?.role === 'teacher' ? 'معلم' :
               currentUser?.role === 'student' ? 'طالب' : 'ولي أمر'}
            </p>
          </div>
          <button className="p-1 rounded hover:bg-sidebar-accent/60 transition-colors group">
            <LogOut size={13} className="text-sidebar-foreground/40 group-hover:text-red-400 transition-colors" />
          </button>
        </div>
      </div>
    </aside>
  );
}
