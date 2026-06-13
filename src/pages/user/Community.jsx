import { useMemo, useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { Calendar, User, Ticket, Sparkles } from 'lucide-react';
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
import BuyResaleTicketModal from '../../components/features/posts/BuyResaleTicketModal';
import { useBuyResaleWeb3 } from '../../hooks/useBuyResaleWeb3';
import { orderService } from '../../services/orderService';
import { usePrivy } from '@privy-io/react-auth';

/* ─── Skeleton ─────────────────────────────────────────── */
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

/* ─── Tab config ──────────────────────────────────────── */
const TABS = [
  { id: 'all', label: 'Tất cả', icon: Sparkles },
  { id: 'event', label: 'Sự kiện', icon: Calendar },
  { id: 'ticket', label: 'Pass vé', icon: Ticket },
  { id: 'my', label: 'Bài viết của tôi', icon: User },
];

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

  const { user: privyUser } = usePrivy();
  const privyWalletAddress = privyUser?.wallet?.address;
  const {
    isProcessing: isBuyResaleProcessing,
    statusMessage: buyResaleStatusMessage,
    handleBuyResaleWeb3,
  } = useBuyResaleWeb3();

  const [buyResaleModalState, setBuyResaleModalState] = useState({
    isOpen: false,
    selectedTickets: [],
    totalPrice: 0,
    post: null,
  });

  const isValidEvmWalletAddress = useCallback(
    (value) => /^0x[a-fA-F0-9]{40}$/.test(value),
    []
  );

  useEffect(() => {
    if (sessionStorage.getItem('purchase_success_toast') === 'true') {
      toast.success('Mua vé thành công!');
      sessionStorage.removeItem('purchase_success_toast');
    }
  }, []);

  const {
    data: feedResponse,
    isLoading: isFeedLoading,
    error: feedError,
    refetch: refetchFeed,
  } = useQuery({
    queryKey: ['community-feed'],
    queryFn: () => getAllPosts({ page: 1, limit: 50 }),
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
        'Vé của bạn đã được hủy bán .... Hệ thống đang gỡ niêm yết, bạn hãy chờ ít phút và kiểm tra lại vé của mình.'
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

  // Tối ưu hóa mảng bài viết từ API
  const feedPosts = useMemo(
    () =>
      extractArray(feedResponse)
        .map(normalizePost)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [feedResponse]
  );

  // FIX TAB "MY": Lọc tường minh dựa trên author ID thay vì phụ thuộc vào postUtils
  const posts = useMemo(() => {
    if (activeTab === 'all') return feedPosts;
    if (activeTab === 'my') {
      return feedPosts.filter(
        (post) => post.author?.id === userId || post.author?._id === userId
      );
    }
    return feedPosts.filter((post) => getPostCategory(post) === activeTab);
  }, [activeTab, feedPosts, userId]);

  const pendingTicketEvents = useMemo(
    () => extractArray(myTicketsResponse),
    [myTicketsResponse]
  );

  const pendingTicketMetaMap = useMemo(
    () => buildPendingTicketMetaMap(pendingTicketEvents),
    [pendingTicketEvents]
  );

  // TỐI ƯU HÓA Callback: Giúp PostThread không bị re-render khi gõ phím ở Modal
  const handleDeletePostWeb3 = useCallback(
    async (postId) => {
      const post = feedPosts.find((p) => p.id === postId);
      if (post && post.postType === 'marketplace_listing') {
        const ticketIdsWeb3 = [];
        if (post.relatedTickets && post.relatedTickets.length > 0) {
          for (const t of post.relatedTickets) {
            if (t.tokenId != null) ticketIdsWeb3.push(BigInt(t.tokenId));
            else console.warn(`[DELETE POST] Ticket missing tokenId:`, t);
          }
        }
        if (ticketIdsWeb3.length > 0) {
          try {
            await handleCancelListingWeb3({ ticketIdsWeb3 });
          } catch (error) {
            toast.error(
              error.message || 'Lỗi khi hủy niêm yết vé trên blockchain.'
            );
            return;
          }
        } else {
          toast.error(
            'Không tìm thấy tokenId của vé để hủy trên Smart Contract!'
          );
          return;
        }
      }
      await deletePostMutation.mutateAsync(postId);
    },
    [feedPosts, deletePostMutation, handleCancelListingWeb3]
  );

  const handleBuyTickets = useCallback(
    (selectedTicketIds, postId) => {
      if (!privyWalletAddress) {
        toast.warning(
          'Bạn cần đăng nhập bằng Embedded Wallet (Privy) để mua vé.'
        );
        return;
      }
      const post = feedPosts.find((p) => p.id === postId);
      if (!post) {
        toast.error('Không tìm thấy thông tin bài viết!');
        return;
      }
      const ticketsToBuy = post.relatedTickets.filter((t) =>
        selectedTicketIds.includes(t.ticketId)
      );
      if (ticketsToBuy.length === 0) {
        toast.error('Không tìm thấy thông tin vé muốn mua!');
        return;
      }
      const totalPrice = ticketsToBuy.reduce(
        (sum, t) => sum + (t.price || 0),
        0
      );
      setBuyResaleModalState({
        isOpen: true,
        selectedTickets: ticketsToBuy,
        totalPrice,
        post,
      });
    },
    [feedPosts, privyWalletAddress]
  );

  const handleConfirmBuyResale = useCallback(async () => {
    try {
      const { selectedTickets, totalPrice } = buyResaleModalState;
      const destinationPrivyAddress = privyWalletAddress;
      const tokenIdsWeb3 = [];
      const orderTicketsPayload = [];
      for (const t of selectedTickets) {
        if (t.tokenId == null) {
          toast.error(
            `Vé ${t.ticketTypeName} chưa có tokenId, không thể mua Web3.`
          );
          return;
        }
        tokenIdsWeb3.push(BigInt(t.tokenId));
        orderTicketsPayload.push({
          ticketId: t.ticketId,
          resalePrice: t.price,
        });
      }
      const orderData = await orderService.createResaleOrder({
        walletAddress: destinationPrivyAddress,
        tickets: orderTicketsPayload,
      });
      const orderId =
        orderData?.data?.orderId || orderData?.data?._id || orderData?._id;
      if (!orderId) throw new Error('Không tạo được đơn hàng từ Server');

      const txHash = await handleBuyResaleWeb3({
        tokenIdsWeb3,
        totalPrice,
        destinationPrivyAddress,
      });

      await orderService.finalizeResaleOrder({
        orderId,
        txHash,
        ticketIds: selectedTickets.map((t) => t.ticketId),
      });

      sessionStorage.setItem('purchase_success_toast', 'true');
      window.location.reload();
    } catch (error) {
      if (!error.message?.includes('Bạn đã từ chối')) {
        toast.error(error.message || 'Giao dịch thất bại.');
      }
    }
  }, [buyResaleModalState, privyWalletAddress, handleBuyResaleWeb3]);

  const closeComposer = useCallback(() => {
    setIsComposerOpen(false);
    setComposerError('');
    setComposerForm({
      content: '',
      walletAddress: '',
      relatedEventId: '',
      selectedTicketIds: [],
      salePrices: {},
    });
  }, []);

  const openComposer = useCallback(() => {
    if (!userId) {
      toast.warning('Bạn cần đăng nhập để tạo bài viết.');
      return;
    }
    setComposerError('');
    setIsComposerOpen(true);
  }, [userId]);

  const handleCreatePost = useCallback(async () => {
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
    if (
      !Array.isArray(composerForm.selectedTicketIds) ||
      composerForm.selectedTicketIds.length === 0
    ) {
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
    if (
      !eventId ||
      selectedMetas.some((meta) => String(meta.eventId) !== eventId)
    ) {
      setComposerError('Bạn chỉ có thể chọn vé trong cùng 1 sự kiện.');
      return;
    }

    const tickets = [];
    const ticketIdsWeb3 = [];
    const pricesWeb3 = [];

    for (const meta of selectedMetas) {
      const originalPrice = Number(meta.originalPrice || 0);
      const salePrice = Number(
        composerForm.salePrices?.[String(meta.ticketId)]
      );

      if (!Number.isFinite(salePrice) || salePrice <= 0) {
        setComposerError(
          `Vui lòng nhập giá bán hợp lệ cho vé #${String(meta.ticketId).slice(-6)}.`
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

      if (meta.tokenId == null) {
        setComposerError(
          `Vé #${String(meta.ticketId).slice(-6)} chưa được cấp tokenId (chưa mint thành công).`
        );
        return;
      }

      tickets.push({ ticketId: meta.ticketId, price: salePrice });
      ticketIdsWeb3.push(BigInt(meta.tokenId));
      pricesWeb3.push(ethers.parseUnits(salePrice.toString(), 6));
    }

    setIsProcessing(true);
    try {
      await handleListTicketWeb3({
        ticketIdsWeb3,
        pricesWeb3,
        walletAddress: trimmedWalletAddress,
      });
      createPostMutation.mutate({
        content: trimmedContent,
        images: [],
        walletAddress: trimmedWalletAddress,
        relatedEvent: eventId,
        relatedTickets: tickets.map((item) => ({
          ticketId: item.ticketId,
          price: item.price,
        })),
        postType: 'marketplace_listing',
      });
    } catch (error) {
      setComposerError(
        error.message || 'Có lỗi xảy ra khi tương tác với blockchain.'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [
    composerForm,
    pendingTicketMetaMap,
    isValidEvmWalletAddress,
    handleListTicketWeb3,
    createPostMutation,
  ]);

  // Các handler cập nhật form State được wrap trong useCallback
  const handleContentChange = useCallback((value) => {
    setComposerForm((prev) => ({
      ...prev,
      content: value.slice(0, POST_CONTENT_MAX_LENGTH),
    }));
    setComposerError('');
  }, []);

  const handleWalletAddressChange = useCallback((value) => {
    setComposerForm((prev) => ({ ...prev, walletAddress: value }));
    setComposerError('');
  }, []);

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
    <div className="mx-auto max-w-5xl pt-4 pb-20">
      {/* ── Composer trigger ── */}
      <section
        onClick={openComposer}
        className="bg-background-secondary border-border-default mb-4 flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition hover:shadow-sm"
      >
        <img
          src={
            user?.avatar || 'https://picsum.photos/seed/community-user/100/100'
          }
          className="border-border-subtle h-10 w-10 flex-shrink-0 rounded-full border object-cover"
          alt="Avatar"
        />
        <div className="bg-foreground flex flex-1 items-center gap-2 rounded-xl px-4 py-2.5">
          <Ticket className="text-primary h-4 w-4 flex-shrink-0 opacity-60" />
          <span className="text-text-placeholder text-sm">
            Đăng bán lại vé của bạn...
          </span>
        </div>
      </section>

      {/* ── Tab filter ── */}
      <section className="bg-background-secondary border-border-default mb-5 rounded-2xl border p-1.5">
        <div className="grid grid-cols-4 gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-text-secondary hover:bg-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Feed ── */}
      {posts.length === 0 ? (
        <div className="bg-background-secondary border-border-default rounded-2xl border px-6 py-14 text-center">
          <div className="bg-foreground mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
            {activeTab === 'ticket' ? (
              <Ticket className="text-primary h-7 w-7 opacity-50" />
            ) : (
              <Calendar className="text-primary h-7 w-7 opacity-50" />
            )}
          </div>
          <h3 className="text-text-primary text-base font-semibold">
            Chưa có bài viết
          </h3>
          <p className="text-text-secondary mt-1 text-sm">
            {activeTab === 'event'
              ? 'Chưa có bài viết sự kiện nào.'
              : activeTab === 'ticket'
                ? 'Chưa có bài đăng pass vé nào.'
                : activeTab === 'my'
                  ? 'Bạn chưa có bài viết nào.'
                  : 'Cộng đồng vẫn đang im lặng — hãy là người đầu tiên!'}
          </p>
          {activeTab === 'ticket' && (
            <button
              onClick={openComposer}
              className="bg-primary text-primary-foreground hover:bg-primary-hover mt-4 rounded-xl px-5 py-2 text-sm font-semibold transition"
            >
              Đăng bán vé ngay
            </button>
          )}
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

      {/* ── Modals & overlays ── */}
      <PostTicketModal
        isOpen={isComposerOpen}
        title="Tạo bài viết"
        currentUser={user}
        roleLabel="customer"
        content={composerForm.content}
        walletAddress={composerForm.walletAddress}
        onContentChange={handleContentChange}
        onWalletAddressChange={handleWalletAddressChange}
        contentLabel="Nội dung bài viết"
        contentPlaceholder="Chia sẻ về vé bạn muốn pass lại..."
        contentLengthText={`${composerForm.content.trim().length}/${POST_CONTENT_MAX_LENGTH} ký tự`}
        ticketLabel="Vé muốn bán"
        ticketEvents={pendingTicketEvents}
        selectedTicketIds={composerForm.selectedTicketIds}
        onSelectedTicketIdsChange={(nextIds) => {
          setComposerForm((prev) => {
            const nextSelected = (Array.isArray(nextIds) ? nextIds : []).map(
              String
            );
            const nextSalePrices = { ...(prev.salePrices || {}) };
            Object.keys(nextSalePrices).forEach((ticketId) => {
              if (!nextSelected.includes(ticketId))
                delete nextSalePrices[ticketId];
            });
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

      <BuyResaleTicketModal
        isOpen={buyResaleModalState.isOpen}
        onClose={() =>
          setBuyResaleModalState((prev) => ({ ...prev, isOpen: false }))
        }
        selectedTickets={buyResaleModalState.selectedTickets}
        totalPrice={buyResaleModalState.totalPrice}
        isProcessing={isBuyResaleProcessing}
        statusMessage={buyResaleStatusMessage}
        onConfirmPayment={handleConfirmBuyResale}
      />
    </div>
  );
};

export default Community;
