import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus } from "lucide-react";

export default function Schedule() {
  const { db } = useApp();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">الجدول الدراسي</h1>
          <p className="text-muted-foreground">جدول الحصص الأسبوعي للفصول والمعلمين.</p>
        </div>
        <Button className="gap-2"><Plus size={16} /> تعديل الجدول</Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-right">اليوم / الحصة</TableHead>
              <TableHead className="text-center">الأولى (8:00 - 8:45)</TableHead>
              <TableHead className="text-center">الثانية (9:00 - 9:45)</TableHead>
              <TableHead className="text-center">الثالثة (10:00 - 10:45)</TableHead>
              <TableHead className="text-center bg-muted">الاستراحة</TableHead>
              <TableHead className="text-center">الرابعة (11:30 - 12:15)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'].map((day) => (
              <TableRow key={day}>
                <TableCell className="font-bold bg-muted/20 w-32">{day}</TableCell>
                <TableCell className="text-center p-2"><div className="bg-blue-50 border border-blue-100 rounded p-2 text-sm">رياضيات<br/><span className="text-xs text-muted-foreground">أ. أحمد</span></div></TableCell>
                <TableCell className="text-center p-2"><div className="bg-green-50 border border-green-100 rounded p-2 text-sm">علوم<br/><span className="text-xs text-muted-foreground">أ. محمود</span></div></TableCell>
                <TableCell className="text-center p-2"><div className="bg-purple-50 border border-purple-100 rounded p-2 text-sm">لغة عربية<br/><span className="text-xs text-muted-foreground">أ. خالد</span></div></TableCell>
                <TableCell className="text-center bg-muted/20">☕</TableCell>
                <TableCell className="text-center p-2"><div className="bg-orange-50 border border-orange-100 rounded p-2 text-sm">تاريخ<br/><span className="text-xs text-muted-foreground">أ. سارة</span></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
