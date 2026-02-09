export const metadata = {
  title: 'Privacy Policy - ForaTask',
  description: 'ForaTask privacy policy - how we collect, use, and protect your data.',
}

export default function Privacy() {
  return (
    <div className="pt-24 pb-16">
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-dark-400 mb-8">Last updated: January 2026</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="text-dark-300 mb-4">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-dark-300 space-y-2">
                <li>Account information (name, email, password)</li>
                <li>Company information (company name, address, GST/PAN numbers)</li>
                <li>Task and project data you create</li>
                <li>Payment information (processed securely via Razorpay)</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="text-dark-300 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-dark-300 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Analyze usage patterns to improve user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
              <p className="text-dark-300 mb-4">
                ForaTask uses a multi-tenant architecture with complete data isolation between companies. Your data is stored securely and is never accessible to other users or companies.
              </p>
              <p className="text-dark-300">
                We implement industry-standard security measures including encryption, secure access controls, and regular security audits.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Retention</h2>
              <p className="text-dark-300">
                We retain your information for as long as your account is active or as needed to provide services. If you delete your account, we will delete your data within 30 days, except where we are required to retain it by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
              <p className="text-dark-300 mb-4">
                We use third-party services for:
              </p>
              <ul className="list-disc list-inside text-dark-300 space-y-2">
                <li>Payment processing (Razorpay)</li>
                <li>Push notifications (Expo)</li>
                <li>Analytics and monitoring</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
              <p className="text-dark-300 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-dark-300 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
              <p className="text-dark-300">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-dark-300 mt-2">
                Email: privacy@foratask.com<br />
                Address: Bangalore, India
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}
