import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Grades() {
  const { data, loading, refreshAttendance } = useApp();
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [attendanceLoaded, setAttendanceLoaded] = useState(false);

  // Get unique grade levels
  const gradeLevels = useMemo(() => {
    const levels = new Set(data.classes.map((c: any) => c.level));
    return Array.from(levels).sort((a, b) => Number(a) - Number(b));
  }, [data.classes]);

  // MJ-3: Filter classes by selected grade
  const filteredClasses = useMemo(() => {
    if (!selectedGrade) return [];
    return data.classes.filter((c: any) => c.level === selectedGrade);
  }, [data.classes, selectedGrade]);

  // Reset class selection when grade changes
  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    setSelectedClassId("");
    setAttendanceMap({});
    setAttendanceLoaded(false);
  };

  // Get students for selected class
  const classStudents = useMemo(() => {
    if (!selectedClassId) return [];
    return data.students.filter((s: any) => s.class_id === selectedClassId);
  }, [data.students, selectedClassId]);

  // Load attendance for date + class
  const loadAttendance = async () => {
    if (!selectedClassId || !selectedDate) return;
    try {
      const records = await api.getAttendance({ date: selectedDate, class_id: selectedClassId });
      const map: Record<string, string> = {};
      for (const r of records) {
        map[r.student_id] = r.status;
      }
      // Default unrecorded students to "present"
      for (const s of classStudents) {
        if (!map[s.id]) map[s.id] = "present";
      }
      setAttendanceMap(map);
      setAttendanceLoaded(true);
    } catch (err) {
      toast.error("فشل تحميل بيانات الحضور");
    }
  };

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setAttendanceMap({});
    setAttendanceLoaded(false);
  };

  const saveAttendance = async () => {
    if (!selectedClassId || !selectedDate) return;
    setSaving(true);
    try {
      const records = classStudents.map((s: any) => ({
        student_id: s.id,
        class_id: selectedClassId,
        date: selectedDate,
        status: attendanceMap[s.id] || "present",
      }));
      await api.saveAttendance(records);
      toast.success("تم حفظ الحضور بنجاح");
    } catch (err: any) {
      toast.error(err.message || "فشل حفظ الحضور");
    } finally {
      setSaving(false);
    }
  };

  // Grade entries display
  const gradeEntries = useMemo(() => {
    return data.grades.slice(0, 30).map((g: any) => {
      const student = data.students.find((s: any) => s.id === g.student_id);
      const assignment = data.assignments.find((a: any) => a.id === g.assignment_id);
      return { ...g, studentName: student?.name || "غير معروف", assignmentTitle: assignment?.title || "غير محدد", totalMarks: assignment?.total_marks || 100 };
    });
  }, [data.grades, data.students, data.assignments]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><span className="text-muted-foreground">جارٍ التحميل...</span></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">الحضور والدرجات</h1>
        <p className="text-muted-foreground">تسجيل الحضور وعرض الدرجات حسب الفصل والمرحلة</p>
      </div>

      {/* Attendance Section */}
      <Card>
        <CardHeader>
          <CardTitle>تسجيل الحضور</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">المرحلة الدراسية</label>
              <Select value={selectedGrade} onValueChange={handleGradeChange}>
                <SelectTrigger><SelectValue placeholder="اختر المرحلة..." /></SelectTrigger>
                <SelectContent>
                  {gradeLevels.map(level => (
                    <SelectItem key={level} value={level}>الصف {level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">الفصل</label>
              <Select value={selectedClassId} onValueChange={handleClassChange} disabled={!selectedGrade}>
                <SelectTrigger><SelectValue placeholder={selectedGrade ? "اختر الفصل..." : "اختر المرحلة أولاً"} /></SelectTrigger>
                <SelectContent>
                  {filteredClasses.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">التاريخ</label>
              <input type="date" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={loadAttendance} disabled={!selectedClassId || !selectedDate} className="w-full">
                تحميل الحضور
              </Button>
            </div>
          </div>

          {attendanceLoaded && classStudents.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right w-16">#</TableHead>
                    <TableHead className="text-right">الطالب</TableHead>
                    <TableHead className="text-right">رقم الطالب</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classStudents.map((s: any, idx: number) => (
                    <TableRow key={s.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{s.student_id}</TableCell>
                      <TableCell>
                        <Select value={attendanceMap[s.id] || "present"} onValueChange={val => setAttendanceMap(prev => ({ ...prev, [s.id]: val }))}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">حاضر</SelectItem>
                            <SelectItem value="absent">غائب</SelectItem>
                            <SelectItem value="late">متأخر</SelectItem>
                            <SelectItem value="excused">معذور</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {classStudents.length} طالب | حاضر: {Object.values(attendanceMap).filter(v => v === 'present').length} | غائب: {Object.values(attendanceMap).filter(v => v === 'absent').length}
                </div>
                <Button onClick={saveAttendance} disabled={saving}>
                  {saving ? "جارٍ الحفظ..." : "حفظ الحضور"}
                </Button>
              </div>
            </>
          )}

          {attendanceLoaded && classStudents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">لا يوجد طلاب مسجلون في هذا الفصل.</div>
          )}
        </CardContent>
      </Card>

      {/* Grade Entries */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الدرجات</CardTitle>
        </CardHeader>
        <CardContent>
          {gradeEntries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الطالب</TableHead>
                  <TableHead className="text-right">التقييم</TableHead>
                  <TableHead className="text-right">الدرجة</TableHead>
                  <TableHead className="text-right">النسبة</TableHead>
                  <TableHead className="text-right">الملاحظات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradeEntries.map((g: any) => {
                  const percentage = (Number(g.score) / g.totalMarks) * 100;
                  return (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium">{g.studentName}</TableCell>
                      <TableCell>{g.assignmentTitle}</TableCell>
                      <TableCell>{g.score} / {g.totalMarks}</TableCell>
                      <TableCell>
                        <Badge className={percentage >= 80 ? 'bg-emerald-500' : percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'}>
                          {percentage.toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{g.feedback || "-"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">لا توجد درجات مسجلة بعد.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
