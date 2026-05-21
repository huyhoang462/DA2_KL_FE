import React, { useMemo, useState } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  BadgeCheck,
  Clock3,
  FileText,
  Flag,
  MessageSquare,
  MessageCircleMore,
  Trash2,
  User,
  Ban,
  AlertCircle,
  Zap,
} from 'lucide-react';
import ConfirmModal from '../../components/ui/ConfirmModal';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import ReportSkeleton from '../../components/features/admin/ReportSkeleton';
//import AdminSummaryCard from '../../components/features/admin/AdminSummaryCard';
import SummaryCards from '../../components/features/reports/SummaryCards';
import {
  deleteReport,
  getReportById,
  getReportSummary,
  getReports,
  reviewReport,
} from '../../services/reportService';
import ReportsTable from '../../components/features/reports/ReportsTable';
import AdminReportDetailModal from '../../components/features/reports/AdminReportDetailModal';
import PostViewModal from '../../components/features/reports/PostViewModal';

const defaultFilters = {
  page: 1,
  limit: 20,
  status: '',
  targetType: '',
  action: '',
};

const normalizeReportsPayload = (raw) => {
  const response = raw || {};

  // Common shape from guide: { data: [...], pagination: {...} }
  if (Array.isArray(response.data)) {
    return {
      reports: response.data,
      pagination: response.pagination || null,
    };
  }

  // Wrapped shapes: { data: { reports/items/data, pagination } }
  const inner =
    response.data && typeof response.data === 'object' ? response.data : null;
  if (inner) {
    const reports =
      inner.reports ||
      inner.items ||
      inner.data ||
      (Array.isArray(inner) ? inner : []);

    if (Array.isArray(reports)) {
      return {
        reports,
        pagination: inner.pagination || response.pagination || null,
      };
    }
  }

  // Direct array fallback
  if (Array.isArray(response)) {
    return {
      reports: response,
      pagination: response.pagination || null,
    };
  }

  // Last resort by checking known keys at top-level
  const topReports = response.reports || response.items || response.list || [];
  return {
    reports: Array.isArray(topReports) ? topReports : [],
    pagination: response.pagination || null,
  };
};

const statusMeta = {
  pending: {
    label: 'Chờ xử lý',
    className: 'bg-warning/10 text-warning',
    icon: Clock3,
    bgColor: '#fef3c7',
    textColor: '#f59e0b',
  },
  resolved: {
    label: 'Đã xử lý',
    className: 'bg-success/10 text-success',
    icon: BadgeCheck,
    bgColor: '#dcfce7',
    textColor: '#16a34a',
  },
};

const actionMeta = {
  remove_content: {
    label: 'Xóa nội dung',
    className: 'bg-destructive/10 text-destructive',
    icon: Trash2,
    bgColor: 'bg-destructive',
  },
  warn_user: {
    label: 'Cảnh báo người dùng',
    className: 'bg-warning/10 text-warning',
    icon: AlertCircle,
    bgColor: 'bg-warning',
  },
  ban_user: {
    label: 'Khóa tài khoản',
    className: 'bg-destructive/10 text-destructive',
    icon: Ban,
    bgColor: 'bg-destructive',
  },
  dismiss: {
    label: 'Bỏ qua',
    className: 'bg-text-secondary/10 text-text-secondary',
    icon: Zap,
    bgColor: 'bg-text-secondary',
  },
  no_action: {
    label: 'Bỏ qua',
    className: 'bg-text-secondary/10 text-text-secondary',
    icon: User,
    bgColor: 'bg-text-secondary',
  },
};

const reasonMeta = {
  spam: 'Spam',
  inappropriate: 'Không phù hợp',
  scam: 'Lừa đảo',
  harassment: 'Quấy rối',
  other: 'Khác',
};

const targetTypeMeta = {
  post: {
    label: 'Bài viết',
    icon: FileText,
    className: 'bg-info/10 text-info',
    color: 'info',
  },
  comment: {
    label: 'Bình luận',
    icon: MessageCircleMore,
    className: 'bg-primary/10 text-primary',
    color: 'primary',
  },
};

const getTargetTypeIcon = (targetType) => {
  const meta = targetTypeMeta[targetType];
  return meta?.icon || FileText;
};

