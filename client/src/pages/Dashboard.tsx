import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, CalendarCheck, School, TrendingUp, TrendingDown, CircleAlert as AlertCircle, Receipt, FileText, ArrowUpRight, Clock, CircleCheck as CheckCircle2, MoveHorizontal as MoreHorizontal, CreditCard, Activity } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";

const attendanceWeekData = [
  { day: "الأحد",  present: 92, absent: 8 },
  { day: "الاثنين", present: 88, absent: 12 },
  { day: "الثلاثاء", present: 95, absent: 5 },
  { day: "الأربعاء", present: 91, absent: 9 },
  { day: "الخميس", present: 87, absent: 13 },
];

const collectionData = [
  { month: "سبت", amount: 48200 },
  { month: "أكت", amount: 62100 },
  { month: "نوف", amount: 55800 },
  { month: "ديس", amount: 71300 },
  { month: "يناير", amount: 68900 },
  { month: "فبر", amount: 79400 },
];

const CHART_COLOR = "#2563EB";
const CHART_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  accent: string;
  iconBg: string;
  iconColor: string;
}

function KpiCard({ title, value, subtitle, icon: Icon, trend, trendLabel, accent, iconBg, iconColor }: KpiCardProps) {
  const isPositive = trend === undefined || trend >= 0;
  return (
    <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className={`text-2xl font-bold mt-1.5 tabular-num kpi-value ${accent}`}>{value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className={`p-2.5 rounded-lg ${iconBg} shrink-0`}>
            <Icon size={18} className={iconColor} />
          </div>
        </div>
        {trend !== undefined && (
          <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5">
            {isPositive
              ? <TrendingUp size={12} className="text-emerald-500" />
              : <TrendingDown size={12} className="text-red-500" />
            }
            <span className={`text-[11px] font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{trend}%
            </span>
            <span className="text-[11px] text-muted-foreground">{trendLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AdminDashboard() {
  const { db, services } = useApp();
  const attendance = services.getSchoolAttendanceStats();
  const financials = services.getOverallFinancialStats();

  const recentInvoices = db.invoices
    .filter(inv => inv.status !== 'paid')
    .slice(0, 5);

  const getStudentName = (id: string) =>
    db.students.find(s => s.id === id)?.name?.split(' ').slice(0, 2).join(' ') || '---';

  const collectionRate = financials.totalInvoiced > 0
    ? Math.round((financials.totalPaid / financials.totalInvoiced) * 100)
    : 0;

  return (
    <div className="space-y-5">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="إجمالي الطلاب"
          value={db.students.length.toLocaleString()}
          subtitle={`في ${db.classes.length} فصل دراسي`}
          icon={Users}
          trend={2}
          trendLabel="عن الشهر الماضي"
          accent="text-foreground"
          iconBg="bg-blue-50 dark:bg-blue-950/40"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <KpiCard
          title="الكادر التعليمي"
          value={db.teachers.length}
          subtitle="معلم وموظف نشط"
          icon={GraduationCap}
          accent="text-foreground"
          iconBg="bg-purple-50 dark:bg-purple-950/40"
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <KpiCard
          title="نسبة الحضور"
          value={`${attendance.toFixed(1)}%`}
          subtitle="متوسط هذا الأسبوع"
          icon={CalendarCheck}
          trend={1.5}
          trendLabel="مقارنة بالأسبوع"
          accent={attendance >= 90 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <KpiCard
          title="نسبة التحصيل"
          value={`${collectionRate}%`}
          subtitle={`${financials.totalPaid.toLocaleString()} د.ل محصّلة`}
          icon={CreditCard}
          trend={collectionRate >= 70 ? 3 : -2}
          trendLabel="عن الفصل الماضي"
          accent={collectionRate >= 70 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}
          iconBg="bg-amber-50 dark:bg-amber-950/40"
          iconColor="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Attendance Chart */}
        <Card className="lg:col-span-3 border border-border shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[14px] font-semibold">الحضور الأسبوعي</CardTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">نسبة الحضور لكل يوم من أيام الأسبوع</p>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 text-[11px]">
                <Activity size={10} className="ml-1" /> مباشر
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceWeekData} barGap={4} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    domain={[70, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number, name: string) => [
                      `${value}%`,
                      name === 'present' ? 'حاضر' : 'غائب'
                    ]}
                  />
                  <Bar dataKey="present" fill="#2563EB" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Financial Overview */}
        <Card className="lg:col-span-2 border border-border shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-[14px] font-semibold">التحصيل المالي</CardTitle>
            <p className="text-[11px] text-muted-foreground">آخر 6 أشهر بالدينار الليبي</p>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={collectionData}>
                  <defs>
                    <linearGradient id="collectGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                    formatter={(v: number) => [`${v.toLocaleString()} د.ل`, 'التحصيل']}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fill="url(#collectGrad)"
                    dot={{ fill: '#2563EB', r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Pending Invoices */}
        <Card className="lg:col-span-3 border border-border shadow-sm">
          <CardHeader className="pb-0 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[14px] font-semibold">الفواتير المعلقة</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-[12px] text-primary px-2">
                عرض الكل <ArrowUpRight size={12} className="mr-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-3">
            {recentInvoices.length === 0 ? (
              <div className="h-32 flex items-center justify-center">
                <div className="text-center">
                  <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-2" />
                  <p className="text-[12px] text-muted-foreground">لا توجد فواتير معلقة</p>
                </div>
              </div>
            ) : (
              <div className="space-y-0 divide-y divide-border">
                {recentInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between py-2.5 group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        inv.status === 'pending' ? 'bg-amber-400' : 'bg-red-500'
                      }`} />
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium truncate">{getStudentName(inv.studentId)}</p>
                        <p className="text-[11px] text-muted-foreground">{inv.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[13px] font-semibold tabular-num">
                        {inv.amount.toLocaleString()} <span className="text-muted-foreground font-normal text-[11px]">د.ل</span>
                      </span>
                      <Badge className={`text-[10px] ${inv.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800'
                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800'
                      }`}>
                        {inv.status === 'pending' ? 'معلق' : 'متأخر'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="lg:col-span-2 border border-border shadow-sm">
          <CardHeader className="pb-0 pt-4 px-5">
            <CardTitle className="text-[14px] font-semibold">ملخص سريع</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-3 space-y-3">
            {[
              { label: "فواتير معلقة", value: db.invoices.filter(i => i.status !== 'paid').length, icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
              { label: "إجمالي الفواتير", value: db.invoices.length, icon: Receipt, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
              { label: "المواد الدراسية", value: db.subjects.length, icon: FileText, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
              { label: "الفصول النشطة", value: db.classes.length, icon: School, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`p-1.5 rounded-md ${item.bg} shrink-0`}>
                  <item.icon size={13} className={item.color} />
                </div>
                <span className="text-[12px] text-muted-foreground flex-1">{item.label}</span>
                <span className="text-[13px] font-bold tabular-num">{item.value}</span>
              </div>
            ))}

            <div className="pt-2 border-t border-border">
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
                <span>نسبة التحصيل</span>
                <span className="font-semibold text-foreground">{collectionRate}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(collectionRate, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { currentUser } = useApp();

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return 'صباح الخير';
    if (h < 17) return 'مساء الخير';
    return 'مساء النور';
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-foreground leading-tight">
            {greetingTime()}، {currentUser?.name?.split(' ')[0]}
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {currentUser?.role === 'admin' && 'لوحة التحكم الرئيسية — نظرة شاملة على النظام'}
            {currentUser?.role === 'teacher' && 'بوابتك التعليمية — مهامك وحصصك اليومية'}
            {currentUser?.role === 'student' && 'بوابتك الأكاديمية — متابعة مستواك ونتائجك'}
            {currentUser?.role === 'parent' && 'بوابة المتابعة — تابع تقدم أبنائك'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground bg-muted/60 border border-border px-3 py-1.5 rounded-md">
          <Clock size={12} />
          {new Date().toLocaleDateString('ar-LY', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {currentUser?.role === 'admin'
        ? <AdminDashboard />
        : (
          <Card className="border border-border shadow-sm">
            <CardContent className="p-10 text-center">
              <School size={40} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-[13px] text-muted-foreground">لوحة تحكم مخصصة حسب الصلاحية — قريباً</p>
            </CardContent>
          </Card>
        )
      }
    </div>
  );
}
