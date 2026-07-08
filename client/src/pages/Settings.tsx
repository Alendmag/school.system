import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, Upload, Globe, Palette, Shield, BookOpen, Building } from "lucide-react";

export default function SettingsPage() {
  const { institution, setInstitution } = useApp();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between page-header">
        <div>
          <h1 className="text-[18px] font-bold text-foreground">إعدادات النظام</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            تخصيص بيانات المدرسة والمراحل الدراسية والمظهر العام
          </p>
        </div>
        <Button size="sm" className="h-8 gap-1.5 text-[12px]">
          <Save size={13} />
          حفظ التغييرات
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="h-9 bg-muted/60 border border-border">
          <TabsTrigger value="general" className="text-[12px] h-7 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Building size={13} /> عام
          </TabsTrigger>
          <TabsTrigger value="stages" className="text-[12px] h-7 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BookOpen size={13} /> المراحل
          </TabsTrigger>
          <TabsTrigger value="appearance" className="text-[12px] h-7 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Palette size={13} /> المظهر
          </TabsTrigger>
          <TabsTrigger value="permissions" className="text-[12px] h-7 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Shield size={13} /> الصلاحيات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card className="border border-border shadow-sm">
            <CardHeader className="py-4 px-5 border-b border-border">
              <CardTitle className="text-[14px] font-semibold">بيانات المدرسة الأساسية</CardTitle>
              <CardDescription className="text-[12px] mt-0.5">
                تُستخدم هذه البيانات في التقارير والشهادات الرسمية
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="inst-name" className="text-[12px] font-semibold">اسم المدرسة</Label>
                <Input
                  id="inst-name"
                  className="h-9 text-[13px] max-w-md"
                  value={institution.name}
                  onChange={(e) => setInstitution({ ...institution, name: e.target.value })}
                  placeholder="مثال: مدرسة المناهل الدولية"
                />
              </div>

              <div className="grid gap-1.5">
                <Label className="text-[12px] font-semibold">شعار المدرسة</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center border border-dashed border-border">
                    <Building size={20} className="text-muted-foreground/40" />
                  </div>
                  <div className="space-y-1.5">
                    <Button variant="outline" size="sm" className="h-8 text-[12px]" disabled>
                      <Upload size={12} className="ml-1.5" />
                      رفع شعار
                    </Button>
                    <p className="text-[11px] text-muted-foreground">PNG, JPG, SVG — حد أقصى 2MB</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="inst-email" className="text-[12px] font-semibold">البريد الرسمي</Label>
                <Input
                  id="inst-email"
                  type="email"
                  className="h-9 text-[13px] max-w-md"
                  placeholder="admin@school.edu.ly"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="inst-phone" className="text-[12px] font-semibold">رقم الهاتف</Label>
                <Input
                  id="inst-phone"
                  className="h-9 text-[13px] max-w-xs"
                  placeholder="021-0000000"
                  dir="ltr"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stages" className="mt-4 space-y-4">
          <Card className="border border-border shadow-sm">
            <CardHeader className="py-4 px-5 border-b border-border">
              <CardTitle className="text-[14px] font-semibold">هيكل المراحل الدراسية</CardTitle>
              <CardDescription className="text-[12px] mt-0.5">
                تفعيل وتعطيل المراحل حسب نظام المدرسة
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="divide-y divide-border">
                {[
                  { label: "رياض الأطفال (KG)", sub: "KG1, KG2", default: false },
                  { label: "التعليم الأساسي — الشق الأول", sub: "الصفوف 1 إلى 6", default: true },
                  { label: "التعليم الأساسي — الشق الثاني", sub: "الصفوف 7 إلى 9 (الإعدادي)", default: true },
                  { label: "التعليم الثانوي", sub: "الصفوف 10 إلى 12", default: true },
                ].map((stage) => (
                  <div key={stage.label} className="flex items-center justify-between py-3.5">
                    <div>
                      <Label className="text-[13px] font-medium cursor-pointer">{stage.label}</Label>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{stage.sub}</p>
                    </div>
                    <Switch defaultChecked={stage.default} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4 space-y-4">
          <Card className="border border-border shadow-sm">
            <CardHeader className="py-4 px-5 border-b border-border">
              <CardTitle className="text-[14px] font-semibold">تخصيص الواجهة</CardTitle>
              <CardDescription className="text-[12px] mt-0.5">التحكم في الثيم واللغة والألوان</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[13px] font-medium">الوضع الليلي التلقائي</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">التحويل للوضع الليلي بعد الساعة 6 مساءً</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div>
                <Label className="text-[12px] font-semibold block mb-3">اللون الرئيسي</Label>
                <div className="flex items-center gap-2">
                  {[
                    { color: 'bg-blue-600', label: 'أزرق' },
                    { color: 'bg-emerald-600', label: 'أخضر' },
                    { color: 'bg-slate-700', label: 'رمادي' },
                    { color: 'bg-orange-600', label: 'برتقالي' },
                  ].map(({ color, label }) => (
                    <div key={color} className="flex flex-col items-center gap-1.5">
                      <button className={`${color} w-8 h-8 rounded-full border-2 border-transparent hover:border-foreground/30 transition-all`} title={label} />
                      <span className="text-[10px] text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[13px] font-medium">تقليل الحركات</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">تعطيل التأثيرات البصرية للأداء</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="mt-4 space-y-4">
          <Card className="border border-border shadow-sm">
            <CardHeader className="py-4 px-5 border-b border-border">
              <CardTitle className="text-[14px] font-semibold">إعدادات الوصول والبوابات</CardTitle>
              <CardDescription className="text-[12px] mt-0.5">التحكم في صلاحيات الدخول لكل دور</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="divide-y divide-border">
                {[
                  { label: "بوابة ولي الأمر", sub: "السماح لأولياء الأمور بالدخول", default: true },
                  { label: "التسجيل الذاتي للطلاب", sub: "فتح باب القبول والتسجيل عبر الموقع", default: false },
                  { label: "إشعارات WhatsApp", sub: "إرسال الإشعارات عبر واتساب", default: false },
                  { label: "الوضع العام للمدرسة", sub: "إظهار المدرسة في نتائج البحث", default: true },
                ].map((perm) => (
                  <div key={perm.label} className="flex items-center justify-between py-3.5">
                    <div>
                      <Label className="text-[13px] font-medium cursor-pointer">{perm.label}</Label>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{perm.sub}</p>
                    </div>
                    <Switch defaultChecked={perm.default} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
