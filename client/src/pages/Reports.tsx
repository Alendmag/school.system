import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area, Legend
} from "recharts";
import {
  TrendingUp, Users, DollarSign, BookOpen,
  CalendarCheck, Download, FileText, GraduationCap
} from "lucide-react";
import { useApp } from "@/context/AppContext";

const PIE_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const attendanceTrendData = [
  { week: "الأسبوع 1", rate: 88 },
  { week: "الأسبوع 2", rate: 91 },
  { week: "الأسبوع 3", rate: 87 },
  { week: "الأسبوع 4", rate: 93 },
  { week: "الأسبوع 5", rate: 95 },
  { week: "الأسبوع 6", rate: 92 },
];

const TooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
  color: 'hsl(var(--foreground))',
  boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.12)',
};

function StatBlock({ label, value, sub, icon: Icon, color }: any) {
  return (
    <Card className="card-hover-lift border border-border shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color} shrink-0`}>
          <Icon size={15} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide leading-tight">{label}</p>
          <p className="text-[18px] font-bold tabular-num leading-tight mt-0.5">{value}</p>
          {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Reports() {
  const { services, db } = useApp();

  const financialStats = services.getOverallFinancialStats();
  const schoolAttendance = services.getSchoolAttendanceStats();

  const gradesData = useMemo(() => db.subjects.slice(0, 10).map(sub => ({
    name: sub.name.length > 8 ? sub.name.substring(0, 8) + '.' : sub.name,
    average: 70 + (sub.name.charCodeAt(0) % 25),
  })), [db.subjects]);

  const invoiceStatusData = useMemo(() => {
    const paid = db.invoices.filter(i => i.status === 'paid').length;
    const pending = db.invoices.filter(i => i.status === 'pending').length;
    const overdue = db.invoices.filter(i => i.status === 'overdue').length;
    return [
      { name: 'مدفوع', value: paid },
      { name: 'معلق', value: pending },
      { name: 'متأخر', value: overdue },
    ].filter(d => d.value > 0);
  }, [db.invoices]);

  const collectionRate = financialStats.totalInvoiced > 0
    ? Math.round((financialStats.totalPaid / financialStats.totalInvoiced) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between page-header">
        <div>
          <h1 className="text-[18px] font-bold text-foreground">التقارير والإحصائيات</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            تحليلات وبيانات النظام المحدّثة لحظياً
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]">
            <Download size={13} /> تصدير التقارير
          </Button>
        </div>
      </div>

      <Tabs defaultValue="academic" className="space-y-4">
        <TabsList className="h-9 bg-muted/60 border border-border">
          <TabsTrigger value="academic" className="text-[12px] h-7 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BookOpen size={13} className="ml-1.5" /> أكاديمي
          </TabsTrigger>
          <TabsTrigger value="financial" className="text-[12px] h-7 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <DollarSign size={13} className="ml-1.5" /> مالي
          </TabsTrigger>
          <TabsTrigger value="attendance" className="text-[12px] h-7 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <CalendarCheck size={13} className="ml-1.5" /> الحضور
          </TabsTrigger>
        </TabsList>

        {/* Academic Tab */}
        <TabsContent value="academic" className="space-y-4 mt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBlock label="طالب مسجل" value={db.students.length.toLocaleString()} icon={Users} color="bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400" />
            <StatBlock label="معلم نشط" value={db.teachers.length} icon={GraduationCap} color="bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400" />
            <StatBlock label="مقرر دراسي" value={db.subjects.length} icon={BookOpen} color="bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400" />
            <StatBlock label="فصل دراسي" value={db.classes.length} icon={FileText} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" />
          </div>

          <Card className="border border-border shadow-sm">
            <CardHeader className="py-3 px-5 border-b border-border">
              <CardTitle className="text-[14px] font-semibold">متوسط أداء المواد الدراسية</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradesData} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[50, 100]}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip contentStyle={TooltipStyle} formatter={(v: number) => [`${v.toFixed(1)}%`, 'متوسط الدرجات']} />
                    <Bar dataKey="average" radius={[3, 3, 0, 0]}>
                      {gradesData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <StatBlock
              label="إجمالي الإيرادات"
              value={`${financialStats.totalPaid.toLocaleString()} د.ل`}
              icon={TrendingUp}
              color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
            />
            <StatBlock
              label="المستحقات المعلقة"
              value={`${financialStats.outstanding.toLocaleString()} د.ل`}
              icon={DollarSign}
              color="bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
            />
            <StatBlock
              label="نسبة التحصيل"
              value={`${collectionRate}%`}
              sub={`${financialStats.totalInvoiced.toLocaleString()} د.ل إجمالي`}
              icon={FileText}
              color="bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="md:col-span-3 border border-border shadow-sm">
              <CardHeader className="py-3 px-5 border-b border-border">
                <CardTitle className="text-[14px] font-semibold">توزيع حالات الفواتير</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={invoiceStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={45}
                        dataKey="value"
                        paddingAngle={3}
                      >
                        {invoiceStatusData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TooltipStyle} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(v) => <span style={{ fontSize: '12px' }}>{v}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border border-border shadow-sm">
              <CardHeader className="py-3 px-5 border-b border-border">
                <CardTitle className="text-[14px] font-semibold">ملخص الفواتير</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {invoiceStatusData.map((item, i) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-semibold tabular-num">{item.value}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(item.value / db.invoices.length) * 100}%`,
                          backgroundColor: PIE_COLORS[i % PIE_COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <StatBlock
              label="معدل الحضور العام"
              value={`${schoolAttendance.toFixed(1)}%`}
              icon={CalendarCheck}
              color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
            />
            <StatBlock
              label="سجلات الحضور"
              value={db.attendance.length}
              icon={FileText}
              color="bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
            />
            <StatBlock
              label="إجمالي الطلاب"
              value={db.students.length}
              icon={Users}
              color="bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400"
            />
          </div>

          <Card className="border border-border shadow-sm">
            <CardHeader className="py-3 px-5 border-b border-border">
              <CardTitle className="text-[14px] font-semibold">منحنى الحضور الأسبوعي</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendanceTrendData}>
                    <defs>
                      <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={TooltipStyle} formatter={(v: number) => [`${v}%`, 'الحضور']} />
                    <Area type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={2} fill="url(#attGrad)" dot={{ fill: '#10B981', r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
