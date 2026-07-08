import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { UniversalDataGrid } from "@/components/data-grid/UniversalDataGrid";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, GraduationCap, BookOpen, Star, MoveHorizontal as MoreHorizontal, Eye, CreditCard as Edit } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function Teachers() {
  const { db } = useApp();

  const avgExperience = useMemo(() => {
    if (!db.teachers.length) return 0;
    return (db.teachers.reduce((sum, t) => sum + (t.experienceYears || 0), 0) / db.teachers.length).toFixed(1);
  }, [db.teachers]);

  const data = useMemo(() => db.teachers.map(teacher => ({
    ...teacher,
    subjectNames: teacher.subjectIds
      .map(sid => db.subjects.find(s => s.id === sid)?.name)
      .filter(Boolean) as string[],
    classCount: db.classes.filter(c => c.teacherId === teacher.id).length,
  })), [db.teachers, db.subjects, db.classes]);

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'name',
      header: 'المعلم',
      cell: ({ row }) => {
        const t = row.original;
        const initials = t.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('');
        return (
          <div className="flex items-center gap-2.5">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 text-[11px] font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium text-[13px] leading-tight truncate">{t.name}</p>
              <p className="text-[11px] text-muted-foreground font-mono">{t.id}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'qualifications',
      header: 'المؤهل',
      cell: ({ getValue }) => (
        <span className="text-[13px] text-muted-foreground">{getValue() as string || '—'}</span>
      ),
    },
    {
      accessorKey: 'experienceYears',
      header: 'الخبرة',
      cell: ({ getValue }) => {
        const years = getValue() as number;
        return (
          <div className="flex items-center gap-1.5">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-[13px] tabular-num">{years} سنة</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'subjectNames',
      header: 'المواد',
      cell: ({ getValue }) => {
        const subjects = getValue() as string[];
        return (
          <div className="flex flex-wrap gap-1">
            {subjects.slice(0, 2).map((s, i) => (
              <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800">
                {s}
              </span>
            ))}
            {subjects.length > 2 && (
              <span className="text-[11px] text-muted-foreground">+{subjects.length - 2}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'classCount',
      header: 'الفصول',
      cell: ({ getValue }) => {
        const count = getValue() as number;
        return (
          <span className="text-[13px] tabular-num">{count} فصل</span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: () => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          نشط
        </span>
      ),
    },
  ], []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between page-header">
        <div>
          <h1 className="text-[18px] font-bold text-foreground">الكادر التعليمي</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            إدارة بيانات المعلمين والمؤهلات والجداول الدراسية
          </p>
        </div>
        <Button size="sm" className="h-8 gap-1.5 text-[12px]" disabled>
          <UserPlus size={13} />
          إضافة معلم
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="card-hover-lift border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 shrink-0">
              <GraduationCap size={16} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">إجمالي المعلمين</p>
              <p className="text-[20px] font-bold tabular-num leading-tight">{db.teachers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover-lift border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 shrink-0">
              <Star size={16} className="text-amber-500" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">متوسط الخبرة</p>
              <p className="text-[20px] font-bold tabular-num leading-tight">{avgExperience} <span className="text-[13px] font-normal text-muted-foreground">سنة</span></p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover-lift border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 shrink-0">
              <BookOpen size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">المواد الدراسية</p>
              <p className="text-[20px] font-bold tabular-num leading-tight">{db.subjects.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid */}
      <UniversalDataGrid
        columns={columns}
        data={data}
        globalSearchPlaceholder="ابحث باسم المعلم أو المادة..."
        renderRowActions={(row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-7 w-7 p-0">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36" dir="rtl">
              <DropdownMenuLabel className="text-[11px] text-muted-foreground">إجراءات</DropdownMenuLabel>
              <DropdownMenuItem className="text-[13px] gap-2"><Eye size={13} /> عرض الملف</DropdownMenuItem>
              <DropdownMenuItem className="text-[13px] gap-2" disabled><Edit size={13} /> تعديل البيانات</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
    </div>
  );
}
