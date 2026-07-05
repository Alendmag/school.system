import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UniversalDataGrid } from '@/components/data-grid/UniversalDataGrid';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Trash2, MoreHorizontal, MessageSquare } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function StudentsGrid() {
  const { db, services } = useApp();
  
  // Real data mapping
  const data = useMemo(() => {
    return db.students.map(student => ({
      ...student,
      className: db.classes.find(c => c.id === student.classId)?.name || 'غير محدد',
      gpa: services.getStudentGPA(student.id),
      attendance: services.getStudentAttendance(student.id).percentage,
    }));
  }, [db.students, db.classes]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'الطالب',
        cell: ({ row }) => {
          const student = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={student.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {student.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-sm">{student.name}</span>
                <span className="text-xs text-muted-foreground">{student.studentId}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'className',
        header: 'الفصل',
      },
      {
        accessorKey: 'gpa',
        header: 'المعدل التراكمي',
        cell: ({ getValue }) => {
          const gpa = getValue() as number;
          return (
            <Badge variant="outline" className={gpa >= 85 ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-amber-500 text-amber-700 bg-amber-50'}>
              {gpa.toFixed(1)}%
            </Badge>
          );
        },
      },
      {
        accessorKey: 'attendance',
        header: 'الحضور',
        cell: ({ getValue }) => {
          const att = getValue() as number;
          return (
            <div className="flex items-center gap-2">
              <div className="w-full bg-secondary rounded-full h-2 max-w-[80px]">
                <div className={`h-2 rounded-full ${att >= 90 ? 'bg-blue-500' : 'bg-red-500'}`} style={{ width: `${att}%` }} />
              </div>
              <span className="text-xs text-muted-foreground">{att.toFixed(0)}%</span>
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
            <Badge className={status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-muted text-muted-foreground'}>
              {status === 'active' ? 'نشط' : status}
            </Badge>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">سجل الطلاب (الشبكة الذكية)</h1>
          <p className="text-muted-foreground">عرض، فرز، تصدير وتحرير بيانات الطلاب بإنتاجية عالية.</p>
        </div>
        <Button onClick={() => window.dispatchEvent(new CustomEvent('open-add-student'))}>
          إضافة طالب جديد
        </Button>
      </div>

      <UniversalDataGrid
        columns={columns}
        data={data}
        enableRowSelection={true}
        globalSearchPlaceholder="ابحث باسم الطالب، الرقم، أو الفصل..."
        onRowDoubleClick={(row) => console.log("Double clicked:", row)}
        renderBulkActions={(selectedRows) => (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="h-8">
              <MessageSquare className="h-3 w-3 ml-2" /> مراسلة ({selectedRows.length})
            </Button>
            <Button variant="secondary" size="sm" className="h-8">
               تغيير الفصل
            </Button>
          </div>
        )}
        renderRowActions={(row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="font-arabic" dir="rtl">
              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.studentId)}>
                نسخ رقم الطالب
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem><Eye className="h-4 w-4 ml-2"/> عرض الملف الشامل</DropdownMenuItem>
              <DropdownMenuItem><Edit className="h-4 w-4 ml-2"/> تعديل البيانات</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 ml-2"/> إيقاف القيد</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
    </div>
  );
}
