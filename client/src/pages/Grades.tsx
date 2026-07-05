import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Download } from "lucide-react";

export default function Grades() {
  const { db } = useApp();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">الامتحانات والنتائج</h1>
          <p className="text-muted-foreground">سجل درجات الطلاب، الشهادات الفصلية، واعتماد النتائج.</p>
        </div>
        <Button className="gap-2"><Download size={16} /> تصدير الكشوف</Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-right">الطالب</TableHead>
              <TableHead className="text-right">الاختبار</TableHead>
              <TableHead className="text-center">الدرجة المكتسبة</TableHead>
              <TableHead className="text-center">النسبة</TableHead>
              <TableHead className="text-left">ملاحظات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {db.grades.slice(0, 15).map((grade) => {
              const student = db.students.find(s => s.id === grade.studentId);
              const assignment = db.assignments.find(a => a.id === grade.assignmentId);
              const percentage = assignment ? (grade.score / assignment.totalMarks) * 100 : 0;
              
              return (
              <TableRow key={grade.id}>
                <TableCell className="font-medium">{student?.name}</TableCell>
                <TableCell>{assignment?.title}</TableCell>
                <TableCell className="text-center font-bold">{grade.score}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className={percentage >= 90 ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}>
                    {percentage.toFixed(0)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-left text-muted-foreground text-sm">{grade.feedback}</TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
