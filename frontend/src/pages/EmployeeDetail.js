import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  ListTodo,
  MapPin,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [tasksData, setTasksData] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchEmployeeData();
  }, [id, currentMonth]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      const [empRes, attendanceRes, tasksRes, salaryRes] = await Promise.all([
        api.get(`/employees/${id}`),
        api.get(`/admin/employee/${id}/attendance?startDate=${startDate}&endDate=${endDate}`),
        api.get(`/admin/employee/${id}/tasks`),
        api.get(`/admin/employee/${id}/salary?month=${format(currentMonth, 'yyyy-MM')}`)
      ]);

      setEmployee(empRes.data);
      setAttendanceData(attendanceRes.data);
      setTasksData(tasksRes.data);
      setSalaryData(salaryRes.data);
    } catch (err) {
      console.error('Failed to fetch employee data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      'admin': { bg: '#fee2e2', color: '#dc2626' },
      'supervisor': { bg: '#dbeafe', color: '#1d4ed8' },
      'employee': { bg: '#dcfce7', color: '#16a34a' }
    };
    return styles[role] || styles['employee'];
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="card empty-state" style={{ padding: '3rem' }}>
        <p>Employee not found</p>
        <button className="btn btn-primary" onClick={() => navigate('/employees')} style={{ marginTop: '1rem' }}>
          Back to Employees
        </button>
      </div>
    );
  }

  const roleStyle = getRoleBadge(employee.role);

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6366f1'];

  const attendanceChartData = [
    { name: 'Present', value: attendanceData?.presentDays || 0 },
    { name: 'Absent', value: attendanceData?.absentDays || 0 },
    { name: 'Leave', value: attendanceData?.leavesTaken || 0 },
    { name: 'Holiday', value: attendanceData?.holidays || 0 }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <button
          onClick={() => navigate('/employees')}
          className="btn btn-ghost"
          style={{ padding: '0.5rem' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div 
              className="avatar avatar-lg"
              style={{ background: '#1360C6' }}
            >
              {employee.firstName?.[0]}{employee.lastName?.[0]}
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                {employee.firstName} {employee.lastName}
              </h1>
              <p style={{ color: '#6b7280' }}>
                {employee.designation || employee.role}
              </p>
            </div>
            <span style={{
              padding: '0.375rem 0.875rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 500,
              background: roleStyle.bg,
              color: roleStyle.color,
              textTransform: 'capitalize'
            }}>
              {employee.role}
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '1.5rem',
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Mail size={16} />
              {employee.email}
            </span>
            {employee.contactNumber && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Phone size={16} />
                {employee.contactNumber}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Month Selector */}
      <div className="card" style={{ 
        padding: '1rem', 
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="btn btn-ghost"
            style={{ padding: '0.375rem' }}
          >
            <ChevronLeft size={20} />
          </button>
          <span style={{ fontWeight: 600, minWidth: '150px', textAlign: 'center' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="btn btn-ghost"
            style={{ padding: '0.375rem' }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <button
          onClick={() => setCurrentMonth(new Date())}
          className="btn btn-secondary"
        >
          Current Month
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          Attendance
        </button>
        <button 
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
        <button 
          className={`tab ${activeTab === 'salary' ? 'active' : ''}`}
          onClick={() => setActiveTab('salary')}
        >
          Salary
        </button>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Attendance Summary */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Attendance Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <StatItem 
                icon={Calendar} 
                label="Working Days" 
                value={attendanceData?.workingDays || 0}
                color="#1360C6"
              />
              <StatItem 
                icon={CheckCircle} 
                label="Present" 
                value={attendanceData?.presentDays || 0}
                color="#10b981"
              />
              <StatItem 
                icon={XCircle} 
                label="Absent" 
                value={attendanceData?.absentDays || 0}
                color="#ef4444"
              />
              <StatItem 
                icon={Clock} 
                label="Leaves Used" 
                value={attendanceData?.leavesTaken || 0}
                color="#f59e0b"
              />
            </div>
          </div>

          {/* Tasks Summary */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Tasks Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <StatItem 
                icon={ListTodo} 
                label="Total Tasks" 
                value={tasksData?.total || 0}
                color="#1360C6"
              />
              <StatItem 
                icon={TrendingUp} 
                label="Completed" 
                value={tasksData?.completed || 0}
                color="#10b981"
              />
              <StatItem 
                icon={Clock} 
                label="In Progress" 
                value={tasksData?.inProgress || 0}
                color="#3b82f6"
              />
              <StatItem 
                icon={XCircle} 
                label="Overdue" 
                value={tasksData?.overdue || 0}
                color="#ef4444"
              />
            </div>
          </div>

          {/* Attendance Chart */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Attendance Breakdown</h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {attendanceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '1rem',
              flexWrap: 'wrap',
              marginTop: '1rem'
            }}>
              {attendanceChartData.map((item, index) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <div style={{ 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '2px',
                    background: COLORS[index]
                  }} />
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Daily Attendance Logs</h3>
          {attendanceData?.records?.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <Calendar size={48} strokeWidth={1.5} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>No attendance records for this month</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours</th>
                    <th>Location</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(attendanceData?.records || []).map((record, index) => (
                    <tr key={record._id || index}>
                      <td>{format(new Date(record.date), 'MMM d, yyyy')}</td>
                      <td>
                        {record.checkIn?.time 
                          ? format(new Date(record.checkIn.time), 'h:mm a')
                          : '-'
                        }
                      </td>
                      <td>
                        {record.checkOut?.time 
                          ? format(new Date(record.checkOut.time), 'h:mm a')
                          : '-'
                        }
                      </td>
                      <td>{record.hoursWorked?.toFixed(1) || '-'}</td>
                      <td>
                        {record.checkIn?.geoTag ? (
                          <span style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            color: '#6b7280'
                          }}>
                            <MapPin size={12} />
                            {record.checkIn.geoTag.latitude?.toFixed(4)}, {record.checkIn.geoTag.longitude?.toFixed(4)}
                          </span>
                        ) : '-'}
                      </td>
                      <td>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          background: record.status === 'present' ? '#dcfce7' : 
                                      record.status === 'half-day' ? '#fef3c7' : '#fee2e2',
                          color: record.status === 'present' ? '#166534' :
                                 record.status === 'half-day' ? '#92400e' : '#991b1b',
                          textTransform: 'capitalize'
                        }}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Assigned Tasks</h3>
          {tasksData?.tasks?.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <ListTodo size={48} strokeWidth={1.5} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>No tasks assigned</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(tasksData?.tasks || []).map((task) => (
                <div 
                  key={task._id}
                  style={{
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/tasks/${task._id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{task.title}</h4>
                      <p style={{ fontSize: '0.813rem', color: '#6b7280' }}>
                        Due: {format(new Date(task.dueDateTime), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span className={`badge badge-${task.status?.toLowerCase().replace(' ', '-')}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'salary' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>Salary Breakdown</h3>
          
          {salaryData ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {/* Earnings */}
              <div>
                <h4 style={{ fontWeight: 500, marginBottom: '1rem', color: '#10b981' }}>Earnings</h4>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem',
                  padding: '1rem',
                  background: '#f0fdf4',
                  borderRadius: '0.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Basic Salary</span>
                    <span style={{ fontWeight: 500 }}>₹{salaryData.basicSalary?.toLocaleString()}</span>
                  </div>
                  {salaryData.components?.filter(c => c.type === 'earning').map((comp, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{comp.name}</span>
                      <span style={{ fontWeight: 500 }}>₹{comp.calculatedAmount?.toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    borderTop: '1px solid #bbf7d0',
                    paddingTop: '0.75rem',
                    fontWeight: 600
                  }}>
                    <span>Total Earnings</span>
                    <span>₹{salaryData.totalEarnings?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h4 style={{ fontWeight: 500, marginBottom: '1rem', color: '#ef4444' }}>Deductions</h4>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem',
                  padding: '1rem',
                  background: '#fef2f2',
                  borderRadius: '0.5rem'
                }}>
                  {salaryData.standardDeductions && (
                    <>
                      {salaryData.standardDeductions.pf?.enabled && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>PF ({salaryData.standardDeductions.pf.percentage}%)</span>
                          <span style={{ fontWeight: 500 }}>₹{salaryData.pfDeduction?.toLocaleString()}</span>
                        </div>
                      )}
                      {salaryData.standardDeductions.professionalTax?.enabled && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Professional Tax</span>
                          <span style={{ fontWeight: 500 }}>₹{salaryData.standardDeductions.professionalTax.amount?.toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  )}
                  {salaryData.unpaidLeavesDeduction > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Unpaid Leaves ({salaryData.unpaidLeaves})</span>
                      <span style={{ fontWeight: 500 }}>₹{salaryData.unpaidLeavesDeduction?.toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    borderTop: '1px solid #fecaca',
                    paddingTop: '0.75rem',
                    fontWeight: 600
                  }}>
                    <span>Total Deductions</span>
                    <span>₹{salaryData.totalDeductions?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Salary */}
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.5rem',
                  background: '#1360C6',
                  borderRadius: '0.5rem',
                  color: 'white'
                }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.25rem' }}>Net Salary</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                      ₹{salaryData.netSalary?.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign size={48} style={{ opacity: 0.3 }} />
                </div>
              </div>

              {/* Attendance Summary */}
              <div style={{ gridColumn: '1 / -1' }}>
                <h4 style={{ fontWeight: 500, marginBottom: '1rem' }}>Attendance Impact</h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '1rem'
                }}>
                  <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Working Days</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{salaryData.workingDays}</p>
                  </div>
                  <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Present Days</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{salaryData.presentDays}</p>
                  </div>
                  <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Paid Leaves</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{salaryData.paidLeaves}</p>
                  </div>
                  <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Unpaid Leaves</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ef4444' }}>{salaryData.unpaidLeaves}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <DollarSign size={48} strokeWidth={1.5} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>No salary configuration found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StatItem = ({ icon: Icon, label, value, color }) => (
  <div style={{ 
    padding: '1rem', 
    background: '#f9fafb', 
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  }}>
    <div style={{
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      background: `${color}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Icon size={18} color={color} />
    </div>
    <div>
      <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{label}</p>
      <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>{value}</p>
    </div>
  </div>
);

export default EmployeeDetail;
