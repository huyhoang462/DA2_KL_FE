import React from 'react';
import Modal from '../../ui/Modal';
import LoadingSpinner from '../../ui/LoadingSpinner';

const ReportDetailModal = ({
  isOpen,
  onClose,
  report,
  isLoading,
  formatReporter,
  formatDate,
  targetTypeMeta,
  getTargetTypeIcon,
  getTargetTypeLabel,
  reasonMeta,
  getStatusInfo,
  actionMeta,
  getActionInfo,
  onQuickAction,
  onViewPost,
}) => {
  if (!isOpen) return null;

  const currentReport = report;
  const resolvedPostId =
    currentReport?.targetType === 'comment'
      ? currentReport?.target?.post?.id || currentReport?.target?.post?._id
      : currentReport?.targetId ||
        currentReport?.target?.id ||
        currentReport?.target?._id;

  return (
    <Modal
      isOpen={isOpen}
      title="Chi tiết report"
      onClose={onClose}
      xButton={true}
      maxWidth="max-w-4xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : currentReport ? (
        <div className="max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1">
            <div className="mb-3 space-y-3 lg:col-span-2">
              <div className="bg-background-secondary border-border-default rounded-lg border p-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-text-secondary font-medium">
                      Reporter:
                    </span>
                    <span className="text-text-primary text-right">
                      {formatReporter(currentReport.reporter)}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-text-secondary font-medium">
                      Type:
                    </span>
                    <span
                      className={`inline-flex rounded-lg px-2 py-1 text-xs font-medium ${targetTypeMeta[currentReport.targetType]?.className}`}
                    >
                      {React.createElement(
                        getTargetTypeIcon(currentReport.targetType),
                        { className: 'h-3.5 w-3.5 mr-1' }
                      )}
                      {getTargetTypeLabel(currentReport.targetType)}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-text-secondary font-medium">
                      Reason:
                    </span>
                    <span className="text-text-primary text-right">
                      {reasonMeta[currentReport.reason] ||
                        currentReport.reason ||
                        'N/A'}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-text-secondary font-medium">
                      Status:
                    </span>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
                      style={{
                        background: getStatusInfo(currentReport.status).bgColor,
                        color: getStatusInfo(currentReport.status).textColor,
                      }}
                    >
                      {React.createElement(
                        getStatusInfo(currentReport.status).icon,
                        { className: 'h-3.5 w-3.5' }
                      )}
                      {getStatusInfo(currentReport.status).label}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-text-secondary font-medium">
                      Created:
                    </span>
                    <span className="text-text-primary text-right text-xs">
                      {formatDate(currentReport.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-border-default rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-text-secondary text-sm font-semibold">
                    {currentReport.targetType === 'post'
                      ? `Bài viết bị báo cáo `
                      : `Bình luận bị báo cáo `}
                  </h4>
                  <button
                    className="text-primary hover:text-primary/80 text-sm font-medium underline"
                    onClick={() => onViewPost(resolvedPostId)}
                  >
                    Xem chi tiết nội dung
                  </button>
                </div>
                <div className="bg-background-secondary rounded-md p-3">
                  <p className="text-text-primary text-sm italic">
                    &quot;{currentReport.target?.content || 'Không có nội dung'}
                    &quot;
                  </p>
                </div>
                <div className="mt-3">
                  <h4 className="text-text-secondary mb-1 text-sm font-semibold">
                    Nội dung báo cáo:
                  </h4>
                  <p className="text-text-primary text-sm">
                    {currentReport.description || '(Không có nội dung báo cáo)'}
                  </p>
                </div>
              </div>

              {currentReport.reviewedBy && (
                <div className="bg-success/5 border-success/20 rounded-lg border p-3">
                  <h4 className="text-success mb-1.5 text-xs font-semibold">
                    ✓ Kết quả review
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="text-text-secondary font-medium">
                        Xử lý bởi:
                      </span>
                      <span className="text-text-primary text-right">
                        {formatReporter(currentReport.reviewedBy)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-text-secondary font-medium">
                        Hành động:
                      </span>
                      <span className="text-text-primary text-right">
                        {getActionInfo(currentReport.action).label}
                      </span>
                    </div>
                    {currentReport.reviewNote && (
                      <div>
                        <p className="text-text-secondary mb-0.5 text-xs font-medium">
                          Ghi chú:
                        </p>
                        <p className="text-text-primary bg-background-primary rounded p-1 text-xs">
                          {currentReport.reviewNote}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {currentReport.status !== 'resolved' && (
              <div className="lg:col-span-1">
                <div className="bg-background-secondary border-border-default space-y-2 rounded-lg border p-3">
                  <h4 className="text-text-primary mb-2 text-xs font-semibold">
                    Hành động nhanh
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['remove_content', 'warn_user', 'ban_user', 'dismiss'].map(
                      (actionKey) => (
                        <button
                          key={actionKey}
                          type="button"
                          onClick={() => onQuickAction(actionKey)}
                          className={`flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${actionMeta[actionKey].className} border-opacity-20 border border-current hover:opacity-80`}
                          title={actionMeta[actionKey].label}
                        >
                          {React.createElement(actionMeta[actionKey].icon, {
                            className: 'h-3.5 w-3.5 flex-shrink-0',
                          })}
                          <span className="truncate text-xs">
                            {actionMeta[actionKey].label}
                          </span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-text-secondary py-10 text-center">
          Không có dữ liệu.
        </div>
      )}
    </Modal>
  );
};

export default ReportDetailModal;
