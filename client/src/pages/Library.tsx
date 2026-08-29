import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Book, Plus } from "lucide-react";

const staticBooks = [
  { id: "1", title: "الرياضيات المعاصرة", author: "د. أحمد خالد", category: "رياضيات", totalCopies: 30, availableCopies: 12 },
  { id: "2", title: "العلوم الطبيعية", author: "د. سارة محمد", category: "علوم", totalCopies: 25, availableCopies: 8 },
  { id: "3", title: "قواعد اللغة العربية", author: "أ. فاطمة علي", category: "لغة عربية", totalCopies: 40, availableCopies: 20 },
  { id: "4", title: "English Grammar", author: "J. Smith", category: "لغة إنجليزية", totalCopies: 35, availableCopies: 15 },
  { id: "5", title: "تاريخ الحضارات", author: "د. محمود حسن", category: "تاريخ", totalCopies: 20, availableCopies: 5 },
];

export default function Library() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إدارة المكتبة</h1>
          <p className="text-muted-foreground">فهرسة الكتب، الاستعارة، والإرجاع.</p>
        </div>
        <Button className="gap-2"><Plus size={16} /> إضافة كتاب</Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-right">عنوان الكتاب</TableHead>
              <TableHead className="text-right">المؤلف</TableHead>
              <TableHead className="text-right">التصنيف</TableHead>
              <TableHead className="text-right">النسخ المتاحة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staticBooks.map((book) => (
              <TableRow key={book.id}>
                <TableCell className="font-medium flex items-center gap-2"><Book size={16} className="text-muted-foreground"/> {book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell><Badge variant="outline">{book.category}</Badge></TableCell>
                <TableCell>
                  <Badge variant={book.availableCopies > 0 ? "secondary" : "destructive"}>
                    {book.availableCopies} / {book.totalCopies}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
