import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, BookOpen, Plus, Users } from "lucide-react";
import {
  Dialog, DialogContent, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";

export default function Homework() {
  const { db, setDb } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubjectId, setNewSubjectId] = useState("");
  const [newClassId, setNewClassId] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  const handleAdd = () => {
    if (!newTitle || !newSubjectId || !newClassId) return;
    setDb(prev => ({
      ...prev,
      assignments: [{
        id: `asg-${Date.now()}`,
        title: newTitle,
        subjectId: newSubjectId,
        classId: newClassId,
        dueDate: newDueDate || new Date().toISOString().split('T')[0],
        type: 'homework' as const,
        totalMarks: 10,
        status: 'active' as const
      }, ...prev.assignments]
    }));
    setIsOpen(false);
    setNewTitle("");
    setNewSubjectId("");
    setNewClassId("");
    setNewDueDate("");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between page-header">
        <div>
          <h1 className="text-[18px] font-bold text-foreground">الواجبات والأنشطة</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {db.assignments.length} نشاط نشط — متصل ببيانات الطلاب والدرجات
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1.5 text-[12px]">
              <Plus size={13} />
              إضافة نشاط
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]" dir="rtl">
            <DialogHeader className="pb-3 border-b border-border">
              <DialogTitle className="text-[15px]">نشاط / واجب جديد</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold">العنوان <span className="text-destructive">*</span></label>
                <Input
                  className="h-9 text-[13px]"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: واجب الفصل الأول — رياضيات"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold">المادة <span className="text-destructive">*</span></label>
                  <Select value={newSubjectId} onValueChange={setNewSubjectId}>
                    <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="اختر..." /></SelectTrigger>
                    <SelectContent dir="rtl">
                      {db.subjects.map(s => <SelectItem key={s.id} value={s.id} className="text-[13px]">{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold">الفصل <span className="text-destructive">*</span></label>
                  <Select value={newClassId} onValueChange={setNewClassId}>
                    <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="اختر..." /></SelectTrigger>
                    <SelectContent dir="rtl">
                      {db.classes.map(c => <SelectItem key={c.id} value={c.id} className="text-[13px]">{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold">تاريخ التسليم</label>
                <Input
                  type="date"
                  className="h-9 text-[13px]"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="border-t border-border pt-3">
              <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => setIsOpen(false)}>إلغاء</Button>
              <Button size="sm" className="h-8 text-[12px]" onClick={handleAdd}>نشر النشاط</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assignments List */}
      {db.assignments.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-12 text-center">
          <FileText size={32} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-[13px] text-muted-foreground">لا توجد واجبات نشطة</p>
        </div>
      ) : (
        <div className="space-y-2">
          {db.assignments.map((assignment) => {
            const studentsInClass = db.students.filter(s => s.classId === assignment.classId).length;
            const submissions = db.grades.filter(g => g.assignmentId === assignment.id).length;
            const progress = studentsInClass > 0 ? (submissions / studentsInClass) * 100 : 0;
            const subject = db.subjects.find(s => s.id === assignment.subjectId);
            const cls = db.classes.find(c => c.id === assignment.classId);

            return (
              <Card key={assignment.id} className="border border-border shadow-sm hover:border-primary/20 hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 shrink-0">
                        <FileText size={15} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold leading-tight">{assignment.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                          {subject && (
                            <span className="flex items-center gap-1">
                              <BookOpen size={10} /> {subject.name}
                            </span>
                          )}
                          {cls && (
                            <span className="flex items-center gap-1">
                              <Users size={10} /> {cls.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar size={10} /> {assignment.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Progress */}
                      <div className="hidden md:flex flex-col items-end gap-1 w-36">
                        <div className="flex justify-between w-full text-[11px]">
                          <span className="text-muted-foreground">التسليم</span>
                          <span className="font-semibold tabular-num">{submissions}/{studentsInClass}</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${progress >= 80 ? 'bg-emerald-500' : progress >= 50 ? 'bg-amber-400' : 'bg-blue-500'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                        assignment.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}>
                        {assignment.status === 'active' ? 'نشط' : 'مغلق'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
