import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../ui/Button';
import ConfirmModal from '../../ui/ConfirmModal';
import Modal from '../../ui/Modal';
import TextArea from '../../ui/TextArea';
import {
  createComment,
  deleteComment,
  getCommentsByPostId,
  updateComment,
} from '../../../services/commentService';
import { createReport } from '../../../services/reportService';
import {
  buildCommunityPostUrl,
  COMMENT_CONTENT_MAX_LENGTH,
  COMMENT_DESCRIPTION_MAX_LENGTH,
  REPORT_REASONS,
  extractCommentsArray,
  getReplyDraftKey,
  normalizeComment,
} from './postUtils';
import PostCard from './PostCard';
import PostDetailModal from './PostDetailModal';

const PostThread = ({
  posts = [],
  allPosts = [],
  currentUser,
  feedQueryKey,
  onDeletePost,
  isDeletingPost = false,
  showDeletePostAction = false,
}) => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedPostId = searchParams.get('post') || '';

  const selectedPost = useMemo(() => {
    const source = allPosts.length > 0 ? allPosts : posts;
    return source.find((post) => post.id === selectedPostId) || null;
  }, [allPosts, posts, selectedPostId]);

  const [expandedContentByPost, setExpandedContentByPost] = useState({});
  const [likedPostIds, setLikedPostIds] = useState({});
  const [likeCountByPost, setLikeCountByPost] = useState({});
  const [commentStateByPost, setCommentStateByPost] = useState({});
  const [commentDraftByPost, setCommentDraftByPost] = useState({});
  const [replyDraftByComment, setReplyDraftByComment] = useState({});
  const [activeReplyInputByPost, setActiveReplyInputByPost] = useState({});
  const [editingComment, setEditingComment] = useState({
    postId: '',
    commentId: '',
    value: '',
  });
  const [commentSubmitState, setCommentSubmitState] = useState({
    postId: '',
    targetCommentId: '',
  });
  const [commentActionState, setCommentActionState] = useState({
    postId: '',
    commentId: '',
    type: '',
  });
  const [deleteCommentState, setDeleteCommentState] = useState({
    isOpen: false,
    postId: '',
    commentId: '',
  });
  const [deletePostState, setDeletePostState] = useState({
    isOpen: false,
    post: null,
  });
  const [reportModalState, setReportModalState] = useState({
    isOpen: false,
    targetType: 'comment',
    targetId: '',
    postId: '',
    targetOwnerId: '',
    reason: REPORT_REASONS[0].value,
    description: '',
  });

  const createCommentMutation = useMutation({
    mutationFn: ({ postId, payload }) => createComment(postId, payload),
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, payload }) => updateComment(commentId, payload),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => deleteComment(commentId),
  });

  const reportMutation = useMutation({
    mutationFn: (payload) => createReport(payload),
  });

  useEffect(() => {
    setEditingComment({ postId: '', commentId: '', value: '' });
    setDeleteCommentState({ isOpen: false, postId: '', commentId: '' });
    setReportModalState((prev) => ({
      ...prev,
      isOpen: false,
      targetId: '',
      postId: '',
      targetOwnerId: '',
      reason: REPORT_REASONS[0].value,
      description: '',
    }));
  }, [selectedPostId]);

  useEffect(() => {
    if (!selectedPostId) return;

    void fetchCommentsForPost(selectedPostId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPostId]);

  const getCommentState = (postId) =>
    commentStateByPost[postId] || {
      items: [],
      isLoading: false,
      error: '',
      loaded: false,
    };

  const setSelectedPostId = (postId) => {
    if (!postId) {
      const next = new URLSearchParams(searchParams);
      next.delete('post');
      setSearchParams(next, { replace: true });
      return;
    }

    const next = new URLSearchParams(searchParams);
    next.set('post', postId);
    setSearchParams(next, { replace: true });
  };

  const handleOpenPost = (postId) => {
    setSelectedPostId(postId);
  };

  const handleClosePost = () => {
    setSelectedPostId('');
  };

  const handleToggleExpandContent = (postId) => {
    setExpandedContentByPost((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleToggleLike = (postId) => {
    const isLiked = Boolean(likedPostIds[postId]);

    setLikedPostIds((prev) => ({
      ...prev,
      [postId]: !isLiked,
    }));

    setLikeCountByPost((prev) => ({
      ...prev,
      [postId]: Math.max(0, Number(prev[postId] || 0) + (isLiked ? -1 : 1)),
    }));
  };

  const handleSharePost = async (postId) => {
    const shareUrl = buildCommunityPostUrl(postId);

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
      toast.success('Đã sao chép link bài viết.');
    } catch {
      toast.info(`Link bài viết: ${shareUrl}`);
    }
  };

  const fetchCommentsForPost = async (postId, force = false) => {
    const currentState = commentStateByPost[postId];

    if (!force && currentState?.loaded) {
      return;
    }

    setCommentStateByPost((prev) => ({
      ...prev,
      [postId]: {
        ...(prev[postId] || {}),
        items: prev[postId]?.items || [],
        isLoading: true,
        error: '',
        loaded: prev[postId]?.loaded || false,
      },
    }));

    try {
      const response = await getCommentsByPostId(postId, {
        page: 1,
        limit: 20,
      });

      const comments = extractCommentsArray(response).map(normalizeComment);

      setCommentStateByPost((prev) => ({
        ...prev,
        [postId]: {
          items: comments,
          isLoading: false,
          error: '',
          loaded: true,
        },
      }));
    } catch (error) {
      setCommentStateByPost((prev) => ({
        ...prev,
        [postId]: {
          items: prev[postId]?.items || [],
          isLoading: false,
          error: error?.message || 'Không thể tải bình luận.',
          loaded: false,
        },
      }));
    }
  };

  const handleToggleReplyInput = (postId, commentId) => {
    setActiveReplyInputByPost((prev) => ({
      ...prev,
      [postId]: prev[postId] === commentId ? '' : commentId,
    }));
  };

  const handleSubmitRootComment = async (postId) => {
    if (!currentUser?.id) {
      toast.warning('Bạn cần đăng nhập để bình luận.');
      return;
    }

    const draft = (commentDraftByPost[postId] || '').trim();
    if (!draft) return;

    setCommentSubmitState({ postId, targetCommentId: '' });

    try {
      await createCommentMutation.mutateAsync({
        postId,
        payload: {
          content: draft.slice(0, COMMENT_CONTENT_MAX_LENGTH),
        },
      });

      setCommentDraftByPost((prev) => ({ ...prev, [postId]: '' }));
      await fetchCommentsForPost(postId, true);
      queryClient.invalidateQueries({ queryKey: [feedQueryKey] });
    } catch (error) {
      toast.error(error?.message || 'Không thể gửi bình luận.');
    } finally {
      setCommentSubmitState({ postId: '', targetCommentId: '' });
    }
  };

  const handleSubmitReply = async (postId, parentCommentId, draftKey) => {
    if (!currentUser?.id) {
      toast.warning('Bạn cần đăng nhập để phản hồi bình luận.');
      return;
    }

    const resolvedDraftKey =
      draftKey || getReplyDraftKey(postId, parentCommentId);
    const draft = (replyDraftByComment[resolvedDraftKey] || '').trim();
    if (!draft) return;

    setCommentSubmitState({ postId, targetCommentId: parentCommentId });

    try {
      await createCommentMutation.mutateAsync({
        postId,
        payload: {
          content: draft.slice(0, COMMENT_CONTENT_MAX_LENGTH),
          parentComment: parentCommentId,
        },
      });

      setReplyDraftByComment((prev) => ({
        ...prev,
        [resolvedDraftKey]: '',
      }));

      setActiveReplyInputByPost((prev) => ({
        ...prev,
        [postId]: '',
      }));

      await fetchCommentsForPost(postId, true);
      queryClient.invalidateQueries({ queryKey: [feedQueryKey] });
    } catch (error) {
      toast.error(error?.message || 'Không thể gửi phản hồi.');
    } finally {
      setCommentSubmitState({ postId: '', targetCommentId: '' });
    }
  };

  const handleStartEditComment = (postId, comment) => {
    setEditingComment({
      postId,
      commentId: comment.id,
      value: comment.content,
    });
  };

  const handleCancelEditComment = () => {
    setEditingComment({ postId: '', commentId: '', value: '' });
  };

  const handleSaveEditComment = async (postId, commentId) => {
    const content = editingComment.value.trim();
    if (!content) return;

    setCommentActionState({ postId, commentId, type: 'edit' });

    try {
      await updateCommentMutation.mutateAsync({
        commentId,
        payload: { content: content.slice(0, COMMENT_CONTENT_MAX_LENGTH) },
      });

      await fetchCommentsForPost(postId, true);
      queryClient.invalidateQueries({ queryKey: [feedQueryKey] });
      handleCancelEditComment();
    } catch (error) {
      toast.error(error?.message || 'Không thể cập nhật bình luận.');
    } finally {
      setCommentActionState({ postId: '', commentId: '', type: '' });
    }
  };

  const handleOpenDeleteComment = (postId, commentId) => {
    setDeleteCommentState({
      isOpen: true,
      postId,
      commentId,
    });
  };

  const handleDeleteComment = async (postId, commentId) => {
    setCommentActionState({ postId, commentId, type: 'delete' });

    try {
      await deleteCommentMutation.mutateAsync(commentId);
      await fetchCommentsForPost(postId, true);
      queryClient.invalidateQueries({ queryKey: [feedQueryKey] });
    } catch (error) {
      toast.error(error?.message || 'Không thể xóa bình luận.');
    } finally {
      setCommentActionState({ postId: '', commentId: '', type: '' });
    }
  };

  const handleConfirmDeleteComment = async () => {
    if (!deleteCommentState.commentId || !deleteCommentState.postId) return;

    await handleDeleteComment(
      deleteCommentState.postId,
      deleteCommentState.commentId
    );

    setDeleteCommentState({
      isOpen: false,
      postId: '',
      commentId: '',
    });
  };

  const openReportModal = ({ targetType, targetId, postId, targetOwnerId }) => {
    if (!currentUser?.id) {
      toast.warning('Bạn cần đăng nhập để gửi báo cáo.');
      return;
    }

    if (targetOwnerId && targetOwnerId === currentUser.id) {
      toast.info('Bạn không thể báo cáo nội dung của chính mình.');
      return;
    }

    setReportModalState({
      isOpen: true,
      targetType,
      targetId,
      postId,
      targetOwnerId,
      reason: REPORT_REASONS[0].value,
      description: '',
    });
  };

  const closeReportModal = () => {
    setReportModalState((prev) => ({
      ...prev,
      isOpen: false,
      targetId: '',
      postId: '',
      targetOwnerId: '',
      reason: REPORT_REASONS[0].value,
      description: '',
    }));
  };

  const handleReportComment = async (postId, commentId) => {
    setCommentActionState({ postId, commentId, type: 'report' });

    try {
      await reportMutation.mutateAsync({
        targetType: 'comment',
        targetId: commentId,
        reason: reportModalState.reason,
        description: reportModalState.description.slice(
          0,
          COMMENT_DESCRIPTION_MAX_LENGTH
        ),
      });
      toast.success('Đã gửi báo cáo bình luận.');
      await fetchCommentsForPost(postId, true);
      queryClient.invalidateQueries({ queryKey: [feedQueryKey] });
      closeReportModal();
    } catch (error) {
      toast.error(error?.message || 'Không thể báo cáo bình luận.');
    } finally {
      setCommentActionState({ postId: '', commentId: '', type: '' });
    }
  };

  const handleReportPost = async (post) => {
    setCommentActionState({ postId: post.id, commentId: '', type: 'report' });

    try {
      await reportMutation.mutateAsync({
        targetType: 'post',
        targetId: post.id,
        reason: reportModalState.reason,
        description: reportModalState.description.slice(
          0,
          COMMENT_DESCRIPTION_MAX_LENGTH
        ),
      });
      toast.success('Đã gửi báo cáo bài viết.');
      queryClient.invalidateQueries({ queryKey: [feedQueryKey] });
      closeReportModal();
    } catch (error) {
      toast.error(error?.message || 'Không thể báo cáo bài viết.');
    } finally {
      setCommentActionState({ postId: '', commentId: '', type: '' });
    }
  };

  const handleSubmitReport = async () => {
    if (!reportModalState.targetId || !reportModalState.postId) return;

    if (reportModalState.targetType === 'comment') {
      await handleReportComment(
        reportModalState.postId,
        reportModalState.targetId
      );
      return;
    }

    const targetPost = allPosts.find(
      (post) => post.id === reportModalState.targetId
    );
    if (targetPost) {
      await handleReportPost(targetPost);
    }
  };

  const handleDeletePost = async () => {
    if (!deletePostState.post?.id || !onDeletePost) return;

    await onDeletePost(deletePostState.post.id);
    setDeletePostState({ isOpen: false, post: null });
    queryClient.invalidateQueries({ queryKey: [feedQueryKey] });
  };

  const selectedCommentState = selectedPostId
    ? getCommentState(selectedPostId)
    : null;
  const selectedExpandedContent = selectedPostId
    ? Boolean(expandedContentByPost[selectedPostId])
    : false;
  const selectedCommentDraft = selectedPostId
    ? commentDraftByPost[selectedPostId] || ''
    : '';
  const selectedActiveReplyInput = selectedPostId
    ? activeReplyInputByPost[selectedPostId] || ''
    : '';

  return (
    <div className="space-y-5">
      {posts.map((post) => {
        const isCommentOpen = selectedPostId === post.id;
        const commentState = getCommentState(post.id);

        return (
          <PostCard
            key={post.id}
            post={post}
            isExpanded={Boolean(expandedContentByPost[post.id])}
            onToggleExpand={handleToggleExpandContent}
            isCommentOpen={isCommentOpen}
            commentCount={post.metrics.commentCount}
            isLiked={Boolean(likedPostIds[post.id])}
            likeCount={likeCountByPost[post.id] || 0}
            onOpen={handleOpenPost}
            onToggleLike={handleToggleLike}
            onToggleComments={handleOpenPost}
            onShare={handleSharePost}
            onReport={(targetPost) =>
              openReportModal({
                targetType: 'post',
                targetId: targetPost.id,
                postId: targetPost.id,
                targetOwnerId: targetPost.author.id,
              })
            }
            onDelete={
              onDeletePost
                ? (targetPost) =>
                    setDeletePostState({ isOpen: true, post: targetPost })
                : undefined
            }
            showDelete={showDeletePostAction}
          />
        );
      })}

      <PostDetailModal
        post={selectedPost}
        isOpen={Boolean(selectedPost)}
        onClose={handleClosePost}
        currentUser={currentUser}
        commentState={
          selectedCommentState || {
            items: [],
            isLoading: false,
            error: '',
            loaded: false,
          }
        }
        commentDraft={selectedCommentDraft}
        onCommentDraftChange={(value) =>
          setCommentDraftByPost((prev) => ({
            ...prev,
            [selectedPostId]: value,
          }))
        }
        onSubmitRootComment={handleSubmitRootComment}
        expandedContent={selectedExpandedContent}
        onToggleExpandedContent={handleToggleExpandContent}
        activeReplyInput={selectedActiveReplyInput}
        onToggleReplyInput={handleToggleReplyInput}
        replyDraftByComment={replyDraftByComment}
        onReplyDraftChange={(key, value) =>
          setReplyDraftByComment((prev) => ({
            ...prev,
            [key]: value,
          }))
        }
        onSubmitReply={handleSubmitReply}
        editingComment={editingComment}
        onStartEditComment={handleStartEditComment}
        onCancelEditComment={handleCancelEditComment}
        onSaveEditComment={handleSaveEditComment}
        onEditingCommentValueChange={(value) =>
          setEditingComment((prev) => ({
            ...prev,
            value,
          }))
        }
        commentActionState={commentActionState}
        onOpenDeleteComment={handleOpenDeleteComment}
        onOpenReportModal={openReportModal}
        isLiked={Boolean(likedPostIds[selectedPostId])}
        likeCount={likeCountByPost[selectedPostId] || 0}
        onToggleLike={handleToggleLike}
        onSharePost={handleSharePost}
      />

      <ConfirmModal
        isOpen={deleteCommentState.isOpen}
        title="Xóa bình luận"
        message="Bạn có chắc muốn xóa bình luận này? Hành động này không thể hoàn tác."
        onCancel={() =>
          setDeleteCommentState({
            isOpen: false,
            postId: '',
            commentId: '',
          })
        }
        onConfirm={handleConfirmDeleteComment}
        isLoading={
          commentActionState.type === 'delete' &&
          commentActionState.postId === deleteCommentState.postId &&
          commentActionState.commentId === deleteCommentState.commentId
        }
        confirmText="Xóa"
      />

      {onDeletePost && (
        <ConfirmModal
          isOpen={deletePostState.isOpen}
          title="Xóa bài viết"
          message="Bạn có chắc muốn xóa bài viết này? Hành động này không thể hoàn tác."
          onCancel={() => setDeletePostState({ isOpen: false, post: null })}
          onConfirm={handleDeletePost}
          isLoading={isDeletingPost}
          confirmText="Xóa"
        />
      )}

      <Modal
        isOpen={reportModalState.isOpen}
        title="Báo cáo nội dung"
        onClose={closeReportModal}
        xButton
        maxWidth="max-w-md"
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-text-secondary block text-sm font-medium">
              Lý do
            </label>
            <select
              value={reportModalState.reason}
              onChange={(event) =>
                setReportModalState((prev) => ({
                  ...prev,
                  reason: event.target.value,
                }))
              }
              className="bg-background-secondary border-border-default focus:border-primary text-text-primary w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
            >
              {REPORT_REASONS.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          <TextArea
            label="Mô tả thêm"
            rows={3}
            value={reportModalState.description}
            onChange={(event) =>
              setReportModalState((prev) => ({
                ...prev,
                description: event.target.value.slice(
                  0,
                  COMMENT_DESCRIPTION_MAX_LENGTH
                ),
              }))
            }
            placeholder="Mô tả ngắn lý do bạn báo cáo (không bắt buộc)."
          />

          <p className="text-text-secondary text-xs">
            {reportModalState.description.length}/
            {COMMENT_DESCRIPTION_MAX_LENGTH} ký tự
          </p>

          <div className="mt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={closeReportModal}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmitReport}
              loading={
                commentActionState.type === 'report' &&
                commentActionState.postId === reportModalState.postId
              }
            >
              Gửi báo cáo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PostThread;
