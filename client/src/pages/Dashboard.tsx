import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, GraduationCap, BookOpen, TrendingUp, CalendarCheck, AlertCircle, School, FileText, Clock, CheckCircle2, CalendarDays, Receipt
} from "lucide-react";

export default function Dashboard() {
  const { currentUser, db, services } = useApp();

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

  const notifications = services.getNotificationsForUser(currentUser);

  // Admin Dashboard View dynamically calculated from DB
  const AdminDashboard = () => {
    const schoolAttendance = services.getSchoolAttendanceStats();
    
    return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="إجمالي الطلاب" value={db.students.length} icon={Users} trend="+2%" color="blue" />
        <StatCard title="الكادر التعليمي" value={db.teachers.length} icon={GraduationCap} trend="ثابت" trendText="هذا الشهر" color="purple" />
        <StatCard title="الفصول الدراسية" value={db.classes.length} icon={School} trend="ثابت" trendText="هذا الفصل" color="amber" />
        <StatCard title="نسبة الحضور اليوم" value={`${schoolAttendance.toFixed(1)}%`} icon={CalendarCheck} trend="+1.5%" trendText="مقارنة بأمس" color="emerald" />
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
          <CardHeader><CardTitle>مركز الإشعارات</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.slice(0, 4).map(n => (
                <div key={n.id} className={`flex items-start gap-4 p-3 rounded-lg border ${n.type === 'alert' ? 'bg-red-50/50 border-red-100' : n.type === 'finance' ? 'bg-orange-50/50 border-orange-100' : 'hover:bg-muted/50 border-transparent hover:border-border'}`}>
                  <div className={`p-2 rounded-full shrink-0 ${n.type === 'alert' ? 'bg-red-100 text-red-600' : n.type === 'finance' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                    {n.type === 'alert' ? <AlertCircle size={16} /> : n.type === 'finance' ? <Receipt size={16} /> : <FileText size={16}/>}
                  </div>
                  <div className="space-y-1">
                    <p className={`text-sm font-bold leading-none ${n.type === 'alert' ? 'text-red-800' : n.type === 'finance' ? 'text-orange-800' : ''}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && <p className="text-sm text-muted-foreground text-center">لا توجد إشعارات جديدة</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )};

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">مرحباً، {currentUser?.name} 👋</h1>
          <p className="text-muted-foreground mt-1">
            {currentUser?.role === 'admin' && 'نظام ERP التعليمي - متصل بالبيانات الموحدة.'}
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