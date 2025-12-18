import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { CalendarIcon, MapPinIcon, UsersIcon, ClockIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import { eventsApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: event, isLoading, error } = useQuery(
    ['event', id],
    () => eventsApi.getEvent(id!),
    {
      enabled: !!id,
      select: (response) => response.data
    }
  );

  const { data: capacity } = useQuery(
    ['event-capacity', id],
    () => eventsApi.getEventCapacity(id!),
    {
      enabled: !!id,
      select: (response) => response.data
    }
  );

  const registerMutation = useMutation(
    (registrationData: any) => eventsApi.registerForEvent(registrationData),
    {
      onSuccess: () => {
        toast.success('Successfully registered for event!');
        queryClient.invalidateQueries(['event-capacity', id]);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Registration failed');
      }
    }
  );

  const handleRegister = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    registerMutation.mutate({
      eventId: id,
      notes: ''
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
            <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/events')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Browse Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isRegistrationOpen = event.status === 'published' && 
    (!event.registrationDeadline || new Date(event.registrationDeadline) > new Date());

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          {event.images?.[0] && (
            <div className="h-64 bg-gray-200">
              <img
                src={event.images[0]}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {event.category}
                </span>
              </div>
              {event.isPaid && (
                <div className="text-right">
                  <div className="flex items-center text-2xl font-bold text-green-600">
                    <CurrencyRupeeIcon className="h-6 w-6" />
                    {(event.ticketPrice / 100).toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-500">per ticket</p>
                </div>
              )}
            </div>

            {/* Event Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-start space-x-3">
                <CalendarIcon className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Date & Time</p>
                  <p className="text-gray-600">
                    {new Date(event.schedule.startDate).toLocaleDateString()} at{' '}
                    {new Date(event.schedule.startDate).toLocaleTimeString()}
                  </p>
                  {event.schedule.endDate && (
                    <p className="text-gray-600">
                      Until {new Date(event.schedule.endDate).toLocaleDateString()} at{' '}
                      {new Date(event.schedule.endDate).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Location</p>
                  <p className="text-gray-600">{event.location.venue || event.location.address}</p>
                  <p className="text-gray-600">{event.location.city}, {event.location.state}</p>
                </div>
              </div>

              {capacity && (
                <div className="flex items-start space-x-3">
                  <UsersIcon className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Capacity</p>
                    <p className="text-gray-600">
                      {capacity.available === -1 ? 'Unlimited' : `${capacity.available} spots available`}
                    </p>
                    {capacity.waitlist > 0 && (
                      <p className="text-orange-600">{capacity.waitlist} on waitlist</p>
                    )}
                  </div>
                </div>
              )}

              {event.registrationDeadline && (
                <div className="flex items-start space-x-3">
                  <ClockIcon className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Registration Deadline</p>
                    <p className="text-gray-600">
                      {new Date(event.registrationDeadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Registration Button */}
            {isRegistrationOpen && (
              <div className="mb-6">
                <button
                  onClick={handleRegister}
                  disabled={registerMutation.isLoading || (capacity?.available === 0)}
                  className={`w-full md:w-auto px-8 py-3 rounded-md font-medium ${
                    capacity?.available === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } ${registerMutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {registerMutation.isLoading
                    ? 'Registering...'
                    : capacity?.available === 0
                    ? 'Join Waitlist'
                    : event.isPaid
                    ? `Register for ₹${(event.ticketPrice / 100).toFixed(2)}`
                    : 'Register for Free'
                  }
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Event Description */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About This Event</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
          </div>

          {event.requirements && event.requirements.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {event.requirements.map((requirement: string, index: number) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>
          )}

          {event.tags && event.tags.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};