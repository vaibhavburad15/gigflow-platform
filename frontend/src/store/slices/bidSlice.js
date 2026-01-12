import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/bids';

const initialState = {
  bids: [],
  myBids: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Create bid
export const createBid = createAsyncThunk(
  'bids/create',
  async (bidData, thunkAPI) => {
    try {
      const response = await axios.post(API_URL, bidData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to submit bid';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get bids for a gig (owner only)
export const getBidsForGig = createAsyncThunk(
  'bids/getForGig',
  async (gigId, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/${gigId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch bids';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Hire a freelancer
export const hireBid = createAsyncThunk(
  'bids/hire',
  async (bidId, thunkAPI) => {
    try {
      const response = await axios.patch(
        `${API_URL}/${bidId}/hire`,
        {},
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to hire freelancer';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get my bids
export const getMyBids = createAsyncThunk(
  'bids/getMy',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/my/bids`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch your bids';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const bidSlice = createSlice({
  name: 'bids',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    updateBidStatus: (state, action) => {
      const { bidId, status } = action.payload;
      const bid = state.myBids.find((b) => b._id === bidId);
      if (bid) {
        bid.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create bid
      .addCase(createBid.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createBid.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.myBids.unshift(action.payload.bid);
      })
      .addCase(createBid.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get bids for gig
      .addCase(getBidsForGig.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBidsForGig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bids = action.payload.bids;
      })
      .addCase(getBidsForGig.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Hire bid
      .addCase(hireBid.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(hireBid.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Update bid statuses
        state.bids = state.bids.map((bid) => {
          if (bid._id === action.payload.bid._id) {
            return { ...bid, status: 'hired' };
          }
          return bid;
        });
      })
      .addCase(hireBid.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get my bids
      .addCase(getMyBids.fulfilled, (state, action) => {
        state.myBids = action.payload.bids;
      });
  },
});

export const { reset, updateBidStatus } = bidSlice.actions;
export default bidSlice.reducer;
