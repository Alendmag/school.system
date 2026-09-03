import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Plus, Users, GraduationCap, Calendar, Edit2, Trash2, Save, X, LinkIcon } from "lucide-react";

export default function Academics() {
  const { data, loading, refreshAcademicYears, refreshTerms, refreshClasses, refreshSubjects, refreshTeachers, refreshTeacherAssignments } = useApp();
  const [activeTab, setActiveTab] = useState("academic-years");

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">الهيكل الأكاديمي</h1>
        <p className="text-muted-foreground">إدارة السنوات الدراسية، الفصول، الشعب، المواد وتوزيع المعلمين</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="academic-years" className="gap-1.5"><Calendar size={14} /> السنوات</TabsTrigger>
          <TabsTrigger value="classes" className="gap-1.5"><GraduationCap size={14} /> الشُعب</TabsTrigger>
          <TabsTrigger value="subjects" className="gap-1.5"><BookOpen size={14} /> المواد</TabsTrigger>
          <TabsTrigger value="terms" className="gap-1.5"><Calendar size={14} /> الفصول</TabsTrigger>
          <TabsTrigger value="assignments" className="gap-1.5"><LinkIcon size={14} /> التوزيع</TabsTrigger>
        </TabsList>

        <TabsContent value="academic-years">
          <AcademicYearsTab data={data} refresh={refreshAcademicYears} />
        </TabsContent>
        <TabsContent value="terms">
          <TermsTab data={data} refreshTerms={refreshTerms} />
        </TabsContent>
        <TabsContent value="classes">
          <ClassesTab data={data} refreshClasses={refreshClasses} />
        </TabsContent>
        <TabsContent value="subjects">
          <SubjectsTab data={data} refreshSubjects={refreshSubjects} />
        </TabsContent>
        <TabsContent value="assignments">
          <AssignmentsTab data={data} refreshAssignments={refreshTeacherAssignments} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AcademicYearsTab({ data, refresh }: { data: any; refresh: () => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", start_date: "", end_date: "", status: "upcoming" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const openAdd = () => { setEditId(null); setForm({ name: "", start_date: "", end_date: "", status: "upcoming" }); setError(""); setIsOpen(true); };
  const openEdit = (ay: any) => { setEditId(ay.id); setForm({ name: ay.name, start_date: ay.start_date, end_date: ay.end_date, status: ay.status }); setError(""); setIsOpen(true); };

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      if (editId) await api.updateAcademicYear(editId, form);
      else await api.createAcademicYear(form);
      await refresh(); setIsOpen(false);
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try { await api.deleteAcademicYear(id); await refresh(); }
    catch (e: any) { alert(e.message); }
  };

  const statusLabel = (s: string) => s === "active" ? "نشط" : s === "upcoming" ? "قادم" : "منتهي";
  const statusColor = (s: string) => s === "active" ? "bg-emerald-500" : s === "upcoming" ? "bg-blue-500" : "bg-gray-400";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">السنوات الدراسية ({data.academicYears.length})</h2>
        <Button onClick={openAdd} className="gap-2"><Plus size={16} /> إضافة سنة</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.academicYears.map((ay: any) => {
          const termCount = data.terms.filter((t: any) => t.academic_year_id === ay.id).length;
          return (
            <Card key={ay.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg">{ay.name}</h3>
                  <Badge className={statusColor(ay.status)}>{statusLabel(ay.status)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">من {ay.start_date} إلى {ay.end_date}</p>
                <p className="text-sm text-muted-foreground mb-4">{termCount} فصل دراسي</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(ay)}><Edit2 size={14} /></Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(ay.id)}><Trash2 size={14} /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {data.academicYears.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">لا توجد سنوات دراسية بعد</p>}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "تعديل السنة الدراسية" : "إضافة سنة دراسية"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>اسم السنة</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="2025-2026" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>بداية السنة</Label><Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
              <div><Label>نهاية السنة</Label><Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
            </div>
            <div><Label>الحالة</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="upcoming">قادم</SelectItem>
                  <SelectItem value="completed">منتهي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsOpen(false)}><X size={14} className="ml-1" /> إلغاء</Button>
              <Button onClick={handleSave} disabled={saving}><Save size={14} className="ml-1" /> {saving ? "جاري الحفظ..." : "حفظ"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TermsTab({ data, refreshTerms }: { data: any; refreshTerms: () => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ academic_year_id: "", name: "", start_date: "", end_date: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");

  const filteredTerms = filterYear === "all" ? data.terms : data.terms.filter((t: any) => t.academic_year_id === filterYear);

  const openAdd = () => { setEditId(null); setForm({ academic_year_id: data.academicYears[0]?.id || "", name: "", start_date: "", end_date: "" }); setError(""); setIsOpen(true); };
  const openEdit = (t: any) => { setEditId(t.id); setForm({ academic_year_id: t.academic_year_id, name: t.name, start_date: t.start_date, end_date: t.end_date }); setError(""); setIsOpen(true); };

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      if (editId) await api.updateTerm(editId, { name: form.name, start_date: form.start_date, end_date: form.end_date });
      else await api.createTerm(form);
      await refreshTerms(); setIsOpen(false);
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try { await api.deleteTerm(id); await refreshTerms(); }
    catch (e: any) { alert(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-lg font-semibold">الفصول الدراسية ({filteredTerms.length})</h2>
        <div className="flex gap-2">
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-48"><SelectValue placeholder="فلترة بالسنة" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع السنوات</SelectItem>
              {data.academicYears.map((ay: any) => <SelectItem key={ay.id} value={ay.id}>{ay.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={openAdd} className="gap-2"><Plus size={16} /> إضافة فصل</Button>
        </div>
      </div>
      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">السنة الدراسية</TableHead>
              <TableHead className="text-right">من</TableHead>
              <TableHead className="text-right">إلى</TableHead>
              <TableHead className="text-right w-24">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTerms.map((t: any) => {
              const ay = data.academicYears.find((a: any) => a.id === t.academic_year_id);
              return (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell><Badge variant="outline">{ay?.name || "—"}</Badge></TableCell>
                  <TableCell>{t.start_date}</TableCell>
                  <TableCell>{t.end_date}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(t)}><Edit2 size={14} /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(t.id)}><Trash2 size={14} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredTerms.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">لا توجد فصول دراسية</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "تعديل الفصل" : "إضافة فصل دراسي"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {!editId && (
              <div><Label>السنة الدراسية</Label>
                <Select value={form.academic_year_id} onValueChange={v => setForm({ ...form, academic_year_id: v })}>
                  <SelectTrigger><SelectValue placeholder="اختر السنة" /></SelectTrigger>
                  <SelectContent>{data.academicYears.map((ay: any) => <SelectItem key={ay.id} value={ay.id}>{ay.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div><Label>اسم الفصل</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="الفصل الأول" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>البداية</Label><Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
              <div><Label>النهاية</Label><Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ClassesTab({ data, refreshClasses }: { data: any; refreshClasses: () => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", level: "", capacity: "30", advisor_id: "", academic_year_id: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");

  const activeYear = data.academicYears.find((ay: any) => ay.status === "active");
  const filteredClasses = filterYear === "all" ? data.classes : data.classes.filter((c: any) => c.academic_year_id === filterYear);

  const openAdd = () => { setEditId(null); setForm({ name: "", level: "", capacity: "30", advisor_id: "", academic_year_id: activeYear?.id || data.academicYears[0]?.id || "" }); setError(""); setIsOpen(true); };
  const openEdit = (c: any) => { setEditId(c.id); setForm({ name: c.name, level: c.level, capacity: String(c.capacity), advisor_id: c.advisor_id || "", academic_year_id: c.academic_year_id || "" }); setError(""); setIsOpen(true); };

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const payload = { name: form.name, level: form.level, capacity: parseInt(form.capacity) || 30, advisor_id: form.advisor_id || null, academic_year_id: form.academic_year_id };
      if (editId) await api.updateClass(editId, payload);
      else await api.createClass(payload);
      await refreshClasses(); setIsOpen(false);
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try { await api.deleteClass(id); await refreshClasses(); }
    catch (e: any) { alert(e.message); }
  };

  const levels = Array.from(new Set(filteredClasses.map((c: any) => c.level) as string[])).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-lg font-semibold">الشُعب والفصول ({filteredClasses.length})</h2>
        <div className="flex gap-2">
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-48"><SelectValue placeholder="فلترة بالسنة" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع السنوات</SelectItem>
              {data.academicYears.map((ay: any) => <SelectItem key={ay.id} value={ay.id}>{ay.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={openAdd} className="gap-2"><Plus size={16} /> إضافة شعبة</Button>
        </div>
      </div>

      {levels.map((level: string) => {
        const levelClasses = filteredClasses.filter((c: any) => c.level === level);
        return (
          <div key={level}>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">الصف {level}</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-4">
              {levelClasses.map((cls: any) => {
                const studentCount = data.students.filter((s: any) => s.class_id === cls.id).length;
                const advisor = data.teachers.find((t: any) => t.id === cls.advisor_id);
                const ay = data.academicYears.find((a: any) => a.id === cls.academic_year_id);
                return (
                  <Card key={cls.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold">{cls.name}</h4>
                        <Badge variant="secondary"><Users size={12} className="ml-1" />{studentCount}/{cls.capacity}</Badge>
                      </div>
                      {ay && <p className="text-xs text-muted-foreground mb-1">{ay.name}</p>}
                      {advisor && <p className="text-sm text-muted-foreground mb-2">المرشد: {advisor.name}</p>}
                      <div className="flex gap-1 mt-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(cls)}><Edit2 size={14} /></Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(cls.id)}><Trash2 size={14} /></Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
      {filteredClasses.length === 0 && <p className="text-muted-foreground text-center py-8">لا توجد فصول بعد</p>}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "تعديل الشعبة" : "إضافة شعبة"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>السنة الدراسية</Label>
              <Select value={form.academic_year_id} onValueChange={v => setForm({ ...form, academic_year_id: v })}>
                <SelectTrigger><SelectValue placeholder="اختر السنة الدراسية" /></SelectTrigger>
                <SelectContent>{data.academicYears.map((ay: any) => <SelectItem key={ay.id} value={ay.id}>{ay.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>اسم الشعبة</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="الصف 1 - أ" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>المرحلة / الصف</Label><Input value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} placeholder="1" /></div>
              <div><Label>السعة</Label><Input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} /></div>
            </div>
            <div><Label>المرشد الأكاديمي</Label>
              <Select value={form.advisor_id} onValueChange={v => setForm({ ...form, advisor_id: v })}>
                <SelectTrigger><SelectValue placeholder="اختر معلم (اختياري)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">بدون مرشد</SelectItem>
                  {data.teachers.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SubjectsTab({ data, refreshSubjects }: { data: any; refreshSubjects: () => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const filtered = search ? data.subjects.filter((s: any) => s.name.includes(search) || s.code.includes(search)) : data.subjects;

  const openAdd = () => { setEditId(null); setForm({ name: "", code: "" }); setError(""); setIsOpen(true); };
  const openEdit = (s: any) => { setEditId(s.id); setForm({ name: s.name, code: s.code }); setError(""); setIsOpen(true); };

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      if (editId) await api.updateSubject(editId, form);
      else await api.createSubject(form);
      await refreshSubjects(); setIsOpen(false);
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try { await api.deleteSubject(id); await refreshSubjects(); }
    catch (e: any) { alert(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-lg font-semibold">المواد الدراسية ({data.subjects.length})</h2>
        <div className="flex gap-2">
          <Input className="w-56" placeholder="بحث عن مادة..." value={search} onChange={e => setSearch(e.target.value)} />
          <Button onClick={openAdd} className="gap-2"><Plus size={16} /> إضافة مادة</Button>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {filtered.map((subject: any) => (
          <Card key={subject.id} className="hover:shadow-md transition-shadow group">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-xl">📚</div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(subject)}><Edit2 size={14} /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(subject.id)}><Trash2 size={14} /></Button>
                </div>
              </div>
              <h3 className="font-bold mb-1">{subject.name}</h3>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{subject.code}</span>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">لا توجد مواد</p>}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "تعديل المادة" : "إضافة مادة"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>اسم المادة</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="الرياضيات" /></div>
            <div><Label>رمز المادة</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="MATH-101" /></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AssignmentsTab({ data, refreshAssignments }: { data: any; refreshAssignments: () => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ teacher_id: "", subject_id: "", class_id: "", academic_year_id: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");

  const assignments = filterYear === "all" ? data.teacherAssignments : data.teacherAssignments.filter((a: any) => a.academic_year_id === filterYear);

  const compatibleClasses = form.academic_year_id
    ? data.classes.filter((c: any) => c.academic_year_id === form.academic_year_id)
    : data.classes;

  const openAdd = () => {
    const activeYear = data.academicYears.find((ay: any) => ay.status === "active");
    setEditId(null);
    setForm({ teacher_id: "", subject_id: "", class_id: "", academic_year_id: activeYear?.id || data.academicYears[0]?.id || "" });
    setError(""); setIsOpen(true);
  };

  const openEdit = (a: any) => {
    setEditId(a.id);
    setForm({ teacher_id: a.teacher_id, subject_id: a.subject_id, class_id: a.class_id, academic_year_id: a.academic_year_id });
    setError(""); setIsOpen(true);
  };

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      if (editId) await api.updateTeacherAssignment(editId, form);
      else await api.createTeacherAssignment(form);
      await refreshAssignments(); setIsOpen(false);
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try { await api.deleteTeacherAssignment(id); await refreshAssignments(); }
    catch (e: any) { alert(e.message); }
  };

  const getName = (list: any[], id: string) => list.find((i: any) => i.id === id)?.name || "—";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-lg font-semibold">توزيع المعلمين على المواد والشُعب ({assignments.length})</h2>
        <div className="flex gap-2">
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-48"><SelectValue placeholder="فلترة بالسنة" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع السنوات</SelectItem>
              {data.academicYears.map((ay: any) => <SelectItem key={ay.id} value={ay.id}>{ay.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={openAdd} className="gap-2"><Plus size={16} /> إضافة توزيع</Button>
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-right">المعلم</TableHead>
              <TableHead className="text-right">المادة</TableHead>
              <TableHead className="text-right">الشعبة</TableHead>
              <TableHead className="text-right">السنة الدراسية</TableHead>
              <TableHead className="text-right w-24">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((a: any) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{getName(data.teachers, a.teacher_id)}</TableCell>
                <TableCell><Badge variant="outline">{getName(data.subjects, a.subject_id)}</Badge></TableCell>
                <TableCell>{getName(data.classes, a.class_id)}</TableCell>
                <TableCell>{getName(data.academicYears, a.academic_year_id)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(a)}><Edit2 size={14} /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(a.id)}><Trash2 size={14} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {assignments.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">لا يوجد توزيع بعد</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "تعديل التوزيع" : "إضافة توزيع معلم"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>السنة الدراسية</Label>
              <Select value={form.academic_year_id} onValueChange={v => setForm({ ...form, academic_year_id: v, class_id: "" })}>
                <SelectTrigger><SelectValue placeholder="اختر السنة" /></SelectTrigger>
                <SelectContent>{data.academicYears.map((ay: any) => <SelectItem key={ay.id} value={ay.id}>{ay.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>المعلم</Label>
              <Select value={form.teacher_id} onValueChange={v => setForm({ ...form, teacher_id: v })}>
                <SelectTrigger><SelectValue placeholder="اختر المعلم" /></SelectTrigger>
                <SelectContent>{data.teachers.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>المادة</Label>
              <Select value={form.subject_id} onValueChange={v => setForm({ ...form, subject_id: v })}>
                <SelectTrigger><SelectValue placeholder="اختر المادة" /></SelectTrigger>
                <SelectContent>{data.subjects.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>الشعبة</Label>
              <Select value={form.class_id} onValueChange={v => setForm({ ...form, class_id: v })}>
                <SelectTrigger><SelectValue placeholder="اختر الشعبة" /></SelectTrigger>
                <SelectContent>
                  {compatibleClasses.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  {compatibleClasses.length === 0 && <div className="px-3 py-2 text-sm text-muted-foreground">لا توجد شعب لهذه السنة</div>}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
