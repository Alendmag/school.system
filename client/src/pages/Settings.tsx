import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, Upload, Globe, Palette, Shield, BookOpen } from "lucide-react";

export default function SettingsPage() {
  const { institution, setInstitution } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">إعدادات المدرسة</h1>
        <p className="text-muted-foreground">
          تخصيص بيانات المدرسة والمراحل الدراسية والمظهر العام.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="gap-2"><Globe size={16} /> عام</TabsTrigger>
          <TabsTrigger value="stages" className="gap-2"><BookOpen size={16} /> المراحل الدراسية</TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2"><Palette size={16} /> المظهر</TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2"><Shield size={16} /> الصلاحيات</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>بيانات المدرسة الأساسية</CardTitle>
              <CardDescription>
                هذه البيانات ستظهر في التقارير والشهادات الرسمية.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="inst-name">اسم المدرسة</Label>
                <Input 
                  id="inst-name" 
                  value={institution.name} 
                  onChange={(e) => setInstitution({...institution, name: e.target.value})}
                  placeholder="مثال: مدرسة المناهل الدولية"
                />
              </div>

              <div className="grid gap-2">
                <Label>شعار المدرسة</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center border border-dashed border-border">
                    <Upload className="text-muted-foreground" />
                  </div>
                  <Button variant="outline">رفع شعار جديد</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>هيكلة المراحل الدراسية</CardTitle>
              <CardDescription>
                تفعيل وتعطيل المراحل الدراسية حسب نظام المدرسة.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border p-3 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">رياض الأطفال (KG)</Label>
                  <p className="text-sm text-muted-foreground">KG1, KG2</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between border p-3 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">التعليم الأساسي (الشق الأول)</Label>
                  <p className="text-sm text-muted-foreground">الصفوف من 1 إلى 6</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between border p-3 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">التعليم الأساسي (الشق الثاني)</Label>
                  <p className="text-sm text-muted-foreground">الصفوف من 7 إلى 9 (الإعدادي)</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between border p-3 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">التعليم الثانوي</Label>
                  <p className="text-sm text-muted-foreground">الصفوف من 10 إلى 12</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تخصيص الواجهة</CardTitle>
              <CardDescription>
                التحكم في الألوان والوضع الليلي الافتراضي.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">تفعيل الوضع الليلي تلقائياً</Label>
                  <p className="text-sm text-muted-foreground">
                    التحويل للوضع الليلي بعد الساعة 6 مساءً.
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>اللون الرئيسي للنظام</Label>
                <div className="flex gap-2">
                  {['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-orange-600'].map((color) => (
                    <div key={color} className={`${color} w-8 h-8 rounded-full cursor-pointer ring-offset-2 hover:ring-2 ring-primary/50 transition-all`} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الوصول</CardTitle>
              <CardDescription>
                التحكم في بوابات الدخول المتاحة.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border p-3 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">بوابة ولي الأمر</Label>
                  <p className="text-sm text-muted-foreground">السماح لأولياء الأمور بالدخول للنظام.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between border p-3 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">التسجيل الذاتي للطلاب</Label>
                  <p className="text-sm text-muted-foreground">فتح باب القبول والتسجيل عبر الموقع.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button variant="outline">إلغاء</Button>
        <Button className="gap-2">
          <Save size={16} />
          حفظ التغييرات
        </Button>
      </div>
    </div>
  );
}
