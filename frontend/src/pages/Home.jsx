import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Briefcase, TrendingUp, Shield, Zap } from 'lucide-react';

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold mb-6">
              Welcome to GigFlow
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              The modern freelance marketplace connecting clients with talented
              freelancers
            </p>
            <div className="flex justify-center space-x-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary-50 transition"
                  >
                    Browse Gigs
                  </Link>
                  <Link
                    to="/create-gig"
                    className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary-900 transition border-2 border-white"
                  >
                    Post a Gig
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary-50 transition"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary-900 transition border-2 border-white"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Why Choose GigFlow?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Briefcase className="h-10 w-10" />}
            title="Easy Job Posting"
            description="Post your projects in minutes and receive bids from qualified freelancers"
          />
          <FeatureCard
            icon={<TrendingUp className="h-10 w-10" />}
            title="Smart Bidding"
            description="Freelancers can submit competitive bids with custom proposals"
          />
          <FeatureCard
            icon={<Shield className="h-10 w-10" />}
            title="Secure Hiring"
            description="Transaction-based hiring system prevents race conditions"
          />
          <FeatureCard
            icon={<Zap className="h-10 w-10" />}
            title="Real-time Updates"
            description="Get instant notifications when you're hired or a bid is accepted"
          />
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Post or Browse"
              description="Clients post gigs, freelancers browse available opportunities"
            />
            <StepCard
              number="2"
              title="Submit Bids"
              description="Freelancers submit competitive bids with custom messages"
            />
            <StepCard
              number="3"
              title="Get Hired"
              description="Clients review bids and hire the perfect freelancer instantly"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="bg-primary-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 text-primary-100">
              Join thousands of clients and freelancers on GigFlow today
            </p>
            <Link
              to="/register"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary-50 transition inline-block"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition text-center">
    <div className="flex justify-center text-primary-600 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const StepCard = ({ number, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md text-center">
    <div className="inline-block bg-primary-600 text-white rounded-full h-12 w-12 flex items-center justify-center text-xl font-bold mb-4">
      {number}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Home;
