import { useEffect, useState } from 'react'
import { api } from '../context/AuthContext'
import { CreditCard, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [totals, setTotals] = useState({ totalRevenue: 0, totalPayments: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({ page: 0, totalPages: 1, total: 0 })

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('page', pagination.page)
      params.append('limit', 20)
      if (statusFilter) params.append('status', statusFilter)

      const response = await api.get(`/master-admin/payments?${params}`)
      setPayments(response.data.payments)
      setTotals(response.data.totals)
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.pagination.totalPages,
        total: response.data.pagination.total
      }))
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [pagination.page, statusFilter])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="text-green-400" size={16} />
      case 'failed': return <XCircle className="text-red-400" size={16} />
      default: return <Clock className="text-yellow-400" size={16} />
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'success': return 'bg-green-500/20 text-green-400'
      case 'failed': return 'bg-red-500/20 text-red-400'
      case 'refunded': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-yellow-500/20 text-yellow-400'
    }
  }

  return (
    <div className="space-y-6" data-testid="payments-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Payments</h1>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPagination(prev => ({ ...prev, page: 0 }))
          }}
          className="px-4 py-2 bg-dark-100 border border-slate-600 rounded-lg focus:outline-none focus:border-primary-500 text-white"
          data-testid="payment-status-filter"
        >
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-dark-100 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="text-green-400" size={24} />
            <span className="text-slate-400">Total Revenue</span>
          </div>
          <p className="text-3xl font-bold">₹{totals.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-dark-100 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-primary-400" size={24} />
            <span className="text-slate-400">Total Transactions</span>
          </div>
          <p className="text-3xl font-bold">{totals.totalPayments}</p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-dark-100 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Invoice</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Company</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Method</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-dark-200/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm">{payment.invoiceNumber}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{payment.company?.companyName || 'N/A'}</p>
                        <p className="text-sm text-slate-400">{payment.company?.companyEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold">₹{payment.amount}</span>
                    </td>
                    <td className="px-6 py-4 capitalize text-slate-300">
                      {payment.paymentMethod || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {payment.paymentDate 
                        ? new Date(payment.paymentDate).toLocaleDateString() 
                        : new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Showing {payments.length} of {pagination.total} payments
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 0}
                className="p-2 rounded-lg bg-dark-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm">
                Page {pagination.page + 1} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages - 1}
                className="p-2 rounded-lg bg-dark-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
