import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Plus, Users, Clock, MoreHorizontal, FileText, GraduationCap } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Academics() {
  const { db, setDb } = useApp();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">الفصول والمواد الدراسية</h1>
          <p className="text-muted-foreground">متصلة بقاعدة البيانات الموحدة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Users size={16} /> إدارة الفصول</Button>
          <Button className="gap-2"><Plus size={16} /> إضافة مادة</Button>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="text-primary" size={20} /> المقررات النشطة
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {db.subjects.map((subject) => (
            <Card key={subject.id} className="hover:shadow-md transition-all group border-border/60">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                    📚
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1">{subject.name}</h3>
                <div className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded w-fit mb-4">
                  {subject.code}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap className="text-primary" size={20} /> الشعب والفصول
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {db.classes.map((cls) => {
            const classStudents = db.students.filter(s => s.classId === cls.id).length;
            return (
            <div key={cls.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-secondary-foreground">
                  {cls.name.substring(0, 1)}
                </div>
                <div>
                  <h4 className="font-semibold">{cls.name}</h4>
                  <p className="text-sm text-muted-foreground">الصف: {cls.level}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="gap-1">
                  <Users size={12} /> {classStudents} / {cls.capacity} طالب
                </Badge>
              </div>
            </div>
          )})}
        </div>
      </section>
    </div>
  );
}