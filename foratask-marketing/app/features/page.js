import { CheckSquare, Users, Calendar, Bell, Repeat, BarChart3, Shield, Clock, Target, Smartphone } from 'lucide-react'

export const metadata = {
  title: 'Features - ForaTask',
  description: 'Explore ForaTask features: task management, team collaboration, recurring tasks, notifications, and analytics.',
}

const features = [
  {
    icon: CheckSquare,
    title: 'Task Management',
    description: 'Create, assign, and organize tasks with priorities, due dates, and detailed descriptions. Keep everything in one place.',
    highlights: ['Priority levels', 'Due date tracking', 'Task descriptions', 'File attachments']
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work together seamlessly. Assign tasks to team members, add observers, and track who\'s working on what.',
    highlights: ['Task assignment', 'Observer mode', 'Team visibility', 'Role-based access']
  },
  {
    icon: Repeat,
    title: 'Recurring Tasks',
    description: 'Automate repetitive work with recurring tasks. Set daily, weekly, monthly, or quarterly schedules.',
    highlights: ['Daily recurrence', 'Weekly schedules', 'Monthly tasks', 'Quarterly reviews']
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Never miss a deadline with real-time push notifications. Get alerts for assignments, updates, and due dates.',
    highlights: ['Push notifications', 'Reminder alerts', 'Assignment updates', 'Deadline warnings']
  },
  {
    icon: Target,
    title: 'Self Tasks',
    description: 'Create personal tasks that only you can see. Perfect for individual goals and personal reminders.',
    highlights: ['Private tasks', 'Personal goals', 'Auto-complete', 'No approval needed']
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track productivity with detailed reports. View task completion rates, team performance, and trends.',
    highlights: ['Completion rates', 'Team insights', 'Performance trends', 'Export reports']
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Multi-tenant architecture with complete data isolation. Your data is safe and separate from other companies.',
    highlights: ['Data isolation', 'Secure access', 'Role permissions', 'Audit trails']
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Access ForaTask anywhere with our mobile app. Manage tasks on the go with full functionality.',
    highlights: ['iOS app', 'Android app', 'Offline access', 'Sync across devices']
  }
]

export default function Features() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Powerful Features for{' '}
            <span className="gradient-text">Productive Teams</span>
          </h1>
          <p className="text-xl text-dark-300 max-w-3xl mx-auto">
            Everything you need to manage tasks, collaborate with your team, and track progress - all in one beautiful platform.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-8 rounded-2xl glass hover:bg-white/10 transition-all">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-7 h-7 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-dark-300 mb-4">{feature.description}</p>
                    <ul className="grid grid-cols-2 gap-2">
                      {feature.highlights.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-dark-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-dark-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-dark-300 mb-8">
            Try ForaTask free for 90 days. No credit card required.
          </p>
          <a
            href="/signup"
            className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl font-semibold text-lg hover:from-primary-500 hover:to-primary-400 transition-all shadow-xl shadow-primary-500/25"
          >
            Start Free Trial
          </a>
        </div>
      </section>
    </div>
  )
}
