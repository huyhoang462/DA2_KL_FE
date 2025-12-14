// src/pages/manage/event/dashboard/mockData.js

export const mockOrdersData = [
  {
    id: 'ORD-2024-001',
    customerName: 'Nguyễn Văn An',
    customerEmail: 'nguyenvanan@gmail.com',
    customerPhone: '0901234567',
    purchaseDate: '2024-12-01T10:30:00Z',
    totalTickets: 3,
    totalAmount: 450000,
    status: 'paid',
    paymentMethod: 'vnpay',
    eventId: 'evt-001',
    eventName: 'Đêm nhạc acoustic cùng Đen Vâu',
    tickets: [
      {
        id: 'TKT-001',
        ticketTypeId: 'tt-vip',
        ticketTypeName: 'VIP',
        quantity: 1,
        unitPrice: 200000,
        totalPrice: 200000,
        qrCodes: ['QR-VIP-001'],
      },
      {
        id: 'TKT-002',
        ticketTypeId: 'tt-regular',
        ticketTypeName: 'Thường',
        quantity: 2,
        unitPrice: 125000,
        totalPrice: 250000,
        qrCodes: ['QR-REG-001', 'QR-REG-002'],
      },
    ],
    createdAt: '2024-12-01T10:30:00Z',
    updatedAt: '2024-12-01T10:35:00Z',
  },
  {
    id: 'ORD-2024-002',
    customerName: 'Trần Thị Bình',
    customerEmail: 'tranthibinh@outlook.com',
    customerPhone: '0912345678',
    purchaseDate: '2024-12-01T14:15:00Z',
    totalTickets: 5,
    totalAmount: 875000,
    status: 'paid',
    paymentMethod: 'momo',
    eventId: 'evt-001',
    eventName: 'Đêm nhạc acoustic cùng Đen Vâu',
    tickets: [
      {
        id: 'TKT-003',
        ticketTypeId: 'tt-vip',
        ticketTypeName: 'VIP',
        quantity: 2,
        unitPrice: 200000,
        totalPrice: 400000,
        qrCodes: ['QR-VIP-002', 'QR-VIP-003'],
      },
      {
        id: 'TKT-004',
        ticketTypeId: 'tt-regular',
        ticketTypeName: 'Thường',
        quantity: 3,
        unitPrice: 125000,
        totalPrice: 375000,
        qrCodes: ['QR-REG-003', 'QR-REG-004', 'QR-REG-005'],
      },
      {
        id: 'TKT-005',
        ticketTypeId: 'tt-student',
        ticketTypeName: 'Sinh viên',
        quantity: 2,
        unitPrice: 50000,
        totalPrice: 100000,
        qrCodes: ['QR-STU-001', 'QR-STU-002'],
      },
    ],
    createdAt: '2024-12-01T14:15:00Z',
    updatedAt: '2024-12-01T14:20:00Z',
  },
  {
    id: 'ORD-2024-003',
    customerName: 'Lê Minh Cường',
    customerEmail: 'leminhcuong@yahoo.com',
    customerPhone: '0923456789',
    purchaseDate: '2024-12-02T09:45:00Z',
    totalTickets: 1,
    totalAmount: 200000,
    status: 'cancelled',
    paymentMethod: 'vnpay',
    eventId: 'evt-001',
    eventName: 'Đêm nhạc acoustic cùng Đen Vâu',
    tickets: [
      {
        id: 'TKT-006',
        ticketTypeId: 'tt-vip',
        ticketTypeName: 'VIP',
        quantity: 1,
        unitPrice: 200000,
        totalPrice: 200000,
        qrCodes: ['QR-VIP-004'],
      },
    ],
    cancelReason: 'Khách hàng yêu cầu hủy',
    cancelledAt: '2024-12-02T11:30:00Z',
    createdAt: '2024-12-02T09:45:00Z',
    updatedAt: '2024-12-02T11:30:00Z',
  },
  {
    id: 'ORD-2024-004',
    customerName: 'Phạm Thị Diệu',
    customerEmail: 'phamthidieu@gmail.com',
    customerPhone: '0934567890',
    purchaseDate: '2024-12-02T16:20:00Z',
    totalTickets: 4,
    totalAmount: 600000,
    status: 'paid',
    paymentMethod: 'bank_transfer',
    eventId: 'evt-001',
    eventName: 'Đêm nhạc acoustic cùng Đen Vâu',
    tickets: [
      {
        id: 'TKT-007',
        ticketTypeId: 'tt-regular',
        ticketTypeName: 'Thường',
        quantity: 4,
        unitPrice: 125000,
        totalPrice: 500000,
        qrCodes: ['QR-REG-006', 'QR-REG-007', 'QR-REG-008', 'QR-REG-009'],
      },
      {
        id: 'TKT-008',
        ticketTypeId: 'tt-student',
        ticketTypeName: 'Sinh viên',
        quantity: 2,
        unitPrice: 50000,
        totalPrice: 100000,
        qrCodes: ['QR-STU-003', 'QR-STU-004'],
      },
    ],
    createdAt: '2024-12-02T16:20:00Z',
    updatedAt: '2024-12-02T16:25:00Z',
  },
  {
    id: 'ORD-2024-005',
    customerName: 'Hoàng Văn Ế',
    customerEmail: 'hoangvane@hotmail.com',
    customerPhone: '0945678901',
    purchaseDate: '2024-12-03T11:10:00Z',
    totalTickets: 2,
    totalAmount: 300000,
    status: 'pending',
    paymentMethod: 'vnpay',
    eventId: 'evt-001',
    eventName: 'Đêm nhạc acoustic cùng Đen Vâu',
    tickets: [
      {
        id: 'TKT-009',
        ticketTypeId: 'tt-regular',
        ticketTypeName: 'Thường',
        quantity: 2,
        unitPrice: 125000,
        totalPrice: 250000,
        qrCodes: [],
      },
      {
        id: 'TKT-010',
        ticketTypeId: 'tt-student',
        ticketTypeName: 'Sinh viên',
        quantity: 1,
        unitPrice: 50000,
        totalPrice: 50000,
        qrCodes: [],
      },
    ],
    createdAt: '2024-12-03T11:10:00Z',
    updatedAt: '2024-12-03T11:10:00Z',
  },
];

