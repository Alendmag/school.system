import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users, BookOpen } from "lucide-react";

export default function Teachers() {
  const { db } = useApp();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إدارة الكادر التعليمي</h1>
          <p className="text-muted-foreground">إدارة بيانات المعلمين، المؤهلات، والجدول الأسبوعي.</p>
        </div>
        <Button className="gap-2"><Plus size={16} /> إضافة معلم</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-6 flex items-center gap-4"><Users className="text-blue-500" size={24}/><div><p className="text-sm text-muted-foreground">إجمالي المعلمين</p><h3 className="text-2xl font-bold">{db.teachers.length}</h3></div></CardContent></Card>
        <Card><CardContent className="p-6 flex items-center gap-4"><BookOpen className="text-purple-500" size={24}/><div><p className="text-sm text-muted-foreground">متوسط سنوات الخبرة</p><h3 className="text-2xl font-bold">8.5</h3></div></CardContent></Card>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">المؤهل</TableHead>
              <TableHead className="text-right">الخبرة</TableHead>
              <TableHead className="text-right">المواد</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {db.teachers.slice(0, 10).map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell className="font-medium">{teacher.name}</TableCell>
                <TableCell>{teacher.qualifications}</TableCell>
                <TableCell>{teacher.experienceYears} سنوات</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {teacher.subjectIds.map(sid => {
                      const sub = db.subjects.find(s => s.id === sid);
                      return <Badge key={sid} variant="outline">{sub?.name}</Badge>;
                    })}
                  </div>
                </TableCell>
                <TableCell><Badge className="bg-emerald-500">على رأس العمل</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
