import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronDown, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight,
  Search, ArrowUp, ArrowDown, ArrowUpDown,
  Columns3, LayoutGrid, Download, Printer,
  SlidersHorizontal, X
} from 'lucide-react';
import { useKeyPress } from '@/hooks/useKeyPress';
import { cn } from '@/lib/utils';

interface UniversalDataGridProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  onRowDoubleClick?: (row: TData) => void;
  globalSearchPlaceholder?: string;
  enableRowSelection?: boolean;
  renderRowActions?: (row: TData) => React.ReactNode;
  renderBulkActions?: (selectedRows: TData[]) => React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function UniversalDataGrid<TData, TValue>({
  columns,
  data,
  isLoading = false,
  onRowDoubleClick,
  globalSearchPlaceholder = "بحث سريع...",
  enableRowSelection = false,
  renderRowActions,
  renderBulkActions,
  title,
  subtitle,
}: UniversalDataGridProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [density, setDensity] = useState<'compact' | 'comfortable'>('comfortable');

  const tableColumns = useMemo(() => {
    const cols = [...columns];

    if (enableRowSelection) {
      cols.unshift({
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            className="rounded border-border w-3.5 h-3.5 accent-primary cursor-pointer"
            checked={table.getIsAllPageRowsSelected()}
            ref={(el) => {
              if (el) el.indeterminate = table.getIsSomePageRowsSelected();
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="تحديد الكل"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="rounded border-border w-3.5 h-3.5 accent-primary cursor-pointer"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label="تحديد الصف"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      });
    }

    if (renderRowActions) {
      cols.push({
        id: 'actions',
        header: '',
        cell: ({ row }) => renderRowActions(row.original),
        enableSorting: false,
        enableHiding: false,
        size: 48,
      });
    }

    return cols;
  }, [columns, enableRowSelection, renderRowActions]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    initialState: { pagination: { pageSize: 15 } },
  });

  useKeyPress("ctrl+a", (e) => {
    if (enableRowSelection) {
      e.preventDefault();
      table.toggleAllPageRowsSelected();
    }
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows.map(r => r.original);
  const totalRows = table.getFilteredRowModel().rows.length;

  const rowPadding = density === 'compact' ? 'py-1.5 px-3' : 'py-2.5 px-4';
  const rowFontSize = density === 'compact' ? 'text-xs' : 'text-[13px]';

  const handleExport = () => {
    const headers = table.getVisibleLeafColumns()
      .filter(col => col.id !== 'select' && col.id !== 'actions')
      .map(col => typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id);

    const rows = table.getFilteredRowModel().rows.map(row =>
      row.getVisibleCells()
        .filter(cell => cell.column.id !== 'select' && cell.column.id !== 'actions')
        .map(cell => String(cell.getValue() ?? ''))
    );

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  return (
    <div className="flex flex-col gap-0 font-sans" dir="rtl">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={globalSearchPlaceholder}
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pr-8 h-8 text-[13px] bg-muted/50 border-border focus:bg-background"
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter('')}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Right toolbar */}
        <div className="flex items-center gap-1.5">
          {/* Bulk actions */}
          {enableRowSelection && selectedRows.length > 0 && renderBulkActions && (
            <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-150 border-l border-border pl-2 ml-1">
              <span className="text-[12px] font-medium text-muted-foreground">
                {selectedRows.length} محدد
              </span>
              {renderBulkActions(selectedRows)}
            </div>
          )}

          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px] px-2.5">
                <Columns3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">أعمدة</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44" dir="rtl">
              {table.getAllColumns()
                .filter(col => col.getCanHide())
                .map(col => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="text-[13px]"
                    checked={col.getIsVisible()}
                    onCheckedChange={(v) => col.toggleVisibility(!!v)}
                  >
                    {typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Density */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px] px-2.5">
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">كثافة</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" dir="rtl">
              <DropdownMenuCheckboxItem
                className="text-[13px]"
                checked={density === 'comfortable'}
                onCheckedChange={() => setDensity('comfortable')}
              >
                مريح
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                className="text-[13px]"
                checked={density === 'compact'}
                onCheckedChange={() => setDensity('compact')}
              >
                مضغوط
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-5 bg-border" />

          <Button variant="ghost" size="icon" className="h-8 w-8" title="تصدير CSV" onClick={handleExport}>
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="طباعة" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-md border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-border hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "text-right whitespace-nowrap bg-muted/40 py-2.5 px-4",
                        "text-[11px] font-semibold text-muted-foreground uppercase tracking-wide",
                        header.column.getCanSort() && "cursor-pointer select-none hover:text-foreground transition-colors"
                      )}
                      style={{ width: header.column.columnDef.size }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-1.5">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-muted-foreground/60">
                              {header.column.getIsSorted() === 'asc'
                                ? <ArrowUp className="h-3 w-3 text-primary" />
                                : header.column.getIsSorted() === 'desc'
                                  ? <ArrowDown className="h-3 w-3 text-primary" />
                                  : <ArrowUpDown className="h-3 w-3 opacity-40" />
                              }
                            </span>
                          )}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {tableColumns.map((_, j) => (
                      <TableCell key={j} className={`${rowPadding} ${rowFontSize}`}>
                        <Skeleton className="h-4 w-full max-w-[160px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    className={cn(
                      "border-b border-border/50 transition-colors",
                      row.getIsSelected()
                        ? "bg-primary/5 hover:bg-primary/8"
                        : "hover:bg-muted/40",
                      onRowDoubleClick && "cursor-pointer"
                    )}
                    onDoubleClick={() => onRowDoubleClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={`${rowPadding} ${rowFontSize}`}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={tableColumns.length} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Search size={20} className="opacity-30" />
                      <p className="text-[13px]">لا توجد نتائج مطابقة</p>
                      {globalFilter && (
                        <button
                          onClick={() => setGlobalFilter('')}
                          className="text-[12px] text-primary hover:underline"
                        >
                          مسح البحث
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-3">
        <div className="text-[12px] text-muted-foreground">
          {enableRowSelection && selectedRows.length > 0
            ? <span className="text-primary font-medium">{selectedRows.length} محدد من {totalRows}</span>
            : <span>إجمالي: <strong>{totalRows}</strong> سجل</span>
          }
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-muted-foreground hidden sm:inline">صفوف:</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="h-7 rounded border border-input bg-background px-2 text-[12px] cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {[10, 15, 20, 30, 50].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-0.5">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <div className="px-3 py-1 text-[12px] font-medium border border-border rounded bg-background min-w-[80px] text-center">
              {table.getState().pagination.pageIndex + 1} / {Math.max(table.getPageCount(), 1)}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
