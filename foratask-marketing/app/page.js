import Link from 'next/link'
import { CheckCircle, Users, Calendar, Bell, BarChart3, Shield, ArrowRight, Star, Zap } from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Assign tasks, track progress, and collaborate seamlessly with your entire team.'
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Set due dates, recurring tasks, and never miss a deadline again.'
  },
  {
    icon: Bell,
    title: 'Real-time Notifications',
    description: 'Stay updated with instant push notifications for task updates and reminders.'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Track productivity with detailed reports and performance insights.'
  },
  {
    icon: Shield,
    title: 'Multi-tenant Security',
    description: 'Enterprise-grade security with complete data isolation between companies.'
  },
  {
    icon: Zap,
    title: 'Workflow Automation',
    description: 'Automate recurring tasks and streamline your team\'s workflow.'
  }
]

const testimonials = [
  {
    quote: "ForaTask transformed how our team manages projects. The recurring task feature saves us hours every week.",
    author: "Priya Sharma",
    role: "Project Manager",
    company: "TechStart India"
  },
  {
    quote: "The best task management tool we've used. Simple, powerful, and affordable.",
    author: "Rahul Verma",
    role: "CTO",
    company: "InnovateTech"
  },
  {
    quote: "Our productivity increased by 40% after switching to ForaTask. Highly recommended!",
    author: "Anita Patel",
    role: "Operations Head",
    company: "GrowthCo"
  }
]

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-radial from-primary-900/20 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8">
              <Star className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-primary-300">90 Days Free Trial - No Credit Card Required</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Smart Task Management for{' '}
              <span className="gradient-text">Growing Teams</span>
            </h1>
            
            <p className="text-xl text-dark-300 mb-10 max-w-2xl mx-auto">
              Streamline your team's workflow with ForaTask. Create, assign, and track tasks effortlessly. 
              Built for teams who want to get more done.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl font-semibold text-lg hover:from-primary-500 hover:to-primary-400 transition-all shadow-xl shadow-primary-500/25 flex items-center justify-center gap-2"
              >
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/features"
                className="w-full sm:w-auto px-8 py-4 glass rounded-xl font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center"
              >
                View Features
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-16 flex flex-col items-center">
              <div className="flex -space-x-3 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 border-2 border-dark-950 flex items-center justify-center font-semibold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-dark-300">
                <span className="text-white font-semibold">500+</span> teams already using ForaTask
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-dark-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-xl text-dark-300 max-w-2xl mx-auto">
              Powerful features designed to help your team collaborate effectively and achieve more.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl glass hover:bg-white/10 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-dark-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Simple, Transparent{' '}
              <span className="gradient-text">Pricing</span>
            </h2>
            <p className="text-xl text-dark-300 max-w-2xl mx-auto">
              Start free, scale as you grow. Pay only for what you need.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="p-8 rounded-2xl glass border border-primary-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary-500 text-white text-sm px-4 py-1 rounded-bl-lg font-medium">
                Most Popular
              </div>
              
              <h3 className="text-2xl font-bold mb-2">Team Plan</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold">₹249</span>
                <span className="text-dark-300">/month</span>
              </div>
              
              <p className="text-dark-300 mb-6">
                Includes 5 team members. Additional users at ₹50/user/month.
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  '90 Days Free Trial',
                  'Unlimited Tasks',
                  'Recurring Tasks',
                  'Real-time Notifications',
                  'Analytics Dashboard',
                  'Priority Support'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link
                href="/signup"
                className="block w-full py-4 text-center bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl font-semibold hover:from-primary-500 hover:to-primary-400 transition-all"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
          
          <p className="text-center text-dark-400 mt-8">
            <Link href="/pricing" className="text-primary-400 hover:underline">
              View detailed pricing →
            </Link>
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-dark-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Loved by{' '}
              <span className="gradient-text">Teams</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-8 rounded-2xl glass">
                <p className="text-lg mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-dark-400 text-sm">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Transform Your{' '}
            <span className="gradient-text">Workflow?</span>
          </h2>
          <p className="text-xl text-dark-300 mb-10">
            Join hundreds of teams already using ForaTask. Start your 90-day free trial today.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl font-semibold text-lg hover:from-primary-500 hover:to-primary-400 transition-all shadow-xl shadow-primary-500/25"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  )
}
