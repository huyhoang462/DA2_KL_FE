// PostDetailModal.jsx

import { useState } from 'react';
import { CalendarDays, Heart, Link2, MessageSquare, Tag } from 'lucide-react';
import Modal from '../../ui/Modal';
import CommentSection from './CommentSection';
import {
  CONTENT_PREVIEW_LIMIT,
  countComments,
  formatDateTime,
  fromNow,
} from './postUtils';

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
  const isOwnerPost = post?.author?.id === currentUser?.id;

  const comments = commentState.items || [];
  const commentCount = countComments(comments);

  // State lưu danh sách các ticketId đang được chọn mua
  const [selectedTicketIds, setSelectedTicketIds] = useState([]);

  // Hàm xử lý khi bấm tick chọn/bỏ chọn một vé
  const handleSelectTicket = (ticketId) => {
    setSelectedTicketIds((prevIds) => {
      if (prevIds.includes(ticketId)) {
        return prevIds.filter((id) => id !== ticketId);
      } else {
        return [...prevIds, ticketId];
      }
    });
  };

  // Hàm xử lý việc Click nút mua vé
  const handleBuyTickets = () => {
    if (selectedTicketIds.length === 0) return;
    console.log('Danh sách Ticket IDs đặt mua:', selectedTicketIds);
    onBuyTickets(selectedTicketIds, post.id);
  };

  // Tính toán tổng số tiền
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
      maxWidth="max-w-6xl" // Mở rộng Modal để đủ không gian cho 2 cột
    >
      {/* Container chính: 2 cột trên PC, 1 cột trên Mobile */}
      <div className="mt-2 flex flex-col gap-6 md:h-[75vh] md:flex-row md:gap-0 md:overflow-hidden">
        {/* ─── CỘT TRÁI: NỘI DUNG BÀI VIẾT ─── */}
        <div className="custom-scrollbar w-full flex-shrink-0 md:w-[55%] md:overflow-y-auto md:pr-6 lg:w-[70%]">
          <div className="space-y-5 pb-4 md:pb-0">
            {/* Tác giả */}
            <div className="flex items-start gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="border-border-subtle h-11 w-11 rounded-full border object-cover"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-text-primary text-sm font-semibold">
                  {post.author.name}
                </h3>
                <p className="text-text-secondary mt-0.5 text-xs">
                  {fromNow(post.createdAt)}
                </p>
              </div>
            </div>

            {/* Nội dung text */}
            <p className="text-text-primary text-sm leading-relaxed whitespace-pre-line">
              {visibleContent}
              {isLongContent && !expandedContent && (
                <button
                  onClick={() => onToggleExpandedContent(post.id)}
                  className="text-primary hover:text-primary-hover ml-1 text-sm font-semibold transition-colors"
                >
                  Xem thêm
                </button>
              )}
            </p>

            {/* Hình ảnh */}
            {post.images.length > 0 && (
              <div
                className={`border-border-subtle grid gap-1 overflow-hidden rounded-xl border ${
                  post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
                }`}
              >
                {post.images.map((image, index) => (
                  <img
                    key={`${post.id}-detail-image-${index}`}
                    src={image}
                    alt="Post"
                    className={`w-full object-cover ${
                      post.images.length === 1
                        ? 'aspect-video'
                        : 'aspect-square'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Khối MarketPlace / Vé */}
            {post?.postType === 'marketplace_listing' &&
              post?.relatedTickets?.length > 0 && (
                <div className="flex flex-col gap-4">
                  {/* Event Info */}
                  {post.relatedEvent && (
                    <div className="bg-background-secondary border-border-default rounded-xl border p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <img
                          src={post.relatedEvent.bannerImageUrl}
                          alt={post.relatedEvent.name}
                          className="border-border-subtle h-16 w-16 flex-shrink-0 rounded-lg border object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-text-primary truncate text-sm font-semibold">
                            {post.relatedEvent.name}
                          </p>
                          <div className="text-text-secondary mt-1.5 flex flex-wrap items-center gap-3 text-xs font-medium">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays className="text-primary h-3.5 w-3.5" />
                              {formatDateTime(post.relatedEvent.startDate)}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Tag className="text-primary h-3.5 w-3.5" />
                              {post.relatedEvent.locationText}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Danh sách vé */}
                  <div className="bg-background-secondary border-border-default rounded-xl border p-4 shadow-sm">
                    <h4 className="text-text-primary mb-3 text-sm font-bold tracking-wide uppercase">
                      Danh sách vé đang bán ({post.relatedTickets.length})
                    </h4>

                    <div className="flex flex-col gap-3">
                      {post.relatedTickets.map((ticket) => {
                        const isSelling = ticket.status === 'selling';
                        const isChecked = selectedTicketIds.includes(
                          ticket.ticketId
                        );

                        return (
                          <div
                            key={ticket.ticketId}
                            title={
                              isOwnerPost
                                ? 'Bạn là chủ bài viết'
                                : isSelling
                                  ? 'Nhấn để chọn vé này'
                                  : 'Vé này không còn bán'
                            }
                            onClick={() =>
                              isSelling &&
                              !isOwnerPost &&
                              handleSelectTicket(ticket.ticketId)
                            }
                            className={`flex items-center justify-between rounded-xl border p-3 transition-all ${
                              isOwnerPost
                                ? 'border-border-subtle bg-disabled-background cursor-not-allowed opacity-80'
                                : isSelling
                                  ? 'border-border-default hover:border-primary bg-foreground cursor-pointer hover:shadow-sm'
                                  : 'border-border-subtle bg-disabled-background cursor-not-allowed opacity-60'
                            } ${isChecked ? 'border-primary bg-primary/5 ring-primary/20 ring-1' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 flex h-5 items-center">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={
                                    !isSelling ||
                                    post?.author?._id === currentUser?._id
                                  }
                                  onChange={() => {}}
                                  className="border-border-default text-primary focus:ring-primary h-4 w-4 cursor-pointer rounded disabled:cursor-not-allowed disabled:opacity-30"
                                />
                              </div>

                              <div>
                                <p className="text-text-primary text-sm font-bold">
                                  {ticket.ticketTypeName}
                                  <span className="text-text-placeholder mx-1">
                                    •
                                  </span>
                                  {ticket.showName}
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="text-text-secondary text-xs font-medium line-through">
                                    {ticket.originalPrice} USDT
                                  </span>
                                  {isSelling ? (
                                    <span className="bg-success-background text-success-text-on-subtle rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                                      Đang bán
                                    </span>
                                  ) : ticket.status === 'expired' ? (
                                    <span className="bg-disabled-background text-text-secondary rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                                      Hết hạn
                                    </span>
                                  ) : post?.author?._id !== ticket?.owner ? (
                                    <span className="bg-destructive-background text-destructive rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                                      Đã bán
                                    </span>
                                  ) : (
                                    <span className="bg-disabled-background text-text-secondary rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                                      Ngưng bán
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-text-secondary text-xs font-medium">
                                Giá bán lại
                              </p>
                              <p className="text-primary text-lg font-bold">
                                {ticket.price} USDT
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Khối Nút Mua hàng */}
                    {selectedTicketIds.length > 0 && (
                      <div className="border-border-subtle mt-5 flex items-center justify-between gap-4 border-t pt-4">
                        <div className="text-text-secondary text-sm font-medium">
                          Đã chọn:{' '}
                          <span className="text-text-primary font-bold">
                            {selectedTicketIds.length} vé
                          </span>
                        </div>

                        <button
                          onClick={handleBuyTickets}
                          className="bg-primary text-primary-foreground hover:bg-primary-hover flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                        >
                          Mua ngay <span className="opacity-50">•</span>{' '}
                          {totalAmount} USDT
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* ─── CỘT PHẢI: TƯƠNG TÁC & BÌNH LUẬN ─── */}
        <div className="border-border-default flex w-full flex-col border-t pt-4 md:w-[45%] md:border-t-0 md:border-l md:pt-0 md:pl-6 lg:w-[30%]">
          {/* Thanh Action (Ghim cố định trên cùng cột phải) */}
          <div className="border-border-subtle flex flex-shrink-0 items-center justify-between border-b pb-3">
            <button
              onClick={() => onToggleLike(post.id)}
              className={`flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-bold transition-colors ${
                isLiked
                  ? 'text-destructive'
                  : 'text-text-secondary hover:bg-foreground hover:text-destructive'
              }`}
            >
              <Heart
                className="h-5 w-5 transition-transform active:scale-75"
                fill={isLiked ? 'currentColor' : 'none'}
              />
              <span>
                Yêu thích {Number(likeCount || 0) > 0 ? `(${likeCount})` : ''}
              </span>
            </button>

            <div className="text-text-secondary flex items-center gap-3 text-sm font-semibold">
              <span className="flex items-center gap-1.5 rounded-lg px-2 py-1">
                <MessageSquare className="text-primary h-5 w-5" />
                {commentCount} bình luận
              </span>
              <button
                onClick={() => onSharePost(post.id)}
                className="hover:bg-foreground hover:text-info flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors"
                title="Chia sẻ"
              >
                <Link2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Phần danh sách Bình luận (Cuộn dọc độc lập) */}
          <div className="custom-scrollbar -mx-4 flex-1 pt-2 md:mx-0 md:overflow-y-auto">
            <CommentSection
              postId={post.id}
              currentUser={currentUser}
              commentState={commentState}
              commentDraft={commentDraft}
              onCommentDraftChange={onCommentDraftChange}
              onSubmitRootComment={onSubmitRootComment}
              activeReplyInput={activeReplyInput}
              onToggleReplyInput={onToggleReplyInput}
              replyDraftByComment={replyDraftByComment}
              onReplyDraftChange={onReplyDraftChange}
              onSubmitReply={onSubmitReply}
              editingComment={editingComment}
              onStartEditComment={onStartEditComment}
              onCancelEditComment={onCancelEditComment}
              onSaveEditComment={onSaveEditComment}
              onEditingCommentValueChange={onEditingCommentValueChange}
              commentActionState={commentActionState}
              onOpenDeleteComment={onOpenDeleteComment}
              onOpenReportModal={onOpenReportModal}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PostDetailModal;
