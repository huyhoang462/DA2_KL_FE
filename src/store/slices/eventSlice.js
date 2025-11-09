import { createSlice } from '@reduxjs/toolkit';
import set from 'lodash.set';
const initialState = {
  currentStep: 1,
  event: {
    name: '',
    bannerImageUrl: '',
    description: '',
    format: 'offline',
    location: {
      address: '',
      street: '',
      ward: '',
      province: '',
    },
    organizer: {
      name: '',
      email: '',
      phone: '',
      description: '',
    },
    category: '',
    status: 'draft',
    startDate: '',
    endDate: '',
    shows: [],
  },
};

const eventSlice = createSlice({
  initialState,
  name: 'event',
  reducers: {
    setEvent: (state, action) => {
      state.event = action.payload;
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    updateEventField: (state, action) => {
      const { field, value } = action.payload;
      set(state.event, field, value);
    },
    setEventShows: (state, action) => {
      state.event.shows = action.payload;
    },
    addShowtime: (state) => {
      const newShow = {
        _id: `temp_show_${Date.now()}`,
        name: `Suất diễn ${state.event.shows.length + 1}`,
        startTime: '',
        endTime: '',
        tickets: [],
      };
      state.event.shows.push(newShow);
    },
    removeShowtime: (state, action) => {
      const showIndex = action.payload;
      state.event.shows.splice(showIndex, 1);
    },
    updateShowtimeField: (state, action) => {
      const { showIndex, field, value } = action.payload;
      const path = `shows[${showIndex}].${field}`;
      set(state.event, path, value);
    },

    // --- Reducers cho Loại vé (TicketType) ---
    addTicketToShowtime: (state, action) => {
      const { showIndex, ticketData } = action.payload;
      const newTicket = {
        _id: `temp_ticket_${Date.now()}`,
        ...ticketData,
      };
      state.event.shows[showIndex].tickets.push(newTicket);
    },
    updateTicketInShowtime: (state, action) => {
      const { showIndex, ticketId, ticketData } = action.payload;
      const ticketIndex = state.event.shows[showIndex].tickets.findIndex(
        (t) => t._id === ticketId
      );
      if (ticketIndex !== -1) {
        // Giữ lại _id cũ, chỉ cập nhật các trường dữ liệu
        state.event.shows[showIndex].tickets[ticketIndex] = {
          ...state.event.shows[showIndex].tickets[ticketIndex],
          ...ticketData,
        };
      }
    },
    removeTicketFromShowtime: (state, action) => {
      const { showIndex, ticketId } = action.payload;
      state.event.shows[showIndex].tickets = state.event.shows[
        showIndex
      ].tickets.filter((t) => t._id !== ticketId);
    },

    clearEvents: (state) => {
      state.event = {};
    },
  },
});

export const {
  setEvent,
  clearEvents,
  setCurrentStep,
  updateEventField,
  setEventShows,
  addShowtime,
  removeShowtime,
  updateShowtimeField,
  addTicketToShowtime,
  updateTicketInShowtime,
  removeTicketFromShowtime,
} = eventSlice.actions;
export default eventSlice.reducer;
