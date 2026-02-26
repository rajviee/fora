import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ListTodo,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Plus,
  ArrowRight,
  MapPin
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [todaysTasks, setTodaysTasks] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, tasksRes, attendanceRes] = await Promise.all([
        api.get('/stats/tasks-summary?isSelfTask=false'),
        api.get('/stats/todaysTasks?isSelfTask=false'),
        api.get('/attendance/today')
      ]);
      
      setStats(statsRes.data);
      setTodaysTasks(tasksRes.data?.tasks || []);
      setTodayAttendance(attendanceRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await api.post('/attendance/check-in', {
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            },
            accuracy: position.coords.accuracy,
            address: 'Current Location'
          });
          fetchDashboardData();
        } catch (err) {
          alert(err.response?.data?.message || 'Check-in failed');
        }
      },
      (error) => {
        alert('Unable to get location: ' + error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleCheckOut = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await api.post('/attendance/check-out', {
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            },
            accuracy: position.coords.accuracy,
            address: 'Current Location'
          });
          fetchDashboardData();
        } catch (err) {
          alert(err.response?.data?.message || 'Check-out failed');
        }
      },
      (error) => {
        alert('Unable to get location: ' + error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'badge-pending',
      'In Progress': 'badge-in-progress',
      'Completed': 'badge-completed',
      'Overdue': 'badge-overdue',
      'For Approval': 'badge-approval'
    };
    return styles[status] || 'badge-pending';
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      'High': 'priority-high',
      'Medium': 'priority-medium',
      'Low': 'priority-low'
    };
    return styles[priority] || 'priority-medium';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Welcome Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            color: '#111827',
            marginBottom: '0.25rem'
          }}>
            Welcome back, {user?.firstName}!
          </h1>
          <p style={{ color: '#6b7280' }}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/tasks/new')}
          data-testid="add-task-btn"
        >
          <Plus size={18} />
          Add Task
        </button>
      </div>

      {/* Attendance Card */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: todayAttendance?.hasCheckedIn ? '#dcfce7' : '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={24} color={todayAttendance?.hasCheckedIn ? '#16a34a' : '#f59e0b'} />
            </div>
            <div>
              <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Today's Attendance</h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                {todayAttendance?.hasCheckedIn 
                  ? `Checked in at ${new Date(todayAttendance.attendance?.checkIn?.time).toLocaleTimeString()}`
                  : 'You have not checked in yet'
                }
                {todayAttendance?.hasCheckedOut && 
                  ` • Checked out at ${new Date(todayAttendance.attendance?.checkOut?.time).toLocaleTimeString()}`
                }
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {!todayAttendance?.hasCheckedIn ? (
              <button 
                className="btn btn-success"
                onClick={handleCheckIn}
                data-testid="check-in-btn"
              >
                <MapPin size={18} />
                Check In
              </button>
            ) : !todayAttendance?.hasCheckedOut ? (
              <button 
                className="btn btn-danger"
                onClick={handleCheckOut}
                data-testid="check-out-btn"
              >
                <MapPin size={18} />
                Check Out
              </button>
            ) : (
              <span className="badge badge-completed">Day Complete</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <StatCard 
          icon={ListTodo}
          label="Total Tasks"
          value={stats?.totalTasks || 0}
          color="#1360C6"
        />
        <StatCard 
          icon={Clock}
          label="Pending"
          value={stats?.pending || 0}
          color="#f59e0b"
        />
        <StatCard 
          icon={TrendingUp}
          label="In Progress"
          value={stats?.inProgress || 0}
          color="#3b82f6"
        />
        <StatCard 
          icon={CheckCircle}
          label="Completed"
          value={stats?.completed || 0}
          color="#10b981"
        />
        <StatCard 
          icon={AlertTriangle}
          label="Overdue"
          value={stats?.overdue || 0}
          color="#ef4444"
        />
      </div>

      {/* Today's Tasks */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ 
          padding: '1rem 1.25rem', 
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontWeight: 600 }}>Today's Tasks</h2>
          <button 
            className="btn btn-ghost"
            onClick={() => navigate('/tasks')}
            style={{ fontSize: '0.875rem' }}
          >
            View All <ArrowRight size={16} />
          </button>
        </div>
        
        {todaysTasks.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <ListTodo size={48} strokeWidth={1.5} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No tasks due today</p>
          </div>
        ) : (
          <div>
            {todaysTasks.slice(0, 5).map((task) => (
              <div
                key={task._id}
                onClick={() => navigate(`/tasks/${task._id}`)}
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                data-testid={`task-${task._id}`}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      fontWeight: 500, 
                      marginBottom: '0.25rem',
                      color: '#111827'
                    }}>
                      {task.title}
                    </h4>
                    <p style={{ 
                      fontSize: '0.813rem', 
                      color: '#6b7280',
                      marginBottom: '0.5rem'
                    }}>
                      Due: {new Date(task.dueDateTime).toLocaleString()}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span className={`badge ${getStatusBadge(task.status)}`}>
                        {task.status}
                      </span>
                      <span className={`badge ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={18} color="#9ca3af" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card" style={{ padding: '1.25rem' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ 
          fontSize: '0.813rem', 
          color: '#6b7280', 
          marginBottom: '0.5rem' 
        }}>
          {label}
        </p>
        <p style={{ 
          fontSize: '1.75rem', 
          fontWeight: 700, 
          color: '#111827' 
        }}>
          {value}
        </p>
      </div>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={20} color={color} />
      </div>
    </div>
  </div>
);

export default Dashboard;
