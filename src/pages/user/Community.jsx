import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import {
  CalendarDays,
  Heart,
  ImagePlus,
  Link2,
  MessageSquare,
  Send,
  X,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import TextArea from '../../components/ui/TextArea';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { toast } from 'react-toastify';
import { createPost, getAllPosts } from '../../services/postService';
import { getMyTickets } from '../../services/ticketService';
import {
  createComment,
  deleteComment,
  getCommentsByPostId,
  updateComment,
} from '../../services/commentService';
import { createReport } from '../../services/reportService';
import { Link } from 'react-router-dom';

const POST_CONTENT_MIN_LENGTH = 30;
const POST_CONTENT_MAX_LENGTH = 5000;
const COMMENT_CONTENT_MAX_LENGTH = 1000;
const CONTENT_PREVIEW_LIMIT = 220;

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

const extractArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.posts)) return payload.posts;
  if (Array.isArray(payload?.tickets)) return payload.tickets;
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
  const author = post.author || {};
  const authorId = author.id || author._id || 'unknown-author';

  const relatedEvent = post.relatedEvent || null;
  const relatedTicket = post.relatedTicket || null;

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
        }
      : null,
    relatedTicket: relatedTicket
      ? {
          id: relatedTicket.id || relatedTicket._id || relatedTicket,
          eventName:
            relatedTicket.eventName ||
            relatedTicket.event?.name ||
            'Vé sự kiện',
          showName:
            relatedTicket.showName || relatedTicket.show?.name || 'Suất diễn',
          startTime: relatedTicket.startTime || relatedTicket.show?.startTime,
        }
      : null,
  };
};

const normalizeTicket = (ticket) => ({
  id: ticket.id || ticket._id,
  eventName: ticket.eventName || 'Sự kiện',
  showName: ticket.showName || 'Suất diễn',
  startTime: ticket.startTime,
  status: ticket.status,
});

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
        <div className="bg-foreground h-3 w-32 rounded" />
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

