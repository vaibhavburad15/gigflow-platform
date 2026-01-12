import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllGigs } from '../store/slices/gigSlice';
import { Link } from 'react-router-dom';
import { Search, DollarSign, Clock, User } from 'lucide-react';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch();
  const { gigs, isLoading } = useSelector((state) => state.gigs);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getAllGigs(''));
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(getAllGigs(searchTerm));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Open Gigs</h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search gigs by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button
            type="submit"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-medium"
          >
            Search
          </button>
        </div>
      </form>

      {/* Gigs List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading gigs...</p>
        </div>
      ) : gigs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-lg">No gigs found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {gigs.map((gig) => (
            <div
              key={gig._id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {gig.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {gig.description}
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-700">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span className="font-semibold">${gig.budget}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <User className="h-4 w-4 mr-2" />
                  <span>Posted by {gig.ownerId?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>
                    {new Date(gig.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Link
                to={`/gigs/${gig._id}`}
                className="block w-full text-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition font-medium"
              >
                {gig.ownerId?._id === user?._id ? 'View Details' : 'Place Bid'}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
