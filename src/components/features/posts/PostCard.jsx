import {
  CalendarDays,
  Heart,
  Link2,
  MessageSquare,
  Tag,
  MoreHorizontal,
  Trash2,
  Flag,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
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
  currentUser,
  onOpen,
  onToggleLike,
  onToggleComments,
  onShare,
  onReport,
  onDelete,
  showDelete = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isLongContent = post.content.length > CONTENT_PREVIEW_LIMIT;
  const visibleContent =
    isLongContent && !isExpanded
      ? `${post.content.slice(0, CONTENT_PREVIEW_LIMIT)}...`
      : post.content;

  const isOwner = currentUser?.id && currentUser.id === post.author.id;
  const canReport = currentUser?.id && currentUser.id !== post.author.id;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <article className="bg-background-secondary border-border-default overflow-hidden rounded-2xl border transition-shadow hover:shadow-sm">
      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-0 md:px-5">
        <div className="flex items-start justify-between gap-3">
          {/* Avatar + Author */}
          <button
            type="button"
            onClick={() => onOpen(post.id)}
            className="flex min-w-0 items-center gap-3 text-left"
          >
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="border-border-subtle h-10 w-10 flex-shrink-0 rounded-full border object-cover"
            />
            <div className="min-w-0">
              <h3 className="text-text-primary truncate text-sm leading-tight font-semibold">
                {post.author.name}
              </h3>
              <p className="text-text-secondary mt-0.5 text-xs">
                {fromNow(post.createdAt)}
              </p>
            </div>
          </button>

          {/* Kebab menu */}
          {(isOwner || canReport) && (
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
                className="text-text-secondary hover:bg-foreground rounded-lg p-1.5 transition"
                aria-label="Tùy chọn"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {menuOpen && (
                <div className="bg-background-secondary border-border-default absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border shadow-lg">
                  {isOwner && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDelete(post);
                      }}
                      className="text-destructive hover:bg-destructive/8 flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa bài viết
                    </button>
                  )}
                  {canReport && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onReport(post);
                      }}
                      className="text-text-secondary hover:bg-foreground flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium transition"
                    >
                      <Flag className="h-3.5 w-3.5" />
                      Báo cáo
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <button
          type="button"
          onClick={() => onOpen(post.id)}
          className="mt-3 block w-full text-left"
        >
          <p className="text-text-primary text-sm leading-relaxed whitespace-pre-line">
            {visibleContent}
            {isLongContent && !isExpanded && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(post.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggleExpand(post.id);
                  }
                }}
                className="text-primary ml-1 text-sm font-semibold hover:underline"
              >
                Xem thêm
              </span>
            )}
          </p>
        </button>
      </div>

      {/* ── Images (event_promotion) ── */}
      {post.postType === 'event_promotion' && post.images.length > 0 && (
        <button
          type="button"
          onClick={() => onOpen(post.id)}
          className={`mt-3 grid w-full gap-0.5 text-left ${
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

      {/* ── Marketplace listing preview ── */}
      {post?.postType === 'marketplace_listing' &&
        post?.relatedTickets?.length > 0 && (
          <div className="px-4 pt-3 pb-0 md:px-5">
            <button
              type="button"
              onClick={() => onOpen(post.id)}
              className="border-border-subtle bg-foreground group hover:border-primary/30 w-full overflow-hidden rounded-xl border text-left transition hover:shadow-sm"
            >
              <div className="flex items-center gap-3 p-3">
                <img
                  src={post.relatedEvent.bannerImageUrl}
                  alt={post.relatedEvent.name}
                  className="border-border-subtle h-14 w-14 flex-shrink-0 rounded-lg border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-text-primary truncate text-sm font-semibold">
                    {post.relatedEvent.name}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold">
                      🎟️ {post.relatedTickets.length} vé
                    </span>
                    <span className="text-text-secondary text-xs">
                      từ{' '}
                      <span className="font-bold text-orange-500">
                        {Math.min(...post.relatedTickets.map((t) => t.price))}{' '}
                        USDT
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

      {/* ── Event promotion preview ── */}
      {post.postType === 'event_promotion' && post.relatedEvent && (
        <div className="px-4 pt-3 pb-0 md:px-5">
          <Link
            to={`/event-detail/${post.relatedEvent.id}`}
            onClick={(e) => e.stopPropagation()}
            className="border-border-subtle bg-foreground group hover:border-primary/30 block overflow-hidden rounded-xl border transition hover:shadow-sm"
          >
            <div className="flex items-center gap-3 p-3">
              <img
                src={post.relatedEvent.bannerImageUrl}
                alt={post.relatedEvent.name}
                className="border-border-subtle h-14 w-14 flex-shrink-0 rounded-lg border object-cover"
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
          </Link>
        </div>
      )}

      {/* ── Action Bar ── */}
      <div className="mt-3 px-4 pb-1 md:px-5">
        <div className="border-border-subtle flex items-center border-t pt-2">
          {/* Like */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike(post.id);
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition ${
              isLiked
                ? 'text-destructive'
                : 'text-text-secondary hover:bg-foreground hover:text-destructive'
            }`}
          >
            <Heart
              className="h-4 w-4"
              fill={isLiked ? 'currentColor' : 'none'}
            />
            <span className="text-xs">
              {Number(likeCount) > 0 ? likeCount : ''} Thích
            </span>
          </button>

          {/* Divider */}
          <div className="bg-border-subtle h-5 w-px" />

          {/* Comment */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComments(post.id);
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition ${
              isCommentOpen
                ? 'text-primary'
                : 'text-text-secondary hover:bg-foreground hover:text-primary'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs">
              {commentCount > 0 ? commentCount : ''} Bình luận
            </span>
          </button>

          {/* Divider */}
          <div className="bg-border-subtle h-5 w-px" />

          {/* Share */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShare(post.id);
            }}
            className="text-text-secondary hover:bg-foreground hover:text-info flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition"
          >
            <Link2 className="h-4 w-4" />
            <span>Chia sẻ</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
