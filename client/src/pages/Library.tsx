import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Book, Plus } from "lucide-react";

export default function Library() {
  const { db } = useApp();
  
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
            {db.libraryBooks.map((book) => (
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
