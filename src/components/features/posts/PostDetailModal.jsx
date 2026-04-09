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
}) => {
  if (!isOpen || !post) return null;

  const isLongContent = post.content.length > CONTENT_PREVIEW_LIMIT;
  const visibleContent =
    isLongContent && !expandedContent
      ? `${post.content.slice(0, CONTENT_PREVIEW_LIMIT)}...`
      : post.content;

  const comments = commentState.items || [];
  const commentCount = countComments(comments);

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

        {post.relatedTicket && (
          <div className="bg-foreground border-border-default rounded-xl border p-4">
            <p className="text-text-primary text-sm font-semibold">
              {post.relatedTicket.eventName}
            </p>
            <p className="text-text-secondary mt-1 text-xs">
              {post.relatedTicket.showName}
            </p>
            {post.relatedTicket.startTime && (
              <div className="text-text-secondary mt-2 inline-flex items-center gap-1 text-xs">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDateTime(post.relatedTicket.startTime)}
              </div>
            )}
          </div>
        )}

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
