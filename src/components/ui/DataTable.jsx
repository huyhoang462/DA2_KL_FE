import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileSearch,
} from 'lucide-react';

const DataTable = ({
  data = [],
  columns = [],
  searchable = true,
  filterable = true,
  sortable = true,
  actions = null,
  onRowClick = null,
  loading = false,
  emptyMessage = 'Không có dữ liệu',
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ✅ Search functionality
  const searchableData = useMemo(() => {
    if (!searchTerm) return data;

    const searchLower = searchTerm.toLowerCase();

    return data.filter((item) => {
      // Search in all columns
      return columns.some((column) => {
        if (column.searchable === false) return false;

        const key = column.key || column.accessor;
        if (!key) return false;

        let value = item[key];

        // Handle nested objects (e.g., buyer.name, buyer.email)
        if (typeof value === 'object' && value !== null) {
          // For buyer object, search in name and email
          if (key === 'buyer') {
            const name = value.name || '';
            const email = value.email || '';
            return (
              String(name).toLowerCase().includes(searchLower) ||
              String(email).toLowerCase().includes(searchLower)
            );
          }
          // For other objects, stringify
          value = JSON.stringify(value);
        }

        return String(value).toLowerCase().includes(searchLower);
      });
    });
  }, [data, searchTerm, columns]);

  // ✅ Filter functionality
  const filteredData = useMemo(() => {
    let filtered = searchableData;

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        filtered = filtered.filter((item) => {
          const itemValue = item[key];
          return itemValue === filters[key];
        });
      }
    });

    return filtered;
  }, [searchableData, filters]);

  // ✅ Sort functionality
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // ✅ Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // ✅ Handlers
  const handleSort = (key) => {
    if (!sortable) return;

    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const getUniqueFilterValues = (key) => {
    return [...new Set(data.map((item) => item[key]).filter(Boolean))];
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Loading skeleton */}
        <div className="animate-pulse">
          <div className="mb-4 h-12 rounded-lg bg-gray-200"></div>
          <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 flex-1 rounded bg-gray-200"></div>
                <div className="h-4 flex-1 rounded bg-gray-200"></div>
                <div className="h-4 flex-1 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search & Filter Bar */}
      {(searchable || filterable) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          {searchable && (
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="focus:border-primary focus:ring-primary/20 bg-background-secondary w-full rounded-lg border border-gray-300 py-2.5 pr-4 pl-11 text-sm placeholder-gray-400 transition-colors focus:ring-2 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Filters */}
          {filterable && (
            <div className="flex flex-wrap gap-2">
              {columns
                .filter((col) => col.filterable)
                .map((column) => (
                  <div key={column.key} className="min-w-[140px]">
                    <select
                      value={filters[column.key] || ''}
                      onChange={(e) => handleFilter(column.key, e.target.value)}
                      className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm transition-colors focus:ring-2 focus:outline-none"
                    >
                      <option value="">
                        {column.filterPlaceholder || `Tất cả ${column.header}`}
                      </option>
                      {getUniqueFilterValues(column.key).map((value) => (
                        <option key={value} value={value}>
                          {column.filterDisplay
                            ? column.filterDisplay(value)
                            : value}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Data Info & Items Per Page */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="text-sm text-gray-600">
          Hiển thị{' '}
          <span className="font-semibold text-gray-900">
            {paginatedData.length}
          </span>{' '}
          trong tổng{' '}
          <span className="font-semibold text-gray-900">
            {sortedData.length}
          </span>{' '}
          kết quả
          {searchTerm && (
            <span className="ml-2 text-gray-500">
              • Tìm kiếm: <span className="font-medium">"{searchTerm}"</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Hiển thị:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="focus:border-primary focus:ring-primary/20 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase ${
                  sortable && column.sortable !== false
                    ? 'cursor-pointer transition-colors select-none hover:bg-gray-200/50'
                    : ''
                }`}
                onClick={() =>
                  column.sortable !== false && handleSort(column.key)
                }
              >
                <div className="flex items-center gap-2">
                  <span>{column.header}</span>
                  {sortable && column.sortable !== false && (
                    <div className="flex flex-col">
                      {sortConfig.key === column.key ? (
                        getSortIcon(column.key)
                      ) : (
                        <div className="flex flex-col opacity-30">
                          <ChevronUp className="h-3 w-3" />
                          <ChevronDown className="-mt-1 h-3 w-3" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </th>
            ))}
            {actions && (
              <th className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-gray-700 uppercase">
                Thao tác
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {paginatedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="px-6 py-16 text-center"
              >
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="rounded-full bg-gray-100 p-4">
                    <FileSearch className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-gray-900">
                      {emptyMessage}
                    </p>
                    {searchTerm && (
                      <p className="mt-1 text-sm text-gray-500">
                        Không tìm thấy kết quả cho "{searchTerm}"
                      </p>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            paginatedData.map((row, index) => (
              <tr
                key={row.id || index}
                className={`hover:bg-gray-50 ${
                  onRowClick ? 'cursor-pointer active:bg-gray-100' : ''
                }`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 text-right text-sm whitespace-nowrap">
                    <div
                      className="flex justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm sm:flex-row">
          <div className="flex items-center gap-2">
            {/* First page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 p-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
              title="Trang đầu"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>

            {/* Previous */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
            >
              <div className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
              </div>
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-sm text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[36px] rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        currentPage === page
                          ? 'bg-primary text-white shadow-md'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>

            {/* Next */}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
            >
              <div className="flex items-center gap-1">
                <ChevronRight className="h-4 w-4" />
              </div>
            </button>

            {/* Last page */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-300 p-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
              title="Trang cuối"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>

          <div className="text-sm text-gray-600">
            Trang{' '}
            <span className="font-semibold text-gray-900">{currentPage}</span> /{' '}
            <span className="font-semibold text-gray-900">{totalPages}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
