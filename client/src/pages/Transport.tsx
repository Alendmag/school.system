import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bus, Plus, Users, MapPin, User, ArrowLeftRight } from "lucide-react";

const ROUTE_COLORS = [
  "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
  "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/30 dark:text-cyan-400",
];

export default function Transport() {
  const { db } = useApp();

  const totalCapacity = db.routes.reduce((sum, r) => sum + r.capacity, 0);
  const totalSubscribers = db.students.filter(s => s.transportRoute).length;
  const utilizationRate = totalCapacity > 0 ? Math.round((totalSubscribers / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between page-header">
        <div>
          <h1 className="text-[18px] font-bold text-foreground">إدارة النقل المدرسي</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {db.routes.length} مسار — {totalSubscribers} طالب مشترك
          </p>
        </div>
        <Button size="sm" className="h-8 gap-1.5 text-[12px]" disabled>
          <Plus size={13} /> مسار جديد
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 shrink-0">
              <Bus size={15} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">المسارات</p>
              <p className="text-[18px] font-bold tabular-num leading-tight">{db.routes.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 shrink-0">
              <Users size={15} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">الطلاب المشتركون</p>
              <p className="text-[18px] font-bold tabular-num leading-tight">{totalSubscribers}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 shrink-0">
              <ArrowLeftRight size={15} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">نسبة الاستخدام</p>
              <p className="text-[18px] font-bold tabular-num leading-tight">{utilizationRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Routes grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {db.routes.map((route, i) => {
          const subscribersOnRoute = db.students.filter(s => s.transportRoute === route.id).length;
          const fill = route.capacity > 0 ? (subscribersOnRoute / route.capacity) * 100 : 0;
          const colorClass = ROUTE_COLORS[i % ROUTE_COLORS.length];
          const isNearCapacity = fill >= 85;

          return (
            <Card key={route.id} className="border border-border shadow-sm hover:border-primary/20 hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg shrink-0 ${colorClass}`}>
                    <Bus size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold leading-tight">{route.name}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User size={10} /> السائق: {route.driverId}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={10} /> حافلة: {route.vehicleId}
                      </span>
                    </div>

                    {/* Capacity bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground">الإشغال</span>
                        <span className={`font-semibold tabular-num ${isNearCapacity ? "text-amber-600" : "text-foreground"}`}>
                          {subscribersOnRoute}/{route.capacity}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isNearCapacity ? "bg-amber-400" : "bg-primary"}`}
                          style={{ width: `${Math.min(fill, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {db.routes.length === 0 && (
        <div className="border border-dashed border-border rounded-lg p-12 text-center">
          <Bus size={32} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-[13px] text-muted-foreground">لا توجد مسارات مضافة</p>
        </div>
      )}
    </div>
  );
}
