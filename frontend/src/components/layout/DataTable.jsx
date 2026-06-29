"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  X,
  Plus,
} from "lucide-react";

/**
 * @typedef {Object} Column
 * @property {string} key
 * @property {string} header
 * @property {function(any): React.ReactNode} [render]
 * @property {boolean} [sortable]
 * @property {string} [width]
 * @property {string} [align]
 */

/**
 * @typedef {Object} Action
 * @property {string} key
 * @property {string} label
 * @property {React.ComponentType} icon
 * @property {function(any): void} onClick
 * @property {function(any): boolean} [visible]
 * @property {string} [variant]
 */

/**
 * @typedef {Object} DataTableProps
 * @property {any[]} data
 * @property {Column[]} columns
 * @property {Action[]} [actions]
 * @property {boolean} [loading]
 * @property {boolean} [selectable]
 * @property {any[]} [selectedRows]
 * @property {function(any[]): void} [onSelectionChange]
 * @property {boolean} [searchable]
 * @property {string} [searchPlaceholder]
 * @property {function(string): void} [onSearch]
 * @property {boolean} [filterable]
 * @property {React.ReactNode} [filters]
 * @property {boolean} [sortable]
 * @property {string} [defaultSortKey]
 * @property {string} [defaultSortOrder]
 * @property {boolean} [pagination]
 * @property {number} [defaultPageSize]
 * @property {number} [totalCount]
 * @property {function(number): void} [onPageChange]
 * @property {function(number): void} [onPageSizeChange]
 * @property {boolean} [exportable]
 * @property {function(): void} [onExport]
 * @property {boolean} [refreshable]
 * @property {function(): void} [onRefresh]
 * @property {React.ReactNode} [toolbar]
 * @property {string} [emptyStateTitle]
 * @property {string} [emptyStateDescription]
 * @property {React.ReactNode} [emptyStateAction]
 * @property {string} [className]
 * @property {string} [tableClassName]
 */

function DataTableSkeleton({ columns, rowCount = 5 }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="rounded-md border">
        <table className="w-full">
          <thead className="border-b bg-slate-50">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="p-4">
                  <Skeleton className="h-4 w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }).map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="p-4">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <Search className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-slate-500">{description}</p>
      {action}
    </div>
  );
}

