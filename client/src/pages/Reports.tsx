import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area, ComposedChart } from "recharts";
import { TrendingUp, Users, DollarSign, BookOpen } from "lucide-react";
import { useApp } from "@/context/AppContext";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Reports() {
  const { services, db } = useApp();

  const financialStats = services.getOverallFinancialStats();
  const schoolAttendance = services.getSchoolAttendanceStats();

  const gradesData = db.subjects.map(sub => {
     // Mock aggregation for UI
     return { name: sub.name, average: 75 + Math.random() * 20 };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">تقارير ERP الديناميكية</h1>
        <p className="text-muted-foreground">البيانات تعكس حالة الـ State المركزية للنظام</p>
      </div>

      <Tabs defaultValue="academic" className="space-y-6">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-6 space-x-reverse">
          <TabsTrigger value="academic" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3">أكاديمي</TabsTrigger>
          <TabsTrigger value="financial" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3">مالي</TabsTrigger>
          <TabsTrigger value="attendance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3">الحضور</TabsTrigger>
        </TabsList>

        <TabsContent value="academic" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            <Card><CardContent className="p-6 text-center"><Users size={24} className="mx-auto mb-2 text-blue-500"/><h3 className="text-2xl font-bold">{db.students.length}</h3><p className="text-sm text-muted-foreground">طالب مسجل</p></CardContent></Card>
            <Card><CardContent className="p-6 text-center"><BookOpen size={24} className="mx-auto mb-2 text-purple-500"/><h3 className="text-2xl font-bold">{db.subjects.length}</h3><p className="text-sm text-muted-foreground">مقرر دراسي</p></CardContent></Card>
            <Card><CardContent className="p-6 text-center"><TrendingUp size={24} className="mx-auto mb-2 text-emerald-500"/><h3 className="text-2xl font-bold">85%</h3><p className="text-sm text-muted-foreground">متوسط GPA</p></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>أداء المواد</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradesData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="average" fill="#8884d8" barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card><CardContent className="p-6 text-center"><h3 className="text-2xl font-bold text-emerald-600">{financialStats.totalPaid} د.ل</h3><p className="text-sm">إجمالي الإيرادات (المدفوع)</p></CardContent></Card>
            <Card><CardContent className="p-6 text-center"><h3 className="text-2xl font-bold text-orange-600">{financialStats.outstanding} د.ل</h3><p className="text-sm">الديون (معلق)</p></CardContent></Card>
            <Card><CardContent className="p-6 text-center"><h3 className="text-2xl font-bold text-blue-600">{financialStats.totalInvoiced} د.ل</h3><p className="text-sm">إجمالي الفواتير المصدرة</p></CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
           <Card><CardContent className="p-6 text-center"><h3 className="text-4xl font-bold text-emerald-600">{schoolAttendance.toFixed(1)}%</h3><p className="text-sm">معدل الحضور العام للمدرسة</p></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}