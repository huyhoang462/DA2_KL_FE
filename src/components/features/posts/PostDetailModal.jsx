import { useState } from 'react';
import {
  CalendarDays,
  Heart,
  Link2,
  MessageSquare,
  Send,
  Tag,
} from 'lucide-react';
import LoadingSpinner from '../../ui/LoadingSpinner';
import Modal from '../../ui/Modal';
import {
  CONTENT_PREVIEW_LIMIT,
  countComments,
  flattenReplies,
  formatDateTime,
  fromNow,
  getReplyDraftKey,
} from './postUtils';

const CommentBubble = ({
  comment,
  isReply = false,
  onReply,
  onReport,
  onStartEdit,
  onDelete,
  isOwner,
  isEditing,
  editValue,
  onEditValueChange,
  onSaveEdit,
  onCancelEdit,
  isActionLoading,
}) => (
  <div
    className={`${isReply ? 'ml-10' : ''} bg-background-secondary border-border-default rounded-xl border px-3 py-2.5`}
  >
    <div className="flex gap-3">
      <img
        src={comment.author.avatar}
        alt={comment.author.name}
        className={`${isReply ? 'h-7 w-7' : 'h-8 w-8'} rounded-full object-cover`}
      />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="text-text-primary text-sm font-semibold">
            {comment.replyDisplay ||
              (comment.replyToUserName
                ? `${comment.author.name} > ${comment.replyToUserName}`
                : comment.author.name)}
          </p>
          <span className="text-text-secondary text-xs">
            {fromNow(comment.createdAt)}
          </span>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <input
              value={editValue}
              onChange={(event) => onEditValueChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  onSaveEdit();
                }
              }}
              className="bg-foreground border-border-default focus:border-primary text-text-primary w-full rounded-lg border px-3 py-2 text-sm outline-none"
            />
            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={onSaveEdit}
                disabled={isActionLoading}
                className="text-primary font-semibold disabled:opacity-70"
              >
                Lưu
              </button>
              <button
                onClick={onCancelEdit}
                disabled={isActionLoading}
                className="text-text-secondary font-semibold disabled:opacity-70"
              >
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <p className="text-text-primary text-sm">{comment.content}</p>
        )}

        {!isEditing && (
          <div className="mt-2 flex items-center gap-3 text-xs">
            <button
              onClick={onReply}
              className="text-text-secondary hover:text-primary font-medium"
            >
              Phản hồi
            </button>

            {isOwner && (
              <button
                onClick={onStartEdit}
                className="text-text-secondary hover:text-primary font-medium"
              >
                Chỉnh sửa
              </button>
            )}

            {isOwner && (
              <button
                onClick={onDelete}
                disabled={isActionLoading}
                className="text-text-secondary hover:text-primary font-medium disabled:opacity-70"
              >
                Xóa
              </button>
            )}

            {!isOwner && (
              <button
                onClick={onReport}
                disabled={isActionLoading}
                className="text-text-secondary hover:text-primary font-medium disabled:opacity-70"
              >
                Báo cáo
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

const PostDetailModal = ({
  post,
  isOpen,
  onClose,
  currentUser,
  commentState,
  commentDraft,
  onCommentDraftChange,
  onSubmitRootComment,
  expandedContent,
  onToggleExpandedContent,
  activeReplyInput,
  onToggleReplyInput,
  replyDraftByComment,
  onReplyDraftChange,
  onSubmitReply,
  editingComment,
  onStartEditComment,
  onCancelEditComment,
  onSaveEditComment,
  onEditingCommentValueChange,
  commentActionState,
  onOpenDeleteComment,
  onOpenReportModal,
  isLiked,
  likeCount,
  onToggleLike,
  onSharePost,
  onBuyTickets = () => {},
}) => {
  if (!isOpen || !post) return null;

  const isLongContent = post.content.length > CONTENT_PREVIEW_LIMIT;
  const visibleContent =
    isLongContent && !expandedContent
      ? `${post.content.slice(0, CONTENT_PREVIEW_LIMIT)}...`
      : post.content;

  const comments = commentState.items || [];
  const commentCount = countComments(comments);

  // State lưu danh sách các ticketId đang được chọn mua
  const [selectedTicketIds, setSelectedTicketIds] = useState([]);

  // Hàm xử lý khi bấm tick chọn/bỏ chọn một vé
  const handleSelectTicket = (ticketId) => {
    setSelectedTicketIds((prevIds) => {
      if (prevIds.includes(ticketId)) {
        // Nếu đã có trong danh sách thì xóa đi (uncheck)
        return prevIds.filter((id) => id !== ticketId);
      } else {
        // Nếu chưa có thì thêm vào danh sách (check)
        return [...prevIds, ticketId];
      }
    });
  };

  // Hàm xử lý việc Click nút mua vé
  const handleBuyTickets = () => {
    if (selectedTicketIds.length === 0) return;

    console.log('Danh sách Ticket IDs đặt mua:', selectedTicketIds);
    // Thực hiện gọi API mua vé tại đây với payload là selectedTicketIds
    // Ví dụ: await buyTicketsAPI({ ticketIds: selectedTicketIds });
  };

  // Tính toán tổng số tiền của các vé đang được chọn mua (Hiển thị trực quan trên nút Mua)
  const totalAmount =
    post?.relatedTickets
      ?.filter((ticket) => selectedTicketIds.includes(ticket.ticketId))
      ?.reduce((sum, ticket) => sum + ticket.price, 0) || 0;

  return (
    <Modal
      isOpen={isOpen}
      title="Bài viết"
      onClose={onClose}
      xButton
      maxWidth="max-w-4xl"
    >
      <div className="max-h-[80vh] space-y-5 overflow-y-auto pr-1">
        <div className="flex items-start gap-3">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="h-11 w-11 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-text-primary text-sm font-semibold">
              {post.author.name}
            </h3>
            <p className="text-text-secondary text-xs">
              {fromNow(post.createdAt)}
            </p>
          </div>
        </div>

        <p className="text-text-primary text-sm leading-relaxed whitespace-pre-line">
          {visibleContent}
          {isLongContent && !expandedContent && (
            <button
              onClick={() => onToggleExpandedContent(post.id)}
              className="text-primary ml-1 text-sm font-semibold"
            >
              Xem thêm
            </button>
          )}
        </p>

        {post.images.length > 0 && (
          <div
            className={`grid gap-1 ${
              post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {post.images.map((image, index) => (
              <img
                key={`${post.id}-detail-image-${index}`}
                src={image}
                alt="Post"
                className={`w-full object-cover ${
                  post.images.length === 1 ? 'aspect-video' : 'aspect-square'
                }`}
              />
            ))}
          </div>
        )}

        {post?.postType === 'marketplace_listing' &&
          post?.relatedTickets?.length > 0 && (
            <div className="flex flex-col gap-4">
              {post.relatedEvent && (
                <div className="bg-foreground border-border-default rounded-xl border p-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={post.relatedEvent.bannerImageUrl}
                      alt={post.relatedEvent.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-text-primary truncate text-sm font-semibold">
                        {post.relatedEvent.name}
                      </p>
                      <div className="text-text-secondary mt-1 flex flex-wrap items-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDateTime(post.relatedEvent.startDate)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5" />
                          {post.relatedEvent.locationText}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-foreground border-border-default rounded-xl border p-4">
                <h4 className="text-text-primary mb-3 text-sm font-semibold">
                  Danh sách vé đang bán ({post.relatedTickets.length})
                </h4>

                <div className="flex flex-col gap-2.5">
                  {post.relatedTickets.map((ticket) => {
                    const isSelling = ticket.status === 'selling';
                    const isChecked = selectedTicketIds.includes(
                      ticket.ticketId
                    );

                    return (
                      <div
                        key={ticket.ticketId}
                        onClick={() =>
                          isSelling && handleSelectTicket(ticket.ticketId)
                        }
                        className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
                          isSelling
                            ? 'border-border-default hover:border-primary cursor-pointer bg-gray-50'
                            : 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-60'
                        } ${isChecked ? 'border-primary' : 'border-dashed'}`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Thẻ Checkbox - Chỉ hiện khi vé ở trạng thái 'selling' */}
                          <div className="mt-0.5 flex h-5 items-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={!isSelling}
                              onChange={() => {}} // Đã xử lý qua onClick của thẻ cha bên trên
                              className="h-4 w-4 cursor-pointer rounded border-gray-300 text-orange-600 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-30"
                            />
                          </div>

                          <div>
                            <p className="text-text-primary text-sm font-semibold">
                              {ticket.ticketTypeName}
                              {' - '}
                              {ticket.showName}
                              {' - '}
                              <span className="text-sm font-bold text-orange-600">
                                {ticket.originalPrice} USDT
                              </span>
                            </p>
                            {isSelling ? (
                              <span className="mt-1 inline-block rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                                Đang bán
                              </span>
                            ) : ticket.status === 'expired' ? (
                              <span className="mt-1 inline-block rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                                Hết hạn
                              </span>
                            ) : post?.author?._id !== ticket?.owner ? (
                              <span className="mt-1 inline-block rounded bg-red-200 px-1.5 py-0.5 text-[10px] font-medium text-red-500">
                                Đã bán
                              </span>
                            ) : (
                              <span className="mt-1 inline-block rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                                Ngưng bán
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-text-secondary text-sm font-bold">
                            Giá bán lại:{' '}
                            <span className="text-orange-600">
                              {ticket.price} USDT
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Khối Nút Mua hàng - Chỉ hiển thị khi có ít nhất 1 vé được chọn */}
                {selectedTicketIds.length > 0 && (
                  <div className="mt-4 flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
                    <div className="text-text-secondary text-sm">
                      Đã chọn:{' '}
                      <span className="text-text-primary font-semibold">
                        {selectedTicketIds.length} vé
                      </span>
                    </div>

                    <button
                      onClick={() => onBuyTickets(selectedTicketIds)}
                      className="bg-primary hover:bg-primary-hover flex items-center gap-1 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors"
                    >
                      Mua ngay •{' '}
                      <span className="font-bold">{totalAmount} USDT</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        <div className="border-border-default text-text-secondary flex items-center justify-between border-t pt-3 text-sm">
          <button
            onClick={() => onToggleLike(post.id)}
            className={`flex items-center gap-2 transition ${
              isLiked ? 'text-destructive' : 'hover:text-destructive'
            }`}
          >
            <Heart
              className="h-4 w-4"
              fill={isLiked ? 'currentColor' : 'none'}
            />
            <span>
              Yêu thích {Number(likeCount || 0) > 0 ? `(${likeCount})` : ''}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSharePost(post.id)}
              className="hover:text-info flex items-center gap-2 transition"
            >
              <Link2 className="h-4 w-4" />
              <span>Chia sẻ</span>
            </button>
            <span className="text-text-secondary inline-flex items-center gap-1 text-xs">
              <MessageSquare className="h-4 w-4" />
              {commentCount} bình luận
            </span>
          </div>
        </div>

        <div className="border-border-default space-y-4 border-t pt-4">
          {commentState.isLoading && (
            <div className="text-text-secondary flex items-center gap-2 text-sm">
              <LoadingSpinner size="sm" /> Đang tải bình luận...
            </div>
          )}

          {commentState.error && (
            <div className="bg-destructive-background text-destructive-text-on-subtle rounded-lg px-3 py-2 text-sm">
              {commentState.error}
            </div>
          )}

          {!commentState.isLoading && comments.length === 0 && (
            <p className="text-text-secondary text-sm">
              Chưa có bình luận, hãy mở đầu cuộc trò chuyện.
            </p>
          )}

          {comments.map((comment) => {
            const rootDraftKey = getReplyDraftKey(post.id, comment.id);
            const isRootReplyOpen = activeReplyInput === comment.id;

            return (
              <div key={comment.id} className="space-y-3">
                <CommentBubble
                  comment={comment}
                  isOwner={Boolean(
                    currentUser?.id && comment.author.id === currentUser.id
                  )}
                  isEditing={
                    editingComment.postId === post.id &&
                    editingComment.commentId === comment.id
                  }
                  editValue={
                    editingComment.postId === post.id &&
                    editingComment.commentId === comment.id
                      ? editingComment.value
                      : comment.content
                  }
                  onEditValueChange={onEditingCommentValueChange}
                  onStartEdit={() => onStartEditComment(post.id, comment)}
                  onSaveEdit={() => onSaveEditComment(post.id, comment.id)}
                  onCancelEdit={onCancelEditComment}
                  onDelete={() => onOpenDeleteComment(post.id, comment.id)}
                  onReport={() =>
                    onOpenReportModal({
                      targetType: 'comment',
                      targetId: comment.id,
                      postId: post.id,
                      targetOwnerId: comment.author.id,
                    })
                  }
                  isActionLoading={
                    commentActionState.postId === post.id &&
                    commentActionState.commentId === comment.id
                  }
                  onReply={() => onToggleReplyInput(post.id, comment.id)}
                />

                {isRootReplyOpen && (
                  <div className="bg-background-secondary border-border-default ml-10 flex items-center gap-2 rounded-full border px-2 py-1">
                    <img
                      src={
                        currentUser?.avatar ||
                        'https://picsum.photos/seed/current-user/100/100'
                      }
                      alt="Current user"
                      className="h-7 w-7 rounded-full object-cover"
                    />
                    <div className="relative flex-1">
                      <input
                        value={replyDraftByComment[rootDraftKey] || ''}
                        onChange={(event) =>
                          onReplyDraftChange(rootDraftKey, event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            onSubmitReply(post.id, comment.id, rootDraftKey);
                          }
                        }}
                        placeholder="Viết phản hồi..."
                        className="text-text-primary w-full bg-transparent px-2 py-2 pr-10 text-sm outline-none"
                      />
                      <button
                        onClick={() =>
                          onSubmitReply(post.id, comment.id, rootDraftKey)
                        }
                        className="text-primary absolute top-1/2 right-3 -translate-y-1/2 disabled:opacity-70"
                        aria-label="Gửi phản hồi"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {flattenReplies(comment.replies || []).map((reply) => {
                  const replyDraftKey = getReplyDraftKey(post.id, reply.id);
                  const isReplyInputOpen = activeReplyInput === reply.id;

                  return (
                    <div key={reply.id} className="space-y-3">
                      <CommentBubble
                        comment={reply}
                        isReply
                        isOwner={Boolean(
                          currentUser?.id && reply.author.id === currentUser.id
                        )}
                        isEditing={
                          editingComment.postId === post.id &&
                          editingComment.commentId === reply.id
                        }
                        editValue={
                          editingComment.postId === post.id &&
                          editingComment.commentId === reply.id
                            ? editingComment.value
                            : reply.content
                        }
                        onEditValueChange={onEditingCommentValueChange}
                        onStartEdit={() => onStartEditComment(post.id, reply)}
                        onSaveEdit={() => onSaveEditComment(post.id, reply.id)}
                        onCancelEdit={onCancelEditComment}
                        onDelete={() => onOpenDeleteComment(post.id, reply.id)}
                        onReport={() =>
                          onOpenReportModal({
                            targetType: 'comment',
                            targetId: reply.id,
                            postId: post.id,
                            targetOwnerId: reply.author.id,
                          })
                        }
                        isActionLoading={
                          commentActionState.postId === post.id &&
                          commentActionState.commentId === reply.id
                        }
                        onReply={() => onToggleReplyInput(post.id, reply.id)}
                      />

                      {isReplyInputOpen && (
                        <div className="bg-background-secondary border-border-default ml-16 flex items-center gap-2 rounded-full border px-2 py-1">
                          <img
                            src={
                              currentUser?.avatar ||
                              'https://picsum.photos/seed/current-user/100/100'
                            }
                            alt="Current user"
                            className="h-7 w-7 rounded-full object-cover"
                          />
                          <div className="relative flex-1">
                            <input
                              value={replyDraftByComment[replyDraftKey] || ''}
                              onChange={(event) =>
                                onReplyDraftChange(
                                  replyDraftKey,
                                  event.target.value
                                )
                              }
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  onSubmitReply(
                                    post.id,
                                    reply.id,
                                    replyDraftKey
                                  );
                                }
                              }}
                              placeholder="Viết phản hồi..."
                              className="text-text-primary w-full bg-transparent px-2 py-2 pr-10 text-sm outline-none"
                            />
                            <button
                              onClick={() =>
                                onSubmitReply(post.id, reply.id, replyDraftKey)
                              }
                              className="text-primary absolute top-1/2 right-3 -translate-y-1/2 disabled:opacity-70"
                              aria-label="Gửi phản hồi"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          <div className="bg-background-secondary border-border-default flex items-center gap-2 rounded-full border px-2 py-1">
            <img
              src={
                currentUser?.avatar ||
                'https://picsum.photos/seed/current-user/100/100'
              }
              className="h-8 w-8 rounded-full object-cover"
              alt="Me"
            />
            <div className="relative flex-1">
              <input
                value={commentDraft}
                onChange={(event) => onCommentDraftChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    onSubmitRootComment(post.id);
                  }
                }}
                placeholder="Viết bình luận..."
                className="text-text-primary w-full bg-transparent px-2 py-2 pr-10 text-sm outline-none"
              />
              <button
                onClick={() => onSubmitRootComment(post.id)}
                className="text-primary absolute top-1/2 right-3 -translate-y-1/2 disabled:opacity-70"
                aria-label="Gửi bình luận"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PostDetailModal;
