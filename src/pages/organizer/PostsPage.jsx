import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import {
  CalendarDays,
  Heart,
  ImagePlus,
  Link2,
  MessageSquare,
  Send,
  Tag,
  X,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import TextArea from '../../components/ui/TextArea';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { toast } from 'react-toastify';
import { getEventsByUserId } from '../../services/eventService';
import {
  createPost,
  deletePost,
  getAllPosts,
} from '../../services/postService';
import {
  createComment,
  deleteComment,
  getCommentsByPostId,
  updateComment,
} from '../../services/commentService';
import { createReport } from '../../services/reportService';

const POST_CONTENT_MIN_LENGTH = 30;
const POST_CONTENT_MAX_LENGTH = 5000;
const COMMENT_CONTENT_MAX_LENGTH = 1000;
const CONTENT_PREVIEW_LIMIT = 240;

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate', label: 'Nội dung không phù hợp' },
  { value: 'scam', label: 'Lừa đảo' },
  { value: 'harassment', label: 'Quấy rối' },
  { value: 'other', label: 'Khác' },
];

const buildImageFromSeed = () =>
  `https://picsum.photos/seed/${Date.now()}/1200/800`;

const formatDateTime = (value) => {
  if (!value) return 'Đang cập nhật';

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const fromNow = (value) => {
  if (!value) return 'Không rõ thời gian';

  const date = new Date(value);
  const now = Date.now();
  const diffSeconds = Math.floor((now - date.getTime()) / 1000);

  if (diffSeconds < 60) return 'Vừa xong';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} phút trước`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} giờ trước`;
  if (diffSeconds < 604800) {
    return `${Math.floor(diffSeconds / 86400)} ngày trước`;
  }

  return formatDateTime(value);
};

const getEventLocationText = (event) => {
  if (!event) return 'Đang cập nhật địa điểm';
  if (event.venue) return event.venue;
  if (event.format === 'online') return 'Sự kiện online';
  if (event.location?.address) return event.location.address;
  if (event.location?.province?.name) return event.location.province.name;
  return 'Đang cập nhật địa điểm';
};

const isApprovedEvent = (event) => {
  const status = (event?.status || '').toLowerCase();

  if (!status) return true;
  if (['approved', 'upcoming', 'ongoing', 'completed'].includes(status)) {
    return true;
  }

  return !['draft', 'pending', 'rejected', 'cancelled'].includes(status);
};

const extractArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.posts)) return payload.posts;
  if (Array.isArray(payload?.events)) return payload.events;
  return [];
};

const extractCommentsArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeComment = (comment) => {
  const author = comment.author || {};
  const replyToUser = comment.replyToUser || {};
  const replies = Array.isArray(comment.replies) ? comment.replies : [];

  return {
    id: comment.id || comment._id,
    content: comment.content || '',
    createdAt: comment.createdAt,
    replyDisplay: comment.replyDisplay || '',
    replyToUserName: replyToUser.fullName || replyToUser.name || '',
    author: {
      id: author.id || author._id || 'unknown-author',
      name: author.fullName || author.name || 'Người dùng',
      avatar:
        author.avatar ||
        `https://picsum.photos/seed/${(author.id || author._id || Date.now())
          .toString()
          .slice(-8)}/100/100`,
    },
    replies: replies.map(normalizeComment),
  };
};

const normalizePost = (post) => {
  const relatedEvent = post.relatedEvent || null;
  const author = post.author || {};
  const authorId = author.id || author._id || 'unknown-author';

  return {
    id: post.id || post._id,
    content: post.content || '',
    images: Array.isArray(post.images) ? post.images : [],
    createdAt: post.createdAt,
    author: {
      id: authorId,
      name: author.fullName || author.name || 'Người dùng',
      avatar:
        author.avatar ||
        `https://picsum.photos/seed/${authorId.toString().slice(-8)}/100/100`,
    },
    metrics: {
      commentCount: Number(post.commentCount || 0),
    },
    relatedEvent: relatedEvent
      ? {
          id: relatedEvent.id || relatedEvent._id,
          name: relatedEvent.name || 'Sự kiện',
          startDate: relatedEvent.startDate,
          bannerImageUrl:
            relatedEvent.bannerImageUrl ||
            'https://picsum.photos/seed/default-event/1200/800',
          locationText: getEventLocationText(relatedEvent),
        }
      : null,
  };
};

