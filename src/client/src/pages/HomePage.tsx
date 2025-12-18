import React from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, CalendarIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline';

export const HomePage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Discover Amazing Events
              <br />
              <span className="text-yellow-300">In Your Community</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Find cultural events, meetups, workshops, and more happening around you. 
              Connect with your local community and create memorable experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/events"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                Explore Events
              </Link>
              <Link
                to="/register"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Community Event Board?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make it easy to discover, organize, and attend local events that matter to you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MagnifyingGlassIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Discovery</h3>
              <p className="text-gray-600">
                Find events based on your interests, location, and schedule with our intelligent search.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Planning</h3>
              <p className="text-gray-600">
                Create and manage events with our intuitive tools. Handle registrations and payments seamlessly.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Local Focus</h3>
              <p className="text-gray-600">
                Connect with your neighborhood. Discover what's happening within walking distance.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community</h3>
              <p className="text-gray-600">
                Build meaningful connections with like-minded people in your area.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore Event Categories
            </h2>
            <p className="text-lg text-gray-600">
              From cultural festivals to tech meetups, find events that match your interests.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { name: 'Cultural', emoji: '🎭', color: 'bg-red-100 text-red-600' },
              { name: 'Educational', emoji: '📚', color: 'bg-blue-100 text-blue-600' },
              { name: 'Social', emoji: '🎉', color: 'bg-green-100 text-green-600' },
              { name: 'Sports', emoji: '⚽', color: 'bg-orange-100 text-orange-600' },
              { name: 'Technology', emoji: '💻', color: 'bg-purple-100 text-purple-600' },
              { name: 'Business', emoji: '💼', color: 'bg-gray-100 text-gray-600' },
              { name: 'Health', emoji: '🏥', color: 'bg-pink-100 text-pink-600' },
              { name: 'Arts', emoji: '🎨', color: 'bg-indigo-100 text-indigo-600' },
              { name: 'Music', emoji: '🎵', color: 'bg-yellow-100 text-yellow-600' },
              { name: 'Food', emoji: '🍽️', color: 'bg-red-100 text-red-600' }
            ].map((category) => (
              <Link
                key={category.name}
                to={`/events?category=${category.name.toLowerCase()}`}
                className={`${category.color} p-6 rounded-lg text-center hover:shadow-lg transition-shadow`}
              >
                <div className="text-3xl mb-2">{category.emoji}</div>
                <div className="font-semibold">{category.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of community members who are already discovering and creating amazing events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Sign Up Free
            </Link>
            <Link
              to="/events"
              className="bg-transparent border-2 border-gray-300 text-gray-300 hover:bg-gray-300 hover:text-gray-900 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};