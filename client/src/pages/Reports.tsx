import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, DollarSign, BookOpen, GraduationCap, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { useApp } from "@/context/AppContext";

const COLORS = ['#059669', '#0284c7', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

export default function Reports() {
  const { loading: appLoading } = useApp();
  const [report, setReport] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReport() {
      if (appLoading) return;
      setLoadingReport(true);
      try {
        const data = await api.getReportSummary();
        setReport(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingReport(false);
      }
    }
    loadReport();
  }, [appLoading]);

  if (loadingReport || appLoading) {
    return <div className="flex items-center justify-center h-64"><span className="text-muted-foreground">جارٍ تحميل التقارير...</span></div>;
  }

  if (error || !report) {
    return <div className="flex items-center justify-center h-64"><span className="text-destructive">فشل تحميل التقارير: {error}</span></div>;
  }

  const { counts, finance, attendance, academic, studentsByGrade } = report;

  const financeTypeLabels: Record<string, string> = {
    tuition: 'أقساط دراسية', books: 'رسوم كتب', transport: 'رسوم نقل', activities: 'أنشطة', other: 'أخرى'
  };

  const financeByTypeData = Object.entries(finance.byType || {}).map(([type, amount]) => ({
    name: financeTypeLabels[type] || type,
    value: Number(amount),
  }));

  const gradeDistData = Object.entries(studentsByGrade || {})
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([grade, count]) => ({
      name: `الصف ${grade}`,
      students: count,
    }));

  const subjectData = (academic.subjectAverages || []).map((s: any) => ({
    name: s.name,
    average: Math.round(s.average * 10) / 10,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">التقارير والإحصائيات</h1>
        <p className="text-muted-foreground">بيانات مباشرة من قاعدة البيانات - بدون بيانات عشوائية أو وهمية</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="border-r-4 border-r-sky-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلاب</p>
                <p className="text-3xl font-bold mt-1">{counts.students}</p>
                <p className="text-xs text-muted-foreground mt-1">{counts.activeStudents} نشط</p>
              </div>
              <Users className="text-sky-500" size={32} />
            </div>
          </CardContent>
        </Card>
        <Card className="border-r-4 border-r-emerald-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المعلمين</p>
                <p className="text-3xl font-bold mt-1">{counts.teachers}</p>
                <p className="text-xs text-muted-foreground mt-1">{counts.classes} فصل</p>
              </div>
              <GraduationCap className="text-emerald-500" size={32} />
            </div>
          </CardContent>
        </Card>
        <Card className="border-r-4 border-r-amber-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">نسبة الحضور</p>
                <p className="text-3xl font-bold mt-1">{attendance.total > 0 ? attendance.percentage.toFixed(1) : '0'}%</p>
                <p className="text-xs text-muted-foreground mt-1">{attendance.total} سجل</p>
              </div>
              <CheckCircle2 className="text-amber-500" size={32} />
            </div>
          </CardContent>
        </Card>
        <Card className="border-r-4 border-r-rose-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المعدل الأكاديمي</p>
                <p className="text-3xl font-bold mt-1">{academic.overallGPA > 0 ? academic.overallGPA.toFixed(1) : '0'}%</p>
                <p className="text-xs text-muted-foreground mt-1">{academic.gradedStudents} طالب مقيّم</p>
              </div>
              <TrendingUp className="text-rose-500" size={32} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="financial" className="space-y-6">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-6 space-x-reverse">
          <TabsTrigger value="financial" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3">مالي</TabsTrigger>
          <TabsTrigger value="academic" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3">أكاديمي</TabsTrigger>
          <TabsTrigger value="attendance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3">الحضور</TabsTrigger>
        </TabsList>

        {/* Financial Report */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="mx-auto mb-2 text-emerald-600" size={28} />
                <p className="text-sm text-emerald-800 dark:text-emerald-400">إجمالي التحصيلات</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-50 mt-1">{finance.totalPaid.toLocaleString()} د.ل</p>
                <p className="text-xs text-emerald-700 mt-1">{finance.paidInvoiceCount} فاتورة مدفوعة</p>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200">
              <CardContent className="p-6 text-center">
                <Clock className="mx-auto mb-2 text-orange-600" size={28} />
                <p className="text-sm text-orange-800 dark:text-orange-400">المستحقات المعلقة</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-50 mt-1">{finance.outstanding.toLocaleString()} د.ل</p>
                <p className="text-xs text-orange-700 mt-1">{finance.pendingInvoiceCount} فاتورة معلقة</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <DollarSign className="mx-auto mb-2 text-blue-600" size={28} />
                <p className="text-sm text-muted-foreground">إجمالي الفواتير</p>
                <p className="text-2xl font-bold mt-1">{finance.totalInvoiced.toLocaleString()} د.ل</p>
                <Progress value={finance.totalInvoiced > 0 ? (finance.totalPaid / finance.totalInvoiced) * 100 : 0} className="mt-3" />
                <p className="text-xs text-muted-foreground mt-1">نسبة التحصيل: {finance.totalInvoiced > 0 ? Math.round((finance.totalPaid / finance.totalInvoiced) * 100) : 0}%</p>
              </CardContent>
            </Card>
          </div>

          {financeByTypeData.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">توزيع الفواتير حسب النوع</CardTitle></CardHeader>
                <CardContent className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={financeByTypeData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {financeByTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value.toLocaleString()} د.ل`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">الفواتير حسب النوع (جدول)</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead className="text-right">النوع</TableHead><TableHead className="text-right">المبلغ</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {financeByTypeData.map((item, i) => (
                        <TableRow key={i}><TableCell>{item.name}</TableCell><TableCell>{item.value.toLocaleString()} د.ل</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Academic Report */}
        <TabsContent value="academic" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardContent className="p-6 text-center">
              <BookOpen className="mx-auto mb-2 text-sky-500" size={28} />
              <p className="text-sm text-muted-foreground">المقررات الدراسية</p>
              <p className="text-3xl font-bold mt-1">{counts.subjects}</p>
            </CardContent></Card>
            <Card><CardContent className="p-6 text-center">
              <TrendingUp className="mx-auto mb-2 text-emerald-500" size={28} />
              <p className="text-sm text-muted-foreground">المعدل العام</p>
              <p className="text-3xl font-bold mt-1">{academic.overallGPA > 0 ? academic.overallGPA.toFixed(1) : '0'}%</p>
              {academic.gradedStudents === 0 && <p className="text-xs text-muted-foreground mt-1">لا توجد درجات مسجلة بعد</p>}
            </CardContent></Card>
            <Card><CardContent className="p-6 text-center">
              <Users className="mx-auto mb-2 text-amber-500" size={28} />
              <p className="text-sm text-muted-foreground">الطلاب المقيّمون</p>
              <p className="text-3xl font-bold mt-1">{academic.gradedStudents}</p>
              <p className="text-xs text-muted-foreground mt-1">من أصل {counts.students} طالب</p>
            </CardContent></Card>
          </div>

          {subjectData.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">متوسط الأداء حسب المادة</CardTitle></CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectData} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Bar dataKey="average" fill="#059669" barSize={24} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {gradeDistData.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">توزيع الطلاب حسب المرحلة الدراسية</CardTitle></CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeDistData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Bar dataKey="students" fill="#0284c7" barSize={32} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Attendance Report */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="mx-auto mb-2 text-emerald-600" size={28} />
                <p className="text-sm text-emerald-800 dark:text-emerald-400">نسبة الحضور العامة</p>
                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-50 mt-1">{attendance.total > 0 ? attendance.percentage.toFixed(1) : '0'}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="mx-auto mb-2 text-sky-500" size={28} />
                <p className="text-sm text-muted-foreground">إجمالي سجلات الحضور</p>
                <p className="text-3xl font-bold mt-1">{attendance.total}</p>
                <p className="text-xs text-muted-foreground mt-1">{attendance.present} حاضر / {attendance.absent} غائب</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="mx-auto mb-2 text-red-500" size={28} />
                <p className="text-sm text-muted-foreground">نسبة الغياب</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{attendance.total > 0 ? ((attendance.absent / attendance.total) * 100).toFixed(1) : '0'}%</p>
              </CardContent>
            </Card>
          </div>

          {attendance.byClass && attendance.byClass.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">الحضور حسب الفصل</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الفصل</TableHead>
                      <TableHead className="text-right">إجمالي السجلات</TableHead>
                      <TableHead className="text-right">الحضور</TableHead>
                      <TableHead className="text-right">النسبة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.byClass.map((cls: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{cls.className}</TableCell>
                        <TableCell>{cls.total}</TableCell>
                        <TableCell>{cls.present}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={cls.percentage} className="w-20" />
                            <span className="text-sm">{cls.percentage.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