const flattenReplies = (replies = []) => {
  const result = [];

  const walk = (items) => {
    items.forEach((item) => {
      result.push(item);
      if (Array.isArray(item.replies) && item.replies.length > 0) {
        walk(item.replies);
      }
    });
  };

  walk(replies);
  return result;
};

const countComments = (comments = []) =>
  comments.reduce((total, comment) => {
    return total + 1 + countComments(comment.replies || []);
  }, 0);

const getReplyDraftKey = (postId, commentId) => `${postId}_${commentId}`;

const PostSkeleton = () => (
  <div className="bg-background-secondary border-border-default animate-pulse rounded-2xl border p-5">
    <div className="flex items-center gap-3">
      <div className="bg-foreground h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <div className="bg-foreground h-3 w-36 rounded" />
        <div className="bg-foreground h-3 w-24 rounded" />
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="bg-foreground h-3 w-full rounded" />
      <div className="bg-foreground h-3 w-10/12 rounded" />
    </div>
    <div className="bg-foreground mt-4 aspect-video w-full rounded-lg" />
  </div>
);

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
              autoFocus={true}
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

const PostsPage = () => {
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.auth.user);
  const userId = user?.id;

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerForm, setComposerForm] = useState({
    content: '',
    relatedEventId: '',
    images: [],
  });
  const [composerError, setComposerError] = useState('');

  const [expandedContent, setExpandedContent] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [commentDraftByPost, setCommentDraftByPost] = useState({});
  const [replyDraftByComment, setReplyDraftByComment] = useState({});
  const [activeReplyInput, setActiveReplyInput] = useState({});

  const [likedPostIds, setLikedPostIds] = useState({});
  const [likeCountByPost, setLikeCountByPost] = useState({});

  const [commentStateByPost, setCommentStateByPost] = useState({});
  const [commentSubmitState, setCommentSubmitState] = useState({
    postId: '',
    targetCommentId: '',
  });
  const [editingComment, setEditingComment] = useState({
    postId: '',
    commentId: '',
    value: '',
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
  const [reportModalState, setReportModalState] = useState({
    isOpen: false,
    targetType: 'comment',
    targetId: '',
    postId: '',
    targetOwnerId: '',
    reason: REPORT_REASONS[0].value,
    description: '',
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    post: null,
  });

  const {
    data: postsResponse,
    isLoading: isPostsLoading,
    error: postsError,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ['organizer-posts', userId],
    queryFn: () =>
      getAllPosts({
        page: 1,
        limit: 50,
        authorId: userId,
        postType: 'event_promotion',
      }),
    enabled: !!userId,
    staleTime: 30000,
  });

  const {
    data: eventsResponse,
    isLoading: isEventsLoading,
    isFetching: isEventsFetching,
    error: eventsError,
  } = useQuery({
    queryKey: ['organizer-events', userId],
    queryFn: () => getEventsByUserId(userId),
    enabled: !!userId,
    staleTime: 60000,
  });

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      closeComposer();
      toast.success('Đăng bài thành công.');
      queryClient.invalidateQueries({ queryKey: ['organizer-posts', userId] });
    },
    onError: (error) => {
      setComposerError(
        error?.message || 'Không thể đăng bài. Vui lòng thử lại.'
      );
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      setDeleteState({ isOpen: false, post: null });
      queryClient.invalidateQueries({ queryKey: ['organizer-posts', userId] });
    },
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

  const reportCommentMutation = useMutation({
    mutationFn: (payload) => createReport(payload),
  });

  const posts = useMemo(() => {
    return extractArray(postsResponse)
      .map(normalizePost)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [postsResponse]);

  const approvedEvents = useMemo(() => {
    return extractArray(eventsResponse)
      .filter((event) => event?.id || event?._id)
      .filter(isApprovedEvent)
      .map((event) => ({
        id: event.id || event._id,
        name: event.name || 'Sự kiện',
        startDate: event.startDate,
        bannerImageUrl:
          event.bannerImageUrl ||
          'https://picsum.photos/seed/default-event/800/450',
        locationText: getEventLocationText(event),
      }));
  }, [eventsResponse]);

  const closeComposer = () => {
    setIsComposerOpen(false);
    setComposerError('');
    setComposerForm({
      content: '',
      relatedEventId: '',
      images: [],
    });
  };

  const openComposer = () => {
    setComposerError('');
    setIsComposerOpen(true);
  };

  const handleAddImageToComposer = () => {
    setComposerForm((prev) => ({
      ...prev,
      images: [...prev.images, buildImageFromSeed()].slice(0, 4),
    }));
  };

  const handleCreatePost = () => {
    setComposerError('');

    const trimmedContent = composerForm.content.trim();

    if (trimmedContent.length < POST_CONTENT_MIN_LENGTH) {
      setComposerError('Nội dung phải từ 50 ký tự trở lên.');
      return;
    }

    if (!composerForm.relatedEventId) {
      setComposerError('Vui lòng chọn sự kiện đã duyệt để gắn vào bài viết.');
      return;
    }

    const selectedEvent = approvedEvents.find(
      (event) => event.id === composerForm.relatedEventId
    );

    if (!selectedEvent) {
      setComposerError('Sự kiện đã chọn không hợp lệ hoặc chưa được duyệt.');
      return;
    }

    createPostMutation.mutate({
      content: trimmedContent,
      images: composerForm.images,
      relatedEvent: composerForm.relatedEventId,
      postType: 'event_promotion',
    });
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

  const handleToggleComments = (postId) => {
    const willOpen = !expandedComments[postId];

    setExpandedComments((prev) => ({
      ...prev,
      [postId]: willOpen,
    }));

    if (willOpen) {
      fetchCommentsForPost(postId);
    }
  };

  const handleSubmitRootComment = async (postId) => {
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

      queryClient.invalidateQueries({ queryKey: ['organizer-posts', userId] });
    } catch (error) {
      toast.error(error?.message || 'Không thể gửi bình luận.');
    } finally {
      setCommentSubmitState({ postId: '', targetCommentId: '' });
    }
  };

  const handleSubmitReply = async (postId, parentCommentId) => {
    const replyKey = getReplyDraftKey(postId, parentCommentId);
    const draft = (replyDraftByComment[replyKey] || '').trim();
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
        [replyKey]: '',
      }));

      setActiveReplyInput((prev) => ({
        ...prev,
        [postId]: '',
      }));

      await fetchCommentsForPost(postId, true);
      queryClient.invalidateQueries({ queryKey: ['organizer-posts', userId] });
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
      queryClient.invalidateQueries({ queryKey: ['organizer-posts', userId] });
      handleCancelEditComment();
    } catch (error) {
      toast.error(error?.message || 'Không thể cập nhật bình luận.');
    } finally {
      setCommentActionState({ postId: '', commentId: '', type: '' });
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    setCommentActionState({ postId, commentId, type: 'delete' });

    try {
      await deleteCommentMutation.mutateAsync(commentId);
      await fetchCommentsForPost(postId, true);
      queryClient.invalidateQueries({ queryKey: ['organizer-posts', userId] });
    } catch (error) {
      toast.error(error?.message || 'Không thể xóa bình luận.');
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
    if (!userId) {
      toast.warning('Bạn cần đăng nhập để gửi báo cáo.');
      return;
    }

    if (targetOwnerId && targetOwnerId === userId) {
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
      await reportCommentMutation.mutateAsync({
        targetType: 'comment',
        targetId: commentId,
        reason: reportModalState.reason,
        description: reportModalState.description.slice(0, 500),
      });
      toast.success('Đã gửi báo cáo bình luận.');
      await fetchCommentsForPost(postId, true);
      queryClient.invalidateQueries({ queryKey: ['organizer-posts', userId] });
      closeReportModal();
    } catch (error) {
      toast.error(error?.message || 'Không thể báo cáo bình luận.');
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
    }
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
    const shareUrl = `${window.location.origin}/community?post=${postId}`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
      toast.success('Đã sao chép link bài viết.');
    } catch {
      toast.info(`Link bài viết: ${shareUrl}`);
    }
  };

  const handleDeletePost = () => {
    if (!deleteState.post?.id) return;
    deletePostMutation.mutate(deleteState.post.id);
  };

  if (!userId) {
    return (
      <div className="bg-background-secondary border-border-default rounded-2xl border p-8 text-center">
        <h2 className="text-text-primary text-lg font-semibold">
          Không tìm thấy thông tin tài khoản
        </h2>
        <p className="text-text-secondary mt-2 text-sm">
          Vui lòng đăng nhập lại để quản lý bài đăng.
        </p>
      </div>
    );
  }

  if (isPostsLoading) {
    return (
      <section className="space-y-5">
        <PostSkeleton />
        <PostSkeleton />
      </section>
    );
  }

  if (postsError) {
    return (
      <ErrorDisplay
        title="Không tải được bài đăng"
        message={postsError?.message}
        onRetry={refetchPosts}
        className="rounded-2xl"
      />
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <section
        onClick={openComposer}
        className="bg-background-secondary border-border-default flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition hover:shadow-sm"
      >
        <img
          src={
            user?.avatar ||
            'https://picsum.photos/seed/organizer-avatar/100/100'
          }
          alt={user?.name || 'Organizer'}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="bg-disabled-background text-text-secondary flex-1 rounded-full px-5 py-2.5 text-sm font-medium">
          Chia sẻ thông tin mới về sự kiện của bạn...
        </div>
      </section>

      {/* <section className="bg-background-secondary border-border-default rounded-2xl border p-4">
        <h1 className="text-text-primary text-2xl font-bold">
          Bài viết của nhà tổ chức
        </h1>
        <p className="text-text-secondary mt-1 text-sm">
          Tạo bài quảng bá cho sự kiện đã duyệt và tương tác bình luận trực
          tiếp.
        </p>
      </section> */}

      {posts.length === 0 ? (
        <div className="bg-background-secondary border-border-default rounded-2xl border px-6 py-12 text-center">
          <h3 className="text-text-primary text-lg font-semibold">
            Chưa có bài viết
          </h3>
          <p className="text-text-secondary mt-1 text-sm">
            Bạn chưa đăng bài nào cho sự kiện của mình.
          </p>
        </div>
      ) : (
        <section className="space-y-5">
          {posts.map((post) => {
            const isExpanded = Boolean(expandedContent[post.id]);
            const isLongContent = post.content.length > CONTENT_PREVIEW_LIMIT;
            const visibleContent =
              isLongContent && !isExpanded
                ? `${post.content.slice(0, CONTENT_PREVIEW_LIMIT)}...`
                : post.content;

            const commentState = commentStateByPost[post.id] || {
              items: [],
              isLoading: false,
              error: '',
              loaded: false,
            };

            const comments = commentState.items;
            const isCommentOpen = Boolean(expandedComments[post.id]);
            const commentCount = commentState.loaded
              ? countComments(comments)
              : post.metrics.commentCount;

            return (
              <article
                key={post.id}
                className="bg-background-secondary border-border-default overflow-hidden rounded-2xl border"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-text-primary text-sm font-semibold">
                          {post.author.name}
                        </h3>
                        <div className="text-text-secondary mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                          <span>{fromNow(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setDeleteState({ isOpen: true, post })}
                      className="text-destructive hover:bg-destructive-background rounded-lg px-3 py-2 text-xs font-semibold transition"
                    >
                      Xóa
                    </button>
                  </div>

                  <p className="text-text-primary mt-4 text-sm leading-relaxed whitespace-pre-line">
                    {visibleContent}
                    {isLongContent && !isExpanded && (
                      <button
                        onClick={() =>
                          setExpandedContent((prev) => ({
                            ...prev,
                            [post.id]: true,
                          }))
                        }
                        className="text-primary ml-1 text-sm font-semibold"
                      >
                        Xem thêm
                      </button>
                    )}
                  </p>

                  {post.images.length > 0 && (
                    <div
                      className={`mt-4 grid gap-1 ${
                        post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
                      }`}
                    >
                      {post.images.map((image, index) => (
                        <img
                          key={`${post.id}-${index}`}
                          src={image}
                          alt={`post-${index + 1}`}
                          className={`w-full rounded-lg object-cover ${
                            post.images.length === 1
                              ? 'aspect-video'
                              : 'aspect-square'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {post.relatedEvent && (
                    <div className="bg-foreground border-border-default mt-4 rounded-xl border p-3.5">
                      <div className="flex items-start gap-3">
                        <img
                          src={post.relatedEvent.bannerImageUrl}
                          alt={post.relatedEvent.name}
                          className="h-14 w-14 rounded-lg object-cover"
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
                </div>

                <div className="border-border-default text-text-secondary flex items-center justify-between border-t px-4 py-3 text-sm md:px-6">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-2 transition ${
                      likedPostIds[post.id]
                        ? 'text-destructive'
                        : 'hover:text-destructive'
                    }`}
                  >
                    <Heart
                      className="h-4 w-4"
                      fill={likedPostIds[post.id] ? 'currentColor' : 'none'}
                    />
                    <span>
                      Yêu thích{' '}
                      {Number(likeCountByPost[post.id] || 0) > 0
                        ? `(${likeCountByPost[post.id]})`
                        : ''}
                    </span>
                  </button>

                  <button
                    onClick={() => handleToggleComments(post.id)}
                    className={`flex items-center gap-2 transition ${
                      isCommentOpen ? 'text-primary' : 'hover:text-primary'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Bình luận ({commentCount})</span>
                  </button>

                  <button
                    onClick={() => handleSharePost(post.id)}
                    className="hover:text-info flex items-center gap-2 transition"
                  >
                    <Link2 className="h-4 w-4" />
                    <span>Chia sẻ</span>
                  </button>
                </div>

                {isCommentOpen && (
                  <div className="bg-foreground border-border-default space-y-4 border-t p-4 md:p-6">
                    {commentState.isLoading && (
                      <div className="text-text-secondary flex items-center gap-2 text-sm">
                        <LoadingSpinner size="sm" /> Đang tải bình luận...
                      </div>
                    )}

                    {commentState.error && (
                      <div className="bg-destructive-background text-destructive-text-on-subtle rounded-lg px-3 py-2 text-sm">
                        {commentState.error}
                        <button
                          onClick={() => fetchCommentsForPost(post.id, true)}
                          className="ml-2 font-semibold underline"
                        >
                          Thử lại
                        </button>
                      </div>
                    )}

                    {!commentState.isLoading && comments.length === 0 && (
                      <p className="text-text-secondary text-sm">
                        Chưa có bình luận, hãy mở đầu cuộc trò chuyện.
                      </p>
                    )}

                    {comments.map((comment) => {
                      const rootDraftKey = getReplyDraftKey(
                        post.id,
                        comment.id
                      );
                      const isRootReplyOpen =
                        activeReplyInput[post.id] === comment.id;

                      return (
                        <div key={comment.id} className="space-y-3">
                          <CommentBubble
                            comment={comment}
                            isOwner={Boolean(
                              userId && comment.author.id === userId
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
                            onEditValueChange={(value) =>
                              setEditingComment((prev) => ({ ...prev, value }))
                            }
                            onStartEdit={() =>
                              handleStartEditComment(post.id, comment)
                            }
                            onSaveEdit={() =>
                              handleSaveEditComment(post.id, comment.id)
                            }
                            onCancelEdit={handleCancelEditComment}
                            onDelete={() =>
                              handleOpenDeleteComment(post.id, comment.id)
                            }
                            onReport={() =>
                              openReportModal({
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
                            onReply={() =>
                              setActiveReplyInput((prev) => ({
                                ...prev,
                                [post.id]:
                                  prev[post.id] === comment.id
                                    ? ''
                                    : comment.id,
                              }))
                            }
                          />

                          {isRootReplyOpen && (
                            <div className="bg-background-secondary border-border-default focus:border-primary ml-10 flex items-center gap-2 rounded-full border px-2 py-1">
                              <img
                                src={
                                  user?.avatar ||
                                  'https://picsum.photos/seed/current-user/100/100'
                                }
                                alt="Current user"
                                className="h-7 w-7 rounded-full object-cover"
                              />
                              <div className="relative flex-1">
                                <input
                                  autoFocus={true}
                                  value={
                                    replyDraftByComment[rootDraftKey] || ''
                                  }
                                  onChange={(event) =>
                                    setReplyDraftByComment((prev) => ({
                                      ...prev,
                                      [rootDraftKey]: event.target.value,
                                    }))
                                  }
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                      event.preventDefault();
                                      handleSubmitReply(post.id, comment.id);
                                    }
                                  }}
                                  placeholder="Viết phản hồi..."
                                  className="text-text-primary w-full bg-transparent px-2 py-2 pr-10 text-sm outline-none"
                                />
                                <button
                                  onClick={() =>
                                    handleSubmitReply(post.id, comment.id)
                                  }
                                  disabled={
                                    commentSubmitState.postId === post.id &&
                                    commentSubmitState.targetCommentId ===
                                      comment.id
                                  }
                                  className="text-primary absolute top-1/2 right-3 -translate-y-1/2 disabled:opacity-70"
                                  aria-label="Gửi phản hồi"
                                >
                                  <Send className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}

                          {flattenReplies(comment.replies || []).map(
                            (reply) => {
                              const replyDraftKey = getReplyDraftKey(
                                post.id,
                                reply.id
                              );
                              const isReplyInputOpen =
                                activeReplyInput[post.id] === reply.id;

                              return (
                                <div key={reply.id} className="space-y-3">
                                  <CommentBubble
                                    comment={reply}
                                    isReply
                                    isOwner={Boolean(
                                      userId && reply.author.id === userId
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
                                    onEditValueChange={(value) =>
                                      setEditingComment((prev) => ({
                                        ...prev,
                                        value,
                                      }))
                                    }
                                    onStartEdit={() =>
                                      handleStartEditComment(post.id, reply)
                                    }
                                    onSaveEdit={() =>
                                      handleSaveEditComment(post.id, reply.id)
                                    }
                                    onCancelEdit={handleCancelEditComment}
                                    onDelete={() =>
                                      handleOpenDeleteComment(post.id, reply.id)
                                    }
                                    onReport={() =>
                                      openReportModal({
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
                                    onReply={() =>
                                      setActiveReplyInput((prev) => ({
                                        ...prev,
                                        [post.id]:
                                          prev[post.id] === reply.id
                                            ? ''
                                            : reply.id,
                                      }))
                                    }
                                  />

                                  {isReplyInputOpen && (
                                    <div className="bg-background-secondary border-border-default ml-16 flex items-center gap-2 rounded-full border px-2 py-1">
                                      <img
                                        src={
                                          user?.avatar ||
                                          'https://picsum.photos/seed/current-user/100/100'
                                        }
                                        alt="Current user"
                                        className="h-7 w-7 rounded-full object-cover"
                                      />
                                      <div className="relative flex-1">
                                        <input
                                          value={
                                            replyDraftByComment[
                                              replyDraftKey
                                            ] || ''
                                          }
                                          onChange={(event) =>
                                            setReplyDraftByComment((prev) => ({
                                              ...prev,
                                              [replyDraftKey]:
                                                event.target.value,
                                            }))
                                          }
                                          onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                              event.preventDefault();
                                              handleSubmitReply(
                                                post.id,
                                                reply.id
                                              );
                                            }
                                          }}
                                          placeholder="Viết phản hồi..."
                                          className="text-text-primary w-full bg-transparent px-2 py-2 pr-10 text-sm outline-none"
                                        />
                                        <button
                                          onClick={() =>
                                            handleSubmitReply(post.id, reply.id)
                                          }
                                          disabled={
                                            commentSubmitState.postId ===
                                              post.id &&
                                            commentSubmitState.targetCommentId ===
                                              reply.id
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
                            }
                          )}
                        </div>
                      );
                    })}

                    <div className="bg-background-secondary border-border-default flex items-center gap-2 rounded-full border px-2 py-1">
                      <img
                        src={
                          user?.avatar ||
                          'https://picsum.photos/seed/current-user/100/100'
                        }
                        className="h-8 w-8 rounded-full object-cover"
                        alt="Me"
                      />
                      <div className="relative flex-1">
                        <input
                          value={commentDraftByPost[post.id] || ''}
                          onChange={(event) =>
                            setCommentDraftByPost((prev) => ({
                              ...prev,
                              [post.id]: event.target.value,
                            }))
                          }
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              handleSubmitRootComment(post.id);
                            }
                          }}
                          placeholder="Viết bình luận..."
                          className="text-text-primary w-full bg-transparent px-2 py-2 pr-10 text-sm outline-none"
                        />
                        <button
                          onClick={() => handleSubmitRootComment(post.id)}
                          disabled={
                            commentSubmitState.postId === post.id &&
                            !commentSubmitState.targetCommentId
                          }
                          className="text-primary absolute top-1/2 right-3 -translate-y-1/2 disabled:opacity-70"
                          aria-label="Gửi bình luận"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background-secondary max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl shadow-xl">
            <div className="border-border-default flex items-center justify-between border-b px-5 py-4">
              <h2 className="text-text-primary text-lg font-semibold">
                Tạo bài viết
              </h2>
              <button
                onClick={closeComposer}
                className="text-text-secondary hover:bg-foreground rounded-full p-2"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <img
                  src={
                    user?.avatar ||
                    'https://picsum.photos/seed/organizer-avatar/100/100'
                  }
                  alt={user?.name || 'Organizer'}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div>
                  <p className="text-text-primary text-sm font-semibold">
                    {user?.name || user?.fullName || 'Organizer'}
                  </p>
                  <p className="text-text-secondary text-xs">organizer</p>
                </div>
              </div>

              <TextArea
                label="Nội dung bài viết"
                rows={6}
                value={composerForm.content}
                onChange={(event) =>
                  setComposerForm((prev) => ({
                    ...prev,
                    content: event.target.value.slice(
                      0,
                      POST_CONTENT_MAX_LENGTH
                    ),
                  }))
                }
                placeholder="Mô tả thông tin cần truyền thông cho sự kiện..."
              />

              <div className="flex justify-end">
                <p className="text-text-secondary text-xs">
                  {composerForm.content.trim().length}/{POST_CONTENT_MAX_LENGTH}{' '}
                  ký tự
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-text-secondary block text-sm font-medium">
                  Sự kiện đã duyệt để quảng bá
                </label>
                <select
                  value={composerForm.relatedEventId}
                  onChange={(event) =>
                    setComposerForm((prev) => ({
                      ...prev,
                      relatedEventId: event.target.value,
                    }))
                  }
                  disabled={isEventsLoading || isEventsFetching}
                  className="bg-background-secondary border-border-default focus:border-primary text-text-primary w-full rounded-lg border px-3 py-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <option value="">
                    {isEventsLoading || isEventsFetching
                      ? 'Đang tải sự kiện...'
                      : '-- Chọn sự kiện --'}
                  </option>
                  {approvedEvents.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </div>

              {eventsError && (
                <p className="text-destructive bg-destructive-background rounded-lg px-3 py-2 text-sm">
                  Không tải được danh sách sự kiện: {eventsError?.message}
                </p>
              )}

              {!isEventsLoading &&
                approvedEvents.length === 0 &&
                !eventsError && (
                  <p className="bg-warning-background text-warning-text-on-subtle rounded-lg px-3 py-2 text-sm">
                    Hiện chưa có sự kiện đã duyệt để gắn vào bài viết.
                  </p>
                )}

              {composerForm.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {composerForm.images.map((image, index) => (
                    <div
                      key={image}
                      className="relative overflow-hidden rounded-lg"
                    >
                      <img
                        src={image}
                        alt={`composer-${index + 1}`}
                        className="aspect-video w-full object-cover"
                      />
                      <button
                        onClick={() =>
                          setComposerForm((prev) => ({
                            ...prev,
                            images: prev.images.filter(
                              (_, imageIndex) => imageIndex !== index
                            ),
                          }))
                        }
                        className="bg-destructive text-destructive-foreground absolute top-2 right-2 rounded-full p-1"
                        aria-label="Xóa ảnh"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Button variant="secondary" onClick={handleAddImageToComposer}>
                <ImagePlus className="mr-2 h-4 w-4" />
                Thêm ảnh mẫu
              </Button>

              {composerError && (
                <p className="text-destructive bg-destructive-background rounded-lg px-3 py-2 text-sm">
                  {composerError}
                </p>
              )}
            </div>

            <div className="border-border-default flex items-center justify-end gap-3 border-t px-5 py-4">
              <Button
                variant="outline"
                onClick={closeComposer}
                disabled={createPostMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreatePost}
                loading={createPostMutation.isPending}
              >
                Đăng bài
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteState.isOpen}
        title="Xóa bài viết"
        message="Bạn có chắc muốn xóa bài viết này? Hành động này không thể hoàn tác."
        onCancel={() => setDeleteState({ isOpen: false, post: null })}
        onConfirm={handleDeletePost}
        isLoading={deletePostMutation.isPending}
        confirmText="Xóa"
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
                description: event.target.value.slice(0, 500),
              }))
            }
            placeholder="Mô tả ngắn lý do bạn báo cáo (không bắt buộc)."
          />

          <p className="text-text-secondary text-xs">
            {reportModalState.description.length}/500 ký tự
          </p>

          <div className="mt-2 flex justify-end gap-2">
            <Button variant="outline" onClick={closeReportModal}>
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

      {(isEventsLoading || isEventsFetching) && isComposerOpen && (
        <div className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-full bg-black/80 px-3 py-2 text-xs text-white">
          <LoadingSpinner size="sm" className="text-white" />
          Đang tải dữ liệu sự kiện...
        </div>
      )}

      {deletePostMutation.isError && (
        <div className="bg-destructive-background text-destructive-text-on-subtle rounded-xl px-4 py-3 text-sm">
          {deletePostMutation.error?.message ||
            'Không thể xóa bài viết. Vui lòng thử lại.'}
        </div>
      )}
    </div>
  );
};

export default PostsPage;
