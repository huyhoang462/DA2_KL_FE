// src/store/slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  eventId: null, // ID của sự kiện đang được chọn vé
  items: {}, // Object để lưu số lượng: { ticketTypeId_1: 2, ticketTypeId_2: 1 }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Action được gọi khi bắt đầu chọn vé cho một sự kiện
    startNewCart: (state, action) => {
      const { eventId } = action.payload;
      // Nếu là sự kiện mới, reset giỏ hàng
      if (state.eventId !== eventId) {
        state.eventId = eventId;
        state.items = {};
      }
    },
    // Action để thay đổi số lượng của một loại vé
    updateTicketQuantity: (state, action) => {
      const { ticketTypeId, quantity } = action.payload;
      if (quantity > 0) {
        state.items[ticketTypeId] = quantity;
      } else {
        // Nếu số lượng là 0, xóa nó khỏi giỏ
        delete state.items[ticketTypeId];
      }
    },
    // Action để xóa sạch giỏ hàng
    clearCart: (state) => {
      state.eventId = null;
      state.items = {};
    },
  },
});

export const { startNewCart, updateTicketQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
