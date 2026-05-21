import React from 'react';
import {
  BadgeCheck,
  Clock3,
  FileText,
  Flag,
  MessageSquare,
} from 'lucide-react';
import AdminSummaryCard from '../admin/AdminSummaryCard';

const defaultCards = [
  {
    key: 'totalItems',
    label: 'Tổng báo cáo',
    icon: Flag,
    color: 'primary',
  },
  {
    key: 'pending',
    label: 'Chờ xử lý',
    icon: Clock3,
    color: 'warning',
  },
  {
    key: 'resolved',
    label: 'Đã xử lý',
    icon: BadgeCheck,
    color: 'success',
  },
  {
    key: 'postCount',
    label: 'Báo cáo bài viết',
    icon: FileText,
    color: 'info',
  },
  {
    key: 'commentCount',
    label: 'Báo cáo bình luận',
    icon: MessageSquare,
    color: 'primary',
  },
];

const SummaryCards = ({ cards = defaultCards, isLoading, onCardClick }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5 xl:grid-cols-5">
      {cards.map((card) => (
        <AdminSummaryCard
          key={card.key}
          title={card.label}
          value={Number(card.value || 0).toLocaleString('vi-VN')}
          icon={card.icon}
          color={card.color}
          disabled={isLoading}
          onClick={() => onCardClick(card.key)}
        />
      ))}
    </div>
  );
};

export default SummaryCards;
