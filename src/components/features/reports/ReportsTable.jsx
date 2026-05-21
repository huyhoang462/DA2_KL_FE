import React from 'react';
import {
  Eye,
  Trash2,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Button from '../../ui/Button';

const ReportsTable = ({
  reports,
  isLoading,
  pagination,
  onPageChange,
  onDetail,
  onDelete,
  targetTypeMeta,
  reasonMeta,
  getStatusInfo,
  getActionInfo,
  getTargetTypeIcon,
  getTargetTypeLabel,
  formatReporter,
  formatDate,
}) => {
  return (
    <div className="bg-background-secondary border-border-default overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background-primary border-border-default border-b">
            <tr>
              <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold uppercase">
                Reporter
              </th>
              <th className="text-text-secondary px-4 py-3 text-center text-xs font-semibold uppercase">
                Type
              </th>
              <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold uppercase">
                Reason
              </th>
              <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold uppercase">
                Status
              </th>
              <th className="text-text-secondary px-4 py-3 text-center text-xs font-semibold uppercase">
                Xử lý
              </th>
              <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold uppercase">
                Created at
              </th>
            </tr>
          </thead>

          <tbody className="divide-border-default divide-y">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center py-4">
                    <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"></div>
                  </div>
                </td>
              </tr>
            ) : reports.length > 0 ? (
              reports.map((report) => {
                const reportId = report.id || report._id;
                const statusInfo = getStatusInfo(report.status);
                const actionInfo = getActionInfo(report.action);

                return (
                  <tr key={reportId} className="hover:bg-background-primary/60">
                    <td className="text-text-primary px-4 py-4 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatReporter(report.reporter)}
                        </span>
                        {report.reporter?.email && (
                          <span className="text-text-secondary text-xs">
                            {report.reporter.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <span
                          className={`inline-flex rounded-lg px-2 py-1 ${targetTypeMeta[report.targetType]?.className || 'bg-text-secondary/10 text-text-secondary'}`}
                          title={getTargetTypeLabel(report.targetType)}
                        >
                          {React.createElement(
                            getTargetTypeIcon(report.targetType),
                            {
                              className: 'h-4 w-4',
                            }
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className="text-text-primary">
                        {reasonMeta[report.reason] || report.reason || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
                        style={{
                          background: statusInfo.bgColor,
                          color: statusInfo.textColor,
                        }}
                      >
                        {React.createElement(statusInfo.icon, {
                          className: 'h-3.5 w-3.5',
                        })}
                        {statusInfo.label}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center">
                      {report.action && report.action !== 'no_action' ? (
                        <span
                          className={`inline-flex rounded-lg px-2 py-1 text-xs font-medium ${actionInfo.className}`}
                          title={actionInfo.label}
                        >
                          {React.createElement(actionInfo.icon, {
                            className: 'h-4 w-4',
                          })}{' '}
                        </span>
                      ) : (
                        <span className="text-text-secondary text-xs">-</span>
                      )}
                    </td>
                    <td className="text-text-secondary px-4 py-4 text-sm">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          title="Xem chi tiết"
                          onClick={() => onDetail(report)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          title="Xóa report"
                          onClick={() => onDelete(report)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <ShieldAlert className="text-text-secondary h-10 w-10" />
                    <div>
                      <p className="text-text-primary font-medium">
                        Không có report phù hợp
                      </p>
                      <p className="text-text-secondary mt-1 text-sm">
                        Hãy đổi bộ lọc hoặc làm mới danh sách
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-border-default flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-text-secondary text-sm">
          Hiển thị trang {pagination.currentPage || 1} /{' '}
          {pagination.totalPages || 1} · Tổng{' '}
          {Number(pagination.totalItems || reports.length).toLocaleString(
            'vi-VN'
          )}{' '}
          report
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              onPageChange(Math.max(1, (pagination.currentPage || 1) - 1))
            }
            disabled={(pagination.currentPage || 1) <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              onPageChange(
                Math.min(
                  pagination.totalPages || 1,
                  (pagination.currentPage || 1) + 1
                )
              )
            }
            disabled={
              (pagination.currentPage || 1) >= (pagination.totalPages || 1)
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportsTable;
