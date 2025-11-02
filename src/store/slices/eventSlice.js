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
    organizerInfo: {
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
} = eventSlice.actions;
export default eventSlice.reducer;
