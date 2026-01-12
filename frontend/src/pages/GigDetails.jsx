import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getGigById } from '../store/slices/gigSlice';
import { createBid, getBidsForGig, hireBid } from '../store/slices/bidSlice';
import toast from 'react-hot-toast';
import { DollarSign, User, Clock, MessageSquare, CheckCircle } from 'lucide-react';

const GigDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentGig } = useSelector((state) => state.gigs);
  const { bids, isLoading: bidsLoading } = useSelector((state) => state.bids);
  const { user } = useSelector((state) => state.auth);

  const [showBidForm, setShowBidForm] = useState(false);
  const [bidFormData, setBidFormData] = useState({
    message: '',
    price: '',
  });

  const isOwner = currentGig?.ownerId?._id === user?._id;

  useEffect(() => {
    dispatch(getGigById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (isOwner && currentGig) {
      dispatch(getBidsForGig(id));
    }
  }, [dispatch, id, isOwner, currentGig]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();

    if (!bidFormData.message || !bidFormData.price) {
      toast.error('Please fill in all fields');
      return;
    }

    const result = await dispatch(
      createBid({
        gigId: id,
        message: bidFormData.message,
        price: Number(bidFormData.price),
      })
    );

    if (result.type === 'bids/create/fulfilled') {
      toast.success('Bid submitted successfully!');
      setBidFormData({ message: '', price: '' });
      setShowBidForm(false);
      navigate('/my-bids');
    } else {
      toast.error(result.payload || 'Failed to submit bid');
    }
  };

  const handleHire = async (bidId, freelancerName) => {
    if (
      window.confirm(
        `Are you sure you want to hire ${freelancerName}? This will reject all other bids.`
      )
    ) {
      const result = await dispatch(hireBid(bidId));

      if (result.type === 'bids/hire/fulfilled') {
        toast.success('Freelancer hired successfully!');
        dispatch(getGigById(id));
        dispatch(getBidsForGig(id));
      } else {
        toast.error(result.payload || 'Failed to hire freelancer');
      }
    }
  };

  if (!currentGig) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading gig details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Gig Details */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{currentGig.title}</h1>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              currentGig.status === 'open'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {currentGig.status === 'open' ? 'Open' : 'Assigned'}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6 text-sm">
          <div className="flex items-center text-gray-700">
            <DollarSign className="h-5 w-5 mr-2" />
            <span className="font-semibold text-lg">${currentGig.budget}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <User className="h-5 w-5 mr-2" />
            <span>Posted by {currentGig.ownerId?.name}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-5 w-5 mr-2" />
            <span>{new Date(currentGig.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{currentGig.description}</p>
        </div>

        {/* Bid Form */}
        {!isOwner && currentGig.status === 'open' && (
          <div className="mt-6 border-t pt-6">
            {!showBidForm ? (
              <button
                onClick={() => setShowBidForm(true)}
                className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-medium"
              >
                Place Your Bid
              </button>
            ) : (
              <form onSubmit={handleBidSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Submit Your Bid</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message
                  </label>
                  <textarea
                    value={bidFormData.message}
                    onChange={(e) =>
                      setBidFormData({ ...bidFormData, message: e.target.value })
                    }
                    placeholder="Explain why you're the best fit for this project..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Bid Price (USD)
                  </label>
                  <input
                    type="number"
                    value={bidFormData.price}
                    onChange={(e) =>
                      setBidFormData({ ...bidFormData, price: e.target.value })
                    }
                    placeholder="Enter your price"
                    min="0"
                    step="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-medium"
                  >
                    Submit Bid
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBidForm(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Bids Section (Owner Only) */}
      {isOwner && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Received Bids ({bids.length})
          </h2>

          {bidsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : bids.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No bids received yet</p>
          ) : (
            <div className="space-y-4">
              {bids.map((bid) => (
                <div
                  key={bid._id}
                  className={`border rounded-lg p-6 ${
                    bid.status === 'hired'
                      ? 'border-green-500 bg-green-50'
                      : bid.status === 'rejected'
                      ? 'border-gray-300 bg-gray-50 opacity-60'
                      : 'border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {bid.freelancerId?.name}
                        </h3>
                        {bid.status === 'hired' && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {bid.freelancerId?.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">
                        ${bid.price}
                      </div>
                      <span
                        className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          bid.status === 'hired'
                            ? 'bg-green-100 text-green-800'
                            : bid.status === 'rejected'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {bid.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-start">
                      <MessageSquare className="h-5 w-5 text-gray-400 mr-2 mt-1" />
                      <p className="text-gray-700">{bid.message}</p>
                    </div>
                  </div>

                  {bid.status === 'pending' && currentGig.status === 'open' && (
                    <button
                      onClick={() => handleHire(bid._id, bid.freelancerId?.name)}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      Hire {bid.freelancerId?.name}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GigDetails;