const CommentBubbleV2 = ({
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

export default function Community() {
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.auth.user);
  const userId = user?.id;

  const [activeTab, setActiveTab] = useState('feed');

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerForm, setComposerForm] = useState({
    content: '',
    relatedTicketId: '',
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

  const {
    data: feedResponse,
    isLoading: isFeedLoading,
    error: feedError,
    refetch: refetchFeed,
  } = useQuery({
    queryKey: ['community-feed'],
    queryFn: () =>
      getAllPosts({
        page: 1,
        limit: 50,
        //status: 'published',
      }),
    staleTime: 30000,
  });

  const {
    data: myPostsResponse,
    isLoading: isMyPostsLoading,
    error: myPostsError,
    refetch: refetchMyPosts,
  } = useQuery({
    queryKey: ['community-my-posts', userId],
    queryFn: () =>
      getAllPosts({
        page: 1,
        limit: 50,
        authorId: userId,
      }),
    enabled: !!userId,
    staleTime: 30000,
  });

  const {
    data: myTicketsResponse,
    isLoading: isTicketsLoading,
    isFetching: isTicketsFetching,
    error: ticketsError,
  } = useQuery({
    queryKey: ['community-my-tickets', userId],
    queryFn: getMyTickets,
    enabled: !!userId,
    staleTime: 60000,
  });

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      closeComposer();
      toast.success('Đăng bài thành công.');
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      queryClient.invalidateQueries({
        queryKey: ['community-my-posts', userId],
      });
    },
    onError: (error) => {
      setComposerError(
        error?.message || 'Không thể đăng bài. Vui lòng thử lại sau.'
      );
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

  const feedPosts = useMemo(() => {
    return extractArray(feedResponse)
      .map(normalizePost)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [feedResponse]);

  const myPosts = useMemo(() => {
    return extractArray(myPostsResponse)
      .map(normalizePost)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [myPostsResponse]);

  const myTickets = useMemo(() => {
    return extractArray(myTicketsResponse)
      .map(normalizeTicket)
      .filter((ticket) => ticket.id);
  }, [myTicketsResponse]);

  const posts = useMemo(
    () => (activeTab === 'my-posts' ? myPosts : feedPosts),
    [activeTab, myPosts, feedPosts]
  );

  const isCurrentTabLoading =
    activeTab === 'my-posts' ? isMyPostsLoading : isFeedLoading;
  const currentTabError = activeTab === 'my-posts' ? myPostsError : feedError;

  const closeComposer = () => {
    setIsComposerOpen(false);
    setComposerError('');
    setComposerForm({
      content: '',
      relatedTicketId: '',
      images: [],
    });
  };

  const openComposer = () => {
    if (!userId) {
      toast.warning('Bạn cần đăng nhập để tạo bài viết.');
      return;
    }

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

    if (!composerForm.relatedTicketId) {
      setComposerError('Bài viết community phải gắn với ít nhất 1 vé của bạn.');
      return;
    }

    const selectedTicket = myTickets.find(
      (ticket) => ticket.id === composerForm.relatedTicketId
    );

    if (!selectedTicket) {
      setComposerError('Không tìm thấy vé bạn đã chọn.');
      return;
    }

    createPostMutation.mutate({
      content: trimmedContent,
      images: composerForm.images,
      relatedTicket: composerForm.relatedTicketId,
      postType: 'marketplace_listing',
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
    if (!userId) {
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

      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      queryClient.invalidateQueries({
        queryKey: ['community-my-posts', userId],
      });
    } catch (error) {
      toast.error(error?.message || 'Không thể gửi bình luận.');
    } finally {
      setCommentSubmitState({ postId: '', targetCommentId: '' });
    }
  };

  const handleSubmitReply = async (postId, parentCommentId) => {
    if (!userId) {
      toast.warning('Bạn cần đăng nhập để phản hồi bình luận.');
      return;
    }

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

      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      queryClient.invalidateQueries({
        queryKey: ['community-my-posts', userId],
      });
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
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      queryClient.invalidateQueries({
        queryKey: ['community-my-posts', userId],
      });
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
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      queryClient.invalidateQueries({
        queryKey: ['community-my-posts', userId],
      });
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
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      queryClient.invalidateQueries({
        queryKey: ['community-my-posts', userId],
      });
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
      await reportCommentMutation.mutateAsync({
        targetType: 'post',
        targetId: post.id,
        reason: reportModalState.reason,
        description: reportModalState.description.slice(0, 500),
      });
      toast.success('Đã gửi báo cáo bài viết.');
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      queryClient.invalidateQueries({
        queryKey: ['community-my-posts', userId],
      });
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

    const targetPost = posts.find(
      (post) => post.id === reportModalState.targetId
    );
    if (targetPost) {
      await handleReportPost(targetPost);
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

  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-4 pb-20">
      <section
        onClick={openComposer}
        className="bg-background-secondary border-border-default flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition hover:shadow-sm"
      >
        <img
          src={
            user?.avatar || 'https://picsum.photos/seed/community-user/100/100'
          }
          className="h-10 w-10 rounded-full object-cover"
          alt="Avatar"
        />
        <div className="bg-disabled-background text-text-secondary flex-1 rounded-full px-5 py-2.5 text-sm font-medium">
          Bạn đang nghĩ gì? Chia sẻ ngay...
        </div>
      </section>

      <section className="bg-background-secondary border-border-default rounded-2xl border p-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTab('feed')}
            className={`w-full rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'feed'
                ? 'bg-primary text-primary-foreground'
                : 'text-text-secondary hover:bg-foreground'
            }`}
          >
            Khám phá
          </button>
          <button
            onClick={() => setActiveTab('my-posts')}
            className={`w-full rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'my-posts'
                ? 'bg-primary text-primary-foreground'
                : 'text-text-secondary hover:bg-foreground'
            }`}
          >
            Bài viết của tôi
          </button>
        </div>
      </section>

      {activeTab === 'my-posts' && !userId ? (
        <div className="bg-background-secondary border-border-default rounded-2xl border px-6 py-12 text-center">
          <h3 className="text-text-primary text-lg font-semibold">
            Cần đăng nhập để xem bài viết của bạn
          </h3>
          <p className="text-text-secondary mt-1 text-sm">
            Vui lòng đăng nhập để quản lý bài post cá nhân.
          </p>
        </div>
      ) : isCurrentTabLoading ? (
        <section className="space-y-5">
          <PostSkeleton />
          <PostSkeleton />
        </section>
      ) : currentTabError ? (
        <ErrorDisplay
          title="Không tải được dữ liệu Community"
          message={currentTabError?.message}
          onRetry={activeTab === 'my-posts' ? refetchMyPosts : refetchFeed}
          className="rounded-2xl"
        />
      ) : posts.length === 0 ? (
        <div className="bg-background-secondary border-border-default rounded-2xl border px-6 py-12 text-center">
          <h3 className="text-text-primary text-lg font-semibold">
            Chưa có bài viết
          </h3>
          <p className="text-text-secondary mt-1 text-sm">
            {activeTab === 'my-posts'
              ? 'Bạn chưa có bài viết nào.'
              : 'Chưa có bài viết cộng đồng phù hợp.'}
          </p>
        </div>
      ) : (
        <section className="space-y-6">
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
                <div className="p-4 pb-2 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-text-primary text-sm font-bold">
                          {post.author.name}
                        </h3>
                        <p className="text-text-secondary text-xs">
                          {fromNow(post.createdAt)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        openReportModal({
                          targetType: 'post',
                          targetId: post.id,
                          postId: post.id,
                          targetOwnerId: post.author.id,
                        })
                      }
                      className="text-text-secondary hover:bg-foreground rounded-lg px-3 py-2 text-xs font-semibold transition"
                    >
                      Báo cáo
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
                </div>

                {post.images.length > 0 && (
                  <div
                    className={`mt-2 grid gap-1 ${
                      post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
                    }`}
                  >
                    {post.images.map((image, index) => (
                      <img
                        key={`${post.id}-image-${index}`}
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

                {post.relatedTicket && (
                  <div className="px-4 py-4 md:px-6">
                    <div className="bg-foreground border-border-default rounded-xl border p-4">
                      <p className="text-text-primary text-sm font-bold">
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
                  </div>
                )}

                {post.relatedEvent && (
                  <Link
                    className=" "
                    to={`/event-detail/${post.relatedEvent.id}`}
                  >
                    <div className="px-4 py-4 md:px-6">
                      <div className="bg-foreground border-border-default cursor-pointer rounded-xl border p-4">
                        <p className="text-text-primary text-sm font-bold">
                          {post.relatedEvent.name}
                        </p>
                        <div className="text-text-secondary mt-2 inline-flex items-center gap-1 text-xs">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDateTime(post.relatedEvent.startDate)}
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

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
                          <CommentBubbleV2
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
                            <div className="bg-background-secondary border-border-default ml-10 flex items-center gap-2 rounded-full border px-2 py-1">
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
                                  <CommentBubbleV2
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
                    'https://picsum.photos/seed/community-user/100/100'
                  }
                  className="h-11 w-11 rounded-full object-cover"
                  alt="Avatar"
                />
                <div>
                  <p className="text-text-primary text-sm font-semibold">
                    {user?.name || user?.fullName || 'Bạn'}
                  </p>
                  <p className="text-text-secondary text-xs">customer</p>
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
                placeholder="Chia sẻ về chiếc vé bạn muốn pass lại..."
              />

              <div className="flex justify-end">
                <p className="text-text-secondary text-xs">
                  {composerForm.content.trim().length}/{POST_CONTENT_MAX_LENGTH}{' '}
                  ký tự
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-text-secondary block text-sm font-medium">
                  Vé liên quan
                </label>
                <select
                  value={composerForm.relatedTicketId}
                  onChange={(event) =>
                    setComposerForm((prev) => ({
                      ...prev,
                      relatedTicketId: event.target.value,
                    }))
                  }
                  disabled={isTicketsLoading || isTicketsFetching}
                  className="bg-background-secondary border-border-default focus:border-primary text-text-primary w-full rounded-lg border px-3 py-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <option value="">
                    {isTicketsLoading || isTicketsFetching
                      ? 'Đang tải vé...'
                      : '-- Chọn vé --'}
                  </option>
                  {myTickets.map((ticket) => (
                    <option key={ticket.id} value={ticket.id}>
                      {ticket.eventName} - {ticket.showName}
                    </option>
                  ))}
                </select>
              </div>

              {ticketsError && (
                <p className="text-destructive bg-destructive-background rounded-lg px-3 py-2 text-sm">
                  Không tải được danh sách vé: {ticketsError?.message}
                </p>
              )}

              {!isTicketsLoading && myTickets.length === 0 && !ticketsError && (
                <p className="bg-warning-background text-warning-text-on-subtle rounded-lg px-3 py-2 text-sm">
                  Bạn chưa có vé nào để tạo bài post pass vé.
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

      {(isTicketsLoading || isTicketsFetching) && isComposerOpen && (
        <div className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-full bg-black/80 px-3 py-2 text-xs text-white">
          <LoadingSpinner size="sm" className="text-white" />
          Đang tải vé của bạn...
        </div>
      )}
    </div>
  );
}
