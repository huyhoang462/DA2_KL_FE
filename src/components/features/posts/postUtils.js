export const POST_CONTENT_MIN_LENGTH = 30;
export const POST_CONTENT_MAX_LENGTH = 5000;
export const COMMENT_CONTENT_MAX_LENGTH = 1000;
export const COMMENT_DESCRIPTION_MAX_LENGTH = 500;
export const CONTENT_PREVIEW_LIMIT = 220;

export const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate', label: 'Nội dung không phù hợp' },
  { value: 'scam', label: 'Lừa đảo' },
  { value: 'harassment', label: 'Quấy rối' },
  { value: 'other', label: 'Khác' },
];

export const buildImageFromSeed = () =>
  `https://picsum.photos/seed/${Date.now()}/1200/800`;

export const formatDateTime = (value) => {
  if (!value) return 'Đang cập nhật';

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export const fromNow = (value) => {
  if (!value) return 'Không rõ thời gian';

  const date = new Date(value);
  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffSeconds < 60) return 'Vừa xong';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} phút trước`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} giờ trước`;
  if (diffSeconds < 604800) {
    return `${Math.floor(diffSeconds / 86400)} ngày trước`;
  }

  return formatDateTime(value);
};

export const getEventLocationText = (event) => {
  if (!event) return 'Đang cập nhật địa điểm';
  if (event.venue) return event.venue;
  if (event.format === 'online') return 'Sự kiện online';
  if (event.location?.address) return event.location.address;
  if (event.location?.province?.name) return event.location.province.name;
  return 'Đang cập nhật địa điểm';
};

export const isApprovedEvent = (event) => {
  const status = (event?.status || '').toLowerCase();

  if (!status) return true;
  if (['approved', 'upcoming', 'ongoing', 'completed'].includes(status)) {
    return true;
  }

  return !['draft', 'pending', 'rejected', 'cancelled'].includes(status);
};

export const extractArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.posts)) return payload.posts;
  if (Array.isArray(payload?.tickets)) return payload.tickets;
  if (Array.isArray(payload?.events)) return payload.events;
  return [];
};

export const extractCommentsArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const normalizeComment = (comment) => {
  const author = comment?.author || {};
  const replyToUser = comment?.replyToUser || {};
  const replies = Array.isArray(comment?.replies) ? comment.replies : [];
  const authorId = author.id || author._id || 'unknown-author';

  return {
    id: comment.id || comment._id,
    content: comment.content || '',
    createdAt: comment.createdAt,
    replyDisplay: comment.replyDisplay || '',
    replyToUserName: replyToUser.fullName || replyToUser.name || '',
    author: {
      id: authorId,
      name: author.fullName || author.name || 'Người dùng',
      avatar:
        author.avatar ||
        `https://picsum.photos/seed/${authorId.toString().slice(-8)}/100/100`,
    },
    replies: replies.map(normalizeComment),
  };
};

export const normalizePost = (post) => {
  const author = post?.author || {};
  const authorId = author.id || author._id || 'unknown-author';
  const relatedEvent = post?.relatedEvent || null;
  const relatedTicket = post?.relatedTicket || null;

  return {
    id: post?.id || post?._id,
    content: post?.content || '',
    images: Array.isArray(post?.images) ? post.images : [],
    createdAt: post?.createdAt,
    author: {
      id: authorId,
      name: author.fullName || author.name || 'Người dùng',
      role: author.role || '',
      avatar:
        author.avatar ||
        `https://picsum.photos/seed/${authorId.toString().slice(-8)}/100/100`,
    },
    postType: post?.postType || '',
    metrics: {
      commentCount: Number(post?.commentCount || 0),
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

export const normalizeTicket = (ticket) => ({
  id: ticket?.id || ticket?._id,
  eventName: ticket?.eventName || 'Sự kiện',
  showName: ticket?.showName || 'Suất diễn',
  startTime: ticket?.startTime,
  status: ticket?.status,
});

export const normalizeEventOption = (event) => ({
  id: event?.id || event?._id,
  name: event?.name || 'Sự kiện',
  startDate: event?.startDate,
  bannerImageUrl:
    event?.bannerImageUrl || 'https://picsum.photos/seed/default-event/800/450',
  locationText: getEventLocationText(event),
});

export const flattenReplies = (replies = []) => {
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

export const countComments = (comments = []) =>
  comments.reduce((total, comment) => {
    return total + 1 + countComments(comment.replies || []);
  }, 0);

export const getReplyDraftKey = (postId, commentId) => `${postId}_${commentId}`;

export const getPostCategory = (post) => {
  const type = (post?.postType || '').toLowerCase();
  const role = (post?.author?.role || '').toLowerCase();

  if (type === 'marketplace_listing' || post?.relatedTicket) return 'ticket';
  if (role === 'organizer' || post?.relatedEvent) return 'event';

  return 'all';
};

export const buildCommunityPostUrl = (postId) =>
  `${window.location.origin}/community?post=${postId}`;
