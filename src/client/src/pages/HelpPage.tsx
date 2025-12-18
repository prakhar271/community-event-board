import React from 'react';
import { MagnifyingGlassIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export const HelpPage: React.FC = () => {
  const faqs = [
    {
      question: 'How do I create an event?',
      answer: 'To create an event, you need to register as an organizer. Once registered, go to your dashboard and click "Create Event". Fill in all the required details including title, description, location, date, and pricing information.'
    },
    {
      question: 'How do I register for an event?',
      answer: 'Browse events on the Events page, click on an event you\'re interested in, and click the "Register" button. For paid events, you\'ll be redirected to complete the payment process.'
    },
    {
      question: 'Can I cancel my event registration?',
      answer: 'Yes, you can cancel your registration from your dashboard. Refund policies depend on the event organizer\'s terms and how close to the event date you cancel.'
    },
    {
      question: 'How do I become an event organizer?',
      answer: 'You can upgrade your account to an organizer account from your profile settings. Organizers can create and manage events, view analytics, and access additional features.'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept all major credit cards, debit cards, UPI, and net banking through our secure Razorpay payment gateway.'
    },
    {
      question: 'How do I get a refund?',
      answer: 'Refunds are processed according to the event organizer\'s refund policy. Contact the organizer directly or reach out to our support team for assistance.'
    },
    {
      question: 'Can I edit my event after publishing?',
      answer: 'Yes, you can edit most event details after publishing. However, major changes like date, time, or location should be communicated to registered attendees.'
    },
    {
      question: 'How do I contact attendees?',
      answer: 'Organizers can send notifications to all registered attendees through the event management dashboard. We also provide email templates for common communications.'
    }
  ];

  const guides = [
    {
      title: 'Getting Started Guide',
      description: 'Learn the basics of using our platform',
      topics: ['Creating an account', 'Setting up your profile', 'Finding events', 'Basic navigation']
    },
    {
      title: 'Organizer Guide',
      description: 'Complete guide for event organizers',
      topics: ['Creating events', 'Managing registrations', 'Payment processing', 'Analytics dashboard']
    },
    {
      title: 'Attendee Guide',
      description: 'How to make the most of events',
      topics: ['Registering for events', 'Payment process', 'Event notifications', 'Providing feedback']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions and learn how to use our platform
          </p>
        </div>

        {/* Search */}
        <div className="mb-12">
          <div className="relative max-w-xl mx-auto">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Guides */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guides.map((guide, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{guide.title}</h3>
                <p className="text-gray-600 mb-4">{guide.description}</p>
                <ul className="space-y-2">
                  {guide.topics.map((topic, topicIndex) => (
                    <li key={topicIndex} className="text-sm text-gray-700 flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                      {topic}
                    </li>
                  ))}
                </ul>
                <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Read Guide →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <details className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer">
                    <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                    <QuestionMarkCircleIcon className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still need help?</h2>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};