import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Plus, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Maintenance() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">المرافق والصيانة</h1>
          <p className="text-muted-foreground">إدارة بلاغات الصيانة، تنظيف المباني، والمعدات.</p>
        </div>
        <Button className="gap-2"><Plus size={16} /> بلاغ جديد</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex gap-4 items-start">
            <AlertCircle className="text-red-500 mt-1" />
            <div>
              <h3 className="font-bold text-red-800">صيانة عاجلة (مكيف الفصل 3ب)</h3>
              <p className="text-red-700 text-sm mt-1">تم الإبلاغ عن تعطل المكيف بشكل كامل. مقدم البلاغ: أ. نورة الأحمد.</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-6 flex gap-4 items-start">
            <CheckCircle2 className="text-emerald-500 mt-1" />
            <div>
              <h3 className="font-bold text-emerald-800">اكتمل: صيانة معمل الحاسب</h3>
              <p className="text-emerald-700 text-sm mt-1">تم تغيير 5 شاشات معطلة وتحديث الشبكة المحلية.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
