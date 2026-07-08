import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ClipboardList, TrendingUp, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Grades() {
  const { db } = useApp();

  const data = useMemo(() => db.grades.map(grade => {
    const student = db.students.find(s => s.id === grade.studentId);
    const assignment = db.assignments.find(a => a.id === grade.assignmentId);
    const percentage = assignment ? (grade.score / assignment.totalMarks) * 100 : 0;
    return {
      ...grade,
      studentName: student?.name || '—',
      assignmentTitle: assignment?.title || '—',
      maxScore: assignment?.totalMarks || 100,
      percentage,
    };
  }), [db.grades, db.students, db.assignments]);

  const avgScore = useMemo(() => {
    if (!data.length) return 0;
    return data.reduce((sum, d) => sum + d.percentage, 0) / data.length;
  }, [data]);

  const highScorers = data.filter(d => d.percentage >= 90).length;

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'studentName',
      header: 'الطالب',
      cell: ({ getValue }) => (
        <span className="text-[13px] font-medium">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'assignmentTitle',
      header: 'الاختبار / الواجب',
      cell: ({ getValue }) => (
        <span className="text-[13px] text-muted-foreground">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'score',
      header: 'الدرجة',
      cell: ({ row }) => (
        <span className="text-[13px] font-semibold tabular-num">
          {row.original.score} / {row.original.maxScore}
        </span>
      ),
    },
    {
      accessorKey: 'percentage',
      header: 'النسبة',
      cell: ({ getValue }) => {
        const pct = getValue() as number;
        const color = pct >= 90
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
          : pct >= 75
            ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800"
            : pct >= 60
              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800";
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border tabular-num ${color}`}>
            {pct.toFixed(0)}%
          </span>
        );
      },
    },
    {
      accessorKey: 'feedback',
      header: 'ملاحظات',
      cell: ({ getValue }) => (
        <span className="text-[12px] text-muted-foreground">{getValue() as string || '—'}</span>
      ),
    },
  ], []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between page-header">
        <div>
          <h1 className="text-[18px] font-bold text-foreground">الامتحانات والنتائج</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            سجل درجات الطلاب والنتائج التفصيلية
          </p>
        </div>
        <Button size="sm" className="h-8 gap-1.5 text-[12px]" variant="outline">
          <Download size={13} />
          تصدير الكشوف
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 shrink-0">
              <ClipboardList size={15} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">إجمالي السجلات</p>
              <p className="text-[18px] font-bold tabular-num leading-tight">{data.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 shrink-0">
              <TrendingUp size={15} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">متوسط النتائج</p>
              <p className="text-[18px] font-bold tabular-num leading-tight">{avgScore.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 shrink-0">
              <Award size={15} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">تفوق (90%+)</p>
              <p className="text-[18px] font-bold tabular-num leading-tight">{highScorers}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <UniversalDataGrid
        columns={columns}
        data={data}
        globalSearchPlaceholder="ابحث بالطالب أو الاختبار..."
      />
    </div>
  );
}
