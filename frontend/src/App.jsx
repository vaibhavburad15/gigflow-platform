import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice';
import { socket, initializeSocket, disconnectSocket } from './config/socket';
import toast from 'react-hot-toast';
import { updateBidStatus } from './store/slices/bidSlice';

// Pages
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateGig from './pages/CreateGig';
import GigDetails from './pages/GigDetails';
import MyGigs from './pages/MyGigs';
import MyBids from './pages/MyBids';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  // Socket.IO connection and real-time notifications
  useEffect(() => {
    if (user) {
      initializeSocket(user._id);

      // Listen for hiring notification
      socket.on('hired', (data) => {
        toast.success(data.message, {
          duration: 8000,
          icon: '🎉',
          style: {
            borderRadius: '10px',
            background: '#10b981',
            color: '#fff',
          },
        });
        // Update bid status in Redux
        dispatch(updateBidStatus({ bidId: data.bid.id, status: 'hired' }));
      });

      // Listen for bid rejection notification
      socket.on('bidRejected', (data) => {
        toast.error(data.message, {
          duration: 5000,
          icon: '❌',
        });
        // Update bid status in Redux
        dispatch(updateBidStatus({ bidId: data.bidId, status: 'rejected' }));
      });

      return () => {
        socket.off('hired');
        socket.off('bidRejected');
      };
    } else {
      disconnectSocket();
    }
  }, [user, dispatch]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-gig"
            element={
              <PrivateRoute>
                <CreateGig />
              </PrivateRoute>
            }
          />
          <Route
            path="/gigs/:id"
            element={
              <PrivateRoute>
                <GigDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-gigs"
            element={
              <PrivateRoute>
                <MyGigs />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-bids"
            element={
              <PrivateRoute>
                <MyBids />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
