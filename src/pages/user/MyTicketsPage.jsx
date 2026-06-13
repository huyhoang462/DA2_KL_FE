// src/pages/user/my-tickets/MyTicketsPage.jsx

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Calendar,
  PlayCircle,
  ShoppingCart,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  POST_CONTENT_MAX_LENGTH,
  POST_CONTENT_MIN_LENGTH,
} from '../../components/features/posts/postUtils';
import { toast } from 'react-toastify';

import { getMyTickets, cancelTicketListing } from '../../services/ticketService';
import TicketCard from '../../components/features/ticket/TicketCard';
import TicketCardSkeleton from '../../components/features/ticket/TicketCardSkeleton';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import TextArea from '../../components/ui/TextArea';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useSelector } from 'react-redux';
import { createPost } from '../../services/postService';
import { ethers } from 'ethers';
import { useListTicketWeb3 } from '../../hooks/useListTicketWeb3';
import { useCancelListingWeb3 } from '../../hooks/useCancelListingWeb3';
const TABS = [
  {
    key: 'upcoming',
    label: 'Sắp diễn ra',
    icon: Calendar,
    emptyMessage: 'Bạn chưa có vé nào sắp diễn ra',
  },
  {
    key: 'ongoing',
    label: 'Đang diễn ra',
    icon: PlayCircle,
    emptyMessage: 'Không có sự kiện nào đang diễn ra',
  },
  {
    key: 'selling',
    label: 'Đang bán',
    icon: ShoppingCart,
    emptyMessage: 'Không có vé nào đang bán',
  },
  {
    key: 'past',
    label: 'Đã qua',
    icon: CheckCircle,
    emptyMessage: 'Bạn chưa có vé nào đã qua',
  },
  {
    key: 'cancelled',
    label: 'Đã hủy',
    icon: XCircle,
    emptyMessage: 'Bạn không có vé nào bị hủy',
  },
];
const isValidEvmWalletAddress = (value) => /^0x[a-fA-F0-9]{40}$/.test(value);

const STATUS_TAB_MAP = {
  pending: 'upcoming',
  checkedIn: 'ongoing',
  selling: 'selling',
  out: 'ongoing',
  expired: 'past',
  cancelled: 'cancelled',
};

