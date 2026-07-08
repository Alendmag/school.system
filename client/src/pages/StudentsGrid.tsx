import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { UniversalDataGrid } from '@/components/data-grid/UniversalDataGrid';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CreditCard as Edit, Eye, Trash2, MoveHorizontal as MoreHorizontal, MessageSquare, UserPlus, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export default function StudentsGrid() {
  const { db, services } = useApp();

  const data = useMemo(() => {
    return db.students.map(student => ({
      ...student,
      className: db.classes.find(c => c.id === student.classId)?.name || '—',
      gpa: services.getStudentGPA(student.id),
      attendance: services.getStudentAttendance(student.id).percentage,
    }));
  }, [db.students, db.classes]);

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'name',
      header: 'الطالب',
      cell: ({ row }) => {
        const s = row.original;
        const initials = s.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('');
        const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700'];
        const colorIdx = s.name.charCodeAt(0) % colors.length;
        return (
          <div className="flex items-center gap-2.5">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className={`text-[11px] font-bold ${colors[colorIdx]}`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium text-[13px] leading-tight truncate">{s.name}</p>
              <p className="text-[11px] text-muted-foreground font-mono">{s.studentId}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'className',
      header: 'الفصل',
      cell: ({ getValue }) => (
        <span className="text-[13px] text-muted-foreground">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'gpa',
      header: 'المعدل',
      cell: ({ getValue }) => {
        const gpa = getValue() as number | null;
        if (!gpa) return <span className="text-muted-foreground text-[12px]">—</span>;
        const isHigh = gpa >= 85;
        return (
          <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tabular-num border",
            isHigh
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
          )}>
            {gpa.toFixed(1)}%
          </span>
        );
      },
    },
    {
      accessorKey: 'attendance',
      header: 'الحضور',
      cell: ({ getValue }) => {
        const att = getValue() as number;
        const isGood = att >= 90;
        return (
          <div className="flex items-center gap-2 w-28">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isGood ? 'bg-primary' : att >= 80 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${Math.min(att, 100)}%` }}
              />
            </div>
            <span className={cn(
              "text-[11px] font-medium tabular-num w-8 text-left",
              isGood ? "text-primary" : att >= 80 ? "text-amber-600" : "text-red-600"
            )}>
              {att.toFixed(0)}%
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      cell: ({ getValue }) => {
        const status = getValue() as string;
        return (
          <span className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border",
            status === 'active'
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
              : "bg-muted text-muted-foreground border-border"
          )}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
            {status === 'active' ? 'نشط' : 'غير نشط'}
          </span>
        );
      },
    },
  ], []);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-start justify-between page-header">
        <div>
          <h1 className="text-[18px] font-bold text-foreground">شؤون الطلاب</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {db.students.length.toLocaleString()} طالب مسجل — إدارة وبحث وتصدير البيانات
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]">
            <Download size={13} />
            تصدير
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5 text-[12px]"
            onClick={() => window.dispatchEvent(new CustomEvent('open-add-student'))}
          >
            <UserPlus size={13} />
            إضافة طالب
          </Button>
        </div>
      </div>

      <UniversalDataGrid
        columns={columns}
        data={data}
        enableRowSelection
        globalSearchPlaceholder="ابحث بالاسم، الرقم، الفصل..."
        onRowDoubleClick={(row) => console.log("view student:", row)}
        renderBulkActions={(selectedRows) => (
          <>
            <Button variant="outline" size="sm" className="h-7 text-[12px] gap-1">
              <MessageSquare size={12} />
              مراسلة ({selectedRows.length})
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[12px]">
              تغيير الفصل
            </Button>
          </>
        )}
        renderRowActions={(row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40" dir="rtl">
              <DropdownMenuLabel className="text-[11px] text-muted-foreground">إجراءات</DropdownMenuLabel>
              <DropdownMenuItem className="text-[13px] gap-2">
                <Eye size={13} /> عرض الملف
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[13px] gap-2">
                <Edit size={13} /> تعديل البيانات
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[13px] gap-2 text-destructive focus:text-destructive">
                <Trash2 size={13} /> إيقاف القيد
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
    </div>
  );
}