export function DataTable({
  data = [],
  columns,
  actions,
  loading = false,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  searchable = false,
  searchPlaceholder = "Search...",
  onSearch,
  filterable = false,
  filters,
  sortable = true,
  defaultSortKey,
  defaultSortOrder = "asc",
  pagination = true,
  defaultPageSize = 10,
  totalCount,
  onPageChange,
  onPageSizeChange,
  exportable = false,
  onExport,
  refreshable = false,
  onRefresh,
  toolbar,
  emptyStateTitle = "No results found",
  emptyStateDescription = "Try adjusting your search or filters to find what you're looking for.",
  emptyStateAction,
  className,
  tableClassName,
  ...props
}) {
  // State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState(defaultSortKey || (columns[0]?.key ?? ""));
  const [sortOrder, setSortOrder] = React.useState(defaultSortOrder);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [selectedRowIds, setSelectedRowIds] = React.useState(new Set(selectedRows));

  // Update selected rows when prop changes
  React.useEffect(() => {
    setSelectedRowIds(new Set(selectedRows));
  }, [selectedRows]);

  // Handle selection change
  const handleSelectionChange = React.useCallback((newSelectedIds) => {
    setSelectedRowIds(newSelectedIds);
    if (onSelectionChange) {
      const selectedData = data.filter((row) => newSelectedIds.has(row.id));
      onSelectionChange(selectedData);
    }
  }, [data, onSelectionChange]);

  // Toggle all rows selection
  const toggleAllRows = () => {
    const allIds = new Set(filteredData.map((row) => row.id));
    const newSelected = selectedRowIds.size === allIds.size ? new Set() : allIds;
    handleSelectionChange(newSelected);
  };

  // Toggle single row selection
  const toggleRowSelection = (id) => {
    const newSelected = new Set(selectedRowIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    handleSelectionChange(newSelected);
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Handle sort
  const handleSort = (key) => {
    let newOrder = "asc";
    if (sortKey === key) {
      newOrder = sortOrder === "asc" ? "desc" : "asc";
    }
    setSortKey(key);
    setSortOrder(newOrder);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (onPageChange) {
      onPageChange(page);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (size) => {
    setPageSize(Number(size));
    setCurrentPage(1);
    if (onPageSizeChange) {
      onPageSizeChange(Number(size));
    }
  };

  // Filter, sort, and paginate data
  const processedData = React.useMemo(() => {
    let result = [...data];

    // Filter
    if (searchable && searchQuery && !onSearch) {
      const query = searchQuery.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const value = row[col.key];
          return value && String(value).toLowerCase().includes(query);
        })
      );
    }

    // Sort
    if (sortable && sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        if (typeof aVal === "string") {
          return sortOrder === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      });
    }

    return result;
  }, [data, searchQuery, sortKey, sortOrder, searchable, sortable, columns, onSearch]);

  // Paginate
  const totalItems = totalCount ?? processedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedData = pagination
    ? processedData.slice(startIndex, endIndex)
    : processedData;

  const filteredData = paginatedData;

  // Loading state
  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        <DataTableSkeleton columns={columns} />
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-4", className)} {...props}>
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Search and Filters */}
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          {searchable && (
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded-md border-slate-200 bg-white pl-9 pr-4 text-sm focus-visible:ring-blue-500"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => handleSearch("")}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {filterable && filters && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 border-slate-200 bg-white"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {filters}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {toolbar}

          {refreshable && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 border-slate-200 bg-white"
              onClick={onRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          )}

          {exportable && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 border-slate-200 bg-white"
              onClick={onExport}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}
        </div>
      </div>

      {/* Selected Count */}
      {selectable && selectedRowIds.size > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <span className="font-medium">{selectedRowIds.size}</span>
          <span>row(s) selected</span>
          <button
            className="ml-2 text-blue-600 hover:text-blue-800 hover:underline"
            onClick={() => handleSelectionChange(new Set())}
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className={cn("rounded-md border border-slate-200 bg-white", tableClassName)}>
        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                {selectable && (
                  <th className="px-4 py-3 text-left w-12">
                    <Checkbox
                      checked={
                        filteredData.length > 0 &&
                        filteredData.every((row) => selectedRowIds.has(row.id))
                      }
                      onCheckedChange={toggleAllRows}
                      aria-label="Select all rows"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-left font-medium text-slate-700",
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right",
                      column.width && `w-[${column.width}]`
                    )}
                    style={{ width: column.width }}
                  >
                    {sortable && column.sortable !== false ? (
                      <button
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                        onClick={() => handleSort(column.key)}
                      >
                        {column.header}
                        <span className="inline-flex">
                          {sortKey === column.key ? (
                            sortOrder === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5 text-blue-600" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5 text-blue-600" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                          )}
                        </span>
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th className="px-4 py-3 text-right w-16">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      columns.length +
                      (selectable ? 1 : 0) +
                      (actions?.length ? 1 : 0)
                    }
                    className="p-0"
                  >
                    <EmptyState
                      title={emptyStateTitle}
                      description={emptyStateDescription}
                      action={emptyStateAction}
                    />
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => (
                  <tr
                    key={row.id || index}
                    className={cn(
                      "border-b transition-colors hover:bg-slate-50",
                      selectedRowIds.has(row.id) && "bg-blue-50 hover:bg-blue-100"
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedRowIds.has(row.id)}
                          onCheckedChange={() => toggleRowSelection(row.id)}
                          aria-label={`Select row ${index + 1}`}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "px-4 py-3",
                          column.align === "center" && "text-center",
                          column.align === "right" && "text-right"
                        )}
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </td>
                    ))}
                    {actions && actions.length > 0 && (
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-slate-900"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {actions
                              .filter(
                                (action) => !action.visible || action.visible(row)
                              )
                              .map((action, idx) => (
                                <React.Fragment key={action.key}>
                                  {idx > 0 && action.variant === "destructive" && (
                                    <DropdownMenuSeparator />
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => action.onClick(row)}
                                    className={cn(
                                      "cursor-pointer gap-2",
                                      action.variant === "destructive" &&
                                        "text-red-600 focus:text-red-600"
                                    )}
                                  >
                                    <action.icon className="h-4 w-4" />
                                    {action.label}
                                  </DropdownMenuItem>
                                </React.Fragment>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{" "}
              <span className="font-medium">{totalItems}</span> results
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Page size selector */}
            <Select
              value={String(pageSize)}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Page navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
                <span className="sr-only">First page</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              <span className="px-2 text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
                <span className="sr-only">Last page</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
