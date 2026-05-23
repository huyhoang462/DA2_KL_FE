import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PostTicketModal from '../../components/features/posts/PostTicketModal';
import PostThread from '../../components/features/posts/PostThread';
import {
  POST_CONTENT_MAX_LENGTH,
  POST_CONTENT_MIN_LENGTH,
  extractArray,
  getPostCategory,
  normalizePost,
  normalizeTicket,
} from '../../components/features/posts/postUtils';
import {
  createPost,
  getAllPosts,
  deletePost,
} from '../../services/postService';
import { getMyPendingTickets } from '../../services/ticketService';

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

const Community = () => {
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.auth.user);
  const userId = user?.id;

  const [activeTab, setActiveTab] = useState('all');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerForm, setComposerForm] = useState({
    content: '',
    relatedTicketId: '',
    relatedEventId: '',
    salePrice: '',
  });
  const [composerError, setComposerError] = useState('');

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
      }),
    staleTime: 30000,
  });

  const {
    data: myTicketsResponse,
    isLoading: isTicketsLoading,
    isFetching: isTicketsFetching,
    error: ticketsError,
  } = useQuery({
    queryKey: ['community-my-tickets', userId],
    queryFn: getMyPendingTickets,
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
        queryKey: ['community-my-tickets', userId],
      });
    },
    onError: (error) => {
      setComposerError(
        error?.message || 'Không thể đăng bài. Vui lòng thử lại sau.'
      );
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      queryClient.invalidateQueries({
        queryKey: ['community-my-tickets', userId],
      });
    },
    onError: (error) => {
      toast.error(
        error?.message || 'Không thể xóa bài viết. Vui lòng thử lại.'
      );
    },
  });

  const feedPosts = useMemo(() => {
    return extractArray(feedResponse)
      .map(normalizePost)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [feedResponse]);

  const myTickets = useMemo(() => {
    return extractArray(myTicketsResponse)
      .map(normalizeTicket)
      .filter((ticket) => ticket.id);
  }, [myTicketsResponse]);

  const posts = useMemo(() => {
    if (activeTab === 'all') return feedPosts;
    return feedPosts.filter((post) => getPostCategory(post) === activeTab);
  }, [activeTab, feedPosts]);

  const closeComposer = () => {
    setIsComposerOpen(false);
    setComposerError('');
    setComposerForm({
      content: '',
      relatedTicketId: '',
      relatedEventId: '',
      salePrice: '',
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

  const handleCreatePost = () => {
    setComposerError('');

    const trimmedContent = composerForm.content.trim();

    if (trimmedContent.length < POST_CONTENT_MIN_LENGTH) {
      setComposerError(
        `Nội dung phải từ ${POST_CONTENT_MIN_LENGTH} ký tự trở lên.`
      );
      return;
    }

    if (!composerForm.relatedTicketId) {
      setComposerError('Bài viết community phải gắn với ít nhất 1 vé của bạn.');
      return;
    }

    const salePrice = Number(composerForm.salePrice);

    if (!Number.isFinite(salePrice) || salePrice <= 0) {
      setComposerError('Vui lòng nhập giá muốn bán hợp lệ.');
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
      images: [],
      relatedTicket: composerForm.relatedTicketId,
      relatedEvent: composerForm.relatedEventId,
      price: salePrice,
      postType: 'marketplace_listing',
    });
  };

  if (isFeedLoading) {
    return (
      <section className="space-y-5">
        <PostSkeleton />
        <PostSkeleton />
      </section>
    );
  }

  if (feedError) {
    return (
      <ErrorDisplay
        title="Không tải được dữ liệu Community"
        message={feedError?.message}
        onRetry={refetchFeed}
        className="rounded-2xl"
      />
    );
  }

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
          Đăng bán lại vé của bạn...
        </div>
      </section>

      <section className="bg-background-secondary border-border-default rounded-2xl border p-2">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`w-full rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'text-text-secondary hover:bg-foreground'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveTab('event')}
            className={`w-full rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'event'
                ? 'bg-primary text-primary-foreground'
                : 'text-text-secondary hover:bg-foreground'
            }`}
          >
            Sự kiện
          </button>
          <button
            onClick={() => setActiveTab('ticket')}
            className={`w-full rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'ticket'
                ? 'bg-primary text-primary-foreground'
                : 'text-text-secondary hover:bg-foreground'
            }`}
          >
            Vé
          </button>
        </div>
      </section>

      {posts.length === 0 ? (
        <div className="bg-background-secondary border-border-default rounded-2xl border px-6 py-12 text-center">
          <h3 className="text-text-primary text-lg font-semibold">
            Chưa có bài viết
          </h3>
          <p className="text-text-secondary mt-1 text-sm">
            {activeTab === 'event'
              ? 'Chưa có bài viết sự kiện nào.'
              : activeTab === 'ticket'
                ? 'Chưa có bài đăng pass vé nào.'
                : 'Chưa có bài viết cộng đồng phù hợp.'}
          </p>
        </div>
      ) : (
        <PostThread
          posts={posts}
          allPosts={feedPosts}
          currentUser={user}
          onDeletePost={(postId) => deletePostMutation.mutateAsync(postId)}
          feedQueryKey="community-feed"
        />
      )}

      <PostTicketModal
        isOpen={isComposerOpen}
        title="Tạo bài viết"
        currentUser={user}
        roleLabel="customer"
        content={composerForm.content}
        onContentChange={(value) => {
          setComposerForm((prev) => ({
            ...prev,
            content: value.slice(0, POST_CONTENT_MAX_LENGTH),
          }));
          setComposerError('');
        }}
        contentLabel="Nội dung bài viết"
        contentPlaceholder="Chia sẻ về chiếc vé bạn muốn pass lại..."
        contentLengthText={`${composerForm.content.trim().length}/${POST_CONTENT_MAX_LENGTH} ký tự`}
        ticketLabel="Vé muốn bán"
        ticketValue={composerForm.relatedTicketId}
        onTicketChange={({ ticketId, eventId }) => {
          setComposerForm((prev) => ({
            ...prev,
            relatedTicketId: ticketId,
            relatedEventId: eventId,
          }));

          setComposerError('');
        }}
        salePrice={composerForm.salePrice}
        onSalePriceChange={(value) => {
          setComposerForm((prev) => ({
            ...prev,
            salePrice: value,
          }));
          setComposerError('');
        }}
        ticketOptions={myTickets}
        ticketLoading={isTicketsLoading || isTicketsFetching}
        ticketLoadingLabel="Đang tải vé..."
        ticketEmptyMessage="Bạn chưa có vé nào để tạo bài post pass vé."
        ticketError={ticketsError?.message || ''}
        error={composerError}
        onClose={closeComposer}
        onSubmit={handleCreatePost}
        isSubmitting={createPostMutation.isPending}
        submitLabel="Đăng bài"
      />

      {(isTicketsLoading || isTicketsFetching) && isComposerOpen && (
        <div className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-full bg-black/80 px-3 py-2 text-xs text-white">
          <LoadingSpinner size="sm" className="text-white" />
          Đang tải vé của bạn...
        </div>
      )}
    </div>
  );
};

export default Community;
