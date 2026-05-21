import React, { useState } from 'react';
import { Eye, Clock3, BadgeCheck } from 'lucide-react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import PostCard from '../posts/PostCard';
import { normalizePost } from '../posts/postUtils';

const ReportDetailModal = ({
  isOpen,
  report,
  onClose,
  formatReporter,
  formatDate,
  actionMeta,
  reasonMeta,
  targetTypeMeta,
  getTargetTypeLabel,
  getTargetTypeIcon,
  getStatusInfo,
  getActionInfo,
  onQuickAction,
}) => {
  const [showTarget, setShowTarget] = useState(false);

  if (!isOpen) return null;

  // Handle rendering of Target Post using PostCard
  const renderTargetPreview = () => {
    if (!report?.target) return null;

    // Convert target to a format PostCard accepts
    let pseudoPost = null;
    if (report.targetType === 'post') {
      pseudoPost = normalizePost(report.target);
    } else if (report.targetType === 'comment' && report.target.relatedPost) {
      pseudoPost = normalizePost(report.target.relatedPost);
    }

    if (!pseudoPost) {
      return (
        <div className="text-text-secondary p-4 text-center text-sm">
          Không tìm thấy bài viết hoặc bài viết đã bị xóa.
        </div>
      );
    }

    return (
      <div className="bg-background-primary border-border-default max-h-[60vh] overflow-y-auto rounded-lg border">
        {report.targetType === 'comment' && (
          <div className="bg-primary/5 border-primary/20 mb-2 border-b p-3">
            <h5 className="text-primary mb-1 text-xs font-medium">
              Nội dung bình luận bị báo cáo:
            </h5>
            <p className="border-primary/10 rounded border bg-white/60 p-2 text-sm">
              {report.target.content}
            </p>
          </div>
        )}
        <div className="pointer-events-none-interactions pointer-events-none p-2">
          {/* We use pointer-events-none-interactions to disable link clicking inside the preview */}
          <PostCard post={pseudoPost} isExpanded={true} />
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      title={showTarget ? 'Chi tiết bài viết' : 'Chi tiết report'}
      onClose={() => {
        if (showTarget) {
          setShowTarget(false);
        } else {
          onClose();
        }
      }}
      xButton={true}
      maxWidth="max-w-4xl"
    >
      {showTarget ? (
        <div className="space-y-4">
          <div className="mb-2 flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowTarget(false)}
            >
              Quay lại chi tiết report
            </Button>
          </div>
          {renderTargetPreview()}
        </div>
      ) : (
        <div className="max-h-[75vh] overflow-y-auto">
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Main Content Area */}
            <div className="flex-1 space-y-4">
              {/* Reporter & Report Info */}
              <div className="bg-background-secondary border-border-default rounded-xl border p-4">
                <div className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-3 text-sm">
                  <span className="text-text-secondary font-medium">
                    Reporter:
                  </span>
                  <span className="text-text-primary font-semibold">
                    {formatReporter(report.reporter)}
                  </span>

                  <span className="text-text-secondary font-medium">Type:</span>
                  <span className="flex items-center">
                    <span
                      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${targetTypeMeta[report.targetType]?.className}`}
                    >
                      {React.createElement(
                        getTargetTypeIcon(report.targetType),
                        { className: 'h-3.5 w-3.5 mr-1.5' }
                      )}
                      {getTargetTypeLabel(report.targetType)}
                    </span>
                  </span>

                  <span className="text-text-secondary font-medium">
                    Reason:
                  </span>
                  <span className="text-text-primary">
                    {reasonMeta[report.reason] || report.reason || 'Khác'}
                  </span>

                  <span className="text-text-secondary font-medium">
                    Status:
                  </span>
                  <span className="flex items-center">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        background: getStatusInfo(report.status).bgColor,
                        color: getStatusInfo(report.status).textColor,
                      }}
                    >
                      {React.createElement(getStatusInfo(report.status).icon, {
                        className: 'h-3.5 w-3.5',
                      })}
                      {getStatusInfo(report.status).label}
                    </span>
                  </span>

                  <span className="text-text-secondary font-medium">
                    Created:
                  </span>
                  <span className="text-text-primary">
                    {formatDate(report.createdAt)}
                  </span>
                </div>
              </div>

              {/* Report Content */}
              <div className="bg-background-secondary border-border-default overflow-hidden rounded-xl border">
                <div className="bg-background-primary border-border-default border-b px-4 py-2">
                  <h4 className="text-text-primary text-xs font-bold tracking-wider uppercase">
                    Nội dung báo cáo
                  </h4>
                </div>
                <div className="p-4">
                  <p className="text-text-primary text-sm leading-6 whitespace-pre-line">
                    {report.description || (
                      <span className="text-text-secondary italic">
                        Người dùng không cung cấp mô tả chi tiết.
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Target Content Overview */}
              <div className="bg-background-secondary border-border-default rounded-xl border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-text-primary flex items-center gap-2 text-sm font-bold">
                    {report.targetType === 'post'
                      ? '📄 Bài viết bị báo cáo'
                      : '💬 Bình luận bị báo cáo'}
                  </h4>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setShowTarget(true)}
                    className="flex items-center gap-1.5"
                  >
                    <Eye className="h-4 w-4" />
                    Xem bài viết
                  </Button>
                </div>

                <div className="bg-background-primary border-border-default rounded-lg border p-3">
                  <div className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-2 text-sm">
                    <span className="text-text-secondary font-medium">
                      Tác giả:
                    </span>
                    <span className="text-text-primary">
                      {formatReporter(report.target?.author) ||
                        'Không xác định'}
                    </span>

                    {report.targetType === 'comment' &&
                      report.target?.relatedPost && (
                        <>
                          <span className="text-text-secondary font-medium">
                            Tiêu đề bài:
                          </span>
                          <span className="text-text-primary font-medium">
                            {report.target.relatedPost.title ||
                              report.target.relatedPost.content?.slice(0, 50) +
                                '...' ||
                              'Không có tiêu đề'}
                          </span>
                        </>
                      )}

                    {report.targetType === 'post' && report.target?.title && (
                      <>
                        <span className="text-text-secondary font-medium">
                          Tiêu đề:
                        </span>
                        <span className="text-text-primary font-medium">
                          {report.target.title}
                        </span>
                      </>
                    )}

                    <span className="text-text-secondary mt-1 font-medium">
                      Trích đoạn:
                    </span>
                    <span className="text-text-secondary mt-1 line-clamp-2 text-sm italic">
                      "{report.target?.content || 'Không có nội dung'}"
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Result (Optional) */}
              {report.reviewedBy && (
                <div className="bg-success/5 border-success/20 rounded-xl border p-4">
                  <h4 className="text-success mb-3 flex items-center gap-2 text-sm font-semibold">
                    <BadgeCheck className="h-4 w-4" />
                    Kết quả xử lý
                  </h4>
                  <div className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-2 text-sm">
                    <span className="text-text-secondary font-medium">
                      Xử lý bởi:
                    </span>
                    <span className="text-text-primary">
                      {formatReporter(report.reviewedBy)}
                    </span>
                    <span className="text-text-secondary font-medium">
                      Hành động:
                    </span>
                    <span className="text-text-primary font-medium">
                      {getActionInfo(report.action).label}
                    </span>
                    {report.reviewNote && (
                      <>
                        <span className="text-text-secondary mt-1 font-medium">
                          Ghi chú:
                        </span>
                        <span className="text-text-primary mt-1 rounded bg-white/50 p-2 text-sm">
                          {report.reviewNote}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Sidebar */}
            <div className="w-full shrink-0 lg:w-64">
              <div className="bg-background-secondary border-border-default sticky top-0 rounded-xl border p-4">
                <h4 className="text-text-primary mb-3 text-sm font-bold tracking-wider uppercase">
                  Hành động
                </h4>
                <p className="text-text-secondary mb-4 text-xs">
                  Chọn hành động để đánh dấu báo cáo là đã xử lý.
                </p>

                <div className="flex flex-col gap-2.5">
                  {['remove_content', 'warn_user', 'ban_user', 'dismiss'].map(
                    (actionKey) => {
                      const meta = actionMeta[actionKey];
                      return (
                        <button
                          key={actionKey}
                          type="button"
                          onClick={() => onQuickAction(actionKey)}
                          className={`flex items-center justify-start gap-2.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${meta.className} border border-transparent hover:border-current hover:shadow-sm`}
                          title={meta.label}
                        >
                          {React.createElement(meta.icon, {
                            className: 'h-4 w-4 flex-shrink-0',
                          })}
                          <span>{meta.label}</span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ReportDetailModal;
