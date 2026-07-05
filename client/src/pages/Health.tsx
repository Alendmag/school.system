import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeartPulse, Plus, AlertTriangle } from "lucide-react";

export default function Health() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">العيادة المدرسية</h1>
          <p className="text-muted-foreground">السجل الطبي للطلاب والتطعيمات والطوارئ.</p>
        </div>
        <Button className="gap-2"><Plus size={16} /> تسجيل زيارة</Button>
      </div>

      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6 flex gap-4 items-start">
          <AlertTriangle className="text-orange-500 mt-1" />
          <div>
            <h3 className="font-bold text-orange-800">تنبيهات الحساسية والأمراض المزمنة</h3>
            <p className="text-orange-700 text-sm mt-1">يوجد 12 طالباً مسجلاً بحالات ربو، و 4 حالات حساسية طعام. يرجى إبلاغ المشرفين.</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center py-20 text-muted-foreground">
        <HeartPulse size={48} className="mx-auto mb-4 opacity-20" />
        <p>لا توجد زيارات مسجلة للعيادة اليوم.</p>
      </div>
    </div>
  );
}
