import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, User, GraduationCap, CreditCard, HeartPulse, Book, Bus, FileText, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFormCache } from "@/hooks/useFormCache";
import { useKeyPress } from "@/hooks/useKeyPress";
import { SearchableSelect } from "@/components/SearchableSelect";

export default function Students() {
  const { db, setDb, services } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [validationError, setValidationError] = useState("");

  const [formData, setFormData, clearFormData] = useFormCache("students-add-form", {
    name: "",
    nationalId: "",
    dateOfBirth: "",
    classId: "",
    guardianId: ""
  });

  useEffect(() => {
    const handleOpen = () => setIsAddStudentOpen(true);
    window.addEventListener('open-add-student', handleOpen);
    return () => window.removeEventListener('open-add-student', handleOpen);
  }, []);

  useKeyPress("ctrl+s", (e) => {
    if (isAddStudentOpen) {
      e.preventDefault();
      handleAddStudent(false);
    }
  });
  
  useKeyPress("shift+enter", (e) => {
      if (isAddStudentOpen) {
          e.preventDefault();
          handleAddStudent(true);
      }
  })

  useKeyPress("esc", (e) => {
    if (isAddStudentOpen && (formData.name || formData.nationalId)) {
      e.preventDefault();
      if (window.confirm("لديك بيانات غير محفوظة. هل أنت متأكد من الإغلاق؟")) {
        setIsAddStudentOpen(false);
        setValidationError("");
      }
    }
  });

  const handleAddStudent = (keepOpen = false) => {
    if (!formData.name) {
        setValidationError("اسم الطالب مطلوب");
        return;
    }
    if (!formData.classId) {
        setValidationError("يجب اختيار الفصل الدراسي");
        return;
    }
    
    setValidationError("");

    const newStudent = {
      id: `std-${Date.now()}`,
      studentId: `ST-${new Date().getFullYear()}${(db.students.length + 1).toString().padStart(4, '0')}`,
      name: formData.name,
      nationalId: formData.nationalId,
      dateOfBirth: formData.dateOfBirth,
      guardianId: formData.guardianId,
      classId: formData.classId,
      gradeLevel: "1", // Mock default
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: "active" as const,
      medicalRecordId: `med-${Date.now()}`
    };

    setDb({
      ...db,
      students: [newStudent, ...db.students],
      notifications: [
        { id: `n-${Date.now()}`, title: 'تسجيل جديد', message: `تم تسجيل الطالب ${newStudent.name} بنجاح.`, time: 'الآن', type: 'info', read: false },
        ...db.notifications
      ]
    });
    
    if (keepOpen) {
        // Only clear specific fields to speed up adding siblings
        setFormData({
            ...formData,
            name: "",
            nationalId: "",
            dateOfBirth: ""
        });
        // We keep classId and guardianId so siblings are faster to add
    } else {
        setIsAddStudentOpen(false);
        clearFormData();
    }
  };

  // Pagination & Filtering simulation
  const filteredStudents = db.students
    .filter(s => s.name.includes(searchTerm) || s.studentId.includes(searchTerm))
    .slice(0, 50); // Show top 50 for performance in demo

  const getStudentClass = (classId?: string) => db.classes.find(c => c.id === classId)?.name || "غير محدد";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">سجل الطلاب (360°)</h1>
          <p className="text-muted-foreground">عرض شامل لجميع بيانات الطالب الأكاديمية، المالية، والطبية.</p>
        </div>
        <Sheet open={isAddStudentOpen} onOpenChange={(open) => {
            if(!open && (formData.name || formData.nationalId)) {
                if (window.confirm("لديك بيانات غير محفوظة. هل أنت متأكد من الإغلاق؟")) {
                    setIsAddStudentOpen(false);
                    setValidationError("");
                }
            } else {
                setIsAddStudentOpen(open);
                setValidationError("");
            }
        }}>
          <SheetTrigger asChild>
            <Button className="gap-2"><Plus size={16} /> تسجيل طالب جديد (معالج)</Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[500px] font-arabic overflow-y-auto" dir="rtl" side="right">
            <SheetHeader>
              <SheetTitle>تسجيل طالب جديد</SheetTitle>
              <SheetDescription>
                قم بإدخال بيانات الطالب الأساسية. سيتم حفظ البيانات مؤقتاً أثناء الإدخال.
              </SheetDescription>
            </SheetHeader>
            
            {validationError && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mt-4 flex items-center gap-2">
                    <AlertCircle size={16} />
                    {validationError}
                </div>
            )}

            <div className="grid gap-6 py-6">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">اسم الطالب الرباعي <span className="text-destructive">*</span></label>
                <Input 
                  id="name" 
                  autoFocus
                  placeholder="الاسم الكامل" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="nationalId" className="text-sm font-medium">الرقم الوطني</label>
                <Input 
                  id="nationalId" 
                  placeholder="12 رقم" 
                  value={formData.nationalId}
                  onChange={(e) => setFormData({...formData, nationalId: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="dob" className="text-sm font-medium">تاريخ الميلاد</label>
                <Input 
                  id="dob" 
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">الفصل الدراسي <span className="text-destructive">*</span></label>
                <SearchableSelect 
                  options={db.classes.map(c => ({ label: c.name, value: c.id }))}
                  value={formData.classId}
                  onChange={(val) => setFormData({...formData, classId: val})}
                  placeholder="اختر الفصل..."
                  searchPlaceholder="ابحث عن الفصل..."
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">ولي الأمر</label>
                <SearchableSelect 
                  options={db.guardians.map(g => ({ label: g.name, value: g.id }))}
                  value={formData.guardianId}
                  onChange={(val) => setFormData({...formData, guardianId: val})}
                  placeholder="اختر ولي الأمر (اختياري)..."
                  searchPlaceholder="ابحث عن ولي الأمر..."
                />
              </div>
            </div>
            <SheetFooter className="mt-6 flex-col sm:flex-col gap-4">
              <div className="flex w-full gap-2">
                  <Button onClick={() => handleAddStudent(false)} className="flex-1">حفظ (Ctrl+S)</Button>
                  <Button onClick={() => handleAddStudent(true)} variant="secondary" className="flex-1">حفظ وإضافة آخر (Shift+Enter)</Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="بحث بجميع الحقول (الاسم، الرقم، الفصل)..." 
            className="pr-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-right">الطالب</TableHead>
              <TableHead className="text-right">الفصل</TableHead>
              <TableHead className="text-right">المعدل العام</TableHead>
              <TableHead className="text-right">الحضور</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const gpa = services.getStudentGPA(student.id);
                  const attendance = services.getStudentAttendance(student.id);
                  return (
                  <TableRow key={student.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedStudent(student); setIsProfileOpen(true); }}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8"><AvatarImage src={student.avatar} /><AvatarFallback>ST</AvatarFallback></Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{student.name}</span>
                          <span className="text-xs text-muted-foreground">{student.studentId}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStudentClass(student.classId)}</TableCell>
                    <TableCell><Badge variant="secondary" className="bg-emerald-100 text-emerald-700">{gpa.toFixed(1)}%</Badge></TableCell>
                    <TableCell><Badge variant="secondary" className="bg-blue-100 text-blue-700">{attendance.percentage.toFixed(0)}%</Badge></TableCell>
                    <TableCell><Badge className="bg-emerald-500">نشط</Badge></TableCell>
                  </TableRow>
                )})
            ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    لا توجد نتائج مطابقة للبحث.
                  </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto" dir="rtl">
          {selectedStudent && (() => {
            const finances = services.getStudentFinances(selectedStudent.id);
            const gpa = services.getStudentGPA(selectedStudent.id);
            const attendance = services.getStudentAttendance(selectedStudent.id);
            
            return (
            <>
              <DialogHeader className="flex flex-row items-center gap-4 pb-4 border-b">
                <Avatar className="h-16 w-16"><AvatarImage src={selectedStudent.avatar} /></Avatar>
                <div className="flex-1">
                  <DialogTitle className="text-xl">{selectedStudent.name}</DialogTitle>
                  <div className="text-sm text-muted-foreground mt-1 flex gap-4">
                    <span>{selectedStudent.studentId}</span>
                    <span>{getStudentClass(selectedStudent.classId)}</span>
                    <Badge className="bg-emerald-500">منتظم</Badge>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="flex flex-wrap w-full bg-transparent h-auto gap-2">
                  <TabsTrigger value="overview" className="border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><User size={14} className="mr-2 ml-1"/> عام</TabsTrigger>
                  <TabsTrigger value="academic" className="border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><GraduationCap size={14} className="mr-2 ml-1"/> أكاديمي</TabsTrigger>
                  <TabsTrigger value="financial" className="border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><CreditCard size={14} className="mr-2 ml-1"/> مالي</TabsTrigger>
                  <TabsTrigger value="medical" className="border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><HeartPulse size={14} className="mr-2 ml-1"/> طبي</TabsTrigger>
                  <TabsTrigger value="library" className="border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Book size={14} className="mr-2 ml-1"/> المكتبة</TabsTrigger>
                  <TabsTrigger value="transport" className="border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Bus size={14} className="mr-2 ml-1"/> النقل</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card><CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">تاريخ الميلاد</p>
                      <p className="font-medium">{selectedStudent.dateOfBirth}</p>
                    </CardContent></Card>
                    <Card><CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">ولي الأمر</p>
                      <p className="font-medium">{db.guardians.find(g => g.id === selectedStudent.guardianId)?.name || 'غير محدد'}</p>
                    </CardContent></Card>
                  </div>
                </TabsContent>

                <TabsContent value="academic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground mb-2">المعدل التراكمي (GPA)</p><div className="text-2xl font-bold text-emerald-600">{gpa.toFixed(1)}%</div><Progress value={gpa} className="mt-2" /></CardContent></Card>
                    <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground mb-2">نسبة الحضور</p><div className="text-2xl font-bold text-blue-600">{attendance.percentage.toFixed(1)}%</div><Progress value={attendance.percentage} className="mt-2 bg-blue-100" /></CardContent></Card>
                  </div>
                </TabsContent>

                <TabsContent value="financial" className="mt-4">
                  <Card><CardContent className="p-4 flex justify-between items-center bg-orange-50 border-orange-200">
                    <div><p className="text-sm text-orange-800">الرصيد المستحق</p><p className="text-2xl font-bold text-orange-900">{finances.outstanding} د.ل</p></div>
                    <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">سداد دفعة</Button>
                  </CardContent></Card>
                </TabsContent>

                <TabsContent value="medical" className="mt-4">
                  <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">فصيلة الدم</p><p className="font-bold text-lg text-red-600">O+</p><div className="mt-4 p-3 bg-emerald-50 rounded text-emerald-800 text-sm">لا توجد أمراض مزمنة أو حساسية مسجلة.</div></CardContent></Card>
                </TabsContent>
                
                <TabsContent value="library" className="mt-4">
                  <Card><CardContent className="p-4 text-center text-muted-foreground py-8">لا توجد كتب مستعارة حالياً.</CardContent></Card>
                </TabsContent>
                
                <TabsContent value="transport" className="mt-4">
                  <Card><CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">المسار المشترك</p>
                    <p className="font-bold text-lg">المسار الشمالي (حافلة رقم 02)</p>
                  </CardContent></Card>
                </TabsContent>
              </Tabs>
            </>
          )})}
        </DialogContent>
      </Dialog>
    </div>
  );
}
