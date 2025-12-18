import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> December 16, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using the Community Event Board platform, you accept and agree to be bound by 
                the terms and provision of this agreement. If you do not agree to abide by the above, 
                please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                Community Event Board is a platform that connects event organizers with community members. 
                Our service includes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Event discovery and registration</li>
                <li>Event creation and management tools</li>
                <li>Payment processing for paid events</li>
                <li>Communication tools between organizers and attendees</li>
                <li>Analytics and reporting features</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 mb-4">
                To use certain features of our service, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Keep your account information updated</li>
                <li>Maintain the security of your password</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Event Organizer Responsibilities</h2>
              <p className="text-gray-700 mb-4">
                As an event organizer, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide accurate event information</li>
                <li>Honor all event registrations and payments</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Maintain appropriate insurance and permits</li>
                <li>Handle refunds according to your stated policy</li>
                <li>Communicate changes to attendees promptly</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Attendee Responsibilities</h2>
              <p className="text-gray-700 mb-4">
                As an event attendee, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide accurate registration information</li>
                <li>Follow event rules and guidelines</li>
                <li>Respect other attendees and organizers</li>
                <li>Understand refund policies before registering</li>
                <li>Attend events you've registered for when possible</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Payment Terms</h2>
              <p className="text-gray-700 mb-4">
                For paid events and subscriptions:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>All payments are processed securely through Razorpay</li>
                <li>Prices are displayed in Indian Rupees (INR)</li>
                <li>Platform fees may apply to ticket sales</li>
                <li>Refunds are subject to organizer policies</li>
                <li>Subscription fees are billed monthly</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">
                You may not use our service to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful or malicious content</li>
                <li>Spam or harass other users</li>
                <li>Create fake accounts or events</li>
                <li>Attempt to gain unauthorized access</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Content and Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                You retain ownership of content you create, but grant us a license to use it on our platform. 
                You agree that your content:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Does not violate any third-party rights</li>
                <li>Is accurate and not misleading</li>
                <li>Complies with our community guidelines</li>
                <li>May be moderated or removed if inappropriate</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700">
                Our platform facilitates connections between organizers and attendees. We are not responsible 
                for the quality, safety, or legality of events. Users participate at their own risk.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-700">
                We may terminate or suspend accounts that violate these terms. Users may delete their 
                accounts at any time through their profile settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these terms at any time. Users will be notified of 
                significant changes via email or platform notifications.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700">
                For questions about these Terms of Service, contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@communityevents.com<br />
                  <strong>Address:</strong> 123 Tech Park, Bangalore, Karnataka 560001, India
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};