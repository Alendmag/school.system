import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CreditCard, TrendingUp, DollarSign, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, FileText, Plus, Search, ListFilter as Filter, Download, MoveHorizontal as MoreHorizontal } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetFooter,
  SheetHeader, SheetTitle, SheetTrigger
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useFormCache } from "@/hooks/useFormCache";
import { useKeyPress } from "@/hooks/useKeyPress";
import { SearchableSelect } from "@/components/SearchableSelect";
import { cn } from "@/lib/utils";

const getTypeName = (type: string) => {
  switch (type) {
    case 'tuition': return 'قسط دراسي';
    case 'books': return 'رسوم كتب';
    case 'transport': return 'رسوم نقل';
    case 'activities': return 'أنشطة مدرسية';
    default: return 'أخرى';
  }
};

const getStatusProps = (status: string) => {
  switch (status) {
    case 'paid':
      return { label: 'مدفوع', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800' };
    case 'pending':
      return { label: 'معلق', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800' };
    case 'overdue':
      return { label: 'متأخر', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800' };
    default:
      return { label: status, className: 'bg-muted text-muted-foreground border-border' };
  }
};

export default function Finance() {
  const { db, setDb, services } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [search, setSearch] = useState("");

  const [formData, setFormData, clearFormData] = useFormCache("finance-invoice-form", {
    studentId: "",
    title: "قسط دراسي",
    type: "tuition" as "tuition" | "books" | "transport" | "activities" | "other",
    amount: ""
  });

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-issue-invoice', handler);
    return () => window.removeEventListener('open-issue-invoice', handler);
  }, []);

  useKeyPress("ctrl+s", (e) => {
    if (isOpen) { e.preventDefault(); handleSave(false); }
  });
  useKeyPress("shift+enter", (e) => {
    if (isOpen) { e.preventDefault(); handleSave(true); }
  });

  const handleSave = (keepOpen = false) => {
    if (!formData.studentId) { setValidationError("يجب اختيار الطالب"); return; }
    if (!formData.amount || isNaN(parseInt(formData.amount))) { setValidationError("يجب إدخال مبلغ صحيح"); return; }
    setValidationError("");

    const newInvoice = {
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

    setDb(prev => ({
      ...prev,
      invoices: [newInvoice, ...prev.invoices],
      notifications: [
        { id: `n-${Date.now()}`, title: 'فاتورة جديدة', message: `تم إصدار ${formData.title} بقيمة ${formData.amount} د.ل`, time: 'الآن', type: 'finance', read: false, userId: formData.studentId },
        ...prev.notifications
      ]
    }));

    if (keepOpen) {
      setFormData({ ...formData, title: "قسط دراسي", type: "tuition", amount: "" });
    } else {
      setIsOpen(false);
      clearFormData();
    }
  };

  const handleClose = () => {
    if (formData.studentId || formData.amount) {
      if (window.confirm("لديك بيانات غير محفوظة. هل أنت متأكد من الإغلاق؟")) {
        setIsOpen(false);
        setValidationError("");
      }
    } else {
      setIsOpen(false);
    }
  };

  const stats = services.getOverallFinancialStats();
  const pendingCount = db.invoices.filter(i => i.status !== 'paid').length;
  const collectionRate = stats.totalInvoiced > 0
    ? Math.round((stats.totalPaid / stats.totalInvoiced) * 100)
    : 0;

  const filteredInvoices = search
    ? db.invoices.filter(inv => {
      const name = db.students.find(s => s.id === inv.studentId)?.name || '';
      return name.includes(search) || inv.invoiceNumber?.includes(search) || inv.title.includes(search);
    })
    : db.invoices;

  const getStudentName = (id: string) =>
    db.students.find(s => s.id === id)?.name || '—';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between page-header">
        <div>
          <h1 className="text-[18px] font-bold text-foreground">الرسوم والمصروفات</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            متابعة الأقساط وإصدار الفواتير والتقارير المالية
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]">
            <FileText size={13} /> تقرير مالي
          </Button>
          <Sheet open={isOpen} onOpenChange={(open) => !open ? handleClose() : setIsOpen(true)}>
            <SheetTrigger asChild>
              <Button size="sm" className="h-8 gap-1.5 text-[12px]">
                <Plus size={13} /> إصدار فاتورة
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:max-w-[400px]" dir="rtl" side="right">
              <SheetHeader className="pb-4 border-b border-border">
                <SheetTitle className="text-[15px] flex items-center gap-2">
                  <CreditCard size={16} className="text-primary" />
                  إصدار فاتورة جديدة
                </SheetTitle>
              </SheetHeader>

              {validationError && (
                <div className="bg-destructive/10 text-destructive text-[12px] p-3 rounded-md mt-4 flex items-center gap-2 border border-destructive/20">
                  <AlertCircle size={14} />
                  {validationError}
                </div>
              )}

              <div className="grid gap-4 py-5">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-foreground">
                    الطالب <span className="text-destructive">*</span>
                  </label>
                  <SearchableSelect
                    options={db.students.map(s => ({ label: `${s.name} — ${s.studentId}`, value: s.id }))}
                    value={formData.studentId}
                    onChange={(val) => { setFormData({ ...formData, studentId: val }); setValidationError(""); }}
                    placeholder="اختر الطالب..."
                    searchPlaceholder="ابحث باسم الطالب..."
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="inv-title" className="text-[12px] font-semibold text-foreground">
                    الوصف <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="inv-title"
                    className="h-9 text-[13px]"
                    placeholder="مثال: القسط الدراسي الثاني"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-foreground">نوع الرسوم</label>
                  <Select
                    value={formData.type}
                    onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                  >
                    <SelectTrigger className="h-9 text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      <SelectItem value="tuition" className="text-[13px]">قسط دراسي</SelectItem>
                      <SelectItem value="books" className="text-[13px]">رسوم كتب</SelectItem>
                      <SelectItem value="transport" className="text-[13px]">رسوم نقل</SelectItem>
                      <SelectItem value="activities" className="text-[13px]">أنشطة مدرسية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="inv-amount" className="text-[12px] font-semibold text-foreground">
                    المبلغ (د.ل) <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="inv-amount"
                      type="number"
                      className="h-9 text-[13px] pl-12"
                      placeholder="0.00"
                      value={formData.amount}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => { setFormData({ ...formData, amount: e.target.value }); setValidationError(""); }}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">د.ل</span>
                  </div>
                </div>
              </div>

              <SheetFooter className="flex flex-col gap-2 pt-4 border-t border-border">
                <div className="flex gap-2 w-full">
                  <Button onClick={() => handleSave(false)} className="flex-1 h-9 text-[13px]">
                    حفظ <kbd className="mr-1 text-[10px] opacity-60">Ctrl+S</kbd>
                  </Button>
                  <Button onClick={() => handleSave(true)} variant="outline" className="flex-1 h-9 text-[13px]">
                    حفظ وإضافة آخر
                  </Button>
                </div>
                <Button variant="ghost" onClick={handleClose} className="w-full h-8 text-[12px] text-muted-foreground">
                  إلغاء
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">إجمالي التحصيلات</p>
                <p className="text-[22px] font-bold text-emerald-600 dark:text-emerald-400 tabular-num mt-1.5">
                  {stats.totalPaid.toLocaleString()}
                  <span className="text-[13px] font-normal text-muted-foreground mr-1">د.ل</span>
                </p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 shrink-0">
                <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={11} />
              <span>نسبة التحصيل: {collectionRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">مستحقات معلقة</p>
                <p className="text-[22px] font-bold text-amber-600 dark:text-amber-400 tabular-num mt-1.5">
                  {stats.outstanding.toLocaleString()}
                  <span className="text-[13px] font-normal text-muted-foreground mr-1">د.ل</span>
                </p>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 shrink-0">
                <DollarSign size={16} className="text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
              <AlertCircle size={11} />
              <span>{pendingCount} فاتورة في الانتظار</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">إجمالي المفوتر</p>
                <p className="text-[22px] font-bold tabular-num mt-1.5">
                  {stats.totalInvoiced.toLocaleString()}
                  <span className="text-[13px] font-normal text-muted-foreground mr-1">د.ل</span>
                </p>
              </div>
              <div className="p-2 rounded-lg bg-muted shrink-0">
                <CreditCard size={16} className="text-muted-foreground" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                <span>نسبة التحصيل</span>
                <span className="font-semibold text-foreground">{collectionRate}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${collectionRate}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="py-3 px-5 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[14px] font-semibold">سجل الفواتير</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-8 h-8 text-[12px] w-52 bg-muted/50"
                />
              </div>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                <Filter size={13} />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Download size={13} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4 bg-muted/40">رقم الفاتورة</TableHead>
                  <TableHead className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4 bg-muted/40">الطالب</TableHead>
                  <TableHead className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4 bg-muted/40">الوصف</TableHead>
                  <TableHead className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4 bg-muted/40">المبلغ</TableHead>
                  <TableHead className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4 bg-muted/40">الاستحقاق</TableHead>
                  <TableHead className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4 bg-muted/40">الحالة</TableHead>
                  <TableHead className="py-2.5 px-4 bg-muted/40 w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.slice(0, 20).map((inv) => {
                  const status = getStatusProps(inv.status);
                  return (
                    <TableRow key={inv.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <TableCell className="py-2.5 px-4 text-[12px] font-mono text-muted-foreground">{inv.invoiceNumber}</TableCell>
                      <TableCell className="py-2.5 px-4 text-[13px] font-medium">
                        {getStudentName(inv.studentId).split(' ').slice(0, 2).join(' ')}
                      </TableCell>
                      <TableCell className="py-2.5 px-4">
                        <p className="text-[13px]">{inv.title}</p>
                        <p className="text-[11px] text-muted-foreground">{getTypeName(inv.type)}</p>
                      </TableCell>
                      <TableCell className="py-2.5 px-4 text-[13px] font-semibold tabular-num">
                        {inv.amount.toLocaleString()}
                        <span className="text-[11px] font-normal text-muted-foreground mr-0.5">د.ل</span>
                      </TableCell>
                      <TableCell className="py-2.5 px-4 text-[12px] text-muted-foreground">{inv.dueDate}</TableCell>
                      <TableCell className="py-2.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${status.className}`}>
                          {status.label}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-7 w-7 p-0">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36" dir="rtl">
                            <DropdownMenuItem className="text-[13px]">عرض الفاتورة</DropdownMenuItem>
                            <DropdownMenuItem className="text-[13px]">تسجيل دفع</DropdownMenuItem>
                            <DropdownMenuItem className="text-[13px]">تصدير PDF</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {filteredInvoices.length > 20 && (
            <div className="px-4 py-3 border-t border-border text-center">
              <p className="text-[12px] text-muted-foreground">
                عرض 20 من {filteredInvoices.length} — <button className="text-primary hover:underline">عرض الكل</button>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
