import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  useMutation,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'; // Sửa import
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { Calendar, User, Ticket, Sparkles } from 'lucide-react';
import LetterAvatar from '../../components/ui/LetterAvatar';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import InfiniteScrollTrigger from '../../components/ui/InfiniteScrollTrigger'; // <--- Import cục bắt cuộn
import PostTicketModal from '../../components/features/posts/PostTicketModal';
import PostThread from '../../components/features/posts/PostThread';
import BuyResaleTicketModal from '../../components/features/posts/BuyResaleTicketModal';

import { buildPendingTicketMetaMap } from '../../components/features/posts/PendingTicketsTreeSelect';
import {
  POST_CONTENT_MAX_LENGTH,
  POST_CONTENT_MIN_LENGTH,
  extractArray,
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

const TABS = [
  { id: 'all', label: 'Tất cả', icon: Sparkles },
  { id: 'event_promotion', label: 'Sự kiện', icon: Calendar }, // Đổi ID trùng với postType của BE
  { id: 'marketplace_listing', label: 'Pass vé', icon: Ticket }, // Đổi ID trùng với postType của BE
  { id: 'my', label: 'Bài viết của tôi', icon: User },
];

const Community = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.auth.user);
  const userId = user?.id;

  const MAX_RESALE_PRICE_MULTIPLIER = 1.2;

  const [activeTab, setActiveTab] = useState('all');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
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

  // Removed the useEffect that checks for purchase_success_toast since we will navigate instead.

  // =========================================================================
  // 1. ÁNH XẠ TAB THÀNH PARAMS & GỌI USE_INFINITE_QUERY
  // =========================================================================
  const fetchCommunityPosts = async ({ pageParam = 1 }) => {
    const params = { page: pageParam, limit: 20 }; // Mỗi lần kéo gọi 20 bài

    // Truyền param theo Tab đang chọn
    if (activeTab === 'event_promotion') {
      params.postType = 'event_promotion';
    } else if (activeTab === 'marketplace_listing') {
      params.postType = 'marketplace_listing';
    } else if (activeTab === 'my') {
      if (!userId) throw new Error('Chưa đăng nhập');
      params.authorId = userId;
    }

    return await getAllPosts(params); // Hàm này gọi API của bạn
  };

  const {
    data: infiniteFeedData,
    isLoading: isFeedLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error: feedError,
    refetch: refetchFeed,
  } = useInfiniteQuery({
    queryKey: ['community-feed', activeTab, userId], // Query Cache tách biệt cho từng tab
    queryFn: fetchCommunityPosts,
    getNextPageParam: (lastPage) => {
      // Dựa vào dữ liệu Pagination trả về từ hàm getAllPosts của BE
      if (lastPage?.pagination?.hasNextPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined; // Hết data
    },
    enabled: activeTab === 'my' ? !!userId : true, // Nếu tab "my" thì đợi có userId mới fetch
    staleTime: 30000,
  });

  // Gộp tất cả các page lại thành 1 mảng bài viết duy nhất
  const posts = useMemo(() => {
    if (!infiniteFeedData) return [];
    // map qua từng page -> lấy mảng .data -> gộp lại -> chuẩn hóa cấu trúc
    return infiniteFeedData.pages
      .flatMap((page) => page.data || [])
      .map(normalizePost);
  }, [infiniteFeedData]);

  // =========================================================================
  // Các Query và Mutation còn lại giữ nguyên...
  // =========================================================================

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

  const pendingTicketEvents = useMemo(
    () => extractArray(myTicketsResponse),
    [myTicketsResponse]
  );
  const pendingTicketMetaMap = useMemo(
    () => buildPendingTicketMetaMap(pendingTicketEvents),
    [pendingTicketEvents]
  );

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      closeComposer();
      toast.success('Đăng bài thành công.');
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      queryClient.invalidateQueries({
        queryKey: ['community-my-tickets', userId],
      });
      setTimeout(() => {
        window.location.reload();
      }, 500);
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
      toast.success('Vé của bạn đã được hủy bán. Hệ thống đang gỡ niêm yết...');
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

  const handleDeletePostWeb3 = useCallback(
    async (postId) => {
      const post = posts.find((p) => p.id === postId);
      if (post && post.postType === 'marketplace_listing') {
        const ticketIdsWeb3 = [];
        if (post.relatedTickets && post.relatedTickets.length > 0) {
          for (const t of post.relatedTickets) {
            if (t.tokenId != null) ticketIdsWeb3.push(BigInt(t.tokenId));
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
        }
      }
      await deletePostMutation.mutateAsync(postId);
    },
    [posts, deletePostMutation, handleCancelListingWeb3]
  );

  const handleBuyTickets = useCallback(
    (selectedTicketIds, postId) => {
      if (!privyWalletAddress)
        return toast.warning('Bạn cần đăng nhập bằng Privy để mua vé.');
      const post = posts.find((p) => p.id === postId);
      if (!post) return toast.error('Không tìm thấy thông tin bài viết!');

      const ticketsToBuy = post.relatedTickets.filter((t) =>
        selectedTicketIds.includes(t.ticketId)
      );
      if (ticketsToBuy.length === 0)
        return toast.error('Không tìm thấy vé muốn mua!');

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
    [posts, privyWalletAddress]
  );

  const handleConfirmBuyResale = useCallback(async () => {
    try {
      const { selectedTickets, totalPrice } = buyResaleModalState;
      const tokenIdsWeb3 = [];
      const orderTicketsPayload = [];
      for (const t of selectedTickets) {
        if (t.tokenId == null)
          return toast.error(`Vé ${t.ticketTypeName} chưa có tokenId`);
        tokenIdsWeb3.push(BigInt(t.tokenId));
        orderTicketsPayload.push({
          ticketId: t.ticketId,
          resalePrice: t.price,
        });
      }
      const orderData = await orderService.createResaleOrder({
        walletAddress: privyWalletAddress,
        tickets: orderTicketsPayload,
      });
      const orderId =
        orderData?.data?.orderId || orderData?.data?._id || orderData?._id;

      const txHash = await handleBuyResaleWeb3({
        tokenIdsWeb3,
        totalPrice,
        destinationPrivyAddress: privyWalletAddress,
      });
      
      setIsFinalizing(true);
      await orderService.finalizeResaleOrder({
        orderId,
        txHash,
        ticketIds: selectedTickets.map((t) => t.ticketId),
      });

      setBuyResaleModalState((prev) => ({ ...prev, isOpen: false }));
      toast.success('Mua vé thành công!');
      
      // Delay navigation slightly to ensure UI updates and Toast is shown
      setTimeout(() => {
        navigate('/user/tickets');
      }, 500);
      
    } catch (error) {
      if (!error.message?.includes('Bạn đã từ chối'))
        toast.error(error.message || 'Giao dịch thất bại.');
    } finally {
      setIsFinalizing(false);
    }
  }, [buyResaleModalState, privyWalletAddress, handleBuyResaleWeb3, navigate]);

  // Handle Create Post logic (Giữ nguyên)
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
    if (!userId) return toast.warning('Bạn cần đăng nhập để tạo bài viết.');
    setComposerError('');
    setComposerForm((prev) => ({
      ...prev,
      walletAddress: user?.walletAddress || '',
    }));
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

  // =========================================================================
  // RENDER UI
  // =========================================================================
  return (
    <div className="mx-auto max-w-5xl pt-4 pb-20">
      {/* ── Composer trigger ── */}
      <section
        onClick={openComposer}
        className="bg-background-secondary border-border-default mb-4 flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition hover:shadow-sm"
      >
        {/* <img
          src={
            user?.avatar || 'https://picsum.photos/seed/community-user/100/100'
          }
          className="border-border-subtle h-10 w-10 flex-shrink-0 rounded-full border object-cover"
          alt="Avatar"
        /> */}
        <LetterAvatar name={user?.fullName || 'Bạn'} />
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
      {isFeedLoading ? (
        <section className="space-y-5">
          <PostSkeleton />
          <PostSkeleton />
        </section>
      ) : feedError && !posts.length ? (
        <ErrorDisplay
          title="Không tải được dữ liệu Community"
          message={feedError?.message}
          onRetry={refetchFeed}
          className="rounded-2xl"
        />
      ) : posts.length === 0 ? (
        <div className="bg-background-secondary border-border-default rounded-2xl border px-6 py-14 text-center">
          <div className="bg-foreground mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
            {activeTab === 'marketplace_listing' ? (
              <Ticket className="text-primary h-7 w-7 opacity-50" />
            ) : (
              <Calendar className="text-primary h-7 w-7 opacity-50" />
            )}
          </div>
          <h3 className="text-text-primary text-base font-semibold">
            Chưa có bài viết
          </h3>
          {activeTab === 'marketplace_listing' && (
            <button
              onClick={openComposer}
              className="bg-primary text-primary-foreground hover:bg-primary-hover mt-4 rounded-xl px-5 py-2 text-sm font-semibold transition"
            >
              Đăng bán vé ngay
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* List danh sách các bài đã fetch */}
          <PostThread
            posts={posts}
            allPosts={posts}
            currentUser={user}
            onDeletePost={handleDeletePostWeb3}
            feedQueryKey={['community-feed', activeTab, userId]} // Cập nhật query key cho khớp
            onBuyTickets={handleBuyTickets}
          />

          {/* ĐÂY LÀ CHỖ KÍCH HOẠT INFINITE SCROLL */}
          <InfiniteScrollTrigger
            onIntersect={() => fetchNextPage()}
            hasMore={hasNextPage}
            isLoading={isFetchingNextPage}
          />
        </div>
      )}

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

      {isProcessing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center rounded-xl bg-white p-8 shadow-2xl">
            <LoadingSpinner className="text-primary mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-bold text-gray-900">
              Đang niêm yết vé...
            </h3>
            <p className="animate-pulse font-medium text-blue-600">
              {web3StatusMessage || 'Vui lòng xác nhận trên ví của bạn...'}
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
        isProcessing={isBuyResaleProcessing || isFinalizing}
        statusMessage={isFinalizing ? "Đang xác nhận giao dịch với hệ thống..." : buyResaleStatusMessage}
        onConfirmPayment={handleConfirmBuyResale}
      />
    </div>
  );
};

export default Community;
