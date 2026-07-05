import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Download, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  Plus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormCache } from "@/hooks/useFormCache";
import { useKeyPress } from "@/hooks/useKeyPress";
import { SearchableSelect } from "@/components/SearchableSelect";

export default function Finance() {
  const { db, setDb, services } = useApp();
  const [isIssueInvoiceOpen, setIsIssueInvoiceOpen] = useState(false);
  const [validationError, setValidationError] = useState("");
  
  const [formData, setFormData, clearFormData] = useFormCache("finance-invoice-form", {
    studentId: "",
    title: "قسط دراسي",
    type: "tuition" as "tuition" | "books" | "transport" | "activities" | "other",
    amount: ""
  });

  // Global listener for Add Invoice
  useEffect(() => {
    const handleOpen = () => setIsIssueInvoiceOpen(true);
    window.addEventListener('open-issue-invoice', handleOpen);
    return () => window.removeEventListener('open-issue-invoice', handleOpen);
  }, []);

  useKeyPress("ctrl+s", (e) => {
    if (isIssueInvoiceOpen) {
      e.preventDefault();
      handleIssueInvoice(false);
    }
  });
  
  useKeyPress("shift+enter", (e) => {
      if (isIssueInvoiceOpen) {
          e.preventDefault();
          handleIssueInvoice(true);
      }
  })

  useKeyPress("esc", (e) => {
    if (isIssueInvoiceOpen && (formData.studentId || formData.amount)) {
      e.preventDefault();
      if (window.confirm("لديك بيانات غير محفوظة. هل أنت متأكد من الإغلاق؟")) {
        setIsIssueInvoiceOpen(false);
        setValidationError("");
      }
    }
  });

  const handleIssueInvoice = (keepOpen = false) => {
    if (!formData.studentId) {
        setValidationError("يجب اختيار الطالب");
        return;
    }
    if (!formData.amount || isNaN(parseInt(formData.amount))) {
        setValidationError("يجب إدخال مبلغ صحيح");
        return;
    }
    
    setValidationError("");

    const newTrx = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${9826 + db.invoices.length}`,
      studentId: formData.studentId,
      title: formData.title,
      type: formData.type,
      amount: parseInt(formData.amount) || 0,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      status: "pending" as const
    };

    setDb({
      ...db,
      invoices: [newTrx, ...db.invoices],
      notifications: [
        { id: `n-${Date.now()}`, title: 'فاتورة جديدة', message: `تم إصدار ${formData.title} بقيمة ${formData.amount} د.ل`, time: 'الآن', type: 'finance', read: false, userId: formData.studentId },
        ...db.notifications
      ]
    });
    
    if (keepOpen) {
        // Keep the sheet open, but clear specific fields to add another
        setFormData({
            ...formData,
            title: "قسط دراسي",
            type: "tuition",
            amount: ""
            // We consciously keep the studentId if they are billing the same student multiple things, 
            // or they can change it easily since it's a combobox.
        });
    } else {
        setIsIssueInvoiceOpen(false);
        clearFormData();
    }
  };

  const getStudentName = (id: string) => {
    return db.students.find(s => s.id === id)?.name || "طالب غير معروف";
  };
  
  const getTypeName = (type: string) => {
      switch(type) {
          case 'tuition': return 'قسط دراسي';
          case 'books': return 'رسوم كتب';
          case 'transport': return 'رسوم نقل';
          case 'activities': return 'أنشطة مدرسية';
          default: return 'أخرى';
      }
  };

  const stats = services.getOverallFinancialStats();
  const pendingInvoices = db.invoices.filter(i => i.status !== 'paid').length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">المالية والرسوم</h1>
          <p className="text-muted-foreground">
            متابعة الأقساط، إصدار الفواتير، والتقارير المالية.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileText size={16} />
            تقرير مالي
          </Button>
          <Sheet open={isIssueInvoiceOpen} onOpenChange={(open) => {
              if(!open && (formData.studentId || formData.amount)) {
                   if (window.confirm("لديك بيانات غير محفوظة. هل أنت متأكد من الإغلاق؟")) {
                       setIsIssueInvoiceOpen(false);
                       setValidationError("");
                   }
              } else {
                  setIsIssueInvoiceOpen(open);
                  setValidationError("");
              }
          }}>
            <SheetTrigger asChild>
              <Button className="gap-2">
                <CreditCard size={16} />
                إصدار فاتورة
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[425px] font-arabic overflow-y-auto" dir="rtl" side="right">
              <SheetHeader>
                <SheetTitle>إصدار فاتورة جديدة</SheetTitle>
                <SheetDescription>
                  قم بإدخال بيانات الطالب وقيمة الفاتورة لإضافتها للنظام. سيتم حفظ البيانات مؤقتاً.
                </SheetDescription>
              </SheetHeader>
              
              {validationError && (
                  <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mt-4 flex items-center gap-2">
                      <AlertCircle size={16} />
                      {validationError}
                  </div>
              )}

              <div className="grid gap-6 py-6">
                <div className="grid items-center gap-2">
                  <label className="text-sm font-medium">الطالب <span className="text-destructive">*</span></label>
                  <SearchableSelect 
                    options={db.students.map(s => ({ label: `${s.name} - ${s.studentId}`, value: s.id }))}
                    value={formData.studentId}
                    onChange={(val) => setFormData({...formData, studentId: val})}
                    placeholder="اختر الطالب..."
                    searchPlaceholder="ابحث باسم الطالب أو رقمه..."
                    autoFocus
                  />
                </div>
                <div className="grid items-center gap-2">
                  <label htmlFor="title" className="text-sm font-medium">الوصف <span className="text-destructive">*</span></label>
                  <Input 
                    id="title" 
                    placeholder="مثال: القسط الدراسي الثاني" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="grid items-center gap-2">
                  <label className="text-sm font-medium">نوع الرسوم</label>
                  <Select value={formData.type} onValueChange={(val: any) => setFormData({...formData, type: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الرسوم" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tuition">قسط دراسي</SelectItem>
                      <SelectItem value="books">رسوم كتب</SelectItem>
                      <SelectItem value="transport">رسوم نقل</SelectItem>
                      <SelectItem value="activities">أنشطة مدرسية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid items-center gap-2">
                  <label htmlFor="amount" className="text-sm font-medium">المبلغ (د.ل) <span className="text-destructive">*</span></label>
                  <Input 
                    id="amount" 
                    type="number"
                    placeholder="0"
                    value={formData.amount}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
              </div>
              <SheetFooter className="mt-6 flex-col sm:flex-col gap-4">
                <div className="flex w-full gap-2">
                    <Button onClick={() => handleIssueInvoice(false)} className="flex-1">حفظ (Ctrl+S)</Button>
                    <Button onClick={() => handleIssueInvoice(true)} variant="secondary" className="flex-1">حفظ وإضافة آخر (Shift+Enter)</Button>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/10 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">إجمالي التحصيلات</p>
                <h3 className="text-3xl font-bold text-emerald-900 dark:text-emerald-50 mt-2">{stats.totalPaid.toLocaleString()} د.ل</h3>
              </div>
              <div className="p-2 bg-emerald-200/50 dark:bg-emerald-800/50 rounded-lg text-emerald-700 dark:text-emerald-300">
                <TrendingUp size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 size={14} className="mr-1" />
              <span>تم تحصيل {Math.round((stats.totalPaid / (stats.totalInvoiced || 1)) * 100)}% من الفواتير</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/10 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-400">مستحقات معلقة</p>
                <h3 className="text-3xl font-bold text-orange-900 dark:text-orange-50 mt-2">{stats.outstanding.toLocaleString()} د.ل</h3>
              </div>
              <div className="p-2 bg-orange-200/50 dark:bg-orange-800/50 rounded-lg text-orange-700 dark:text-orange-300">
                <DollarSign size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-orange-700 dark:text-orange-400">
              <AlertCircle size={14} className="mr-1" />
              <span>{pendingInvoices} فواتير في الانتظار</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الإجمالي المفوتر</p>
                <h3 className="text-3xl font-bold mt-2">{stats.totalInvoiced.toLocaleString()} د.ل</h3>
              </div>
              <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                <CreditCard size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <span>قيمة الفواتير الصادرة</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>سجل الفواتير والمعاملات</CardTitle>
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث برقم الفاتورة أو اسم الطالب" className="pr-8 h-9" />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Filter size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الفاتورة</TableHead>
                <TableHead className="text-right">الطالب</TableHead>
                <TableHead className="text-right">الوصف</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {db.invoices.map((trx) => (
                <TableRow key={trx.id}>
                  <TableCell className="font-mono text-sm">{trx.invoiceNumber}</TableCell>
                  <TableCell className="font-medium">{getStudentName(trx.studentId)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{trx.title}</span>
                      <span className="text-xs text-muted-foreground">{getTypeName(trx.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{trx.amount} د.ل</TableCell>
                  <TableCell>{trx.dueDate}</TableCell>
                  <TableCell>
                    <Badge variant={
                      trx.status === 'paid' ? 'default' : 
                      trx.status === 'pending' ? 'secondary' : 'destructive'
                    } className={
                      trx.status === 'paid' ? 'bg-emerald-500 hover:bg-emerald-600' : 
                      trx.status === 'pending' ? 'bg-amber-500 hover:bg-amber-600' : ''
                    }>
                      {trx.status === 'paid' ? 'مدفوع' : 
                       trx.status === 'pending' ? 'معلق' : 'متأخر'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left">
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                      <Download size={14} />
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}