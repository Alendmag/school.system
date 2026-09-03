import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Users, BookOpen, Edit2, Trash2, Search, Eye, ChevronLeft, Save } from "lucide-react";

export default function Teachers() {
  const { data, loading, refreshTeachers } = useApp();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [viewTeacher, setViewTeacher] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", qualifications: "",
    experience_years: "0", join_date: "", status: "active",
    subject_ids: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  const filtered = search
    ? data.teachers.filter((t: any) => t.name.includes(search) || (t.email || "").includes(search))
    : data.teachers;

  const openAdd = () => {
    setEditId(null);
    setForm({ name: "", email: "", phone: "", qualifications: "", experience_years: "0", join_date: new Date().toISOString().split("T")[0], status: "active", subject_ids: [] });
    setError(""); setIsAddOpen(true);
  };

  const openEdit = (t: any) => {
    setEditId(t.id);
    setForm({
      name: t.name, email: t.email || "", phone: t.phone || "",
      qualifications: t.qualifications || "", experience_years: String(t.experience_years || 0),
      join_date: t.join_date || "", status: t.status || "active",
      subject_ids: t.subject_ids || [],
    });
    setError(""); setIsAddOpen(true);
  };

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const payload = {
        ...form,
        experience_years: parseInt(form.experience_years) || 0,
        email: form.email || null,
        phone: form.phone || null,
        qualifications: form.qualifications || null,
        join_date: form.join_date || null,
      };
      if (editId) await api.updateTeacher(editId, payload);
      else await api.createTeacher(payload);
      await refreshTeachers();
      setIsAddOpen(false);
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try { await api.deleteTeacher(id); await refreshTeachers(); }
    catch (e: any) { alert(e.message); }
  };

  const statusLabel = (s: string) => s === "active" ? "على رأس العمل" : s === "on_leave" ? "في إجازة" : "استقالة";
  const statusColor = (s: string) => s === "active" ? "bg-emerald-500" : s === "on_leave" ? "bg-amber-500" : "bg-gray-400";

  if (viewTeacher) {
    const t = viewTeacher;
    const teacherAssignments = data.teacherAssignments.filter((a: any) => a.teacher_id === t.id);
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setViewTeacher(null)} className="gap-2"><ChevronLeft size={16} /> العودة للقائمة</Button>
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">{t.name[0]}</div>
          <div>
            <h1 className="text-2xl font-bold">{t.name}</h1>
            <p className="text-muted-foreground">{t.email}</p>
            <Badge className={`mt-2 ${statusColor(t.status)}`}>{statusLabel(t.status)}</Badge>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">الهاتف</p><p className="font-medium">{t.phone || "—"}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">المؤهل</p><p className="font-medium">{t.qualifications || "—"}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">سنوات الخبرة</p><p className="font-medium">{t.experience_years}</p></CardContent></Card>
        </div>
        <div>
          <h3 className="font-semibold mb-2">المواد التي يدرّسها</h3>
          <div className="flex gap-2 flex-wrap">
            {(t.subject_ids || []).map((sid: string) => {
              const sub = data.subjects.find((s: any) => s.id === sid);
              return sub ? <Badge key={sid} variant="outline">{sub.name}</Badge> : null;
            })}
            {(!t.subject_ids || t.subject_ids.length === 0) && <p className="text-muted-foreground text-sm">لم يتم تحديد مواد</p>}
          </div>
        </div>
        {teacherAssignments.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">توزيع الحصص ({teacherAssignments.length})</h3>
            <div className="border rounded-md bg-card">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-right">المادة</TableHead>
                    <TableHead className="text-right">الشعبة</TableHead>
                    <TableHead className="text-right">السنة الدراسية</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherAssignments.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell>{data.subjects.find((s: any) => s.id === a.subject_id)?.name || "—"}</TableCell>
                      <TableCell>{data.classes.find((c: any) => c.id === a.class_id)?.name || "—"}</TableCell>
                      <TableCell>{data.academicYears.find((ay: any) => ay.id === a.academic_year_id)?.name || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إدارة الكادر التعليمي</h1>
          <p className="text-muted-foreground">إدارة بيانات المعلمين، المؤهلات، والتوزيع.</p>
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus size={16} /> إضافة معلم</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-6 flex items-center gap-4"><Users className="text-blue-500" size={24} /><div><p className="text-sm text-muted-foreground">إجمالي المعلمين</p><h3 className="text-2xl font-bold">{data.teachers.length}</h3></div></CardContent></Card>
        <Card><CardContent className="p-6 flex items-center gap-4"><BookOpen className="text-green-500" size={24} /><div><p className="text-sm text-muted-foreground">المواد الدراسية</p><h3 className="text-2xl font-bold">{data.subjects.length}</h3></div></CardContent></Card>
        <Card><CardContent className="p-6 flex items-center gap-4"><Users className="text-teal-500" size={24} /><div><p className="text-sm text-muted-foreground">على رأس العمل</p><h3 className="text-2xl font-bold">{data.teachers.filter((t: any) => t.status === "active").length}</h3></div></CardContent></Card>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pr-9" placeholder="بحث عن معلم..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">البريد</TableHead>
              <TableHead className="text-right">المؤهل</TableHead>
              <TableHead className="text-right">الخبرة</TableHead>
              <TableHead className="text-right">المواد</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right w-28">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((teacher: any) => (
              <TableRow key={teacher.id}>
                <TableCell className="font-medium">{teacher.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{teacher.email || "—"}</TableCell>
                <TableCell>{teacher.qualifications || "—"}</TableCell>
                <TableCell>{teacher.experience_years} سنوات</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {(teacher.subject_ids || []).slice(0, 2).map((sid: string) => {
                      const sub = data.subjects.find((s: any) => s.id === sid);
                      return sub ? <Badge key={sid} variant="outline" className="text-xs">{sub.name}</Badge> : null;
                    })}
                    {(teacher.subject_ids || []).length > 2 && <Badge variant="outline" className="text-xs">+{teacher.subject_ids.length - 2}</Badge>}
                  </div>
                </TableCell>
                <TableCell><Badge className={statusColor(teacher.status)}>{statusLabel(teacher.status)}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setViewTeacher(teacher)}><Eye size={14} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(teacher)}><Edit2 size={14} /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(teacher.id)}><Trash2 size={14} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">لا يوجد معلمون</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? "تعديل بيانات المعلم" : "إضافة معلم جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
            <div><Label>الاسم الكامل *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="أدخل اسم المعلم" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>البريد الإلكتروني</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="teacher@school.edu" /></div>
              <div><Label>رقم الهاتف</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="09xxxxxxxx" /></div>
            </div>
            <div><Label>المؤهل العلمي</Label><Input value={form.qualifications} onChange={e => setForm({ ...form, qualifications: e.target.value })} placeholder="بكالوريوس التربية" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>سنوات الخبرة</Label><Input type="number" value={form.experience_years} onChange={e => setForm({ ...form, experience_years: e.target.value })} /></div>
              <div><Label>تاريخ الالتحاق</Label><Input type="date" value={form.join_date} onChange={e => setForm({ ...form, join_date: e.target.value })} /></div>
            </div>
            <div><Label>الحالة</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">على رأس العمل</SelectItem>
                  <SelectItem value="on_leave">في إجازة</SelectItem>
                  <SelectItem value="resigned">استقالة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>المواد (اختر واحدة أو أكثر)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {data.subjects.map((sub: any) => {
                  const selected = form.subject_ids.includes(sub.id);
                  return (
                    <label key={sub.id} className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm transition-colors ${selected ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}>
                      <input type="checkbox" checked={selected} className="rounded" onChange={() => {
                        setForm(prev => ({
                          ...prev,
                          subject_ids: selected ? prev.subject_ids.filter(id => id !== sub.id) : [...prev.subject_ids, sub.id],
                        }));
                      }} />
                      {sub.name}
                    </label>
                  );
                })}
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>إلغاء</Button>
              <Button onClick={handleSave} disabled={saving}><Save size={14} className="ml-1" />{saving ? "جاري الحفظ..." : "حفظ"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
