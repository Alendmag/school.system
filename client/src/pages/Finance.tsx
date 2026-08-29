import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, DollarSign, TrendingUp, CircleAlert as AlertCircle, CircleCheck as CheckCircle } from 'lucide-react';

export default function Finance() {
  const { data, loading, refreshInvoices } = useApp();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addForm, setAddForm] = useState({ student_id: '', title: 'قسط دراسي', type: 'tuition', amount: '1500' });

  const invoices = (data.invoices || []).filter((inv: any) => {
    if (!search) return true;
    const student = data.students.find((s: any) => s.id === inv.student_id);
    return inv.invoice_number?.includes(search) || student?.name?.includes(search) || inv.title?.includes(search);
  });

  const totalInvoiced = invoices.reduce((s: number, i: any) => s + Number(i.amount), 0);
  const paidInvoices = invoices.filter((i: any) => i.status === 'paid');
  const pendingInvoices = invoices.filter((i: any) => i.status === 'pending');
  const totalPaid = data.payments.reduce((s: number, p: any) => s + Number(p.amount), 0);
  const outstanding = totalInvoiced - totalPaid;

  function getStudentName(studentId: string) {
    return data.students.find((s: any) => s.id === studentId)?.name || '-';
  }

  async function handleAdd() {
    if (!addForm.student_id || !addForm.amount) return;
    setSaving(true);
    try {
      await api.createInvoice(addForm);
      await refreshInvoices();
      setShowAdd(false);
      setAddForm({ student_id: '', title: 'قسط دراسي', type: 'tuition', amount: '1500' });
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">المالية</h1>
        <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 ml-2" /> فاتورة جديدة</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30"><DollarSign className="w-5 h-5 text-blue-600" /></div>
              <div><p className="text-sm text-muted-foreground">إجمالي الفواتير</p><p className="text-2xl font-bold">{totalInvoiced.toLocaleString()} <span className="text-sm font-normal">ر.س</span></p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30"><CheckCircle className="w-5 h-5 text-green-600" /></div>
              <div><p className="text-sm text-muted-foreground">المحصّل</p><p className="text-2xl font-bold">{totalPaid.toLocaleString()} <span className="text-sm font-normal">ر.س</span></p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30"><AlertCircle className="w-5 h-5 text-red-600" /></div>
              <div><p className="text-sm text-muted-foreground">المتبقي</p><p className="text-2xl font-bold">{outstanding.toLocaleString()} <span className="text-sm font-normal">ر.س</span></p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30"><TrendingUp className="w-5 h-5 text-amber-600" /></div>
              <div><p className="text-sm text-muted-foreground">نسبة التحصيل</p><p className="text-2xl font-bold">{totalInvoiced > 0 ? ((totalPaid / totalInvoiced) * 100).toFixed(0) : 0}%</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="بحث في الفواتير..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10" />
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-right p-3 font-medium">رقم الفاتورة</th>
              <th className="text-right p-3 font-medium">الطالب</th>
              <th className="text-right p-3 font-medium hidden md:table-cell">البيان</th>
              <th className="text-right p-3 font-medium">المبلغ</th>
              <th className="text-right p-3 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoices.slice(0, 50).map((inv: any) => (
              <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-3 text-sm font-mono">{inv.invoice_number}</td>
                <td className="p-3">{getStudentName(inv.student_id)}</td>
                <td className="p-3 hidden md:table-cell text-sm text-muted-foreground">{inv.title}</td>
                <td className="p-3 font-medium">{Number(inv.amount).toLocaleString()} ر.س</td>
                <td className="p-3">
                  <Badge variant={inv.status === 'paid' ? 'default' : inv.status === 'pending' ? 'secondary' : 'destructive'}>
                    {inv.status === 'paid' ? 'مدفوعة' : inv.status === 'pending' ? 'معلقة' : 'متأخرة'}
                  </Badge>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">لا توجد فواتير</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>فاتورة جديدة</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>الطالب *</Label>
              <Select value={addForm.student_id} onValueChange={v => setAddForm({ ...addForm, student_id: v })}>
                <SelectTrigger><SelectValue placeholder="اختر الطالب" /></SelectTrigger>
                <SelectContent>{data.students.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name} - {s.student_id}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>البيان</Label><Input value={addForm.title} onChange={e => setAddForm({ ...addForm, title: e.target.value })} /></div>
            <div><Label>المبلغ *</Label><Input type="number" value={addForm.amount} onChange={e => setAddForm({ ...addForm, amount: e.target.value })} /></div>
            <Button onClick={handleAdd} disabled={saving || !addForm.student_id || !addForm.amount} className="w-full">{saving ? 'جاري الحفظ...' : 'إنشاء الفاتورة'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
