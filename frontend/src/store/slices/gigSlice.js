import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/gigs';

const initialState = {
  gigs: [],
  myGigs: [],
  currentGig: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get all gigs
export const getAllGigs = createAsyncThunk(
  'gigs/getAll',
  async (searchQuery = '', thunkAPI) => {
    try {
      const response = await axios.get(
        `${API_URL}?search=${searchQuery}&status=open`
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch gigs';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single gig
export const getGigById = createAsyncThunk(
  'gigs/getById',
  async (gigId, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/${gigId}`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to fetch gig';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create gig
export const createGig = createAsyncThunk(
  'gigs/create',
  async (gigData, thunkAPI) => {
    try {
      const response = await axios.post(API_URL, gigData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to create gig';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get my gigs
export const getMyGigs = createAsyncThunk(
  'gigs/getMy',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/my/posted`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch your gigs';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete gig
export const deleteGig = createAsyncThunk(
  'gigs/delete',
  async (gigId, thunkAPI) => {
    try {
      const response = await axios.delete(`${API_URL}/${gigId}`, {
        withCredentials: true,
      });
      return { ...response.data, gigId };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to delete gig';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const gigSlice = createSlice({
  name: 'gigs',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all gigs
      .addCase(getAllGigs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllGigs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.gigs = action.payload.gigs;
      })
      .addCase(getAllGigs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get single gig
      .addCase(getGigById.fulfilled, (state, action) => {
        state.currentGig = action.payload.gig;
      })
      // Create gig
      .addCase(createGig.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createGig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.gigs.unshift(action.payload.gig);
        state.myGigs.unshift(action.payload.gig);
      })
      .addCase(createGig.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get my gigs
      .addCase(getMyGigs.fulfilled, (state, action) => {
        state.myGigs = action.payload.gigs;
      })
      // Delete gig
      .addCase(deleteGig.fulfilled, (state, action) => {
        state.myGigs = state.myGigs.filter(
          (gig) => gig._id !== action.payload.gigId
        );
        state.gigs = state.gigs.filter((gig) => gig._id !== action.payload.gigId);
      });
  },
});

export const { reset } = gigSlice.actions;
export default gigSlice.reducer;
