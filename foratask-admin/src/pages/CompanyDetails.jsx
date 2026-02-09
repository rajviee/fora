import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../context/AuthContext'
import { ArrowLeft, Building2, Users, Calendar, CreditCard, Lock, Unlock, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export default function CompanyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [payments, setPayments] = useState([])
  const [taskStats, setTaskStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [extendDays, setExtendDays] = useState(7)
  const [restrictReason, setRestrictReason] = useState('')
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [showRestrictModal, setShowRestrictModal] = useState(false)

  const fetchCompanyDetails = async () => {
    try {
      const response = await api.get(`/master-admin/companies/${id}`)
      setCompany(response.data.company)
      setSubscription(response.data.subscription)
      setPayments(response.data.payments)
      setTaskStats(response.data.taskStats)
    } catch (error) {
      console.error('Failed to fetch company details:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanyDetails()
  }, [id])

  const handleExtendTrial = async () => {
    setActionLoading(true)
    try {
      await api.post(`/master-admin/companies/${id}/extend-trial`, { days: extendDays })
      setShowExtendModal(false)
      fetchCompanyDetails()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to extend trial')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRestrict = async () => {
    setActionLoading(true)
    try {
      await api.post(`/master-admin/companies/${id}/restrict`, { reason: restrictReason })
      setShowRestrictModal(false)
      setRestrictReason('')
      fetchCompanyDetails()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to restrict company')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnrestrict = async () => {
    setActionLoading(true)
    try {
      await api.post(`/master-admin/companies/${id}/unrestrict`)
      fetchCompanyDetails()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to unrestrict company')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Company not found</p>
        <button onClick={() => navigate('/companies')} className="mt-4 text-primary-400 hover:underline">
          Back to Companies
        </button>
      </div>
    )
  }

  const getStatusBadge = (status) => {
    const styles = {
      trial: 'bg-blue-500/20 text-blue-400',
      active: 'bg-green-500/20 text-green-400',
      expired: 'bg-yellow-500/20 text-yellow-400',
      cancelled: 'bg-red-500/20 text-red-400',
    }
    return styles[status] || 'bg-slate-500/20 text-slate-400'
  }

  return (
    <div className="space-y-6" data-testid="company-details-page">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/companies')}
          className="p-2 rounded-lg bg-dark-100 hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{company.companyName}</h1>
          <p className="text-slate-400">{company.companyEmail}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {(subscription?.status === 'trial' || subscription?.status === 'expired') && (
          <button
            onClick={() => setShowExtendModal(true)}
            className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors flex items-center gap-2"
            data-testid="extend-trial-btn"
          >
            <Clock size={18} /> Extend Trial
          </button>
        )}
        {subscription?.isManuallyRestricted ? (
          <button
            onClick={handleUnrestrict}
            disabled={actionLoading}
            className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
            data-testid="unrestrict-btn"
          >
            <Unlock size={18} /> Unrestrict
          </button>
        ) : (
          <button
            onClick={() => setShowRestrictModal(true)}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
            data-testid="restrict-btn"
          >
            <Lock size={18} /> Restrict
          </button>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Company Info */}
        <div className="bg-dark-100 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 size={20} className="text-primary-400" />
            Company Info
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-400">Contact</p>
              <p>{company.companyContactNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Address</p>
              <p>{company.companyAddress || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">GST Number</p>
              <p>{company.companyGSTNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Created</p>
              <p>{new Date(company.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        <div className="bg-dark-100 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-primary-400" />
            Subscription
          </h2>
          {subscription ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(subscription.status)}`}>
                  {subscription.status}
                </span>
                {subscription.isManuallyRestricted && (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400">
                    Restricted
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm text-slate-400">Plan</p>
                <p className="capitalize">{subscription.planType?.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Users</p>
                <p>{subscription.currentUserCount}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Monthly Bill</p>
                <p className="text-xl font-bold text-primary-400">₹{subscription.totalAmount}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">
                  {subscription.status === 'trial' ? 'Trial Ends' : 'Current Period Ends'}
                </p>
                <p>
                  {new Date(subscription.trialEndDate || subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">No subscription</p>
          )}
        </div>

        {/* Task Stats */}
        <div className="bg-dark-100 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-primary-400" />
            Task Statistics
          </h2>
          {taskStats ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-dark-200 rounded-lg">
                <p className="text-2xl font-bold">{taskStats.total}</p>
                <p className="text-sm text-slate-400">Total</p>
              </div>
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <p className="text-2xl font-bold text-green-400">{taskStats.completed}</p>
                <p className="text-sm text-slate-400">Completed</p>
              </div>
              <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                <p className="text-2xl font-bold text-yellow-400">{taskStats.pending}</p>
                <p className="text-sm text-slate-400">Pending</p>
              </div>
              <div className="text-center p-3 bg-red-500/10 rounded-lg">
                <p className="text-2xl font-bold text-red-400">{taskStats.overdue}</p>
                <p className="text-sm text-slate-400">Overdue</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">No task data</p>
          )}
        </div>
      </div>

      {/* Users */}
      <div className="bg-dark-100 rounded-xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users size={20} className="text-primary-400" />
          Team Members ({company.employeeCount})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {company.owners?.map((owner) => (
            <div key={owner._id} className="p-4 bg-dark-200 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                <Users size={18} className="text-primary-400" />
              </div>
              <div>
                <p className="font-medium">{owner.firstName} {owner.lastName}</p>
                <p className="text-sm text-slate-400">{owner.email}</p>
                <span className="text-xs text-primary-400">Admin</span>
              </div>
            </div>
          ))}
          {company.employees?.slice(0, 5).map((emp) => (
            <div key={emp._id} className="p-4 bg-dark-200 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-500/20 flex items-center justify-center">
                <Users size={18} className="text-slate-400" />
              </div>
              <div>
                <p className="font-medium">{emp.firstName} {emp.lastName}</p>
                <p className="text-sm text-slate-400">{emp.email}</p>
                <span className="text-xs text-slate-400 capitalize">{emp.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-dark-100 rounded-xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard size={20} className="text-primary-400" />
          Payment History
        </h2>
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-slate-400">
                  <th className="pb-3">Invoice</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="py-3">{payment.invoiceNumber}</td>
                    <td className="py-3">₹{payment.amount}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        payment.status === 'success' ? 'bg-green-500/20 text-green-400' :
                        payment.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4">No payment history</p>
        )}
      </div>

      {/* Extend Trial Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-100 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <h3 className="text-xl font-semibold mb-4">Extend Trial Period</h3>
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Number of Days</label>
              <input
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(parseInt(e.target.value) || 0)}
                min="1"
                max="90"
                className="w-full px-4 py-2 bg-dark-200 border border-slate-600 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExtendModal(false)}
                className="flex-1 px-4 py-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExtendTrial}
                disabled={actionLoading || extendDays < 1}
                className="flex-1 px-4 py-2 bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Extending...' : 'Extend'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restrict Modal */}
      {showRestrictModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-100 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="text-red-400" size={24} />
              Restrict Company
            </h3>
            <p className="text-slate-400 mb-4">This will block all users from accessing the system.</p>
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Reason (optional)</label>
              <textarea
                value={restrictReason}
                onChange={(e) => setRestrictReason(e.target.value)}
                rows="3"
                className="w-full px-4 py-2 bg-dark-200 border border-slate-600 rounded-lg focus:outline-none focus:border-primary-500 resize-none"
                placeholder="Enter reason for restriction..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRestrictModal(false)}
                className="flex-1 px-4 py-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRestrict}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Restricting...' : 'Restrict'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
