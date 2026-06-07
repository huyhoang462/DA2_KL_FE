import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PostTicketModal from '../../components/features/posts/PostTicketModal';
import PostThread from '../../components/features/posts/PostThread';
import { buildPendingTicketMetaMap } from '../../components/features/posts/PendingTicketsTreeSelect';
import {
  POST_CONTENT_MAX_LENGTH,
  POST_CONTENT_MIN_LENGTH,
  extractArray,
  getPostCategory,
  normalizePost,
} from '../../components/features/posts/postUtils';
import {
  createPost,
  getAllPosts,
  deletePost,
} from '../../services/postService';
import { getMyPendingTickets } from '../../services/ticketService';
import { useListTicketWeb3 } from '../../hooks/useListTicketWeb3';
import { useCancelListingWeb3 } from '../../hooks/useCancelListingWeb3';

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

  const MAX_RESALE_PRICE_MULTIPLIER = 1.2;

  const [activeTab, setActiveTab] = useState('all');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [composerForm, setComposerForm] = useState({
    content: '',
    walletAddress: '',
    relatedEventId: '',
    selectedTicketIds: [],
    salePrices: {},
  });
  const [composerError, setComposerError] = useState('');
  const { isWeb3Processing, web3StatusMessage, handleListTicketWeb3 } =
    useListTicketWeb3();
  const { isCancelingWeb3, cancelWeb3StatusMessage, handleCancelListingWeb3 } =
    useCancelListingWeb3();

  const isValidEvmWalletAddress = (value) => /^0x[a-fA-F0-9]{40}$/.test(value);

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
      toast.success(
        'Vé của bạn đã được hủy bán ....  Hệ thống đang gỡ niêm yết , bạn hãy chờ ít phút và kiểm tra lại vé của mình.'
      );
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

  const handleDeletePostWeb3 = async (postId) => {
    // Lấy post từ feedPosts đã được normalize
    const post = feedPosts.find((p) => p.id === postId);
    console.log('[DELETE POST] Found post:', post);

    if (post && post.postType === 'marketplace_listing') {
      const ticketIdsWeb3 = [];

      if (post.relatedTickets && post.relatedTickets.length > 0) {
        for (const t of post.relatedTickets) {
          if (t.tokenId != null) {
            ticketIdsWeb3.push(BigInt(t.tokenId));
          } else {
            console.warn(`[DELETE POST] Ticket missing tokenId:`, t);
          }
        }
      }

      console.log('[DELETE POST] tokenIds to cancel:', ticketIdsWeb3);

      if (ticketIdsWeb3.length > 0) {
        try {
          await handleCancelListingWeb3({ ticketIdsWeb3 });
        } catch (error) {
          toast.error(
            error.message || 'Lỗi khi hủy niêm yết vé trên blockchain.'
          );
          return; // Dừng, không xóa trên BE nếu Blockchain lỗi
        }
      } else {
        toast.error(
          'Không tìm thấy tokenId của vé để hủy trên Smart Contract! API backend chưa trả về tokenId?'
        );
        return; // Dừng, không cho xóa nếu chưa hủy web3
      }
    }

    // Nếu là post bình thường hoặc đã hủy web3 thành công thì mới gọi BE
    await deletePostMutation.mutateAsync(postId);
  };

  // xử lý mua lại vé
  const handleBuyTickets = (selectedTicketIds) => {
    console.log('Mua lại vé với ticketIds:', selectedTicketIds);
    toast.info(
      'Tính năng mua lại vé đang được phát triển. Vui lòng chờ trong giây lát!'
    );
  };

  const pendingTicketEvents = useMemo(
    () => extractArray(myTicketsResponse),
    [myTicketsResponse]
  );

  const pendingTicketMetaMap = useMemo(
    () => buildPendingTicketMetaMap(pendingTicketEvents),
    [pendingTicketEvents]
  );

  const closeComposer = () => {
    setIsComposerOpen(false);
    setComposerError('');
    setComposerForm({
      content: '',
      walletAddress: '',
      relatedEventId: '',
      selectedTicketIds: [],
      salePrices: {},
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

  const handleCreatePost = async () => {
    console.log('Submitting post with form data:', composerForm);
    setComposerError('');

    const trimmedContent = composerForm.content.trim();
    const trimmedWalletAddress = composerForm.walletAddress.trim();

    if (!trimmedWalletAddress) {
      setComposerError('Vui lòng nhập địa chỉ ví MetaMask để nhận tiền.');
      return;
    }

    if (!isValidEvmWalletAddress(trimmedWalletAddress)) {
      setComposerError('Địa chỉ ví MetaMask không hợp lệ.');
      return;
    }

    if (trimmedContent.length < POST_CONTENT_MIN_LENGTH) {
      setComposerError(
        `Nội dung phải từ ${POST_CONTENT_MIN_LENGTH} ký tự trở lên.`
      );
      return;
    }

    if (!Array.isArray(composerForm.selectedTicketIds)) {
      setComposerError('Danh sách vé đã chọn không hợp lệ.');
      return;
    }

    if (composerForm.selectedTicketIds.length === 0) {
      setComposerError('Bài viết community phải gắn với ít nhất 1 vé của bạn.');
      return;
    }

    const selectedMetas = composerForm.selectedTicketIds
      .map((ticketId) => pendingTicketMetaMap.get(String(ticketId)))
      .filter(Boolean);

    if (selectedMetas.length !== composerForm.selectedTicketIds.length) {
      setComposerError('Có vé đã chọn không còn tồn tại. Vui lòng chọn lại.');
      return;
    }

    const eventId = String(selectedMetas[0]?.eventId || '');
    if (!eventId) {
      setComposerError('Không xác định được sự kiện của vé đã chọn.');
      return;
    }

    const hasDifferentEvent = selectedMetas.some(
      (meta) => String(meta.eventId) !== eventId
    );

    if (hasDifferentEvent) {
      setComposerError('Bạn chỉ có thể chọn vé trong cùng 1 sự kiện.');
      return;
    }

    const tickets = [];
    const ticketIdsWeb3 = [];
    const pricesWeb3 = [];

    for (const meta of selectedMetas) {
      const originalPrice = Number(meta.originalPrice || 0);
      const rawSalePrice = composerForm.salePrices?.[String(meta.ticketId)];
      const salePrice = Number(rawSalePrice);

      if (!Number.isFinite(salePrice) || salePrice <= 0) {
        setComposerError(
          `Vui lòng nhập giá muốn bán hợp lệ cho vé #${String(meta.ticketId).slice(-6)}.`
        );
        return;
      }

      const maxAllowed = originalPrice * MAX_RESALE_PRICE_MULTIPLIER;
      if (originalPrice > 0 && salePrice > maxAllowed) {
        setComposerError(
          `Giá bán của vé #${String(meta.ticketId).slice(-6)} không được lớn hơn 120% giá gốc (${maxAllowed} USDT).`
        );
        return;
      }

      tickets.push({
        ticketId: meta.ticketId,
        price: salePrice,
      });

      // Giai đoạn 2: Định dạng Decimals
      if (meta.tokenId == null) {
        setComposerError(
          `Vé #${String(meta.ticketId).slice(-6)} chưa được cấp tokenId (chưa mint thành công).`
        );
        return;
      }
      const tokenIdBigInt = BigInt(meta.tokenId);
      console.log(
        `[TICKET CONVERSION] DB ticketId: ${meta.ticketId}, On-chain tokenId: ${tokenIdBigInt}`
      );
      ticketIdsWeb3.push(tokenIdBigInt);
      pricesWeb3.push(ethers.parseUnits(salePrice.toString(), 6));
    }

    setIsProcessing(true);

    try {
      await handleListTicketWeb3({
        ticketIdsWeb3,
        pricesWeb3,
        walletAddress: trimmedWalletAddress,
      });

      // Bước 6: Khi giao dịch Blockchain thành công, gọi API createPost
      const datanewPost = {
        content: trimmedContent,
        images: [],
        walletAddress: trimmedWalletAddress,
        relatedEvent: eventId,
        relatedTickets: tickets.map((item) => {
          return { ticketId: item.ticketId, price: item.price };
        }),
        postType: 'marketplace_listing',
      };

      createPostMutation.mutate(datanewPost);
    } catch (error) {
      console.error('Lỗi khi tương tác Web3:', error);
      setComposerError(
        error.message || 'Có lỗi xảy ra khi tương tác với blockchain.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const feedPosts = useMemo(() => {
    return extractArray(feedResponse)
      .map(normalizePost)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [feedResponse]);

  const posts = useMemo(() => {
    if (activeTab === 'all') return feedPosts;
    return feedPosts.filter((post) => getPostCategory(post) === activeTab);
  }, [activeTab, feedPosts]);

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
          onDeletePost={handleDeletePostWeb3}
          feedQueryKey="community-feed"
          onBuyTickets={handleBuyTickets}
        />
      )}

      <PostTicketModal
        isOpen={isComposerOpen}
        title="Tạo bài viết"
        currentUser={user}
        roleLabel="customer"
        content={composerForm.content}
        walletAddress={composerForm.walletAddress}
        onContentChange={(value) => {
          setComposerForm((prev) => ({
            ...prev,
            content: value.slice(0, POST_CONTENT_MAX_LENGTH),
          }));
          setComposerError('');
        }}
        onWalletAddressChange={(value) => {
          setComposerForm((prev) => ({
            ...prev,
            walletAddress: value,
          }));
          setComposerError('');
        }}
        contentLabel="Nội dung bài viết"
        contentPlaceholder="Chia sẻ về vé bạn muốn pass lại..."
        contentLengthText={`${composerForm.content.trim().length}/${POST_CONTENT_MAX_LENGTH} ký tự`}
        ticketLabel="Vé muốn bán"
        ticketEvents={pendingTicketEvents}
        selectedTicketIds={composerForm.selectedTicketIds}
        onSelectedTicketIdsChange={(nextIds) => {
          setComposerForm((prev) => {
            const nextSelected = (Array.isArray(nextIds) ? nextIds : []).map(
              (id) => String(id)
            );
            const nextSalePrices = { ...(prev.salePrices || {}) };

            // Remove prices for unselected tickets.
            Object.keys(nextSalePrices).forEach((ticketId) => {
              if (!nextSelected.includes(ticketId)) {
                delete nextSalePrices[ticketId];
              }
            });

            // Add default price for newly selected tickets.
            nextSelected.forEach((ticketId) => {
              const key = String(ticketId);
              if (nextSalePrices[key] !== undefined) return;
              const meta = pendingTicketMetaMap.get(key);
              nextSalePrices[key] = meta ? String(meta.originalPrice ?? 0) : '';
            });

            const firstMeta = nextSelected.length
              ? pendingTicketMetaMap.get(String(nextSelected[0]))
              : null;

            return {
              ...prev,
              selectedTicketIds: nextSelected,
              relatedEventId: firstMeta?.eventId
                ? String(firstMeta.eventId)
                : '',
              salePrices: nextSalePrices,
            };
          });
          setComposerError('');
        }}
        salePrices={composerForm.salePrices}
        onSalePriceChange={(ticketId, value) => {
          setComposerForm((prev) => ({
            ...prev,
            salePrices: {
              ...(prev.salePrices || {}),
              [String(ticketId)]: value,
            },
          }));
          setComposerError('');
        }}
        ticketLoading={isTicketsLoading || isTicketsFetching}
        ticketLoadingLabel="Đang tải vé..."
        ticketEmptyMessage="Bạn chưa có vé nào để tạo bài post pass vé."
        ticketError={ticketsError?.message || ''}
        maxResaleMultiplier={MAX_RESALE_PRICE_MULTIPLIER}
        error={composerError}
        onClose={closeComposer}
        onSubmit={handleCreatePost}
        isSubmitting={isProcessing || createPostMutation.isPending}
        submitLabel="Đăng bài"
      />

      {(isTicketsLoading || isTicketsFetching) && isComposerOpen && (
        <div className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-full bg-black/80 px-3 py-2 text-xs text-white">
          <LoadingSpinner size="sm" className="text-white" />
          Đang tải vé của bạn...
        </div>
      )}

      {isCancelingWeb3 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center rounded-xl bg-white p-8 shadow-2xl">
            <LoadingSpinner className="text-primary mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-bold text-gray-900">
              Đang gỡ niêm yết vé...
            </h3>
            <p className="animate-pulse font-medium text-blue-600">
              {cancelWeb3StatusMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
