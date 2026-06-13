// CommentSection.jsx

import { useRef, useEffect } from 'react';
import {
  CornerDownRight,
  Send,
  Pencil,
  Trash2,
  Flag,
  X,
  Check,
} from 'lucide-react';
import {
  COMMENT_CONTENT_MAX_LENGTH,
  fromNow,
  getReplyDraftKey,
} from './postUtils';

/* ─── Tiny avatar helper ──────────────────────────────── */
const Avatar = ({ src, name, size = 'md' }) => {
  const dim = size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-9 w-9 text-xs';
  const initials = (name || 'H')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return src ? (
    <img
      src={src}
      alt={name}
      className={`${dim} border-border-subtle flex-shrink-0 rounded-full border object-cover`}
    />
  ) : (
    <div
      className={`${dim} bg-primary/10 text-primary flex flex-shrink-0 items-center justify-center rounded-full font-semibold`}
    >
      {initials}
    </div>
  );
};

/* ─── Auto-resize textarea ────────────────────────────── */
const AutoTextarea = ({
  value,
  onChange,
  onSubmit,
  placeholder,
  maxLength,
  disabled,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      maxLength={maxLength}
      disabled={disabled}
      className="text-text-primary placeholder:text-text-placeholder w-full resize-none bg-transparent text-sm leading-relaxed outline-none disabled:opacity-50"
      style={{ minHeight: '22px', maxHeight: '120px', overflowY: 'auto' }}
    />
  );
};

