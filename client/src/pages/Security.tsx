import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Security() {
  const { db } = useApp();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">الأمن والصلاحيات</h1>
          <p className="text-muted-foreground">سجل الدخول، صلاحيات المستخدمين، والبطاقات الأمنية.</p>
        </div>
        <Button className="gap-2"><Plus size={16} /> إنشاء بطاقة زائر</Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-right">المستخدم</TableHead>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-center">الدور (Role)</TableHead>
              <TableHead className="text-center">آخر دخول</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {db.users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium flex items-center gap-2"><Shield size={16} className="text-muted-foreground"/> {user.name}</TableCell>
                <TableCell dir="ltr" className="text-right">{user.email}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{user.role}</Badge>
                </TableCell>
                <TableCell className="text-center text-muted-foreground text-sm">منذ ساعتين</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
