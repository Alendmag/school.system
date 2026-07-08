import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Calendar, CreditCard as Edit } from "lucide-react";

const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];

const PERIODS = [
  { label: "الأولى", time: "8:00 — 8:45" },
  { label: "الثانية", time: "9:00 — 9:45" },
  { label: "الثالثة", time: "10:00 — 10:45" },
  { label: "الرابعة", time: "11:30 — 12:15" },
  { label: "الخامسة", time: "12:30 — 13:15" },
];

const CELL_COLORS = [
  "bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-300",
  "bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300",
  "bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300",
  "bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300",
  "bg-cyan-50 border-cyan-100 text-cyan-800 dark:bg-cyan-950/30 dark:border-cyan-900 dark:text-cyan-300",
];

const SCHEDULE_DATA: Record<string, Record<string, { subject: string; teacher: string }>> = {
  "الأحد":    { "الأولى": { subject: "رياضيات", teacher: "أ. أحمد سالم" }, "الثانية": { subject: "علوم", teacher: "أ. محمود علي" }, "الثالثة": { subject: "لغة عربية", teacher: "أ. خالد منصور" }, "الرابعة": { subject: "تاريخ", teacher: "أ. سارة الأحمد" }, "الخامسة": { subject: "تربية بدنية", teacher: "أ. نوري الطيب" } },
  "الإثنين":  { "الأولى": { subject: "لغة إنجليزية", teacher: "أ. فاطمة بنت سالم" }, "الثانية": { subject: "رياضيات", teacher: "أ. أحمد سالم" }, "الثالثة": { subject: "فيزياء", teacher: "أ. يوسف الشريف" }, "الرابعة": { subject: "علوم", teacher: "أ. محمود علي" }, "الخامسة": { subject: "تربية فنية", teacher: "أ. ليلى الصيد" } },
  "الثلاثاء": { "الأولى": { subject: "تاريخ", teacher: "أ. سارة الأحمد" }, "الثانية": { subject: "لغة عربية", teacher: "أ. خالد منصور" }, "الثالثة": { subject: "رياضيات", teacher: "أ. أحمد سالم" }, "الرابعة": { subject: "لغة إنجليزية", teacher: "أ. فاطمة بنت سالم" }, "الخامسة": { subject: "فيزياء", teacher: "أ. يوسف الشريف" } },
  "الأربعاء": { "الأولى": { subject: "علوم", teacher: "أ. محمود علي" }, "الثانية": { subject: "فيزياء", teacher: "أ. يوسف الشريف" }, "الثالثة": { subject: "تاريخ", teacher: "أ. سارة الأحمد" }, "الرابعة": { subject: "رياضيات", teacher: "أ. أحمد سالم" }, "الخامسة": { subject: "لغة عربية", teacher: "أ. خالد منصور" } },
  "الخميس":   { "الأولى": { subject: "لغة إنجليزية", teacher: "أ. فاطمة بنت سالم" }, "الثانية": { subject: "تربية بدنية", teacher: "أ. نوري الطيب" }, "الثالثة": { subject: "علوم", teacher: "أ. محمود علي" }, "الرابعة": { subject: "تربية فنية", teacher: "أ. ليلى الصيد" }, "الخامسة": { subject: "رياضيات", teacher: "أ. أحمد سالم" } },
};

const subjectColorIndex: Record<string, number> = {
  "رياضيات": 0, "علوم": 1, "لغة عربية": 2, "تاريخ": 3,
  "لغة إنجليزية": 4, "فيزياء": 0, "تربية بدنية": 1, "تربية فنية": 2,
};

export default function Schedule() {
  const { db } = useApp();
  const [selectedClass, setSelectedClass] = useState(db.classes[0]?.id || "");

  const cls = db.classes.find(c => c.id === selectedClass);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between page-header">
        <div>
          <h1 className="text-[18px] font-bold text-foreground">الجدول الدراسي</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            جدول الحصص الأسبوعي — {cls?.name || "الفصل"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="h-8 text-[12px] w-36">
              <SelectValue placeholder="اختر الفصل..." />
            </SelectTrigger>
            <SelectContent dir="rtl">
              {db.classes.map(c => (
                <SelectItem key={c.id} value={c.id} className="text-[12px]">{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" className="h-8 gap-1.5 text-[12px]" disabled>
            <Edit size={13} /> تعديل الجدول
          </Button>
        </div>
      </div>

      {/* Timetable */}
      <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4 w-28">
                  اليوم
                </th>
                {PERIODS.map(p => (
                  <th key={p.label} className="text-center py-2.5 px-3 min-w-[130px]">
                    <div className="text-[11px] font-semibold text-foreground">{p.label}</div>
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5" dir="ltr">{p.time}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, di) => (
                <tr key={day} className={`border-b border-border/60 ${di % 2 === 0 ? "" : "bg-muted/10"}`}>
                  <td className="py-3 px-4">
                    <span className="text-[13px] font-semibold">{day}</span>
                  </td>
                  {PERIODS.map(p => {
                    const cell = SCHEDULE_DATA[day]?.[p.label];
                    if (!cell) return <td key={p.label} className="py-2 px-2 text-center"><span className="text-[11px] text-muted-foreground/40">—</span></td>;
                    const colorIdx = subjectColorIndex[cell.subject] ?? 0;
                    return (
                      <td key={p.label} className="py-2 px-2">
                        <div className={`rounded border px-2.5 py-1.5 ${CELL_COLORS[colorIdx % CELL_COLORS.length]}`}>
                          <div className="text-[12px] font-medium leading-tight">{cell.subject}</div>
                          <div className="text-[10px] opacity-70 mt-0.5 truncate">{cell.teacher}</div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-[11px] text-muted-foreground font-semibold">المواد:</span>
        {Object.entries(subjectColorIndex).map(([subj, ci]) => (
          <span key={subj} className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] border ${CELL_COLORS[ci % CELL_COLORS.length]}`}>
            {subj}
          </span>
        ))}
      </div>
    </div>
  );
}
