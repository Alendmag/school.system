import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Book, Plus, Search, BookOpen, Tag, Copy } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  "رياضيات": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  "علوم": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
  "أدب عربي": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  "تاريخ": "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800",
  "default": "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};

function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS["default"];
}

export default function Library() {
  const { db } = useApp();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("الكل");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(db.libraryBooks.map(b => b.category)));
    return ["الكل", ...cats];
  }, [db.libraryBooks]);

  const filtered = useMemo(() => db.libraryBooks.filter(book => {
    const matchSearch = !search || book.title.includes(search) || book.author.includes(search) || book.category.includes(search);
    const matchCategory = activeCategory === "الكل" || book.category === activeCategory;
    return matchSearch && matchCategory;
  }), [db.libraryBooks, search, activeCategory]);

  const totalBooks = db.libraryBooks.reduce((sum, b) => sum + b.totalCopies, 0);
  const availableBooks = db.libraryBooks.reduce((sum, b) => sum + b.availableCopies, 0);
  const borrowedBooks = totalBooks - availableBooks;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between page-header">
        <div>
          <h1 className="text-[18px] font-bold text-foreground">إدارة المكتبة</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {db.libraryBooks.length} عنوان — {totalBooks} نسخة إجمالية
          </p>
        </div>
        <Button size="sm" className="h-8 gap-1.5 text-[12px]" disabled>
          <Plus size={13} /> إضافة كتاب
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="card-hover-lift border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 shrink-0">
              <BookOpen size={15} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">العناوين</p>
              <p className="text-[18px] font-bold tabular-num leading-tight">{db.libraryBooks.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover-lift border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 shrink-0">
              <Copy size={15} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">نسخ متاحة</p>
              <p className="text-[18px] font-bold tabular-num leading-tight">{availableBooks}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover-lift border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 shrink-0">
              <Book size={15} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">مُستعارة حالياً</p>
              <p className="text-[18px] font-bold tabular-num leading-tight">{borrowedBooks}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="بحث بالعنوان أو المؤلف..."
            className="pr-8 h-8 text-[12px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Books table */}
      <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4">عنوان الكتاب</th>
              <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4">المؤلف</th>
              <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4">التصنيف</th>
              <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4">النسخ المتاحة</th>
              <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-4">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((book) => {
              const available = book.availableCopies > 0;
              return (
                <tr key={book.id} className="border-b border-border/40 hover:bg-primary/[0.025] transition-colors duration-100">
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-muted shrink-0">
                        <Book size={12} className="text-muted-foreground" />
                      </div>
                      <span className="text-[13px] font-medium">{book.title}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-[12px] text-muted-foreground">{book.author}</span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${getCategoryColor(book.category)}`}>
                      <Tag size={9} />
                      {book.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border tabular-num ${
                      available
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
                    }`}>
                      {book.availableCopies} {available ? "متاح" : "غير متاح"}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-[13px] tabular-num text-muted-foreground">{book.totalCopies}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <Book size={28} className="text-muted-foreground/25 mx-auto mb-2" />
            <p className="text-[13px] text-muted-foreground">لا توجد كتب مطابقة للبحث</p>
          </div>
        )}
      </div>
    </div>
  );
}
