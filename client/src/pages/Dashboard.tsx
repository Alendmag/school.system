import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, TrendingUp, CalendarCheck, CircleAlert as AlertCircle, School, FileText, Clock, CircleCheck as CheckCircle2, CalendarDays, Receipt } from "lucide-react";

export default function Dashboard() {
  const { currentUser, data, loading } = useApp();

  const StatCard = ({ title, value, icon: Icon, trend, color, trendText = "منذ الأسبوع الماضي" }: any) => (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-card to-muted/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={`p-2 rounded-full bg-${color}-100 text-${color}-600 dark:bg-${color}-900/30 dark:text-${color}-400`}>
            <Icon size={20} />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <h2 className="text-3xl font-bold tracking-tight">{value}</h2>
          <span className="text-xs text-muted-foreground flex items-center font-medium">
            <span className={trend.startsWith('+') ? 'text-emerald-500 ml-1' : trend.startsWith('-') ? 'text-red-500 ml-1' : 'text-blue-500 ml-1'}>
              {trend}
            </span> 
            {trendText}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  const attRecords = data.attendance || [];
  const attPresent = attRecords.filter((a: any) => a.status === 'present' || a.status === 'late').length;
  const attendancePct = attRecords.length > 0 ? (attPresent / attRecords.length) * 100 : 0;

  const AdminDashboard = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="إجمالي الطلاب" value={data.students.length} icon={Users} trend="+2%" color="blue" />
        <StatCard title="الكادر التعليمي" value={data.teachers.length} icon={GraduationCap} trend="ثابت" trendText="هذا الشهر" color="green" />
        <StatCard title="الفصول الدراسية" value={data.classes.length} icon={School} trend="ثابت" trendText="هذا الفصل" color="amber" />
        <StatCard title="نسبة الحضور اليوم" value={`${attendancePct.toFixed(1)}%`} icon={CalendarCheck} trend="+1.5%" trendText="مقارنة بأمس" color="emerald" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-sm">
          <CardHeader><CardTitle>العمليات اليومية</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px] w-full bg-muted/20 rounded-lg flex flex-col items-center justify-center border border-dashed border-border p-6 text-center">
              <TrendingUp size={48} className="text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-sm font-medium">رسم بياني تفاعلي متصل بقاعدة البيانات</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-sm">
          <CardHeader><CardTitle>ملخص سريع</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600"><FileText size={16} /></div>
                <div className="space-y-1">
                  <p className="text-sm font-bold leading-none">الفواتير</p>
                  <p className="text-xs text-muted-foreground">{data.invoices.length} فاتورة مسجلة</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-lg bg-green-50/50 dark:bg-green-900/20 border border-green-100 dark:border-green-900">
                <div className="p-2 rounded-full bg-green-100 text-green-600"><CheckCircle2 size={16} /></div>
                <div className="space-y-1">
                  <p className="text-sm font-bold leading-none">المواد الدراسية</p>
                  <p className="text-xs text-muted-foreground">{data.subjects.length} مادة نشطة</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900">
                <div className="p-2 rounded-full bg-amber-100 text-amber-600"><CalendarDays size={16} /></div>
                <div className="space-y-1">
                  <p className="text-sm font-bold leading-none">الحضور</p>
                  <p className="text-xs text-muted-foreground">{attRecords.length} سجل حضور اليوم</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">مرحباً، {currentUser?.name} 👋</h1>
          <p className="text-muted-foreground mt-1">
            {currentUser?.role === 'admin' && 'نظام ERP التعليمي - متصل بقاعدة البيانات.'}
            {currentUser?.role === 'teacher' && 'بوابتك التعليمية - مهامك، حصصك وطلابك.'}
            {currentUser?.role === 'student' && 'بوابتك الأكاديمية - بياناتك وحضورك.'}
            {currentUser?.role === 'parent' && 'بوابة ولي الأمر - لمتابعة الأبناء.'}
          </p>
        </div>
      </div>
      {currentUser?.role === 'admin' ? <AdminDashboard /> : <Card><CardContent className="p-6 text-center text-muted-foreground">شاشة مخصصة حسب الصلاحية...</CardContent></Card>}
    </div>
  );
}
