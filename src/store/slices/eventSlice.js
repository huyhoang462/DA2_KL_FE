import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentStep: 1,
  event: {
    name: '',
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
    setEventShows: (state, action) => {
      state.event.shows = action.payload;
    },
    clearEvents: (state) => {
      state.event = {};
    },
  },
});

export const { setEvent, clearEvents, setCurrentStep, setEventShows } =
  eventSlice.actions;
export default eventSlice.reducer;
