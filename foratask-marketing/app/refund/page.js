export const metadata = {
  title: 'Refund Policy - ForaTask',
  description: 'ForaTask refund policy - understanding our no partial month refund policy.',
}

export default function Refund() {
  return (
    <div className="pt-24 pb-16">
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
          <p className="text-dark-400 mb-8">Last updated: January 2026</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <div className="p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <h2 className="text-xl font-semibold mb-2 text-yellow-400">Important Notice</h2>
              <p className="text-dark-300">
                ForaTask does not provide refunds for partial billing periods. Please read this policy carefully before subscribing.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-semibold mb-4">1. No Partial Month Refunds</h2>
              <p className="text-dark-300 mb-4">
                Subscriptions are billed for the full billing cycle, regardless of the signup date or cancellation date. We do not prorate or refund for partial months.
              </p>
              <p className="text-dark-300">
                <strong>Example:</strong> If you pay on February 29 and cancel on March 2, no refund will be issued. You will have access until your next billing date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Billing Date Anchoring</h2>
              <p className="text-dark-300 mb-4">
                Your billing date is anchored to the original purchase date:
              </p>
              <ul className="list-disc list-inside text-dark-300 space-y-2">
                <li>If you subscribe on January 31, your next billing will be February 28 (or 29 in a leap year)</li>
                <li>If you subscribe on the 15th, you will be billed on the 15th of each month</li>
                <li>We adjust for months with fewer days automatically</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Free Trial Period</h2>
              <p className="text-dark-300">
                We offer a generous 90-day free trial with full access to all features. This allows you to thoroughly evaluate ForaTask before committing to a paid subscription. No credit card is required during the trial.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Cancellation</h2>
              <p className="text-dark-300 mb-4">
                You can cancel your subscription at any time:
              </p>
              <ul className="list-disc list-inside text-dark-300 space-y-2">
                <li>Go to Settings > Subscription > Cancel Subscription</li>
                <li>Your access continues until the end of the current billing period</li>
                <li>No additional charges will be made after cancellation</li>
                <li>Your data will be preserved for 30 days after expiration</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Exceptional Circumstances</h2>
              <p className="text-dark-300 mb-4">
                Refunds may be considered in exceptional circumstances:
              </p>
              <ul className="list-disc list-inside text-dark-300 space-y-2">
                <li>Duplicate charges due to technical errors</li>
                <li>Extended service outages (>24 hours)</li>
                <li>Billing errors on our part</li>
              </ul>
              <p className="text-dark-300 mt-4">
                To request a review, contact support@foratask.com within 7 days of the charge.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Company Deletion</h2>
              <p className="text-dark-300">
                When a company account is deleted, all active subscriptions are automatically cancelled. No refund is provided for the remaining billing period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
              <p className="text-dark-300">
                If you have questions about our refund policy or believe you qualify for an exception:
              </p>
              <p className="text-dark-300 mt-2">
                Email: support@foratask.com<br />
                Response time: Within 24 business hours
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}
