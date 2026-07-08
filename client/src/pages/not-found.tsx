import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LayoutDashboard, FileQuestionMark as FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center max-w-sm mx-4">
        <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-6">
          <FileQuestion size={28} className="text-muted-foreground/50" />
        </div>
        <h1 className="text-[32px] font-bold text-foreground tabular-num">404</h1>
        <p className="text-[15px] font-medium text-foreground mt-1">الصفحة غير موجودة</p>
        <p className="text-[13px] text-muted-foreground mt-2 mb-6">
          الصفحة التي تبحث عنها غير متاحة أو تم نقلها.
        </p>
        <Link href="/">
          <Button size="sm" className="h-9 gap-2 text-[13px]">
            <LayoutDashboard size={14} />
            العودة للوحة التحكم
          </Button>
        </Link>
      </div>
    </div>
  );
}
