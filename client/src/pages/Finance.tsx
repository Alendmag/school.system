import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, TrendingUp, DollarSign, AlertCircle, CheckCircle2, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/SearchableSelect";
import { toast } from "sonner";

export default function Finance() {
  const { data, refreshInvoices, loading } = useApp();
  const [isIssueInvoiceOpen, setIsIssueInvoiceOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [validationError, setValidationError] = useState("");

  const [formData, setFormData] = useState({
    student_id: "",
    title: "قسط دراسي",
    type: "tuition" as string,
    amount: "",
  });

  const handleIssueInvoice = async () => {
    if (!formData.student_id) { setValidationError("يجب اختيار الطالب"); return; }
    if (!formData.amount || isNaN(parseInt(formData.amount))) { setValidationError("يجب إدخال مبلغ صحيح"); return; }
    setValidationError("");
    setSaving(true);
    try {
      await api.createInvoice({
        student_id: formData.student_id,
        title: formData.title,
        type: formData.type,
        amount: parseInt(formData.amount),
      });
      toast.success("تم إصدار الفاتورة بنجاح");
      setIsIssueInvoiceOpen(false);
      setFormData({ student_id: "", title: "قسط دراسي", type: "tuition", amount: "" });
      await refreshInvoices();
    } catch (err: any) {
      toast.error(err.message || "فشل إصدار الفاتورة");
    } finally {
      setSaving(false);
    }
  };

  const getStudentName = (id: string) => data.students.find((s: any) => s.id === id)?.name || "طالب غير معروف";

  const getTypeName = (type: string) => {
    switch (type) {
      case 'tuition': return 'قسط دراسي';
      case 'books': return 'رسوم كتب';
      case 'transport': return 'رسوم نقل';
      case 'activities': return 'أنشطة مدرسية';
      default: return 'أخرى';
    }
  };

  const totalInvoiced = data.invoices.reduce((s: number, i: any) => s + Number(i.amount), 0);
  const totalPaid = data.payments.reduce((s: number, p: any) => s + Number(p.amount), 0);
  const outstanding = totalInvoiced - totalPaid;
  const pendingInvoices = data.invoices.filter((i: any) => i.status !== 'paid').length;
  const collectionRate = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;

  const filteredInvoices = data.invoices.filter((inv: any) => {
    if (!searchTerm) return true;
    const studentName = getStudentName(inv.student_id);
    return inv.invoice_number?.includes(searchTerm) || studentName.includes(searchTerm);
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground">جارٍ تحميل البيانات...</div></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">المالية والرسوم</h1>
          <p className="text-muted-foreground">متابعة الأقساط، إصدار الفواتير، والتقارير المالية.</p>
        </div>
        <Sheet open={isIssueInvoiceOpen} onOpenChange={setIsIssueInvoiceOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2"><CreditCard size={16} /> إصدار فاتورة</Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[425px] overflow-y-auto" dir="rtl" side="right">
            <SheetHeader>
              <SheetTitle>إصدار فاتورة جديدة</SheetTitle>
              <SheetDescription>قم بإدخال بيانات الطالب وقيمة الفاتورة.</SheetDescription>
            </SheetHeader>
            {validationError && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mt-4 flex items-center gap-2">
                <AlertCircle size={16} />{validationError}
              </div>
            )}
            <div className="grid gap-6 py-6">
              <div className="grid gap-2">
                <label className="text-sm font-medium">الطالب <span className="text-destructive">*</span></label>
                <SearchableSelect
                  options={data.students.map((s: any) => ({ label: `${s.name} - ${s.student_id}`, value: s.id }))}
                  value={formData.student_id}
                  onChange={val => setFormData({ ...formData, student_id: val })}
                  placeholder="اختر الطالب..."
                  searchPlaceholder="ابحث باسم الطالب..."
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">الوصف</label>
                <Input placeholder="مثال: القسط الدراسي" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">نوع الرسوم</label>
                <Select value={formData.type} onValueChange={val => setFormData({ ...formData, type: val })}>
                  <SelectTrigger><SelectValue placeholder="اختر نوع الرسوم" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tuition">قسط دراسي</SelectItem>
                    <SelectItem value="books">رسوم كتب</SelectItem>
                    <SelectItem value="transport">رسوم نقل</SelectItem>
                    <SelectItem value="activities">أنشطة مدرسية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">المبلغ (د.ل) <span className="text-destructive">*</span></label>
                <Input type="number" placeholder="0" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
              </div>
            </div>
            <SheetFooter>
              <Button onClick={handleIssueInvoice} disabled={saving} className="w-full">
                {saving ? "جارٍ الحفظ..." : "إصدار الفاتورة"}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/10 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div><p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">إجمالي التحصيلات</p><h3 className="text-3xl font-bold text-emerald-900 dark:text-emerald-50 mt-2">{totalPaid.toLocaleString()} د.ل</h3></div>
              <div className="p-2 bg-emerald-200/50 dark:bg-emerald-800/50 rounded-lg text-emerald-700 dark:text-emerald-300"><TrendingUp size={24} /></div>
            </div>
            <div className="mt-4 flex items-center text-sm text-emerald-700 dark:text-emerald-400"><CheckCircle2 size={14} className="mr-1" /><span>تم تحصيل {collectionRate}% من الفواتير</span></div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/10 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div><p className="text-sm font-medium text-orange-800 dark:text-orange-400">مستحقات معلقة</p><h3 className="text-3xl font-bold text-orange-900 dark:text-orange-50 mt-2">{outstanding.toLocaleString()} د.ل</h3></div>
              <div className="p-2 bg-orange-200/50 dark:bg-orange-800/50 rounded-lg text-orange-700 dark:text-orange-300"><DollarSign size={24} /></div>
            </div>
            <div className="mt-4 flex items-center text-sm text-orange-700 dark:text-orange-400"><AlertCircle size={14} className="mr-1" /><span>{pendingInvoices} فاتورة في الانتظار</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div><p className="text-sm font-medium text-muted-foreground">الإجمالي المفوتر</p><h3 className="text-3xl font-bold mt-2">{totalInvoiced.toLocaleString()} د.ل</h3></div>
              <div className="p-2 bg-muted rounded-lg text-muted-foreground"><CreditCard size={24} /></div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">قيمة {data.invoices.length} فاتورة صادرة</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>سجل الفواتير والمعاملات</CardTitle>
          <div className="relative w-64">
            <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث برقم الفاتورة أو اسم الطالب" className="pr-8 h-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length > 0 ? filteredInvoices.map((trx: any) => (
                <TableRow key={trx.id}>
                  <TableCell className="font-mono text-sm">{trx.invoice_number}</TableCell>
                  <TableCell className="font-medium">{getStudentName(trx.student_id)}</TableCell>
                  <TableCell><div className="flex flex-col"><span>{trx.title}</span><span className="text-xs text-muted-foreground">{getTypeName(trx.type)}</span></div></TableCell>
                  <TableCell>{Number(trx.amount).toLocaleString()} د.ل</TableCell>
                  <TableCell>{trx.due_date}</TableCell>
                  <TableCell>
                    <Badge className={trx.status === 'paid' ? 'bg-emerald-500 hover:bg-emerald-600' : trx.status === 'pending' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-500'}>
                      {trx.status === 'paid' ? 'مدفوع' : trx.status === 'pending' ? 'معلق' : 'متأخر'}
                    </Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">لا توجد فواتير.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
