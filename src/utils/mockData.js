export const mockEvents = [
  {
    id: 'evt_1',
    name: 'Đại nhạc hội Ravolution Music Festival 2024',
    bannerImageUrl:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop',
    startDate: '2024-09-20T18:00:00Z',
    endDate: '2024-09-20T23:00:00Z',
    location: {
      address: 'SECC - Trung tâm Hội chợ và Triển lãm Sài Gòn, Q.7',
    },
    lowestPrice: 250000,
    category: 'Âm nhạc',
  },
  {
    id: 'evt_2',
    name: 'Workshop "Bí mật Trí tuệ nhân tạo"',
    bannerImageUrl:
      'https://images.unsplash.com/photo-1678496464321-3aaa683cf4c4?q=80&w=2070&auto=format&fit=crop',
    startDate: '2024-10-05T09:00:00Z',
    endDate: '2024-10-05T17:00:00Z',
    location: {
      address: 'Dreamplex, 195 Điện Biên Phủ, Bình Thạnh',
    },
    lowestPrice: 50000,
    category: 'Công nghệ',
  },
  {
    id: 'evt_3',
    name: 'Triển lãm nghệ thuật đương đại "Mộng Chiều Xuân"',
    bannerImageUrl:
      'https://images.unsplash.com/photo-1549887552-cb1025d1a533?q=80&w=2070&auto=format&fit=crop',
    startDate: '2024-09-15T10:00:00Z',
    endDate: '2024-09-30T20:00:00Z',
    location: {
      address: 'Bảo tàng Mỹ thuật TP.HCM, Q.1',
    },
    lowestPrice: 0, // Sự kiện miễn phí
    category: 'Nghệ thuật',
  },
  {
    id: 'evt_4',
    name: 'Giải chạy Marathon HCMC 2024',
    bannerImageUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop',
    startDate: '2024-11-10T05:00:00Z',
    endDate: '2024-11-10T11:00:00Z',
    location: {
      address: 'Đường đi bộ Nguyễn Huệ, Q.1',
    },
    lowestPrice: 300000,
    category: 'Thể thao',
  },
  {
    id: 'evt_5',
    name: 'Lễ hội Ẩm thực Đường phố Sài Gòn',
    bannerImageUrl:
      'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=1964&auto=format&fit=crop',
    startDate: '2024-09-27T16:00:00Z',
    endDate: '2024-09-29T22:00:00Z',
    location: {
      address: 'Nhà thi đấu Phú Thọ, Q.11',
    },
    lowestPrice: 10000,
    category: 'Ẩm thực',
  },
];

export const mockTickets = [
  {
    id: 'ticket_1',
    qrCode: 'SHINE-123-ABC',
    status: 'active', // Sắp diễn ra
    eventName: 'Đại nhạc hội Ravolution 2024',
    eventBanner:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop',
    showtime: '2024-12-20T18:00:00.000Z',
    location: 'Thủ Đức, TP. Hồ Chí Minh',
    ticketTypeName: 'Vé GA',
    price: 900000,
  },
  {
    id: 'ticket_2',
    qrCode: 'SHINE-456-DEF',
    status: 'checkedIn', // Đang diễn ra
    eventName: 'Workshop "Làm chủ AI"',
    eventBanner:
      'https://images.unsplash.com/photo-1678493392357-109c915f0f35?q=80&w=2070&auto=format&fit=crop',
    showtime: new Date().toISOString(), // Đặt là hôm nay để test
    location: 'Quận 1, TP. Hồ Chí Minh',
    ticketTypeName: 'Vé Tiêu chuẩn',
    price: 500000,
  },
  {
    id: 'ticket_3',
    qrCode: 'SHINE-789-GHI',
    status: 'consumed', // Đã kết thúc
    eventName: 'Triển lãm nghệ thuật "Mộng"',
    eventBanner:
      'https://images.unsplash.com/photo-1549887552-cb1325381e44?q=80&w=2070&auto=format&fit=crop',
    showtime: '2023-11-15T10:00:00.000Z',
    location: 'Hà Nội',
    ticketTypeName: 'Vé vào cổng',
    price: 150000,
  },
];
