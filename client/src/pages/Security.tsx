import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Plus, Users, ShieldCheck, Clock, Lock } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  admin: "مدير النظام",
  teacher: "معلم",
  student: "طالب",
  parent: "ولي أمر",
  accountant: "محاسب",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  teacher: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
  student: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  parent: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800",
  accountant: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800",
};

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return parts[0][0] + parts[1][0];
  return name.substring(0, 2);
}

const LAST_LOGIN_LABELS = [
  "منذ دقيقتين", "منذ 15 دقيقة", "منذ ساعة", "منذ ساعتين",
  "منذ 4 ساعات", "منذ يوم", "منذ يومين", "منذ 3 أيام",
];

export default function Security() {
  const { db } = useApp();

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    db.users.forEach(u => { counts[u.role] = (counts[u.role] || 0) + 1; });
    return counts;
  }, [db.users]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between page-header">
        <div>
          <h1 className="text-[18px] font-bold text-foreground">الأمن والصلاحيات</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {db.users.length} مستخدم — إدارة الأدوار وسجل الدخول
          </p>
        </div>
        <Button size="sm" className="h-8 gap-1.5 text-[12px]" disabled>
          <Plus size={13} /> إنشاء بطاقة زائر
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 shrink-0">
              <Users size={15} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">المستخدمون</p>
              <p className="text-[18px] font-bold tabular-num leading-tight">{db.users.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 shrink-0">
              <ShieldCheck size={15} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">المديرون</p>
              <p className="text-[18px] font-bold tabular-num leading-tight">{roleCounts.admin || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 shrink-0">
              <Clock size={15} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">نشط الآن</p>
              <p className="text-[18px] font-bold tabular-num leading-tight">3</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 shrink-0">
              <Lock size={15} className="text-red-500 dark:text-red-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">محاولات فاشلة</p>
              <p className="text-[18px] font-bold tabular-num leading-tight">0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users table */}
      <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4">المستخدم</th>
              <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4">البريد الإلكتروني</th>
              <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4">الدور</th>
              <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4">آخر دخول</th>
              <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {db.users.map((user, i) => (
              <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${ROLE_COLORS[user.role] || ROLE_COLORS.teacher}`}>
                      {getInitials(user.name)}
                    </div>
                    <span className="text-[13px] font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="py-2.5 px-4">
                  <span className="text-[12px] text-muted-foreground font-mono" dir="ltr">{user.email}</span>
                </td>
                <td className="py-2.5 px-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${ROLE_COLORS[user.role] || ROLE_COLORS.teacher}`}>
                    <Shield size={9} />
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                </td>
                <td className="py-2.5 px-4">
                  <span className="text-[12px] text-muted-foreground">
                    {LAST_LOGIN_LABELS[i % LAST_LOGIN_LABELS.length]}
                  </span>
                </td>
                <td className="py-2.5 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    نشط
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
