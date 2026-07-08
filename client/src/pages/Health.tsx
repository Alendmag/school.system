import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { HeartPulse, Plus, TriangleAlert as AlertTriangle, Activity, User, Calendar, Search, ChevronRight } from "lucide-react";

const VISIT_TYPES = [
  { label: "مرض", color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800" },
  { label: "إصابة", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800" },
  { label: "روتينية", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800" },
  { label: "طارئة", color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800" },
];

const mockVisits = [
  { id: 1, studentName: "أحمد محمد السالم", class: "الصف الخامس أ", type: "مرض", complaint: "صداع وحرارة خفيفة", time: "08:30 ص", date: "2026-07-08", outcome: "راح للمنزل" },
  { id: 2, studentName: "فاطمة علي الزوي", class: "الصف الثالث ب", type: "إصابة", complaint: "كدمة في الركبة من الملعب", time: "10:15 ص", date: "2026-07-08", outcome: "تم التضميد، عادت للفصل" },
  { id: 3, studentName: "خالد إبراهيم الورفلي", class: "الصف السادس أ", type: "روتينية", complaint: "فحص دوري قبل المباراة الرياضية", time: "11:00 ص", date: "2026-07-08", outcome: "مؤهل للمشاركة" },
  { id: 4, studentName: "نورة يوسف المنصوري", class: "الصف الأول ج", type: "طارئة", complaint: "تعرضت لنوبة ربو", time: "12:40 م", date: "2026-07-07", outcome: "تم إخطار ولي الأمر، تحسنت الحالة" },
  { id: 5, studentName: "عمر سالم الفرجاني", class: "الصف الرابع أ", type: "مرض", complaint: "غثيان وألم في المعدة", time: "09:00 ص", date: "2026-07-07", outcome: "راح للمنزل" },
];

const ALERTS = [
  { text: "12 طالباً مسجلاً بحالات ربو — يرجى إبلاغ المشرفين في رحلات خارج المدرسة", severity: "warning" },
  { text: "4 حالات حساسية طعام حادة — خطر مصنف لدى إدارة المقصف", severity: "error" },
];

function getTypeStyle(type: string) {
  return VISIT_TYPES.find(v => v.label === type)?.color || VISIT_TYPES[2].color;
}

export default function Health() {
  const { db } = useApp();
  const [search, setSearch] = useState("");

  const today = mockVisits.filter(v => v.date === "2026-07-08");
  const previous = mockVisits.filter(v => v.date !== "2026-07-08");

  const filtered = mockVisits.filter(v =>
    v.studentName.includes(search) || v.complaint.includes(search) || v.class.includes(search)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between page-header">
        <div>
          <h1 className="text-[18px] font-bold text-foreground">العيادة المدرسية</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {today.length} زيارة اليوم — السجل الطبي والتنبيهات الصحية
          </p>
        </div>
        <Button size="sm" className="h-8 gap-1.5 text-[12px]">
          <Plus size={13} /> تسجيل زيارة
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 shrink-0">
              <Activity size={15} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">زيارات اليوم</p>
              <p className="text-[18px] font-bold tabular-num leading-tight">{today.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 shrink-0">
              <HeartPulse size={15} className="text-red-500 dark:text-red-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">حالات مزمنة</p>
              <p className="text-[18px] font-bold tabular-num leading-tight">16</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 shrink-0">
              <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">تنبيهات نشطة</p>
              <p className="text-[18px] font-bold tabular-num leading-tight">{ALERTS.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 shrink-0">
              <User size={15} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">إجمالي الزيارات</p>
              <p className="text-[18px] font-bold tabular-num leading-tight">{mockVisits.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <div className="space-y-2">
        {ALERTS.map((alert, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 p-3 rounded-lg border text-[12px] ${
              alert.severity === "error"
                ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400"
                : "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400"
            }`}
          >
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>{alert.text}</span>
          </div>
        ))}
      </div>

      {/* Visit log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-semibold">سجل الزيارات</h2>
          <div className="relative">
            <Search size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="بحث..."
              className="h-7 text-[12px] pr-7 w-52"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4">الطالب</th>
                <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4">الفصل</th>
                <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4">الشكوى</th>
                <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4">النوع</th>
                <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4">النتيجة</th>
                <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4">الوقت</th>
              </tr>
            </thead>
            <tbody>
              {(search ? filtered : mockVisits).map(visit => (
                <tr key={visit.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-4">
                    <span className="text-[13px] font-medium">{visit.studentName}</span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-[12px] text-muted-foreground">{visit.class}</span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-[12px]">{visit.complaint}</span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getTypeStyle(visit.type)}`}>
                      {visit.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-[12px] text-muted-foreground">{visit.outcome}</span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-[11px] text-muted-foreground tabular-num">{visit.time}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(search ? filtered : mockVisits).length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-[13px]">
              لا توجد نتائج مطابقة
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
