import { useMemo } from 'react';
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
  const { data, loading } = useApp();

  // Real data mapping - GPA and attendance now computed server-side via Student 360 endpoint
  const gridData = useMemo(() => {
    return data.students.map(student => ({
      ...student,
      className: data.classes.find(c => c.id === student.classId)?.name || 'غير محدد',
    }));
  }, [data.students, data.classes]);

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
        id: 'gpa',
        header: 'المعدل التراكمي',
        cell: () => (
          <Badge variant="outline" className="border-muted text-muted-foreground">
            N/A
          </Badge>
        ),
      },
      {
        id: 'attendance',
        header: 'الحضور',
        cell: () => (
          <span className="text-xs text-muted-foreground">N/A</span>
        ),
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

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

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
        data={gridData}
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