const summaryCardConfig = [
  {
    key: 'totalItems',
    label: 'Tổng báo cáo',
    icon: Flag,
    color: 'primary',
  },
  {
    key: 'pending',
    label: 'Chờ xử lý',
    icon: Clock3,
    color: 'warning',
  },
  {
    key: 'resolved',
    label: 'Đã xử lý',
    icon: BadgeCheck,
    color: 'success',
  },
  {
    key: 'postCount',
    label: 'Báo cáo bài viết',
    icon: FileText,
    color: 'info',
  },
  {
    key: 'commentCount',
    label: 'Báo cáo bình luận',
    icon: MessageSquare,
    color: 'primary',
  },
];

const formatDate = (value) => {
  if (!value) return 'N/A';

  return new Date(value).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatReporter = (reporter) => {
  if (!reporter) return 'Ẩn danh';
  if (typeof reporter === 'string') return reporter;

  return (
    reporter.fullName ||
    reporter.name ||
    reporter.email ||
    reporter.id ||
    'Ẩn danh'
  );
};

const getStatusInfo = (status) => {
  return statusMeta[status] || statusMeta.pending;
};

const getActionInfo = (action) => {
  return actionMeta[action] || actionMeta.no_action;
};

const getTargetTypeLabel = (targetType) => {
  const meta = targetTypeMeta[targetType];
  return meta?.label || targetType || 'N/A';
};

const AdminContenReportsPage = () => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState(defaultFilters);

  const [detailState, setDetailState] = useState({
    isOpen: false,
    reportId: null,
    preview: null,
  });
  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    report: null,
  });
  const [postViewState, setPostViewState] = useState({
    isOpen: false,
    postId: null,
  });

  const reportsQuery = useQuery({
    queryKey: ['admin-content-reports', filters],
    queryFn: () => getReports(filters),
    placeholderData: keepPreviousData,
  });

  const summaryQuery = useQuery({
    queryKey: ['admin-content-reports-summary'],
    queryFn: getReportSummary,
  });

  const { data: detailPayload, isLoading } = useQuery({
    queryKey: ['admin-content-report', detailState.reportId],
    queryFn: () => getReportById(detailState.reportId),
    enabled: Boolean(detailState.reportId),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ reportId, payload }) => reviewReport(reportId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries(['admin-content-reports']),
        queryClient.invalidateQueries(['admin-content-reports-summary']),
        queryClient.invalidateQueries([
          'admin-content-report',
          detailState.reportId,
        ]),
      ]);
      setDetailState({ isOpen: false, reportId: null, preview: null });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (reportId) => deleteReport(reportId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries(['admin-content-reports']),
        queryClient.invalidateQueries(['admin-content-reports-summary']),
      ]);
      setDeleteState({ isOpen: false, report: null });
      if (deleteState.report?.id === detailState.reportId) {
        setDetailState({ isOpen: false, reportId: null, preview: null });
      }
    },
  });

  const normalizedList = useMemo(
    () => normalizeReportsPayload(reportsQuery.data),
    [reportsQuery.data]
  );
  const summaryPayload = useMemo(
    () =>
      summaryQuery.data?.summary ||
      summaryQuery.data?.data ||
      summaryQuery.data ||
      {},
    [summaryQuery.data]
  );

  const reports = normalizedList.reports;

  const pagination = normalizedList.pagination || {
    currentPage: filters.page,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: filters.limit,
  };

  const summary = useMemo(() => summaryPayload || {}, [summaryPayload]);

  const currentReport = detailPayload?.data || detailState.preview;

  const summaryCards = useMemo(() => {
    const byStatus = summary.byStatus || {};
    const byTargetType = summary.byTargetType || {};

    return summaryCardConfig.map((card) => {
      if (card.key === 'pending') {
        return {
          ...card,
          value: summary.pending ?? byStatus.pending ?? 0,
        };
      }

      if (card.key === 'resolved') {
        return {
          ...card,
          value: summary.resolved ?? byStatus.resolved ?? 0,
        };
      }

      if (card.key === 'postCount') {
        return {
          ...card,
          value: summary.postCount ?? byTargetType.post ?? 0,
        };
      }

      if (card.key === 'commentCount') {
        return {
          ...card,
          value: summary.commentCount ?? byTargetType.comment ?? 0,
        };
      }

      return {
        ...card,
        value: summary.totalItems ?? summary.totalReports ?? summary.total ?? 0,
      };
    });
  }, [summary]);

  const handleClickSummaryCard = (key) => {
    if (key === 'totalItems') {
      setFilters((prev) => ({
        ...prev,
        page: 1,
        status: '',
        targetType: '',
        action: '',
      }));
    } else if (key === 'pending') {
      setFilters((prev) => ({
        ...prev,
        page: 1,
        status: 'pending',
        targetType: '',
      }));
    } else if (key === 'resolved') {
      setFilters((prev) => ({
        ...prev,
        page: 1,
        status: 'resolved',
        targetType: '',
      }));
    } else if (key === 'postCount') {
      setFilters((prev) => ({
        ...prev,
        page: 1,
        status: '',
        targetType: 'post',
      }));
    } else if (key === 'commentCount') {
      setFilters((prev) => ({
        ...prev,
        page: 1,
        status: '',
        targetType: 'comment',
      }));
    }
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const openReportDetail = (report) => {
    const reportId = report?.id || report?._id;
    if (!reportId) return;

    setDetailState({
      isOpen: true,
      reportId,
      preview: report,
    });
  };

  const openDeleteDialog = (report) => {
    setDeleteState({ isOpen: true, report });
  };

  const handleCloseDetail = () => {
    setDetailState({ isOpen: false, reportId: null, preview: null });
  };

  const handleOpenPostView = (postId) => {
    setPostViewState({ isOpen: true, postId });
  };

  const handleClosePostView = () => {
    setPostViewState({ isOpen: false, postId: null });
  };

  const handleQuickAction = (actionKey) => {
    const payload = {
      status: 'resolved',
      action: actionKey,
      reviewNote: undefined,
    };

    reviewMutation.mutate({
      reportId: currentReport?.id || currentReport?._id || detailState.reportId,
      payload,
    });
  };

  const handleDeleteReport = () => {
    if (!deleteState.report) return;

    deleteMutation.mutate(deleteState.report.id || deleteState.report._id);
  };

  const manualRefresh = async () => {
    await Promise.all([reportsQuery.refetch(), summaryQuery.refetch()]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-text-primary text-3xl font-bold">
            Quản lý báo cáo nội dung
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            Xử lý báo cáo về bài viết và bình luận
          </p>
        </div>
      </div>

      {!reportsQuery.data &&
      (reportsQuery.isLoading || summaryQuery.isLoading) ? (
        <ReportSkeleton />
      ) : reportsQuery.error ? (
        <ErrorDisplay
          message={
            reportsQuery.error?.message || 'Không tải được danh sách report'
          }
          onRetry={manualRefresh}
        />
      ) : (
        <>
          <SummaryCards
            cards={summaryCards}
            isLoading={summaryQuery.isLoading}
            onCardClick={handleClickSummaryCard}
          />

          <ReportsTable
            reports={reports}
            isLoading={reportsQuery.isLoading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onDetail={openReportDetail}
            onDelete={openDeleteDialog}
            targetTypeMeta={targetTypeMeta}
            reasonMeta={reasonMeta}
            getStatusInfo={getStatusInfo}
            getActionInfo={getActionInfo}
            getTargetTypeIcon={getTargetTypeIcon}
            getTargetTypeLabel={getTargetTypeLabel}
            formatReporter={formatReporter}
            formatDate={formatDate}
          />
        </>
      )}

      <AdminReportDetailModal
        isOpen={detailState.isOpen}
        onClose={handleCloseDetail}
        report={currentReport}
        isLoading={isLoading && !currentReport}
        formatReporter={formatReporter}
        formatDate={formatDate}
        targetTypeMeta={targetTypeMeta}
        getTargetTypeIcon={getTargetTypeIcon}
        getTargetTypeLabel={getTargetTypeLabel}
        reasonMeta={reasonMeta}
        statusMeta={statusMeta}
        getStatusInfo={getStatusInfo}
        actionMeta={actionMeta}
        getActionInfo={getActionInfo}
        onQuickAction={handleQuickAction}
        onViewPost={handleOpenPostView}
      />

      <PostViewModal
        isOpen={postViewState.isOpen}
        onClose={handleClosePostView}
        postId={postViewState.postId}
      />

      <ConfirmModal
        isOpen={deleteState.isOpen}
        title="Xóa report"
        message="DỮ liệu nãy sẽ bị xóa vĩnh viễn. Bạn có chắc chắn muốn xóa báo cáo này không?"
        onConfirm={handleDeleteReport}
        onCancel={() => setDeleteState({ isOpen: false, report: null })}
        confirmText="Xóa report"
        confirmVariant="destructive"
        isLoading={deleteMutation.isLoading}
      />
    </div>
  );
};

export default AdminContenReportsPage;
