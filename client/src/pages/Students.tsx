import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, UserPlus, Eye, CreditCard as Edit2, Trash2, Users, GraduationCap, Wallet, Heart, ChevronLeft, Save, X } from 'lucide-react';

export default function Students() {
  const { data, loading, refreshStudents, refreshData } = useApp();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [addForm, setAddForm] = useState({ name: '', class_id: '', guardian_id: '', date_of_birth: '', grade_level: '1', blood_type: '', medical_conditions: '' });
  const [saving, setSaving] = useState(false);

  const students = (data.students || []).filter((s: any) =>
    !search || s.name?.includes(search) || s.student_id?.includes(search)
  );

  async function loadProfile(id: string) {
    setSelectedId(id);
    setProfileLoading(true);
    setEditing(false);
    try {
      const p = await api.getStudent360(id);
      setProfile(p);
    } catch (e) { console.error(e); }
    setProfileLoading(false);
  }

  function startEdit() {
    if (!profile?.student) return;
    const s = profile.student;
    setEditForm({ name: s.name || '', class_id: s.class_id || '', guardian_id: s.guardian_id || '', date_of_birth: s.date_of_birth || '', grade_level: s.grade_level || '', blood_type: s.blood_type || '', medical_conditions: s.medical_conditions || '' });
    setEditing(true);
  }

  async function saveEdit() {
    if (!selectedId) return;
    setSaving(true);
    try {
      await api.updateStudent(selectedId, editForm);
      await loadProfile(selectedId);
      await refreshStudents();
      setEditing(false);
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  async function handleAdd() {
    if (!addForm.name) return;
    setSaving(true);
    try {
      await api.createStudent(addForm);
      await refreshStudents();
      setShowAdd(false);
      setAddForm({ name: '', class_id: '', guardian_id: '', date_of_birth: '', grade_level: '1', blood_type: '', medical_conditions: '' });
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا الطالب؟')) return;
    try {
      await api.deleteStudent(id);
      await refreshStudents();
      if (selectedId === id) { setSelectedId(null); setProfile(null); }
    } catch (e) { console.error(e); }
  }

  function getClassName(classId: string) {
    return data.classes.find((c: any) => c.id === classId)?.name || '-';
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  if (selectedId && profile) {
    const s = profile.student;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedId(null); setProfile(null); }}>
            <ChevronLeft className="w-4 h-4 ml-1" /> العودة للقائمة
          </Button>
          <h2 className="text-2xl font-bold">{s?.name}</h2>
          <Badge variant={s?.status === 'active' ? 'default' : 'secondary'}>{s?.status === 'active' ? 'نشط' : s?.status}</Badge>
          {!editing && <Button size="sm" onClick={startEdit}><Edit2 className="w-4 h-4 ml-1" /> تعديل</Button>}
        </div>

        {profileLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
        ) : editing ? (
          <Card>
            <CardHeader><CardTitle>تعديل بيانات الطالب</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>الاسم</Label><Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
                <div><Label>تاريخ الميلاد</Label><Input type="date" value={editForm.date_of_birth} onChange={e => setEditForm({ ...editForm, date_of_birth: e.target.value })} /></div>
                <div><Label>المرحلة</Label>
                  <Select value={editForm.grade_level} onValueChange={v => setEditForm({ ...editForm, grade_level: v, class_id: '' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Array.from({ length: 12 }, (_, i) => <SelectItem key={i+1} value={String(i+1)}>الصف {i+1}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>الفصل</Label>
                  <Select value={editForm.class_id} onValueChange={v => setEditForm({ ...editForm, class_id: v })}>
                    <SelectTrigger><SelectValue placeholder="اختر الفصل" /></SelectTrigger>
                    <SelectContent>{data.classes.filter((c: any) => c.level === editForm.grade_level).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>ولي الأمر</Label>
                  <Select value={editForm.guardian_id} onValueChange={v => setEditForm({ ...editForm, guardian_id: v })}>
                    <SelectTrigger><SelectValue placeholder="اختر ولي الأمر" /></SelectTrigger>
                    <SelectContent>{data.guardians.map((g: any) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>فصيلة الدم</Label><Input value={editForm.blood_type} onChange={e => setEditForm({ ...editForm, blood_type: e.target.value })} /></div>
                <div className="md:col-span-2"><Label>حالات طبية</Label><Input value={editForm.medical_conditions} onChange={e => setEditForm({ ...editForm, medical_conditions: e.target.value })} /></div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveEdit} disabled={saving}><Save className="w-4 h-4 ml-1" />{saving ? 'جاري الحفظ...' : 'حفظ'}</Button>
                <Button variant="outline" onClick={() => setEditing(false)}><X className="w-4 h-4 ml-1" /> إلغاء</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="general" dir="rtl">
            <TabsList className="grid grid-cols-4 w-full max-w-lg">
              <TabsTrigger value="general"><Users className="w-4 h-4 ml-1" /> عام</TabsTrigger>
              <TabsTrigger value="academic"><GraduationCap className="w-4 h-4 ml-1" /> أكاديمي</TabsTrigger>
              <TabsTrigger value="financial"><Wallet className="w-4 h-4 ml-1" /> مالي</TabsTrigger>
              <TabsTrigger value="medical"><Heart className="w-4 h-4 ml-1" /> طبي</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div><span className="text-sm text-muted-foreground">الرقم الأكاديمي</span><p className="font-medium">{s?.student_id}</p></div>
                    <div><span className="text-sm text-muted-foreground">الصف</span><p className="font-medium">{profile.class?.name || '-'}</p></div>
                    <div><span className="text-sm text-muted-foreground">تاريخ الميلاد</span><p className="font-medium">{s?.date_of_birth || '-'}</p></div>
                    <div><span className="text-sm text-muted-foreground">ولي الأمر</span><p className="font-medium">{profile.guardian?.name || '-'}</p></div>
                    <div><span className="text-sm text-muted-foreground">هاتف ولي الأمر</span><p className="font-medium">{profile.guardian?.phone || '-'}</p></div>
                    <div><span className="text-sm text-muted-foreground">تاريخ التسجيل</span><p className="font-medium">{s?.enrollment_date || '-'}</p></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="academic">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-primary">{profile.academic?.gpa?.toFixed(1) || 0}%</p><p className="text-sm text-muted-foreground mt-1">المعدل التراكمي</p></CardContent></Card>
                <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-600">{profile.attendance?.present || 0}</p><p className="text-sm text-muted-foreground mt-1">أيام حضور</p></CardContent></Card>
                <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-red-600">{profile.attendance?.absent || 0}</p><p className="text-sm text-muted-foreground mt-1">أيام غياب</p></CardContent></Card>
              </div>
              {profile.attendance?.records?.length > 0 && (
                <Card className="mt-4">
                  <CardHeader><CardTitle>سجل الحضور الأخير</CardTitle></CardHeader>
                  <CardContent>
                    <div className="divide-y">{profile.attendance.records.slice(0, 10).map((r: any) => (
                      <div key={r.id} className="flex justify-between py-2">
                        <span>{r.date}</span>
                        <Badge variant={r.status === 'present' ? 'default' : r.status === 'absent' ? 'destructive' : 'secondary'}>{r.status === 'present' ? 'حاضر' : r.status === 'absent' ? 'غائب' : r.status === 'late' ? 'متأخر' : 'مستأذن'}</Badge>
                      </div>
                    ))}</div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="financial">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{profile.finance?.totalInvoiced?.toLocaleString() || 0}</p><p className="text-sm text-muted-foreground mt-1">إجمالي الفواتير (ر.س)</p></CardContent></Card>
                <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-600">{profile.finance?.totalPaid?.toLocaleString() || 0}</p><p className="text-sm text-muted-foreground mt-1">المدفوع (ر.س)</p></CardContent></Card>
                <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-red-600">{profile.finance?.outstanding?.toLocaleString() || 0}</p><p className="text-sm text-muted-foreground mt-1">المتبقي (ر.س)</p></CardContent></Card>
              </div>
              {profile.finance?.invoices?.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>الفواتير</CardTitle></CardHeader>
                  <CardContent>
                    <div className="divide-y">{profile.finance.invoices.map((inv: any) => (
                      <div key={inv.id} className="flex justify-between py-2">
                        <div><p className="font-medium">{inv.title}</p><p className="text-sm text-muted-foreground">{inv.invoice_number}</p></div>
                        <div className="text-left"><p className="font-medium">{Number(inv.amount).toLocaleString()} ر.س</p><Badge variant={inv.status === 'paid' ? 'default' : 'destructive'}>{inv.status === 'paid' ? 'مدفوعة' : 'معلقة'}</Badge></div>
                      </div>
                    ))}</div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="medical">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div><span className="text-sm text-muted-foreground">فصيلة الدم</span><p className="font-medium">{s?.blood_type || 'غير محدد'}</p></div>
                    <div><span className="text-sm text-muted-foreground">حالات طبية</span><p className="font-medium">{s?.medical_conditions || 'لا توجد'}</p></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">الطلاب</h1>
        <Button onClick={() => setShowAdd(true)}><UserPlus className="w-4 h-4 ml-2" /> إضافة طالب</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="بحث بالاسم أو الرقم..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10" />
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-right p-3 font-medium">الرقم</th>
              <th className="text-right p-3 font-medium">الاسم</th>
              <th className="text-right p-3 font-medium hidden md:table-cell">الصف</th>
              <th className="text-right p-3 font-medium hidden md:table-cell">الحالة</th>
              <th className="text-right p-3 font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {students.slice(0, 50).map((s: any) => (
              <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-3 text-sm">{s.student_id}</td>
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3 hidden md:table-cell text-sm">{getClassName(s.class_id)}</td>
                <td className="p-3 hidden md:table-cell"><Badge variant={s.status === 'active' ? 'default' : 'secondary'}>{s.status === 'active' ? 'نشط' : s.status}</Badge></td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => loadProfile(s.id)}><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">لا يوجد طلاب</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>إضافة طالب جديد</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>الاسم *</Label><Input value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>المرحلة</Label>
                <Select value={addForm.grade_level} onValueChange={v => setAddForm({ ...addForm, grade_level: v, class_id: '' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Array.from({ length: 12 }, (_, i) => <SelectItem key={i+1} value={String(i+1)}>الصف {i+1}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>الفصل</Label>
                <Select value={addForm.class_id} onValueChange={v => setAddForm({ ...addForm, class_id: v })}>
                  <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                  <SelectContent>{data.classes.filter((c: any) => c.level === addForm.grade_level).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>ولي الأمر</Label>
              <Select value={addForm.guardian_id} onValueChange={v => setAddForm({ ...addForm, guardian_id: v })}>
                <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                <SelectContent>{data.guardians.map((g: any) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>تاريخ الميلاد</Label><Input type="date" value={addForm.date_of_birth} onChange={e => setAddForm({ ...addForm, date_of_birth: e.target.value })} /></div>
            <Button onClick={handleAdd} disabled={saving || !addForm.name} className="w-full">{saving ? 'جاري الحفظ...' : 'إضافة'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
