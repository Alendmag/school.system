import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useKeyPress } from "@/hooks/useKeyPress";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  GraduationCap, 
  FileText,
  Plus
} from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  useKeyPress("ctrl+k", (e) => {
    e.preventDefault();
    setOpen((open) => !open);
  });

  const navigateTo = (path: string) => {
    setLocation(path);
    setOpen(false);
  };

  const navigateAndDispatch = (path: string, eventName: string) => {
    setLocation(path);
    setOpen(false);
    // Wait for the new page to mount before dispatching the event
    setTimeout(() => {
        window.dispatchEvent(new CustomEvent(eventName));
    }, 150);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="ابحث عن أمر أو صفحة... (Ctrl+K)" className="font-arabic" />
      <CommandList className="font-arabic" dir="rtl">
        <CommandEmpty>لم يتم العثور على نتائج.</CommandEmpty>
        <CommandGroup heading="الاختصارات السريعة">
          <CommandItem onSelect={() => navigateAndDispatch("/students", "open-add-student")}>
            <Plus className="ml-2 h-4 w-4" />
            <span>تسجيل طالب جديد</span>
            <CommandShortcut>Alt+N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigateAndDispatch("/finance", "open-issue-invoice")}>
            <Plus className="ml-2 h-4 w-4" />
            <span>إصدار فاتورة جديدة</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="التنقل">
          <CommandItem onSelect={() => navigateTo("/")}>
            <LayoutDashboard className="ml-2 h-4 w-4" />
            <span>الرئيسية</span>
          </CommandItem>
          <CommandItem onSelect={() => navigateTo("/students")}>
            <Users className="ml-2 h-4 w-4" />
            <span>الطلاب</span>
          </CommandItem>
          <CommandItem onSelect={() => navigateTo("/finance")}>
            <CreditCard className="ml-2 h-4 w-4" />
            <span>المالية</span>
          </CommandItem>
          <CommandItem onSelect={() => navigateTo("/academics")}>
            <GraduationCap className="ml-2 h-4 w-4" />
            <span>الأكاديمية</span>
          </CommandItem>
          <CommandItem onSelect={() => navigateTo("/reports")}>
            <FileText className="ml-2 h-4 w-4" />
            <span>التقارير</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
