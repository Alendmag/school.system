import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Calendar as CalendarIcon, Clock, FileText, Plus, CheckCircle2, MoreVertical, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Homework() {
  const { db, setDb } = useApp();
  const assignments = db.assignments;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubjectId, setNewSubjectId] = useState("");
  const [newClassId, setNewClassId] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  const handleAddAssignment = () => {
      if (!newTitle || !newSubjectId || !newClassId) return;

      const newAssignment = {
          id: `asg-${Date.now()}`,
          title: newTitle,
          subjectId: newSubjectId,
          classId: newClassId,
          dueDate: newDueDate || new Date().toISOString().split('T')[0],
          type: 'homework' as const,
          totalMarks: 10,
          status: 'active' as const
      };

      setDb({
          ...db,
          assignments: [newAssignment, ...db.assignments]
      });

      setIsAddOpen(false);
      setNewTitle("");
  };

  const getClassName = (id: string) => db.classes.find(c => c.id === id)?.name;
  const getSubjectName = (id: string) => db.subjects.find(s => s.id === id)?.name;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">الواجبات والمهام الأكاديمية</h1>
          <p className="text-muted-foreground">متصلة ببيانات الطلاب والدرجات الموحدة</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus size={16} /> إضافة نشاط</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[600px] font-arabic" dir="rtl">
            <DialogHeader><DialogTitle>نشاط جديد</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-right">
                  <label className="text-sm font-medium">العنوان</label>
                  <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                </div>
                <div className="space-y-2 text-right">
                  <label className="text-sm font-medium">المادة</label>
                  <Select value={newSubjectId} onValueChange={setNewSubjectId}>
                    <SelectTrigger><SelectValue placeholder="اختر المادة" /></SelectTrigger>
                    <SelectContent>
                      {db.subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 text-right">
                  <label className="text-sm font-medium">الفصل المستهدف</label>
                  <Select value={newClassId} onValueChange={setNewClassId}>
                    <SelectTrigger><SelectValue placeholder="اختر الفصل" /></SelectTrigger>
                    <SelectContent>
                      {db.classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 text-right">
                  <label className="text-sm font-medium">تاريخ التسليم</label>
                  <Input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)}/>
                </div>
              </div>
            </div>
            <DialogFooter><Button onClick={handleAddAssignment}>نشر النشاط</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsContent value="active" className="space-y-4">
          {assignments.map((assignment) => {
              const studentsInClass = db.students.filter(s => s.classId === assignment.classId).length;
              const submissions = db.grades.filter(g => g.assignmentId === assignment.id).length;

              return (
            <Card key={assignment.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-blue-50 text-blue-600"><FileText size={24} /></div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{assignment.title}</h3>
                        <Badge variant="outline">{getSubjectName(assignment.subjectId)}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><BookOpen size={14} /> {getClassName(assignment.classId)}</span>
                        <span className="flex items-center gap-1"><CalendarIcon size={14} /> {assignment.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 min-w-[200px]">
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">تم التسليم (والرصد)</span>
                        <span className="font-medium">{submissions} / {studentsInClass}</span>
                      </div>
                      <Progress value={studentsInClass ? (submissions / studentsInClass) * 100 : 0} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )})}
        </TabsContent>
      </Tabs>
    </div>
  );
}