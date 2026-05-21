import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, Heart, Calendar } from 'lucide-react';
import Modal from '../../ui/Modal';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { getPostById } from '../../../services/postService';
import { getCommentsByPostId } from '../../../services/commentService';
import { formatDate } from '../../../utils/formatDate';

const hashName = (value) => {
  if (!value) return 0;

  return String(value)
    .split('')
    .reduce((accumulator, character) => {
      return (accumulator * 31 + character.charCodeAt(0)) >>> 0;
    }, 0);
};

const getInitials = (name) => {
  if (!name) return '?';

  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return '?';

  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }

  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`.toUpperCase();
};

const getAvatarStyle = (name) => {
  const hue = hashName(name) % 360;

  return {
    backgroundColor: `hsl(${hue} 82% 56%)`,
    color: '#ffffff',
  };
};

const AvatarInitial = ({ name, className = 'h-10 w-10' }) => {
  return (
    <div
      className={`${className} border-border-default flex shrink-0 items-center justify-center rounded-full border text-xs font-bold shadow-sm`}
      style={getAvatarStyle(name)}
      aria-label={name || 'Người dùng'}
      title={name || 'Người dùng'}
    >
      {getInitials(name)}
    </div>
  );
};

const flattenReplies = (replies = []) => {
  const result = [];
  const stack = Array.isArray(replies) ? [...replies].reverse() : [];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    result.push(current);

    if (Array.isArray(current.replies) && current.replies.length > 0) {
      stack.push(...[...current.replies].reverse());
    }
  }

  return result;
};

const getReplyText = (comment, authorName) => {
  if (!comment.replyDisplay || typeof comment.replyDisplay !== 'string') {
    return null;
  }

  const parts = comment.replyDisplay
    .split('>')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) return null;

  const targetName = parts[parts.length - 1];
  if (!targetName || targetName === authorName) return null;

  return ` > ${targetName}`;
};

const CommentCard = ({ comment, isReply = false }) => {
  const authorName = comment.author?.fullName || 'Người dùng';
  const replyText = getReplyText(comment, authorName);

  return (
    <div className={`flex gap-3 ${isReply ? 'pl-1' : ''}`}>
      <AvatarInitial
        name={authorName}
        className={isReply ? 'h-8 w-8' : 'h-9 w-9'}
      />
      <div className="bg-background-secondary min-w-0 flex-1 rounded-2xl px-3 py-2.5">
        <div className="mb-0.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h5 className="text-text-primary truncate text-sm leading-tight font-semibold">
              {authorName}
              {replyText && (
                <span className="text-text-secondary truncate text-[11px] leading-tight">
                  {replyText}
                </span>
              )}
            </h5>
          </div>
          <span className="text-text-secondary shrink-0 text-[10px] leading-tight whitespace-nowrap">
            {formatDate(comment.createdAt)}
          </span>
        </div>

        <p className="text-text-primary text-sm leading-snug whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>
    </div>
  );
};

const PostViewModal = ({ isOpen, onClose, postId }) => {
  const { data: postData, isLoading: isPostLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId && isOpen,
  });

  const { data: commentsData, isLoading: isCommentsLoading } = useQuery({
    queryKey: ['post-comments', postId],
    queryFn: () => getCommentsByPostId(postId),
    enabled: !!postId && isOpen,
  });

  const post = postData?.data || postData;
  const rootComments = Array.isArray(commentsData?.data)
    ? commentsData.data
    : [];

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xem nội dung chi tiết"
      maxWidth="max-w-3xl"
      xButton={true}
    >
      <div className="max-h-[80vh] overflow-y-auto pr-2">
        {isPostLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : post ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <AvatarInitial name={post.author?.fullName} />
              <div>
                <h3 className="text-text-primary text-sm font-bold">
                  {post.author?.fullName || 'Người dùng'}
                </h3>
                <div className="text-text-secondary flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                  </span>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>

              {post.images && post.images.length > 0 && (
                <div
                  className={`grid gap-2 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}
                >
                  {post.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Post visual ${idx + 1}`}
                      className="w-full rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="border-border-default flex items-center gap-6 border-y py-3">
              <div className="text-text-secondary flex items-center gap-1.5 text-xs font-medium">
                <Heart className="h-4 w-4" />
                <span>{post.likesCount || 0} lượt thích</span>
              </div>
              <div className="text-text-secondary flex items-center gap-1.5 text-xs font-medium">
                <MessageCircle className="h-4 w-4" />
                <span>{post.commentsCount || 0} bình luận</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-text-primary text-sm font-bold">Bình luận</h4>

              {isCommentsLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : rootComments.length > 0 ? (
                <div className="space-y-2.5">
                  {rootComments.map((comment) => {
                    const replyItems = flattenReplies(comment.replies || []);

                    return (
                      <div
                        key={comment.id || comment._id}
                        className="space-y-2.5"
                      >
                        <CommentCard comment={comment} />

                        {replyItems.length > 0 && (
                          <div className="border-border-default ml-8 space-y-2.5 border-l pl-3">
                            {replyItems.map((reply) => (
                              <CommentCard
                                key={reply.id || reply._id}
                                comment={reply}
                                isReply
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-text-secondary py-4 text-center text-sm italic">
                  Chưa có bình luận nào
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-text-secondary py-10 text-center">
            Không tìm thấy nội dung hoặc đã bị xóa.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PostViewModal;
