import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users, BookOpen } from "lucide-react";

export default function Teachers() {
  const { data, loading } = useApp();

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إدارة الكادر التعليمي</h1>
          <p className="text-muted-foreground">إدارة بيانات المعلمين، المؤهلات، والجدول الأسبوعي.</p>
        </div>
        <Button className="gap-2"><Plus size={16} /> إضافة معلم</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-6 flex items-center gap-4"><Users className="text-blue-500" size={24}/><div><p className="text-sm text-muted-foreground">إجمالي المعلمين</p><h3 className="text-2xl font-bold">{data.teachers.length}</h3></div></CardContent></Card>
        <Card><CardContent className="p-6 flex items-center gap-4"><BookOpen className="text-green-500" size={24}/><div><p className="text-sm text-muted-foreground">المواد الدراسية</p><h3 className="text-2xl font-bold">{data.subjects.length}</h3></div></CardContent></Card>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">المؤهل</TableHead>
              <TableHead className="text-right">الخبرة</TableHead>
              <TableHead className="text-right">المواد</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.teachers.slice(0, 15).map((teacher: any) => (
              <TableRow key={teacher.id}>
                <TableCell className="font-medium">{teacher.name}</TableCell>
                <TableCell>{teacher.qualifications}</TableCell>
                <TableCell>{teacher.experience_years} سنوات</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {(teacher.subject_ids || []).map((sid: string) => {
                      const sub = data.subjects.find((s: any) => s.id === sid);
                      return sub ? <Badge key={sid} variant="outline">{sub.name}</Badge> : null;
                    })}
                  </div>
                </TableCell>
                <TableCell><Badge className="bg-emerald-500">على رأس العمل</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
