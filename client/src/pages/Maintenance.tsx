import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Plus, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Clock, Wrench, Timer } from "lucide-react";

type Priority = "عاجل" | "متوسط" | "منخفض";
type Status = "مفتوح" | "جاري" | "مكتمل";

interface Ticket {
  id: number;
  title: string;
  location: string;
  reporter: string;
  priority: Priority;
  status: Status;
  date: string;
}

const TICKETS: Ticket[] = [
  { id: 1, title: "تعطل مكيف الفصل 3ب", location: "الطابق الثاني — فصل 3ب", reporter: "أ. نورة الأحمد", priority: "عاجل", status: "مفتوح", date: "2026-07-08" },
  { id: 2, title: "تسريب مياه في دورة مياه البنين", location: "الطابق الأرضي", reporter: "إدارة المدرسة", priority: "عاجل", status: "جاري", date: "2026-07-07" },
  { id: 3, title: "كسر في نافذة فصل 2أ", location: "الطابق الأول — فصل 2أ", reporter: "أ. سالم البرعصي", priority: "متوسط", status: "مفتوح", date: "2026-07-06" },
  { id: 4, title: "صيانة معمل الحاسب — تغيير شاشات", location: "معمل الحاسب", reporter: "أ. خالد اليتيم", priority: "متوسط", status: "مكتمل", date: "2026-07-05" },
  { id: 5, title: "إصلاح إضاءة الممر الرئيسي", location: "الممر الرئيسي", reporter: "الحارس", priority: "منخفض", status: "مكتمل", date: "2026-07-04" },
  { id: 6, title: "تحديث شبكة الإنترنت اللاسلكي", location: "جميع المباني", reporter: "تقنية المعلومات", priority: "متوسط", status: "جاري", date: "2026-07-03" },
];

const PRIORITY_STYLES: Record<Priority, string> = {
  "عاجل": "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
  "متوسط": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  "منخفض": "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
};

const STATUS_STYLES: Record<Status, string> = {
  "مفتوح": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  "جاري": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  "مكتمل": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
};

const STATUS_ICONS: Record<Status, React.ReactNode> = {
  "مفتوح": <AlertCircle size={11} />,
  "جاري": <Timer size={11} />,
  "مكتمل": <CheckCircle2 size={11} />,
};

type FilterStatus = "الكل" | Status;

export default function Maintenance() {
  const [filter, setFilter] = useState<FilterStatus>("الكل");

  const filtered = filter === "الكل" ? TICKETS : TICKETS.filter(t => t.status === filter);

  const openCount = TICKETS.filter(t => t.status === "مفتوح").length;
  const inProgressCount = TICKETS.filter(t => t.status === "جاري").length;
  const completedCount = TICKETS.filter(t => t.status === "مكتمل").length;

  const filters: FilterStatus[] = ["الكل", "مفتوح", "جاري", "مكتمل"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between page-header">
        <div>
          <h1 className="text-[18px] font-bold text-foreground">المرافق والصيانة</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {openCount} بلاغ مفتوح — {inProgressCount} قيد التنفيذ
          </p>
        </div>
        <Button size="sm" className="h-8 gap-1.5 text-[12px]">
          <Plus size={13} /> بلاغ جديد
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 shrink-0">
              <AlertCircle size={15} className="text-red-500 dark:text-red-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">بلاغات مفتوحة</p>
              <p className="text-[18px] font-bold tabular-num leading-tight">{openCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 shrink-0">
              <Wrench size={15} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">قيد التنفيذ</p>
              <p className="text-[18px] font-bold tabular-num leading-tight">{inProgressCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 shrink-0">
              <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">مكتملة</p>
              <p className="text-[18px] font-bold tabular-num leading-tight">{completedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-[12px] font-medium border transition-all ${
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {f}
            {f !== "الكل" && (
              <span className="mr-1.5 tabular-num">
                ({TICKETS.filter(t => t.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tickets */}
      <div className="space-y-2">
        {filtered.map(ticket => (
          <div
            key={ticket.id}
            className="border border-border rounded-lg bg-card hover:border-primary/20 hover:shadow-sm transition-all duration-200 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  ticket.priority === "عاجل"
                    ? "bg-red-50 dark:bg-red-950/30"
                    : ticket.priority === "متوسط"
                      ? "bg-amber-50 dark:bg-amber-950/30"
                      : "bg-muted"
                }`}>
                  {ticket.status === "مكتمل"
                    ? <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                    : ticket.priority === "عاجل"
                      ? <AlertCircle size={14} className="text-red-500 dark:text-red-400" />
                      : <Building2 size={14} className="text-amber-600 dark:text-amber-400" />
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold leading-tight">{ticket.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground flex-wrap">
                    <span>{ticket.location}</span>
                    <span className="text-border">·</span>
                    <span>مقدم البلاغ: {ticket.reporter}</span>
                    <span className="text-border">·</span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {ticket.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${PRIORITY_STYLES[ticket.priority]}`}>
                  {ticket.priority}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${STATUS_STYLES[ticket.status]}`}>
                  {STATUS_ICONS[ticket.status]}
                  {ticket.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="border border-dashed border-border rounded-lg p-12 text-center">
          <Building2 size={32} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-[13px] text-muted-foreground">لا توجد بلاغات في هذا التصنيف</p>
        </div>
      )}
    </div>
  );
}
