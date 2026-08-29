import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bus, Plus, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Transport() {
  const { db } = useApp();
  
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
        {db.routes.map(route => (
          <Card key={route.id}>
            <CardContent className="p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><Bus size={24}/></div>
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
