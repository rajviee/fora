'use client'
import { useState } from 'react'
import { Mail, Lock, ExternalLink } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      // Store token and redirect to app
      localStorage.setItem('token', data.token)
      window.location.href = process.env.NEXT_PUBLIC_APP_URL || '/'
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-dark-400">Sign in to your ForaTask account</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-dark-900 border border-dark-700 rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-dark-900 border border-dark-700 rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl font-semibold hover:from-primary-500 hover:to-primary-400 transition-all disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a 
              href={process.env.NEXT_PUBLIC_APP_URL || '#'}
              className="inline-flex items-center gap-2 text-primary-400 hover:underline"
            >
              Open Mobile App <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <p className="text-center text-dark-400 mt-6">
          Don't have an account?{' '}
          <a href="/signup" className="text-primary-400 hover:underline">Start free trial</a>
        </p>
      </div>
    </div>
  )
}