export default function MyTicketsPage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [composerError, setComposerError] = useState('');

  const [composerForm, setComposerForm] = useState({
    content: '',
    walletAddress: '',
    relatedEventId: '',
    salePrice: 0,
  });
  const ITEMS_PER_PAGE = 10;

  const user = useSelector((state) => state.auth.user);
  const userId = user?.id;

  const { isWeb3Processing, web3StatusMessage, handleListTicketWeb3 } = useListTicketWeb3();
  const { isCancelingWeb3, cancelWeb3StatusMessage, handleCancelListingWeb3 } = useCancelListingWeb3();

  // Fetch tickets data
  const {
    data: allTickets = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['myTickets'],
    queryFn: getMyTickets,
    staleTime: 1000 * 60 * 2, // Cache 2 phút
  });

  // Filter và sort tickets theo tab
  const filteredTickets = useMemo(() => {
    if (isLoading || !allTickets) return [];

    let filtered = allTickets.filter((ticket) => {
      // Filter theo search
      const matchesSearch =
        searchTerm === '' ||
        ticket.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.showName?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Filter theo tab dựa trên status từ BE
      return STATUS_TAB_MAP[ticket.status] === activeTab;
    });

    // Sort theo tab
    filtered.sort((a, b) => {
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();

      if (activeTab === 'upcoming' || activeTab === 'ongoing') {
        // Sắp diễn ra / Đang diễn ra: gần nhất trước (ASC)
        return timeA - timeB;
      } else {
        // Đã qua / Đã hủy: mới nhất trước (DESC)
        return timeB - timeA;
      }
    });

    return filtered;
  }, [activeTab, searchTerm, allTickets, isLoading]);

  // Tính số lượng vé cho mỗi tab
  const tabCounts = useMemo(() => {
    if (!allTickets) return {};
    const counts = {
      upcoming: 0,
      selling: 0,
      ongoing: 0,
      past: 0,
      cancelled: 0,
    };

    allTickets.forEach((ticket) => {
      const tabKey = STATUS_TAB_MAP[ticket.status];
      if (tabKey && counts[tabKey] !== undefined) {
        counts[tabKey]++;
      }
    });

    return counts;
  }, [allTickets]);

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredTickets.slice(startIndex, endIndex);
  }, [filteredTickets, currentPage]);

  // Reset về trang 1 khi đổi tab hoặc search
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const currentTab = TABS.find((tab) => tab.key === activeTab);

  const clickSellTicket = (ticket) => {
    console.log('[TICKET]: ', ticket);
    setComposerForm((prev) => ({
      ...prev,
      relatedEventId: ticket.eventId,
      walletAddress: user?.walletAddress || '',
    }));
    setSelectedTicket({ ...ticket });
    setIsComposerOpen(true);
  };

  const closeComposer = () => {
    setIsComposerOpen(false);
    setComposerError('');
    setComposerForm({
      content: '',
      walletAddress: '',
      relatedEventId: '',
      salePrice: 0,
    });
    setSelectedTicket(null);
  };

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
  const handleCreatePost = async () => {
    console.log('Submitting post with form data:', composerForm);
    setComposerError('');

    const trimmedContent = composerForm.content.trim();
    const trimmedWalletAddress = composerForm.walletAddress.trim();
    const relatedEventId = composerForm.relatedEventId;

    if (trimmedContent.length < POST_CONTENT_MIN_LENGTH) {
      setComposerError(
        `Nội dung phải từ ${POST_CONTENT_MIN_LENGTH} ký tự trở lên.`
      );
      return;
    }
    if (!trimmedWalletAddress) {
      setComposerError('Vui lòng nhập địa chỉ ví MetaMask để nhận tiền.');
      return;
    }

    if (!isValidEvmWalletAddress(trimmedWalletAddress)) {
      setComposerError('Địa chỉ ví MetaMask không hợp lệ.');
      return;
    }

    if (selectedTicket?.tokenId == null) {
      setComposerError('Vé này chưa được cấp tokenId (chưa mint thành công).');
      return;
    }

    const salePrice = Number(composerForm.salePrice);
    if (!Number.isFinite(salePrice) || salePrice <= 0) {
      setComposerError('Vui lòng nhập giá muốn bán hợp lệ.');
      return;
    }

    // Giá tối đa 120% giá gốc
    const MAX_RESALE_PRICE_MULTIPLIER = 1.2;
    const originalPrice = Number(selectedTicket.price || 0);
    const maxAllowed = originalPrice * MAX_RESALE_PRICE_MULTIPLIER;

    if (originalPrice > 0 && salePrice > maxAllowed) {
      setComposerError(
        `Giá bán không được lớn hơn 120% giá gốc (${maxAllowed} USDT).`
      );
      return;
    }

    const ticketIdsWeb3 = [BigInt(selectedTicket.tokenId)];
    const pricesWeb3 = [ethers.parseUnits(salePrice.toString(), 6)];

    try {
      await handleListTicketWeb3({
        ticketIdsWeb3,
        pricesWeb3,
        walletAddress: trimmedWalletAddress,
      });

      const datanewPost = {
        content: trimmedContent,
        images: [],
        walletAddress: trimmedWalletAddress,
        relatedEvent: relatedEventId,
        relatedTickets: [
          {
            ticketId: selectedTicket?.id || selectedTicket?.ticketId,
            price: salePrice,
          },
        ],
        postType: 'marketplace_listing',
      };
      createPostMutation.mutate(datanewPost);
    } catch (error) {
      console.error('Lỗi khi tương tác Web3:', error);
      setComposerError(error.message || 'Có lỗi xảy ra khi tương tác với blockchain.');
    }
  };

  const handleCancelSell = async (ticket) => {
    console.log('[CANCEL SELL] Canceling sell for ticket:', ticket);

    const ticketId = ticket._id || ticket.id;
    const tokenId = ticket.tokenId;

    if (!tokenId) {
      toast.error('Không tìm thấy tokenId của vé. Vui lòng liên hệ hỗ trợ.');
      return;
    }

    try {
      // Bước 1: Gọi Smart Contract hủy niêm yết (Gas funding + batchCancelListings)
      await handleCancelListingWeb3({ ticketIdsWeb3: [BigInt(tokenId)] });

      // Bước 2: Sau khi Blockchain thành công, gọi API Backend cập nhật trạng thái vé
      await cancelTicketListing(ticketId);

      toast.success('Hủy bán vé thành công! Vé của bạn đã được gỡ khỏi sàn giao dịch.');
      queryClient.invalidateQueries({ queryKey: ['myTickets'] });
    } catch (error) {
      console.error('[CANCEL SELL] Error:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi hủy bán vé. Vui lòng thử lại.');
    }
  };
  return (
    <div className="space-y-6">
      {/* Search Bar & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-text-placeholder absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
          <Input
            placeholder="Tìm kiếm theo tên sự kiện, địa điểm..."
            inputClassName="pl-10 py-2.5"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tab Select */}
        <div className="relative min-w-[200px]">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="border-border-default bg-background-secondary text-text-primary focus:border-primary focus:ring-primary/20 w-full cursor-pointer appearance-none rounded-lg border px-4 py-2.5 pr-10 text-sm font-medium transition-colors focus:ring-2 focus:outline-none"
          >
            {TABS.map((tab) => {
              const count = tabCounts[tab.key] || 0;
              return (
                <option key={tab.key} value={tab.key}>
                  {tab.label} {count > 0 ? `(${count})` : '(0)'}
                </option>
              );
            })}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
            <svg
              className="text-text-secondary h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(4)].map((_, i) => (
            <TicketCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorDisplay
          message={error?.message || 'Không thể tải danh sách vé.'}
        />
      ) : filteredTickets.length > 0 ? (
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            Hiển thị{' '}
            <span className="font-semibold">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>
            -
            <span className="font-semibold">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredTickets.length)}
            </span>{' '}
            trong tổng số{' '}
            <span className="font-semibold">{filteredTickets.length}</span> vé
          </p>
          <div className="space-y-3">
            {paginatedTickets.map((ticket) => (
              <TicketCard
                key={ticket._id || ticket.id}
                ticket={ticket}
                onClickSell={clickSellTicket}
                onCancelSell={handleCancelSell}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-border-default text-text-primary hover:bg-background-secondary disabled:text-text-tertiary rounded-lg border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trước
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  // Hiển thị: 1 ... current-1 current current+1 ... last
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[40px] rounded-lg px-3 py-2 text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-primary text-primary-foreground'
                            : 'border-border-default text-text-primary hover:bg-background-secondary border'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return (
                      <span
                        key={pageNum}
                        className="text-text-tertiary px-2 py-2 text-sm"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="border-border-default text-text-primary hover:bg-background-secondary disabled:text-text-tertiary rounded-lg border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="border-border-default bg-background-secondary flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
          <div className="bg-background-primary mb-4 rounded-full p-4">
            {currentTab && (
              <currentTab.icon className="text-text-secondary h-8 w-8" />
            )}
          </div>
          <h3 className="text-text-primary mb-2 text-lg font-semibold">
            {searchTerm ? 'Không tìm thấy vé' : currentTab?.emptyMessage}
          </h3>
          <p className="text-text-secondary text-sm">
            {searchTerm
              ? 'Không có vé nào khớp với tìm kiếm của bạn.'
              : 'Hãy khám phá các sự kiện và đặt vé ngay!'}
          </p>
        </div>
      )}

      <Modal
        isOpen={isComposerOpen}
        title={'Đăng bán vé'}
        onClose={() => setIsComposerOpen(false)}
        xButton
        maxWidth="max-w-3xl"
      >
        <div className="relative flex h-[85vh] flex-col">
          <div className="mb-4 flex items-center gap-3">
            <img
              src={'https://picsum.photos/seed/post-composer/100/100'}
              className="h-9 w-9 rounded-full object-cover"
              alt={user?.name || 'Avatar'}
            />
            <div>
              <p className="text-text-primary text-sm font-semibold">
                {user?.name || user?.fullName || 'Bạn'}
              </p>
              <p className="text-text-secondary text-xs capitalize">
                {'Customer'}
              </p>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex min-h-0 flex-col overflow-hidden pb-16">
            <div className="space-y-2 overflow-y-auto pr-1">
              {/* TextArea Nội dung (Đã cho full width và giảm rows) */}
              <div>
                <TextArea
                  label={'Nội dung'}
                  rows={3} // Giảm từ 4 xuống 3
                  value={composerForm.content}
                  onChange={(event) => {
                    setComposerForm((prev) => ({
                      ...prev,
                      content: event.target.value,
                    }));
                    setComposerError('');
                  }}
                  placeholder={'Chia sẻ về vé bạn muốn bán...'}
                  className="w-full"
                />
                {/* {contentLengthText ? (
                  <p className="text-text-secondary mt-1 text-right text-xs">
                    {contentLengthText}
                  </p>
                ) : null} */}
              </div>

              <Input
                label={'Địa chỉ ví'}
                value={composerForm.walletAddress}
                onChange={(event) => {
                  setComposerForm((prev) => ({
                    ...prev,
                    walletAddress: event.target.value,
                  }));
                  setComposerError('');
                }}
                placeholder={'0x...'}
              />

              <div className="space-y-1.5">
                <label className="text-text-secondary block text-sm font-medium">
                  {`Vé muốn bán`}
                </label>

                <div
                  className={`border-border-default } rounded-xl border p-3`}
                >
                  <div className="mb-3 flex items-start gap-3">
                    {selectedTicket?.bannerImageUrl ? (
                      <img
                        src={selectedTicket?.bannerImageUrl}
                        alt={selectedTicket?.eventName || 'Sự kiện'}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : null}

                    <div className="min-w-0 flex-1">
                      <p className="text-text-primary line-clamp-1 text-sm font-semibold">
                        {selectedTicket?.eventName || 'Sự kiện'}
                      </p>
                      {selectedTicket?.location ? (
                        <p className="text-text-secondary mt-0.5 line-clamp-1 text-xs">
                          {selectedTicket?.location}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div
                    key={selectedTicket?.ticketId}
                    className={`bg-gray-50' border-primary flex items-center justify-between rounded-lg border p-3 transition-all`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 items-center"></div>
                      <div>
                        <p className="text-text-primary text-sm font-semibold">
                          {/* <span className="mr-1">
                                          {String(selectedTicket?.ticketId).slice(-6)}
                                        </span>
                                        {' - '} */}
                          {'Vé '}
                          {selectedTicket?.ticketTypeName}
                          {' - '}
                          {selectedTicket?.showName}
                          {' - '}
                          <span className="text-sm font-bold text-orange-600">
                            {Number(selectedTicket?.price || 0)} USDT
                          </span>
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1 text-right"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <p className="text-text-secondary text-sm font-bold">
                        {'Giá bán lại: '}
                      </p>

                      <div className="mt-1 flex items-center justify-end gap-1">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={composerForm.salePrice}
                          onChange={(event) => {
                            setComposerForm((prev) => ({
                              ...prev,
                              salePrice: event.target.value,
                            }));
                            setComposerError('');
                          }}
                          onFocus={(e) => {
                            // Ép kiểu về Number hoặc so sánh chuỗi cẩn thận
                            if (
                              String(e.currentTarget.value) === '0' &&
                              selectedTicket?.price
                            ) {
                              // Lưu giá trị vào một biến local trước để đảm bảo tính chính xác
                              const targetPrice = selectedTicket.price;

                              setComposerForm((prev) => ({
                                ...prev,
                                salePrice: targetPrice,
                              }));
                            }
                          }}
                          placeholder={'0'}
                          className="text-text-primary focus:border-primary border-border-default w-16 border-b bg-white px-2 py-1 text-sm font-semibold outline-none dark:border-gray-700 dark:bg-transparent"
                        />
                        <span className="text-sm font-semibold text-orange-600">
                          USDT
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-border-default absolute right-0 bottom-0 left-0 mt-4 flex justify-between border-t pt-2">
            <div>
              {composerError ? (
                <p className="text-destructive bg-destructive-background rounded-lg px-3 py-2 text-sm">
                  {composerError}
                </p>
              ) : isWeb3Processing && web3StatusMessage ? (
                <p className="text-primary bg-primary/10 rounded-lg px-3 py-2 text-sm">
                  {web3StatusMessage}
                </p>
              ) : null}
            </div>
            {/* Footer Buttons */}
            <div className="flex shrink-0 justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setIsComposerOpen(false)}
                disabled={createPostMutation.isLoading || createPostMutation.isPending || isWeb3Processing}
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreatePost}
                loading={createPostMutation.isLoading || createPostMutation.isPending || isWeb3Processing}
              >
                {'Đăng bán'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {isCancelingWeb3 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center rounded-xl bg-white p-8 shadow-2xl">
            <LoadingSpinner className="mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 text-lg font-bold text-gray-900">
              Đang hủy niêm yết vé...
            </h3>
            <p className="animate-pulse font-medium text-blue-600">
              {cancelWeb3StatusMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
