import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Check, X as XIcon, Clock } from 'lucide-react';

export default function Grades() {
  const { data, loading, refreshAttendance, refreshData } = useApp();
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [filteredClasses, setFilteredClasses] = useState<any[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [classStudents, setClassStudents] = useState<any[]>([]);

  useEffect(() => {
    if (!selectedGrade) { setFilteredClasses([]); setSelectedClass(''); return; }
    const filtered = data.classes.filter((c: any) => c.level === selectedGrade);
    setFilteredClasses(filtered);
    setSelectedClass('');
  }, [selectedGrade, data.classes]);

  useEffect(() => {
    if (!selectedClass) { setClassStudents([]); setAttendanceMap({}); return; }
    const students = data.students.filter((s: any) => s.class_id === selectedClass);
    setClassStudents(students);
    const existing = data.attendance.filter((a: any) => a.class_id === selectedClass && a.date === attendanceDate);
    const map: Record<string, string> = {};
    for (const a of existing) map[a.student_id] = a.status;
    for (const s of students) { if (!map[s.id]) map[s.id] = 'present'; }
    setAttendanceMap(map);
  }, [selectedClass, attendanceDate, data.students, data.attendance]);

  async function saveAttendance() {
    if (!selectedClass || classStudents.length === 0) return;
    setSaving(true);
    try {
      const records = classStudents.map(s => ({
        student_id: s.id, class_id: selectedClass, date: attendanceDate, status: attendanceMap[s.id] || 'present',
      }));
      await api.saveAttendance(records);
      await refreshAttendance();
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  function getStudentName(id: string) { return data.students.find((s: any) => s.id === id)?.name || '-'; }
  function getAssignmentTitle(id: string) { return data.assignments.find((a: any) => a.id === id)?.title || '-'; }
  function getAssignmentMarks(id: string) { return data.assignments.find((a: any) => a.id === id)?.total_marks || 100; }

  const grades = Array.from({ length: 12 }, (_, i) => String(i + 1));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الدرجات والحضور</h1>

      <Tabs defaultValue="attendance" dir="rtl">
        <TabsList>
          <TabsTrigger value="attendance">تسجيل الحضور</TabsTrigger>
          <TabsTrigger value="grades">سجل الدرجات</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>تسجيل الحضور اليومي</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">المرحلة</label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger><SelectValue placeholder="اختر المرحلة" /></SelectTrigger>
                    <SelectContent>{grades.map(g => <SelectItem key={g} value={g}>الصف {g}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">الفصل</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass} disabled={!selectedGrade}>
                    <SelectTrigger><SelectValue placeholder={selectedGrade ? 'اختر الفصل' : 'اختر المرحلة أولاً'} /></SelectTrigger>
                    <SelectContent>{filteredClasses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">التاريخ</label>
                  <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
                </div>
              </div>

              {selectedClass && classStudents.length > 0 ? (
                <>
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-right p-3 font-medium">الطالب</th>
                          <th className="text-center p-3 font-medium">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {classStudents.map(s => {
                          const status = attendanceMap[s.id] || 'present';
                          return (
                            <tr key={s.id} className="hover:bg-muted/30">
                              <td className="p-3 font-medium">{s.name}</td>
                              <td className="p-3">
                                <div className="flex justify-center gap-2">
                                  <Button size="sm" variant={status === 'present' ? 'default' : 'outline'} className="gap-1" onClick={() => setAttendanceMap({ ...attendanceMap, [s.id]: 'present' })}>
                                    <Check className="w-3 h-3" /> حاضر
                                  </Button>
                                  <Button size="sm" variant={status === 'absent' ? 'destructive' : 'outline'} className="gap-1" onClick={() => setAttendanceMap({ ...attendanceMap, [s.id]: 'absent' })}>
                                    <XIcon className="w-3 h-3" /> غائب
                                  </Button>
                                  <Button size="sm" variant={status === 'late' ? 'secondary' : 'outline'} className="gap-1" onClick={() => setAttendanceMap({ ...attendanceMap, [s.id]: 'late' })}>
                                    <Clock className="w-3 h-3" /> متأخر
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>حاضر: {Object.values(attendanceMap).filter(v => v === 'present').length}</span>
                      <span>غائب: {Object.values(attendanceMap).filter(v => v === 'absent').length}</span>
                      <span>متأخر: {Object.values(attendanceMap).filter(v => v === 'late').length}</span>
                    </div>
                    <Button onClick={saveAttendance} disabled={saving}><Save className="w-4 h-4 ml-2" />{saving ? 'جاري الحفظ...' : 'حفظ الحضور'}</Button>
                  </div>
                </>
              ) : selectedClass ? (
                <p className="text-center py-8 text-muted-foreground">لا يوجد طلاب في هذا الفصل</p>
              ) : (
                <p className="text-center py-8 text-muted-foreground">اختر المرحلة والفصل لتسجيل الحضور</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>سجل الدرجات</CardTitle></CardHeader>
            <CardContent>
              {data.grades.length > 0 ? (
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-right p-3 font-medium">الطالب</th>
                        <th className="text-right p-3 font-medium">التقييم</th>
                        <th className="text-right p-3 font-medium">الدرجة</th>
                        <th className="text-right p-3 font-medium">النسبة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.grades.slice(0, 30).map((g: any) => {
                        const total = getAssignmentMarks(g.assignment_id);
                        const pct = (Number(g.score) / Number(total)) * 100;
                        return (
                          <tr key={g.id} className="hover:bg-muted/30">
                            <td className="p-3">{getStudentName(g.student_id)}</td>
                            <td className="p-3 text-sm">{getAssignmentTitle(g.assignment_id)}</td>
                            <td className="p-3 font-medium">{g.score}/{total}</td>
                            <td className="p-3">
                              <Badge variant={pct >= 80 ? 'default' : pct >= 60 ? 'secondary' : 'destructive'}>
                                {pct.toFixed(0)}%
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : <p className="text-center py-8 text-muted-foreground">لا توجد درجات مسجلة بعد</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
