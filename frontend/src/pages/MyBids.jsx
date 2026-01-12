import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyBids } from '../store/slices/bidSlice';
import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const MyBids = () => {
  const dispatch = useDispatch();
  const { myBids } = useSelector((state) => state.bids);

  useEffect(() => {
    dispatch(getMyBids());
  }, [dispatch]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'hired':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'hired':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Submitted Bids</h1>

      {myBids.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-lg">You haven't submitted any bids yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myBids.map((bid) => (
            <div
              key={bid._id}
              className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                bid.status === 'hired'
                  ? 'border-green-300'
                  : bid.status === 'rejected'
                  ? 'border-gray-300 opacity-75'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {bid.gigId?.title || 'Untitled Gig'}
                  </h3>
                  <p className="text-gray-600 line-clamp-2">
                    {bid.gigId?.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(bid.status)}
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                      bid.status
                    )}`}
                  >
                    {bid.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Your Bid Price</p>
                    <div className="flex items-center text-primary-600">
                      <DollarSign className="h-5 w-5" />
                      <span className="text-2xl font-bold">{bid.price}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Original Budget</p>
                    <div className="flex items-center text-gray-700">
                      <DollarSign className="h-5 w-5" />
                      <span className="text-2xl font-bold">
                        {bid.gigId?.budget || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Your Message</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {bid.message}
                  </p>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Submitted on {new Date(bid.createdAt).toLocaleString()}</span>
                </div>

                {bid.status === 'hired' && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-semibold flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Congratulations! You've been hired for this project.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBids;
