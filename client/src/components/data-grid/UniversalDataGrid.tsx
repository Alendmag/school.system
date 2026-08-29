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
import { ChevronDown, Search, ArrowUpDown, LayoutGrid, CheckSquare, Settings2, Download, Printer } from 'lucide-react';
import { useKeyPress } from '@/hooks/useKeyPress';

interface UniversalDataGridProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  onRowDoubleClick?: (row: TData) => void;
  globalSearchPlaceholder?: string;
  enableRowSelection?: boolean;
  renderRowActions?: (row: TData) => React.ReactNode;
  renderBulkActions?: (selectedRows: TData[]) => React.ReactNode;
}

export function UniversalDataGrid<TData, TValue>({
  columns,
  data,
  isLoading = false,
  onRowDoubleClick,
  globalSearchPlaceholder = "البحث السريع...",
  enableRowSelection = false,
  renderRowActions,
  renderBulkActions,
}: UniversalDataGridProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [density, setDensity] = useState<'compact' | 'comfortable'>('comfortable');

  // Inject row selection column if enabled
  const tableColumns = useMemo(() => {
    const cols = [...columns];
    if (enableRowSelection) {
      cols.unshift({
        id: 'select',
        header: ({ table }) => (
          <div className="px-1">
            <input
              type="checkbox"
              className="rounded border-gray-300 w-4 h-4 text-primary focus:ring-primary"
              checked={table.getIsAllPageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="px-1">
            <input
              type="checkbox"
              className="rounded border-gray-300 w-4 h-4 text-primary focus:ring-primary"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }
    
    if (renderRowActions) {
      cols.push({
        id: 'actions',
        header: '',
        cell: ({ row }) => renderRowActions(row.original),
        enableSorting: false,
        enableHiding: false,
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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  // Global Keyboard Shortcuts for Data Grid
  useKeyPress("ctrl+a", (e) => {
    if (enableRowSelection) {
      e.preventDefault();
      table.toggleAllPageRowsSelected();
    }
  });

  const cellPadding = density === 'compact' ? 'py-1 px-2 text-xs' : 'py-3 px-4 text-sm';
  const selectedRows = table.getFilteredSelectedRowModel().rows.map(r => r.original);

  return (
    <div className="space-y-4 font-arabic" dir="rtl">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="flex flex-1 items-center gap-2 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={globalSearchPlaceholder}
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pr-8"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Bulk Actions Context Menu */}
          {enableRowSelection && selectedRows.length > 0 && renderBulkActions && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <span className="text-sm font-medium text-muted-foreground ml-2">
                تم تحديد {selectedRows.length}
              </span>
              {renderBulkActions(selectedRows)}
            </div>
          )}

          <div className="flex items-center gap-1 border-r pr-2 ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1 hidden sm:flex">
                  <Settings2 className="h-4 w-4" />
                  أعمدة
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[150px] font-arabic" dir="rtl">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1 hidden sm:flex">
                  <LayoutGrid className="h-4 w-4" />
                  العرض
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="font-arabic" dir="rtl">
                <DropdownMenuCheckboxItem 
                  checked={density === 'comfortable'} 
                  onCheckedChange={() => setDensity('comfortable')}
                >
                  مريح (Comfortable)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={density === 'compact'} 
                  onCheckedChange={() => setDensity('compact')}
                >
                  مضغوط (Compact)
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="h-9 w-9" title="تصدير">
              <Download className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" title="طباعة">
              <Printer className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead 
                        key={header.id} 
                        className={`text-right whitespace-nowrap font-semibold text-foreground ${
                            header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-muted/80' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {header.isPlaceholder ? null : (
                          <div className="flex items-center gap-1">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: <ArrowUpDown className="h-3 w-3 opacity-100 text-primary" />,
                              desc: <ArrowUpDown className="h-3 w-3 opacity-100 text-primary rotate-180" />,
                            }[header.column.getIsSorted() as string] ?? (
                                header.column.getCanSort() ? <ArrowUpDown className="h-3 w-3 opacity-30" /> : null
                            )}
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading Skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {tableColumns.map((col, i) => (
                      <TableCell key={i} className={cellPadding}>
                        <Skeleton className="h-5 w-full max-w-[200px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`group ${row.getIsSelected() ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                    onDoubleClick={() => onRowDoubleClick && onRowDoubleClick(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={cellPadding}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className="h-32 text-center text-muted-foreground"
                  >
                    لا توجد بيانات مطابقة للبحث.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {enableRowSelection && (
            <span>
              تم تحديد {table.getFilteredSelectedRowModel().rows.length} من{" "}
              {table.getFilteredRowModel().rows.length} صف(وف).
            </span>
          )}
        </div>
        <div className="flex items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">الصفوف بالصفحة</p>
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value))
              }}
              className="h-8 w-[70px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {[10, 20, 30, 40, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronDown className="h-4 w-4 rotate-90" />
            </Button>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              صفحة {table.getState().pagination.pageIndex + 1} من{" "}
              {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronDown className="h-4 w-4 -rotate-90" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
