import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyGigs, deleteGig } from '../store/slices/gigSlice';
import { Link } from 'react-router-dom';
import { DollarSign, Clock, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const MyGigs = () => {
  const dispatch = useDispatch();
  const { myGigs } = useSelector((state) => state.gigs);

  useEffect(() => {
    dispatch(getMyGigs());
  }, [dispatch]);

  const handleDelete = async (gigId, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      const result = await dispatch(deleteGig(gigId));
      if (result.type === 'gigs/delete/fulfilled') {
        toast.success('Gig deleted successfully');
      } else {
        toast.error('Failed to delete gig');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Posted Gigs</h1>
        <Link
          to="/create-gig"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-medium"
        >
          Post New Gig
        </Link>
      </div>

      {myGigs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-lg mb-4">You haven't posted any gigs yet</p>
          <Link
            to="/create-gig"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-medium"
          >
            Post Your First Gig
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myGigs.map((gig) => (
            <div
              key={gig._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {gig.title}
                      </h3>
                      <p className="text-gray-600 line-clamp-2 mb-3">
                        {gig.description}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                        gig.status === 'open'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {gig.status === 'open' ? 'Open' : 'Assigned'}
                    </span>
                  </div>

                  <div className="flex gap-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span className="font-semibold">${gig.budget}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(gig.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link
                    to={`/gigs/${gig._id}`}
                    className="flex items-center gap-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(gig._id, gig.title)}
                    className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGigs;
