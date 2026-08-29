import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bus, Plus, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const staticRoutes = [
  { id: "1", name: "مسار الشمال", driverId: "سائق 1", vehicleId: "حافلة أ", capacity: 40 },
  { id: "2", name: "مسار الجنوب", driverId: "سائق 2", vehicleId: "حافلة ب", capacity: 35 },
  { id: "3", name: "مسار الشرق", driverId: "سائق 3", vehicleId: "حافلة ج", capacity: 30 },
];

export default function Transport() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إدارة النقل المدرسي</h1>
          <p className="text-muted-foreground">تتبع المسارات، الحافلات، واشتراكات الطلاب.</p>
        </div>
        <Button className="gap-2"><Plus size={16} /> مسار جديد</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staticRoutes.map(route => (
          <Card key={route.id}>
            <CardContent className="p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full"><Bus size={24}/></div>
                <div>
                  <h3 className="font-bold text-lg">{route.name}</h3>
                  <p className="text-sm text-muted-foreground">السائق: {route.driverId} | الحافلة: {route.vehicleId}</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">الطاقة الاستيعابية</p>
                <Badge variant="secondary" className="mt-1 text-lg py-1 px-3"><Users size={14} className="mr-2 ml-1"/> {route.capacity}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