/* ─── Root comment input ──────────────────────────────── */
const RootCommentInput = ({
  currentUser,
  postId,
  draft,
  onChange,
  onSubmit,
  isSubmitting,
}) => {
  const empty = !draft.trim();

  return (
    <div className="flex gap-2 py-3">
      <Avatar src={currentUser?.avatar} name={currentUser?.name} />
      <div className="border-border-default bg-background-secondary focus-within:border-primary/50 flex flex-1 items-end gap-2 rounded-2xl border px-3 py-2.5 transition-colors">
        <AutoTextarea
          value={draft}
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder="Viết bình luận… (Ctrl+Enter để gửi)"
          maxLength={COMMENT_CONTENT_MAX_LENGTH}
          disabled={isSubmitting}
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={empty || isSubmitting}
          className={`mb-0.5 flex-shrink-0 rounded-full p-1.5 transition ${
            empty || isSubmitting
              ? 'text-text-placeholder cursor-not-allowed'
              : 'bg-primary hover:bg-primary-hover text-white'
          }`}
          aria-label="Gửi bình luận"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

/* ─── Reply input ─────────────────────────────────────── */
const ReplyInput = ({
  currentUser,
  draftKey,
  draft,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const empty = !draft.trim();
  return (
    <div className="mt-2 flex gap-2">
      <Avatar src={currentUser?.avatar} name={currentUser?.name} size="sm" />
      <div className="border-border-default bg-background-secondary focus-within:border-primary/50 flex flex-1 items-end gap-2 rounded-xl border px-2 py-2 transition-colors">
        <AutoTextarea
          value={draft}
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder="Phản hồi… (Ctrl+Enter)"
          maxLength={COMMENT_CONTENT_MAX_LENGTH}
          disabled={isSubmitting}
        />
        <div className="mb-0.5 flex flex-shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onCancel}
            className="text-text-secondary hover:text-text-primary rounded-full p-1 transition"
            aria-label="Hủy"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={empty || isSubmitting}
            className={`rounded-full p-1.5 transition ${
              empty || isSubmitting
                ? 'text-text-placeholder cursor-not-allowed'
                : 'bg-primary hover:bg-primary-hover text-white'
            }`}
            aria-label="Gửi"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Edit inline ─────────────────────────────────────── */
const EditInput = ({ value, onChange, onSave, onCancel, isSaving }) => (
  <div className="border-primary/40 bg-primary/5 mt-1.5 rounded-xl border px-3 py-2">
    <AutoTextarea
      value={value}
      onChange={onChange}
      onSubmit={onSave}
      placeholder=""
      maxLength={COMMENT_CONTENT_MAX_LENGTH}
      disabled={isSaving}
    />
    <div className="mt-2 flex justify-end gap-1.5">
      <button
        type="button"
        onClick={onCancel}
        className="text-text-secondary hover:bg-foreground rounded-lg px-2.5 py-1 text-xs font-medium transition"
      >
        Hủy
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={!value.trim() || isSaving}
        className="bg-primary text-primary-foreground hover:bg-primary-hover flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50"
      >
        <Check className="h-3 w-3" />
        Lưu
      </button>
    </div>
  </div>
);

/* ─── Single comment bubble (KHÔNG chứa đệ quy nữa) ───── */
const CommentBubble = ({
  comment,
  postId,
  currentUser,
  isReply = false,
  editingComment,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditValueChange,
  commentActionState,
  activeReplyInput,
  onToggleReplyInput,
  replyDraftByComment,
  onReplyDraftChange,
  onSubmitReply,
  onOpenDeleteComment,
  onOpenReportModal,
}) => {
  const isOwner = currentUser?.id && currentUser.id === comment.author?.id;
  const canReport = currentUser?.id && currentUser.id !== comment.author?.id;
  const isEditing =
    editingComment.postId === postId && editingComment.commentId === comment.id;
  const isSaving =
    commentActionState.postId === postId &&
    commentActionState.commentId === comment.id &&
    commentActionState.type === 'edit';

  const draftKey = getReplyDraftKey(postId, comment.id);
  const replyDraft = replyDraftByComment[draftKey] || '';
  const isReplyOpen = activeReplyInput === comment.id;
  const isSubmittingReply =
    commentActionState.postId === postId &&
    commentActionState.commentId === comment.id &&
    commentActionState.type === 'reply';

  return (
    <div className="flex gap-1.5">
      <div className="flex flex-col items-center">
        <Avatar
          src={comment.author?.avatar}
          name={comment.author?.name}
          size={isReply ? 'sm' : 'md'}
        />
      </div>

      <div className="min-w-0 flex-1 pb-1">
        {/* Bubble Text */}
        <div className="bg-foreground inline-block max-w-full rounded-2xl px-3.5 py-2">
          <div className="mb-0.5 flex items-baseline gap-2">
            <span className="text-text-primary text-xs leading-tight font-bold">
              {comment.author?.name || 'Người dùng'}
            </span>
            {/* Nếu là reply sâu, có thể hiện tên người được reply ở đây, nhưng theo UI chuẩn thì không cần thiết nếu đã flatten */}
            <span className="text-text-placeholder text-[10px] font-medium">
              {fromNow(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <span className="text-text-placeholder text-[10px] italic">
                đã sửa
              </span>
            )}
          </div>

          {isEditing ? (
            <EditInput
              value={editingComment.value}
              onChange={onEditValueChange}
              onSave={() => onSaveEdit(postId, comment.id)}
              onCancel={onCancelEdit}
              isSaving={isSaving}
            />
          ) : (
            <p className="text-text-primary text-sm leading-relaxed whitespace-pre-line">
              {comment.content}
            </p>
          )}
        </div>

        {/* Meta actions */}
        {!isEditing && (
          <div className="mt-1 flex items-center gap-3 pl-1">
            <button
              type="button"
              onClick={() => onToggleReplyInput(postId, comment.id)}
              className={`flex items-center gap-1 text-[11px] font-bold transition ${
                isReplyOpen
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              <CornerDownRight className="h-3 w-3" />
              Trả lời
            </button>

            {isOwner && (
              <>
                <span className="bg-border-subtle h-3 w-px" />
                <button
                  type="button"
                  onClick={() => onStartEdit(postId, comment)}
                  className="text-text-secondary hover:text-text-primary flex items-center gap-1 text-[11px] font-semibold transition"
                >
                  <Pencil className="h-3 w-3" />
                  Sửa
                </button>
                <span className="bg-border-subtle h-3 w-px" />
                <button
                  type="button"
                  onClick={() => onOpenDeleteComment(postId, comment.id)}
                  className="text-text-secondary hover:text-destructive flex items-center gap-1 text-[11px] font-semibold transition"
                >
                  <Trash2 className="h-3 w-3" />
                  Xóa
                </button>
              </>
            )}

            {canReport && (
              <>
                <span className="bg-border-subtle h-3 w-px" />
                <button
                  type="button"
                  onClick={() =>
                    onOpenReportModal({
                      targetType: 'comment',
                      targetId: comment.id,
                      postId,
                      targetOwnerId: comment.author?.id,
                    })
                  }
                  className="text-text-secondary hover:text-warning flex items-center gap-1 text-[11px] font-semibold transition"
                >
                  <Flag className="h-3 w-3" />
                  Báo cáo
                </button>
              </>
            )}
          </div>
        )}

        {/* Reply input */}
        {isReplyOpen && (
          <ReplyInput
            currentUser={currentUser}
            draftKey={draftKey}
            draft={replyDraft}
            onChange={(val) => onReplyDraftChange(draftKey, val)}
            onSubmit={() => onSubmitReply(postId, comment.id, draftKey)}
            onCancel={() => onToggleReplyInput(postId, comment.id)}
            isSubmitting={isSubmittingReply}
          />
        )}
      </div>
    </div>
  );
};

/* ─── Hàm Đệ quy: Làm phẳng (Flatten) mảng comment ────── */
// Hàm này lấy toàn bộ reply của 1 comment gốc (dù lồng sâu đến đâu) và biến thành mảng 1 chiều
const flattenReplies = (replies) => {
  if (!replies || !Array.isArray(replies)) return [];
  return replies.reduce((acc, reply) => {
    acc.push(reply);
    if (reply.replies && reply.replies.length > 0) {
      acc.push(...flattenReplies(reply.replies));
    }
    return acc;
  }, []);
};

/* ─── Main CommentSection export ──────────────────────── */
const CommentSection = ({
  postId,
  currentUser,
  commentState,
  commentDraft,
  onCommentDraftChange,
  onSubmitRootComment,
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
}) => {
  const isSubmittingRoot =
    commentActionState.postId === postId &&
    commentActionState.targetCommentId === '';

  return (
    <div className="flex flex-col">
      {/* Cụm nhập bình luận gốc */}
      <RootCommentInput
        currentUser={currentUser}
        postId={postId}
        draft={commentDraft}
        onChange={onCommentDraftChange}
        onSubmit={() => onSubmitRootComment(postId)}
        isSubmitting={isSubmittingRoot}
      />

      {/* Divider */}
      <div className="border-border-subtle mx-4 border-t md:mx-5" />

      {/* Comment list */}
      <div className="px-2 pt-4 pb-6">
        {commentState.isLoading && (
          <div className="space-y-5">
            {[1, 2].map((i) => (
              <div key={i} className="flex animate-pulse gap-3">
                <div className="bg-foreground h-9 w-9 flex-shrink-0 rounded-full" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="bg-foreground h-3 w-24 rounded" />
                  <div className="bg-foreground h-3 w-4/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {commentState.error && (
          <p className="text-destructive text-center text-sm font-medium">
            {commentState.error}
          </p>
        )}

        {!commentState.isLoading &&
          commentState.loaded &&
          commentState.items.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-text-secondary text-sm font-medium">
                Chưa có bình luận nào.
              </p>
              <p className="text-text-placeholder mt-1 text-xs">
                Hãy là người đầu tiên mở lời!
              </p>
            </div>
          )}

        {/* --- KHU VỰC RENDER COMMENT ĐÃ ĐƯỢC LÀM PHẲNG --- */}
        {!commentState.isLoading && commentState.items.length > 0 && (
          <div className="space-y-6">
            {commentState.items.map((rootComment) => {
              // Làm phẳng tất cả các bậc reply của comment gốc này
              const allFlatReplies = flattenReplies(rootComment.replies);

              return (
                <div key={rootComment.id} className="flex flex-col gap-2">
                  {/* 1. Render Comment Gốc (Level 0) */}
                  <CommentBubble
                    comment={rootComment}
                    postId={postId}
                    currentUser={currentUser}
                    isReply={false} // Là comment gốc
                    editingComment={editingComment}
                    onStartEdit={onStartEditComment}
                    onCancelEdit={onCancelEditComment}
                    onSaveEdit={onSaveEditComment}
                    onEditValueChange={onEditingCommentValueChange}
                    commentActionState={commentActionState}
                    activeReplyInput={activeReplyInput}
                    onToggleReplyInput={onToggleReplyInput}
                    replyDraftByComment={replyDraftByComment}
                    onReplyDraftChange={onReplyDraftChange}
                    onSubmitReply={onSubmitReply}
                    onOpenDeleteComment={onOpenDeleteComment}
                    onOpenReportModal={onOpenReportModal}
                  />

                  {/* 2. Render TOÀN BỘ Reply (Đã gộp chung thành Level 1) */}
                  {allFlatReplies.length > 0 && (
                    <div className="border-border-subtle ml-4 flex flex-col gap-3 border-l-[1.5px] pl-4">
                      {allFlatReplies.map((reply) => (
                        <CommentBubble
                          key={reply.id}
                          comment={reply}
                          postId={postId}
                          currentUser={currentUser}
                          isReply={true} // Báo hiệu là reply để icon Avatar nhỏ lại
                          editingComment={editingComment}
                          onStartEdit={onStartEditComment}
                          onCancelEdit={onCancelEditComment}
                          onSaveEdit={onSaveEditComment}
                          onEditValueChange={onEditingCommentValueChange}
                          commentActionState={commentActionState}
                          activeReplyInput={activeReplyInput}
                          onToggleReplyInput={onToggleReplyInput}
                          replyDraftByComment={replyDraftByComment}
                          onReplyDraftChange={onReplyDraftChange}
                          onSubmitReply={onSubmitReply}
                          onOpenDeleteComment={onOpenDeleteComment}
                          onOpenReportModal={onOpenReportModal}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
