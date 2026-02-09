export const metadata = {
  title: 'Terms of Service - ForaTask',
  description: 'ForaTask terms of service - rules and guidelines for using our platform.',
}

export default function Terms() {
  return (
    <div className="pt-24 pb-16">
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <p className="text-dark-400 mb-8">Last updated: January 2026</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-dark-300">
                By accessing or using ForaTask, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-dark-300">
                ForaTask is a multi-tenant task management platform that enables teams to create, assign, and track tasks. The service includes web and mobile applications, notifications, analytics, and related features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <ul className="list-disc list-inside text-dark-300 space-y-2">
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the security of your account credentials</li>
                <li>You must notify us immediately of any unauthorized access</li>
                <li>One company account per organization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Subscription and Payment</h2>
              <ul className="list-disc list-inside text-dark-300 space-y-2">
                <li>Free trial period: 90 days with full features</li>
                <li>Base plan: ₹249/month for up to 5 users</li>
                <li>Additional users: ₹50/user/month</li>
                <li>Billing is monthly on your subscription anniversary date</li>
                <li>All payments are processed securely through Razorpay</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Cancellation</h2>
              <p className="text-dark-300">
                You may cancel your subscription at any time from your account settings. Upon cancellation, you will retain access until the end of your current billing period. We do not provide refunds for partial billing periods.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Acceptable Use</h2>
              <p className="text-dark-300 mb-4">You agree not to:</p>
              <ul className="list-disc list-inside text-dark-300 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Upload malicious code or content</li>
                <li>Attempt to access other users' data</li>
                <li>Use the service for illegal activities</li>
                <li>Resell or redistribute the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data Ownership</h2>
              <p className="text-dark-300">
                You retain ownership of all data you upload to ForaTask. We do not claim any ownership rights over your content. You grant us a limited license to process and store your data solely to provide our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Service Availability</h2>
              <p className="text-dark-300">
                We strive for 99.9% uptime but do not guarantee uninterrupted service. We may perform maintenance with reasonable notice. We are not liable for any damages resulting from service interruptions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="text-dark-300">
                ForaTask is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
              <p className="text-dark-300">
                We may update these terms from time to time. We will notify you of significant changes via email or in-app notification. Continued use of the service constitutes acceptance of updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
              <p className="text-dark-300">
                For questions about these Terms of Service, contact us at: legal@foratask.com
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}