export const orderStatusMap = {
  paid: {
    label: 'Đã thanh toán',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '✓',
  },
  pending: {
    label: 'Chờ thanh toán',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '⏳',
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '✕',
  },
  refunded: {
    label: 'Đã hoàn tiền',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '↩',
  },
};

export const paymentMethodMap = {
  vnpay: 'VNPay',
  momo: 'MoMo',
  bank_transfer: 'Chuyển khoản',
  cash: 'Tiền mặt',
};
export const mockDashboardData = {
  keyMetrics: {
    grossRevenue: 150500000,
    ticketsSold: 1250,
    totalTickets: 2000,
    orderCount: 480,
  },
  revenueOverTime: [
    { date: '2025-12-01', revenue: 50 },
    { date: '2025-12-02', revenue: 85 },
    { date: '2025-12-03', revenue: 120 },
    { date: '2025-12-04', revenue: 90 },
    { date: '2025-12-05', revenue: 150 },
    { date: '2025-12-06', revenue: 130 },
    { date: '2025-12-07', revenue: 180 },
  ].map((d) => ({ ...d, revenue: d.revenue * 100000 })), // Nhân lên để có số liệu thật
  ticketBreakdown: [
    {
      showId: 'show_1',
      showName: 'Suất diễn ngày 1 (20/12)',
      tickets: [
        { ticketTypeId: 'vip_1', name: 'Vé VIP', sold: 150 },
        { ticketTypeId: 'special_1', name: 'Vé SPECIAL', sold: 56 },
        {
          ticketTypeId: 'normal_1',
          name: 'Vé Thường',
          sold: 300,
        },
      ],
    },
    {
      showId: 'show_2',
      showName: 'Suất diễn ngày 2 (21/12)',
      tickets: [
        { ticketTypeId: 'vip_2', name: 'Vé VIP', sold: 200 },
        { ticketTypeId: 'special_2', name: 'Vé SPECIAL', sold: 87 },
        {
          ticketTypeId: 'normal_2',
          name: 'Vé Thường',
          sold: 300,
        },
      ],
    },
    {
      showId: 'show_3',
      showName: 'Suất diễn ngày 3 (22/12)',
      tickets: [
        { ticketTypeId: 'vip_3', name: 'Vé VIP', sold: 200 },
        { ticketTypeId: 'special_3', name: 'Vé SPECIAL', sold: 87 },
        {
          ticketTypeId: 'normal_3',
          name: 'Vé Thường',
          sold: 300,
        },
      ],
    },
  ],
  recentOrders: [
    {
      id: 'order_123',
      customerName: 'Nguyễn Văn A',
      totalAmount: 2000000,
      ticketCount: 2,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'order_122',
      customerName: 'Trần Thị B',
      totalAmount: 500000,
      ticketCount: 1,
      createdAt: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: 'order_121',
      customerName: 'Lê Văn C',
      totalAmount: 1500000,
      ticketCount: 3,
      createdAt: new Date(Date.now() - 600000).toISOString(),
    },
  ],
};

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

export const mockAdminPaymentMethods = [
  {
    id: 'payout_method_bank_123',
    user: 'admin_user_id',
    methodType: 'bank_account',
    isDefault: true,
    bankDetails: {
      bankName: 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)',
      accountNumber: '1030489517',
      accountName: 'CONG TY TNHH SHINE TICKET',
      bankBranch: 'Chi nhánh Phan Đình Phùng - Hà Tĩnh',
    },
    momoDetails: null,
  },
  {
    id: 'payout_method_momo_456',
    user: 'admin_user_id',
    methodType: 'momo',
    isDefault: false,
    bankDetails: null,
    momoDetails: {
      phoneNumber: '0916097570',
      accountName: 'CONG TY TNHH SHINE TICKET',
    },
  },
  // {
  //   id: 'payout_method_bank_789',
  //   user: 'admin_user_id',
  //   methodType: 'bank_account',
  //   isDefault: false,
  //   bankDetails: {
  //     bankName: 'Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)',
  //     accountNumber: '1234567890',
  //     accountName: 'CONG TY TNHH SHINE TICKET',
  //     bankBranch: 'Hội sở chính',
  //   },
  //   momoDetails: null,
  // },
];
