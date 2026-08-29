import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, User, GraduationCap, CreditCard, HeartPulse, AlertCircle, Edit, Calendar, Phone, Mail, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SearchableSelect } from "@/components/SearchableSelect";
import { toast } from "sonner";

export default function Students() {
  const { data, refreshStudents, loading } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [student360, setStudent360] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading360, setLoading360] = useState(false);
  const [validationError, setValidationError] = useState("");

  const [formData, setFormData] = useState({
    name: "", national_id: "", date_of_birth: "",
    class_id: "", guardian_id: "", grade_level: "",
    blood_type: "", medical_conditions: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "", national_id: "", date_of_birth: "",
    class_id: "", guardian_id: "", grade_level: "",
    blood_type: "", medical_conditions: "", status: "active",
  });

  useEffect(() => {
    const handleOpen = () => setIsAddStudentOpen(true);
    window.addEventListener('open-add-student', handleOpen);
    return () => window.removeEventListener('open-add-student', handleOpen);
  }, []);

  const openStudent360 = async (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsProfileOpen(true);
    setIsEditMode(false);
    setLoading360(true);
    try {
      const result = await api.getStudent360(studentId);
      setStudent360(result);
    } catch (err: any) {
      toast.error("فشل تحميل بيانات الطالب");
    } finally {
      setLoading360(false);
    }
  };

  const startEdit = () => {
    if (!student360) return;
    const s = student360.student;
    setEditFormData({
      name: s.name || "",
      national_id: s.national_id || "",
      date_of_birth: s.date_of_birth || "",
      class_id: s.class_id || "",
      guardian_id: s.guardian_id || "",
      grade_level: s.grade_level || "",
      blood_type: s.blood_type || "",
      medical_conditions: s.medical_conditions || "",
      status: s.status || "active",
    });
    setIsEditMode(true);
  };

  const saveEdit = async () => {
    if (!selectedStudentId) return;
    if (!editFormData.name.trim()) {
      toast.error("اسم الطالب مطلوب");
      return;
    }
    setSaving(true);
    try {
      await api.updateStudent(selectedStudentId, editFormData);
      toast.success("تم تحديث بيانات الطالب بنجاح");
      setIsEditMode(false);
      await refreshStudents();
      const result = await api.getStudent360(selectedStudentId);
      setStudent360(result);
    } catch (err: any) {
      toast.error(err.message || "فشل حفظ التعديلات");
    } finally {
      setSaving(false);
    }
  };

  const handleAddStudent = async () => {
    if (!formData.name.trim()) {
      setValidationError("اسم الطالب مطلوب");
      return;
    }
    if (!formData.class_id) {
      setValidationError("يجب اختيار الفصل الدراسي");
      return;
    }
    setValidationError("");
    setSaving(true);
    try {
      await api.createStudent(formData);
      toast.success("تم تسجيل الطالب بنجاح");
      setIsAddStudentOpen(false);
      setFormData({ name: "", national_id: "", date_of_birth: "", class_id: "", guardian_id: "", grade_level: "", blood_type: "", medical_conditions: "" });
      await refreshStudents();
    } catch (err: any) {
      toast.error(err.message || "فشل تسجيل الطالب");
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = data.students.filter(s =>
    s.name?.includes(searchTerm) || s.student_id?.includes(searchTerm)
  ).slice(0, 100);

  const getClassName = (classId?: string) =>
    data.classes.find((c: any) => c.id === classId)?.name || "غير محدد";

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground">جارٍ تحميل البيانات...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">سجل الطلاب (360°)</h1>
          <p className="text-muted-foreground">عرض شامل لجميع بيانات الطالب الأكاديمية، المالية، والطبية.</p>
        </div>
        <Sheet open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2"><Plus size={16} /> تسجيل طالب جديد</Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[500px] overflow-y-auto" dir="rtl" side="right">
            <SheetHeader>
              <SheetTitle>تسجيل طالب جديد</SheetTitle>
              <SheetDescription>قم بإدخال بيانات الطالب الأساسية.</SheetDescription>
            </SheetHeader>
            {validationError && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mt-4 flex items-center gap-2">
                <AlertCircle size={16} />{validationError}
              </div>
            )}
            <div className="grid gap-5 py-6">
              <div className="grid gap-2">
                <label className="text-sm font-medium">اسم الطالب الرباعي <span className="text-destructive">*</span></label>
                <Input autoFocus placeholder="الاسم الكامل" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">الرقم الوطني</label>
                <Input placeholder="12 رقم" value={formData.national_id} onChange={e => setFormData({ ...formData, national_id: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">تاريخ الميلاد</label>
                <Input type="date" value={formData.date_of_birth} onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">الفصل الدراسي <span className="text-destructive">*</span></label>
                <SearchableSelect
                  options={data.classes.map((c: any) => ({ label: c.name, value: c.id }))}
                  value={formData.class_id}
                  onChange={val => {
                    const cls = data.classes.find((c: any) => c.id === val);
                    setFormData({ ...formData, class_id: val, grade_level: cls?.level || "" });
                  }}
                  placeholder="اختر الفصل..."
                  searchPlaceholder="ابحث عن الفصل..."
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">ولي الأمر</label>
                <SearchableSelect
                  options={data.guardians.map((g: any) => ({ label: g.name, value: g.id }))}
                  value={formData.guardian_id}
                  onChange={val => setFormData({ ...formData, guardian_id: val })}
                  placeholder="اختر ولي الأمر..."
                  searchPlaceholder="ابحث عن ولي الأمر..."
                />
              </div>
            </div>
            <SheetFooter>
              <Button onClick={handleAddStudent} disabled={saving} className="w-full">
                {saving ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="بحث بالاسم أو رقم الطالب..." className="pr-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-right">الطالب</TableHead>
              <TableHead className="text-right">رقم الطالب</TableHead>
              <TableHead className="text-right">الفصل</TableHead>
              <TableHead className="text-right">المرحلة</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student: any) => (
                <TableRow key={student.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openStudent360(student.id)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{student.name?.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{student.student_id}</TableCell>
                  <TableCell>{getClassName(student.class_id)}</TableCell>
                  <TableCell>الصف {student.grade_level}</TableCell>
                  <TableCell>
                    <Badge className={student.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}>
                      {student.status === 'active' ? 'نشط' : student.status === 'suspended' ? 'موقوف' : 'منسحب'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {data.students.length === 0 ? "لا يوجد طلاب مسجلون بعد." : "لا توجد نتائج مطابقة."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Student 360 Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={(open) => { setIsProfileOpen(open); if (!open) { setIsEditMode(false); setStudent360(null); } }}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto" dir="rtl">
          {loading360 ? (
            <div className="flex items-center justify-center py-12"><span className="text-muted-foreground">جارٍ تحميل بيانات الطالب...</span></div>
          ) : student360 ? (
            <>
              <DialogHeader className="flex flex-row items-center gap-4 pb-4 border-b">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">{student360.student.name?.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <DialogTitle className="text-xl">{student360.student.name}</DialogTitle>
                    {!isEditMode && (
                      <Button variant="outline" size="sm" onClick={startEdit} className="gap-1">
                        <Edit size={14} /> تعديل
                      </Button>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 flex gap-4 flex-wrap">
                    <span>{student360.student.student_id}</span>
                    <span>{student360.class?.name || "بدون فصل"}</span>
                    <Badge className={student360.student.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}>
                      {student360.student.status === 'active' ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              {isEditMode ? (
                <div className="space-y-5 mt-4">
                  <h3 className="font-semibold text-lg border-b pb-2">تعديل بيانات الطالب</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">الاسم <span className="text-destructive">*</span></label>
                      <Input value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">الرقم الوطني</label>
                      <Input value={editFormData.national_id} onChange={e => setEditFormData({ ...editFormData, national_id: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">تاريخ الميلاد</label>
                      <Input type="date" value={editFormData.date_of_birth} onChange={e => setEditFormData({ ...editFormData, date_of_birth: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">الفصل</label>
                      <SearchableSelect
                        options={data.classes.map((c: any) => ({ label: c.name, value: c.id }))}
                        value={editFormData.class_id}
                        onChange={val => {
                          const cls = data.classes.find((c: any) => c.id === val);
                          setEditFormData({ ...editFormData, class_id: val, grade_level: cls?.level || editFormData.grade_level });
                        }}
                        placeholder="اختر الفصل..."
                        searchPlaceholder="ابحث..."
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">ولي الأمر</label>
                      <SearchableSelect
                        options={data.guardians.map((g: any) => ({ label: g.name, value: g.id }))}
                        value={editFormData.guardian_id}
                        onChange={val => setEditFormData({ ...editFormData, guardian_id: val })}
                        placeholder="اختر ولي الأمر..."
                        searchPlaceholder="ابحث..."
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">فصيلة الدم</label>
                      <Select value={editFormData.blood_type} onValueChange={val => setEditFormData({ ...editFormData, blood_type: val })}>
                        <SelectTrigger><SelectValue placeholder="اختر..." /></SelectTrigger>
                        <SelectContent>
                          {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bt => (
                            <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">الحالة</label>
                      <Select value={editFormData.status} onValueChange={val => setEditFormData({ ...editFormData, status: val })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">نشط</SelectItem>
                          <SelectItem value="suspended">موقوف</SelectItem>
                          <SelectItem value="withdrawn">منسحب</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                      <label className="text-sm font-medium">ملاحظات طبية</label>
                      <Input value={editFormData.medical_conditions} onChange={e => setEditFormData({ ...editFormData, medical_conditions: e.target.value })} placeholder="أي حالات صحية..." />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t">
                    <Button onClick={saveEdit} disabled={saving}>{saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}</Button>
                    <Button variant="outline" onClick={() => setIsEditMode(false)}>إلغاء</Button>
                  </div>
                </div>
              ) : (
                <Tabs defaultValue="overview" className="mt-4">
                  <TabsList className="flex flex-wrap w-full bg-transparent h-auto gap-2">
                    <TabsTrigger value="overview" className="border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><User size={14} className="mr-2 ml-1" /> عام</TabsTrigger>
                    <TabsTrigger value="academic" className="border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><GraduationCap size={14} className="mr-2 ml-1" /> أكاديمي</TabsTrigger>
                    <TabsTrigger value="financial" className="border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><CreditCard size={14} className="mr-2 ml-1" /> مالي</TabsTrigger>
                    <TabsTrigger value="medical" className="border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><HeartPulse size={14} className="mr-2 ml-1" /> طبي</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card><CardContent className="p-4 flex items-center gap-3">
                        <Calendar size={18} className="text-muted-foreground" />
                        <div><p className="text-sm text-muted-foreground">تاريخ الميلاد</p><p className="font-medium">{student360.student.date_of_birth || "غير محدد"}</p></div>
                      </CardContent></Card>
                      <Card><CardContent className="p-4 flex items-center gap-3">
                        <GraduationCap size={18} className="text-muted-foreground" />
                        <div><p className="text-sm text-muted-foreground">الفصل / المرحلة</p><p className="font-medium">{student360.class?.name || "غير محدد"} - الصف {student360.student.grade_level}</p></div>
                      </CardContent></Card>
                      <Card><CardContent className="p-4 flex items-center gap-3">
                        <Calendar size={18} className="text-muted-foreground" />
                        <div><p className="text-sm text-muted-foreground">تاريخ التسجيل</p><p className="font-medium">{student360.student.enrollment_date || "غير محدد"}</p></div>
                      </CardContent></Card>
                      <Card><CardContent className="p-4 flex items-center gap-3">
                        <User size={18} className="text-muted-foreground" />
                        <div><p className="text-sm text-muted-foreground">الرقم الوطني</p><p className="font-medium">{student360.student.national_id || "غير مسجل"}</p></div>
                      </CardContent></Card>
                    </div>
                    {student360.guardian && (
                      <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-base">ولي الأمر</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center gap-2"><User size={14} className="text-muted-foreground" /><span>{student360.guardian.name}</span></div>
                          {student360.guardian.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-muted-foreground" /><span dir="ltr">{student360.guardian.phone}</span></div>}
                          {student360.guardian.email && <div className="flex items-center gap-2"><Mail size={14} className="text-muted-foreground" /><span>{student360.guardian.email}</span></div>}
                          {student360.guardian.relation && <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">صلة القرابة:</span><span>{student360.guardian.relation}</span></div>}
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="academic" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card><CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-2">المعدل التراكمي (GPA)</p>
                        <div className="text-2xl font-bold text-emerald-600">{student360.academic.gpa > 0 ? student360.academic.gpa.toFixed(1) : "0"}%</div>
                        <Progress value={student360.academic.gpa} className="mt-2" />
                        {student360.academic.grades.length === 0 && <p className="text-xs text-muted-foreground mt-2">لا توجد درجات مسجلة بعد</p>}
                      </CardContent></Card>
                      <Card><CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-2">نسبة الحضور</p>
                        <div className="text-2xl font-bold text-blue-600">{student360.attendance.percentage.toFixed(1)}%</div>
                        <Progress value={student360.attendance.percentage} className="mt-2 bg-blue-100" />
                        <p className="text-xs text-muted-foreground mt-2">حضور {student360.attendance.present} من {student360.attendance.total} يوم</p>
                      </CardContent></Card>
                    </div>
                    {student360.attendance.records.length > 0 && (
                      <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-base">سجل الحضور الأخير</CardTitle></CardHeader>
                        <CardContent>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {student360.attendance.records.slice(0, 10).map((a: any) => (
                              <div key={a.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                                <span className="text-sm">{a.date}</span>
                                <Badge className={a.status === 'present' ? 'bg-emerald-500' : a.status === 'absent' ? 'bg-red-500' : 'bg-amber-500'}>
                                  {a.status === 'present' ? 'حاضر' : a.status === 'absent' ? 'غائب' : a.status === 'late' ? 'متأخر' : 'معذور'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="financial" className="mt-4 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-blue-800 dark:text-blue-400">إجمالي الفواتير</p>
                          <p className="text-xl font-bold text-blue-900 dark:text-blue-50">{student360.finance.totalInvoiced.toLocaleString()} د.ل</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-emerald-800 dark:text-emerald-400">المدفوع</p>
                          <p className="text-xl font-bold text-emerald-900 dark:text-emerald-50">{student360.finance.totalPaid.toLocaleString()} د.ل</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-orange-800 dark:text-orange-400">المستحق</p>
                          <p className="text-xl font-bold text-orange-900 dark:text-orange-50">{student360.finance.outstanding.toLocaleString()} د.ل</p>
                        </CardContent>
                      </Card>
                    </div>
                    {student360.finance.invoices.length > 0 && (
                      <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-base">الفواتير</CardTitle></CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-right">رقم الفاتورة</TableHead>
                                <TableHead className="text-right">الوصف</TableHead>
                                <TableHead className="text-right">المبلغ</TableHead>
                                <TableHead className="text-right">الحالة</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {student360.finance.invoices.map((inv: any) => (
                                <TableRow key={inv.id}>
                                  <TableCell className="font-mono text-sm">{inv.invoice_number}</TableCell>
                                  <TableCell>{inv.title}</TableCell>
                                  <TableCell>{Number(inv.amount).toLocaleString()} د.ل</TableCell>
                                  <TableCell>
                                    <Badge className={inv.status === 'paid' ? 'bg-emerald-500' : inv.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}>
                                      {inv.status === 'paid' ? 'مدفوع' : inv.status === 'pending' ? 'معلق' : 'متأخر'}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="medical" className="mt-4">
                    <Card><CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <HeartPulse size={18} className="text-red-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">فصيلة الدم</p>
                          <p className="font-bold text-lg text-red-600">{student360.student.blood_type || "غير مسجل"}</p>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-muted/50 rounded text-sm">
                        {student360.student.medical_conditions || "لا توجد ملاحظات طبية مسجلة."}
                      </div>
                    </CardContent></Card>
                  </TabsContent>
                </Tabs>
              )}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
