import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  CalendarIcon, 
  UsersIcon, 
  CurrencyRupeeIcon, 
  PlusIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import { eventsApi, paymentsApi } from '../services/api';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  // Fetch user's events (for organizers) or registrations (for residents)
  const { data: userEvents } = useQuery(
    ['user-events'],
    () => user?.role === 'organizer' ? eventsApi.getMyEvents({}) : null,
    {
      enabled: user?.role === 'organizer',
      select: (response) => response?.data
    }
  );

  const { data: userRegistrations } = useQuery(
    ['user-registrations'],
    () => user?.role === 'resident' ? eventsApi.getUserRegistrations() : null,
    {
      enabled: user?.role === 'resident',
      select: (response) => response?.data
    }
  );

  const { data: subscription } = useQuery(
    ['subscription'],
    () => user?.role === 'organizer' ? paymentsApi.getSubscription() : null,
    {
      enabled: user?.role === 'organizer',
      select: (response) => response?.data
    }
  );

  const isOrganizer = user?.role === 'organizer';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            {isOrganizer 
              ? 'Manage your events and track performance' 
              : 'Discover and manage your event registrations'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isOrganizer ? (
            <>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <CalendarIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userEvents?.data?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <UsersIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Attendees</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <CurrencyRupeeIcon className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹0</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Current Plan</p>
                    <p className="text-2xl font-bold text-gray-900 capitalize">
                      {subscription?.planType || 'Free'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <CalendarIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Registered Events</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userRegistrations?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <ClockIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <UsersIcon className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Events Attended</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Reviews Given</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Events/Registrations */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  {isOrganizer ? 'Recent Events' : 'My Registrations'}
                </h2>
                {isOrganizer && (
                  <Link
                    to="/create-event"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Create Event
                  </Link>
                )}
              </div>
              <div className="p-6">
                {(isOrganizer ? userEvents?.data : userRegistrations)?.length > 0 ? (
                  <div className="space-y-4">
                    {(isOrganizer ? userEvents.data : userRegistrations).slice(0, 5).map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {isOrganizer ? item.title : item.event?.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {isOrganizer 
                              ? `${item.status} • ${item.category}`
                              : `Status: ${item.status}`
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(isOrganizer ? item.createdAt : item.registeredAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {isOrganizer ? 'No events yet' : 'No registrations yet'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {isOrganizer 
                        ? 'Get started by creating your first event.'
                        : 'Browse events and register for ones you like.'
                      }
                    </p>
                    <div className="mt-6">
                      <Link
                        to={isOrganizer ? "/create-event" : "/events"}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        {isOrganizer ? 'Create Event' : 'Browse Events'}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {isOrganizer ? (
                  <>
                    <Link
                      to="/create-event"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      Create New Event
                    </Link>
                    <Link
                      to="/events/my"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      Manage Events
                    </Link>
                    <Link
                      to="/analytics"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      View Analytics
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/events"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      Browse Events
                    </Link>
                    <Link
                      to="/profile"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      Update Profile
                    </Link>
                    <Link
                      to="/notifications"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      Notification Settings
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Subscription Info for Organizers */}
            {isOrganizer && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Current Plan: <span className="font-medium capitalize">{subscription?.planType || 'Free'}</span>
                  </p>
                  {subscription?.endDate && (
                    <p className="text-sm text-gray-600">
                      Expires: {new Date(subscription.endDate).toLocaleDateString()}
                    </p>
                  )}
                  <Link
                    to="/subscription"
                    className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-500"
                  >
                    Manage Subscription →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};