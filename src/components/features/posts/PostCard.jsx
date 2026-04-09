import { CalendarDays, Heart, Link2, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CONTENT_PREVIEW_LIMIT, formatDateTime, fromNow } from './postUtils';

const PostCard = ({
  post,
  isExpanded = false,
  onToggleExpand,
  isCommentOpen = false,
  commentCount = 0,
  isLiked = false,
  likeCount = 0,
  onOpen,
  onToggleLike,
  onToggleComments,
  onShare,
  onReport,
  onDelete,
  showDelete = false,
}) => {
  const isLongContent = post.content.length > CONTENT_PREVIEW_LIMIT;
  const visibleContent =
    isLongContent && !isExpanded
      ? `${post.content.slice(0, CONTENT_PREVIEW_LIMIT)}...`
      : post.content;

  return (
    <article className="bg-background-secondary border-border-default overflow-hidden rounded-2xl border">
      <div className="p-4 pb-2 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <button
            type="button"
            onClick={() => onOpen(post.id)}
            className="flex min-w-0 items-start gap-3 text-left"
          >
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="h-11 w-11 rounded-full object-cover"
            />
            <div className="min-w-0">
              <h3 className="text-text-primary truncate text-sm font-semibold">
                {post.author.name}
              </h3>
              <p className="text-text-secondary mt-0.5 text-xs">
                {fromNow(post.createdAt)}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {showDelete && onDelete && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(post);
                }}
                className="text-destructive hover:bg-destructive-background rounded-lg px-3 py-2 text-xs font-semibold transition"
              >
                Xóa
              </button>
            )}

            {onReport && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onReport(post);
                }}
                className="text-text-secondary hover:bg-foreground rounded-lg px-3 py-2 text-xs font-semibold transition"
              >
                Báo cáo
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpen(post.id)}
          className="mt-4 block w-full text-left"
        >
          <p className="text-text-primary text-sm leading-relaxed whitespace-pre-line">
            {visibleContent}
            {isLongContent && !isExpanded && (
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleExpand(post.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onToggleExpand(post.id);
                  }
                }}
                className="text-primary ml-1 text-sm font-semibold"
              >
                Xem thêm
              </span>
            )}
          </p>
        </button>
      </div>

      {post.images.length > 0 && (
        <button
          type="button"
          onClick={() => onOpen(post.id)}
          className={`mt-2 grid w-full gap-1 text-left ${
            post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {post.images.map((image, index) => (
            <img
              key={`${post.id}-image-${index}`}
              src={image}
              alt="Post"
              className={`w-full object-cover ${
                post.images.length === 1 ? 'aspect-video' : 'aspect-square'
              }`}
            />
          ))}
        </button>
      )}

      {post.relatedTicket && (
        <div className="px-4 py-4 md:px-6">
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
        </div>
      )}

      {post.relatedEvent && (
        <div className="px-4 py-4 md:px-6">
          <Link
            to={`/event-detail/${post.relatedEvent.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-foreground border-border-default cursor-pointer rounded-xl border p-4 transition hover:shadow-sm">
              <p className="text-text-primary text-sm font-semibold">
                {post.relatedEvent.name}
              </p>
              <div className="text-text-secondary mt-2 inline-flex items-center gap-1 text-xs">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDateTime(post.relatedEvent.startDate)}
              </div>
            </div>
          </Link>
        </div>
      )}

      <div className="border-border-default text-text-secondary flex items-center justify-between border-t px-4 py-3 text-sm md:px-6">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleLike(post.id);
          }}
          className={`flex items-center gap-2 transition ${
            isLiked ? 'text-destructive' : 'hover:text-destructive'
          }`}
        >
          <Heart className="h-4 w-4" fill={isLiked ? 'currentColor' : 'none'} />
          <span>
            Yêu thích {Number(likeCount || 0) > 0 ? `(${likeCount})` : ''}
          </span>
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleComments(post.id);
          }}
          className={`flex items-center gap-2 transition ${
            isCommentOpen ? 'text-primary' : 'hover:text-primary'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Bình luận ({commentCount})</span>
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onShare(post.id);
          }}
          className="hover:text-info flex items-center gap-2 transition"
        >
          <Link2 className="h-4 w-4" />
          <span>Chia sẻ</span>
        </button>
      </div>
    </article>
  );
};

export default PostCard;
