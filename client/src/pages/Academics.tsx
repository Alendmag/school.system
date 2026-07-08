import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Plus, GraduationCap, Hash } from "lucide-react";

const SUBJECT_COLORS = [
  "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800",
  "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
  "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800",
];

export default function Academics() {
  const { db } = useApp();

  const classesWithCounts = useMemo(() =>
    db.classes.map(cls => ({
      ...cls,
      studentCount: db.students.filter(s => s.classId === cls.id).length,
      teacherName: db.teachers.find(t => t.id === cls.teacherId)?.name || '—',
    })),
    [db.classes, db.students, db.teachers]
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between page-header">
        <div>
          <h1 className="text-[18px] font-bold text-foreground">الفصول والمواد الدراسية</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {db.subjects.length} مادة دراسية — {db.classes.length} فصل نشط
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" disabled>
            <Users size={13} /> إدارة الفصول
          </Button>
          <Button size="sm" className="h-8 gap-1.5 text-[12px]" disabled>
            <Plus size={13} /> إضافة مادة
          </Button>
        </div>
      </div>

      {/* Subjects */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold flex items-center gap-2">
            <BookOpen size={15} className="text-primary" />
            المقررات الدراسية
          </h2>
          <span className="text-[11px] text-muted-foreground">{db.subjects.length} مادة</span>
        </div>
        <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {db.subjects.map((subject, i) => (
            <div
              key={subject.id}
              className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-card hover:shadow-sm hover:border-primary/20 transition-all cursor-default group"
            >
              <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-[11px] font-bold border ${SUBJECT_COLORS[i % SUBJECT_COLORS.length]}`}>
                {subject.name.substring(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium truncate leading-tight">{subject.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{subject.code}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Classes */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold flex items-center gap-2">
            <GraduationCap size={15} className="text-primary" />
            الفصول الدراسية
          </h2>
          <span className="text-[11px] text-muted-foreground">{db.classes.length} فصل</span>
        </div>
        <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4">الفصل</th>
                <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4">الصف</th>
                <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4">المعلم المسؤول</th>
                <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4">الطلاب</th>
                <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4">الطاقة</th>
              </tr>
            </thead>
            <tbody>
              {classesWithCounts.map((cls, i) => {
                const fillRate = cls.capacity > 0 ? (cls.studentCount / cls.capacity) * 100 : 0;
                const isNearCapacity = fillRate >= 90;
                return (
                  <tr key={cls.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                          <span className="text-[11px] font-bold text-primary">{cls.name.substring(0, 1)}</span>
                        </div>
                        <span className="text-[13px] font-medium">{cls.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="text-[12px] text-muted-foreground">{cls.level}</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="text-[13px]">{cls.teacherName}</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="text-[13px] tabular-num font-medium">{cls.studentCount}</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isNearCapacity ? 'bg-amber-400' : 'bg-primary'}`}
                            style={{ width: `${Math.min(fillRate, 100)}%` }}
                          />
                        </div>
                        <span className={`text-[11px] tabular-num ${isNearCapacity ? 'text-amber-600' : 'text-muted-foreground'}`}>
                          {cls.studentCount}/{cls.capacity}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
