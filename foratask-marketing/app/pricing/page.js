'use client'
import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Minus, Calculator } from 'lucide-react'

export default function Pricing() {
  const [userCount, setUserCount] = useState(5)
  
  const basePrice = 249
  const perUserPrice = 50
  const baseUsers = 5
  
  const calculatePrice = () => {
    if (userCount <= baseUsers) return basePrice
    return basePrice + ((userCount - baseUsers) * perUserPrice)
  }

  const included = [
    'Unlimited Tasks',
    'Recurring Tasks (Daily, Weekly, Monthly, Quarterly)',
    'Task Assignment & Observers',
    'Self Tasks (Private)',
    'File Attachments',
    'Real-time Push Notifications',
    'Analytics Dashboard',
    'Mobile Apps (iOS & Android)',
    'Email Support',
    '99.9% Uptime SLA'
  ]

  const notIncluded = [
    'White-label Branding',
    'Custom Integrations',
    'Dedicated Account Manager'
  ]

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Simple, Transparent{' '}
            <span className="gradient-text">Pricing</span>
          </h1>
          <p className="text-xl text-dark-300 max-w-3xl mx-auto">
            Start with a 90-day free trial. No credit card required. Pay only for the users you need.
          </p>
        </div>
      </section>

      {/* Pricing Calculator */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Calculator */}
            <div className="p-8 rounded-2xl glass">
              <div className="flex items-center gap-3 mb-6">
                <Calculator className="w-6 h-6 text-primary-400" />
                <h2 className="text-xl font-semibold">Price Calculator</h2>
              </div>
              
              <div className="mb-6">
                <label className="block text-dark-300 mb-2">Team Size</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={userCount}
                    onChange={(e) => setUserCount(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="w-16 text-center text-2xl font-bold">{userCount}</span>
                </div>
                <p className="text-sm text-dark-400 mt-2">users</p>
              </div>

              <div className="p-6 rounded-xl bg-dark-900/50">
                <p className="text-dark-300 mb-2">Monthly Cost</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">₹{calculatePrice()}</span>
                  <span className="text-dark-300">/month</span>
                </div>
                <p className="text-sm text-dark-400 mt-4">
                  {userCount <= baseUsers 
                    ? `Base plan includes ${baseUsers} users`
                    : `₹${basePrice} base + ₹${(userCount - baseUsers) * perUserPrice} (${userCount - baseUsers} extra users)`
                  }
                </p>
              </div>
            </div>

            {/* Plan Details */}
            <div className="p-8 rounded-2xl glass border border-primary-500/30">
              <div className="absolute top-0 right-0 bg-primary-500 text-white text-sm px-4 py-1 rounded-bl-lg font-medium">
                90 Days Free
              </div>
              
              <h2 className="text-2xl font-bold mb-2">Team Plan</h2>
              <p className="text-dark-300 mb-6">
                Everything you need to manage your team's tasks effectively.
              </p>
              
              <div className="space-y-3 mb-8">
                {included.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent-500 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <p className="text-sm text-dark-400 mb-4">Coming Soon:</p>
              <div className="space-y-2 mb-8">
                {notIncluded.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-dark-400">
                    <Minus className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
              
              <Link
                href="/signup"
                className="block w-full py-4 text-center bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl font-semibold hover:from-primary-500 hover:to-primary-400 transition-all"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Billing Info */}
      <section className="py-16 px-4 bg-dark-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Billing Information</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl glass">
              <h3 className="font-semibold mb-3">Free Trial</h3>
              <p className="text-dark-300 text-sm">
                Start with a full-featured 90-day free trial. No credit card required to get started.
              </p>
            </div>
            <div className="p-6 rounded-xl glass">
              <h3 className="font-semibold mb-3">Monthly Billing</h3>
              <p className="text-dark-300 text-sm">
                Subscriptions are billed monthly on the anniversary of your signup date.
              </p>
            </div>
            <div className="p-6 rounded-xl glass">
              <h3 className="font-semibold mb-3">No Refunds</h3>
              <p className="text-dark-300 text-sm">
                We do not offer refunds for partial months. Cancel anytime before your next billing date.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="p-6 rounded-xl glass">
              <h3 className="font-semibold mb-2">What happens after the free trial?</h3>
              <p className="text-dark-300">After 90 days, you'll need to subscribe to continue using ForaTask. Your data will be preserved, and admins will have read-only access until you subscribe.</p>
            </div>
            <div className="p-6 rounded-xl glass">
              <h3 className="font-semibold mb-2">Can I add more users later?</h3>
              <p className="text-dark-300">Yes! You can add users anytime. The additional cost (₹50/user/month) will be reflected in your next billing cycle.</p>
            </div>
            <div className="p-6 rounded-xl glass">
              <h3 className="font-semibold mb-2">How do I cancel my subscription?</h3>
              <p className="text-dark-300">You can cancel anytime from your account settings. Your access continues until the end of your current billing period.</p>
            </div>
            <div className="p-6 rounded-xl glass">
              <h3 className="font-semibold mb-2">Is my data secure?</h3>
              <p className="text-dark-300">Absolutely. ForaTask uses enterprise-grade security with complete data isolation between companies. Your data is never shared or accessible to other users.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
