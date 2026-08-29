import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, GraduationCap, DollarSign, CircleCheck as CheckCircle, BookOpen, TrendingUp } from 'lucide-react';

export default function Reports() {
  const { loading: appLoading } = useApp();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appLoading) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await api.getReportSummary();
        if (!cancelled) setReport(data);
      } catch (e) { console.error(e); }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [appLoading]);

  if (loading || !report) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  const c = report.counts || {};
  const f = report.finance || {};
  const a = report.attendance || {};
  const ac = report.academic || {};

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">التقارير والإحصائيات</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card><CardContent className="pt-6 text-center">
          <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
          <p className="text-3xl font-bold">{c.students}</p><p className="text-sm text-muted-foreground">طالب</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <GraduationCap className="w-8 h-8 mx-auto mb-2 text-green-600" />
          <p className="text-3xl font-bold">{c.teachers}</p><p className="text-sm text-muted-foreground">معلم</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-amber-600" />
          <p className="text-3xl font-bold">{c.classes}</p><p className="text-sm text-muted-foreground">فصل</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <DollarSign className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
          <p className="text-3xl font-bold">{f.totalPaid?.toLocaleString()}</p><p className="text-sm text-muted-foreground">محصّل (ر.س)</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-teal-600" />
          <p className="text-3xl font-bold">{a.percentage?.toFixed(0)}%</p><p className="text-sm text-muted-foreground">نسبة الحضور</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-cyan-600" />
          <p className="text-3xl font-bold">{ac.overallGPA?.toFixed(1)}%</p><p className="text-sm text-muted-foreground">المعدل العام</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>الملخص المالي</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span>إجمالي الفواتير</span><span className="font-bold">{f.totalInvoiced?.toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <span>المحصّل</span><span className="font-bold text-green-600">{f.totalPaid?.toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                <span>المتبقي</span><span className="font-bold text-red-600">{f.outstanding?.toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span>فواتير مدفوعة</span><Badge>{f.paidInvoiceCount}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span>فواتير معلقة</span><Badge variant="secondary">{f.pendingInvoiceCount}</Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-3 mt-2">
                <div className="bg-green-600 h-3 rounded-full transition-all" style={{ width: `${f.totalInvoiced > 0 ? (f.totalPaid / f.totalInvoiced) * 100 : 0}%` }} />
              </div>
              <p className="text-center text-sm text-muted-foreground">نسبة التحصيل: {f.totalInvoiced > 0 ? ((f.totalPaid / f.totalInvoiced) * 100).toFixed(0) : 0}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>أداء المواد الدراسية</CardTitle></CardHeader>
          <CardContent>
            {(ac.subjectAverages || []).length > 0 ? (
              <div className="space-y-3">
                {ac.subjectAverages.map((sub: any) => (
                  <div key={sub.id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{sub.name}</span>
                      <span className="text-sm font-bold">{sub.average?.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="h-2.5 rounded-full transition-all" style={{ width: `${sub.average}%`, backgroundColor: sub.average >= 80 ? '#16a34a' : sub.average >= 60 ? '#eab308' : '#dc2626' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-center py-8 text-muted-foreground">لا توجد بيانات درجات بعد</p>}
          </CardContent>
        </Card>
      </div>

      {(a.byClass || []).length > 0 && (
        <Card>
          <CardHeader><CardTitle>الحضور حسب الفصل</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-right p-3 font-medium">الفصل</th>
                    <th className="text-right p-3 font-medium">إجمالي السجلات</th>
                    <th className="text-right p-3 font-medium">حضور</th>
                    <th className="text-right p-3 font-medium">نسبة الحضور</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {a.byClass.map((cls: any, i: number) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="p-3 font-medium">{cls.className}</td>
                      <td className="p-3">{cls.total}</td>
                      <td className="p-3">{cls.present}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-2"><div className="h-2 rounded-full bg-green-600" style={{ width: `${cls.percentage}%` }} /></div>
                          <span className="text-sm font-medium">{cls.percentage?.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {report.studentsByGrade && Object.keys(report.studentsByGrade).length > 0 && (
        <Card>
          <CardHeader><CardTitle>توزيع الطلاب حسب المرحلة</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {Object.entries(report.studentsByGrade).sort(([a],[b]) => Number(a)-Number(b)).map(([grade, count]) => (
                <div key={grade} className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{count as number}</p>
                  <p className="text-xs text-muted-foreground">الصف {grade}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
