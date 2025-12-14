import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  MoreVertical,
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
  const [itemsPerPage] = useState(10);

  // ✅ Search functionality
  const searchableData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((item) => {
      return columns.some((column) => {
        if (column.searchable === false) return false;
        const value = column.accessor ? item[column.accessor] : '';
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
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
      <div className="flex items-center justify-center p-8">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search & Filter Bar */}
      {(searchable || filterable) && (
        <div className="flex flex-col gap-4 rounded-lg bg-gray-50 p-4 sm:flex-row">
          {/* Search */}
          {searchable && (
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="focus:ring-primary/20 focus:border-primary w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:ring-2"
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
                  <div key={column.key} className="min-w-[120px]">
                    <select
                      value={filters[column.key] || ''}
                      onChange={(e) => handleFilter(column.key, e.target.value)}
                      className="focus:ring-primary/20 focus:border-primary w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2"
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

      {/* Data Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Hiển thị {paginatedData.length} trong tổng {sortedData.length} kết quả
        </span>
        {searchTerm && <span>Tìm kiếm: "{searchTerm}"</span>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase ${
                    sortable && column.sortable !== false
                      ? 'cursor-pointer hover:bg-gray-100'
                      : ''
                  }`}
                  onClick={() =>
                    column.sortable !== false && handleSort(column.key)
                  }
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {sortable &&
                      column.sortable !== false &&
                      getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
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
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={`transition-colors hover:bg-gray-50 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 text-sm whitespace-nowrap"
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-right text-sm whitespace-nowrap">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Trước
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 2
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`rounded px-3 py-1 text-sm ${
                        currentPage === page
                          ? 'bg-primary text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sau
            </button>
          </div>

          <span className="text-sm text-gray-600">
            Trang {currentPage} / {totalPages}
          </span>
        </div>
      )}
    </div>
  );
};

export default DataTable;
