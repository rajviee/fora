import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Clock,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Sun,
  Moon
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';

const Attendance = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
  }, [currentMonth]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      const [recordsRes, todayRes, statsRes] = await Promise.all([
        api.get(`/attendance/history?startDate=${startDate}&endDate=${endDate}`),
        api.get('/attendance/today'),
        api.get(`/attendance/monthly-stats?month=${format(currentMonth, 'yyyy-MM')}`)
      ]);

      // Handle different API response formats
      const records = recordsRes.data?.records || recordsRes.data || [];
      setAttendanceRecords(Array.isArray(records) ? records : []);
      setTodayAttendance(todayRes.data);
      
      // Handle monthly stats from API response
      const stats = statsRes.data || {};
      setMonthlyStats({
        workingDays: stats.workingDays || stats.expectedWorkingDays || 0,
        presentDays: stats.presentDays || stats.present || 0,
        absentDays: stats.absentDays || stats.absent || 0,
        leavesTaken: stats.leavesTaken || stats.onLeave || 0
      });
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
      setAttendanceRecords([]);
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
          fetchAttendanceData();
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
          fetchAttendanceData();
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

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const getAttendanceForDay = (day) => {
    return attendanceRecords.find(record => 
      isSameDay(new Date(record.date), day)
    );
  };

  const getDayStatus = (day) => {
    const record = getAttendanceForDay(day);
    if (!record) return 'absent';
    if (record.status === 'present') return 'present';
    if (record.status === 'half-day') return 'half-day';
    if (record.status === 'leave') return 'leave';
    return 'absent';
  };

  const getDayColor = (status) => {
    const colors = {
      'present': '#10b981',
      'half-day': '#f59e0b',
      'leave': '#ef4444',
      'absent': '#e5e7eb',
      'holiday': '#6366f1'
    };
    return colors[status] || colors['absent'];
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Attendance
      </h1>

      {/* Today's Status Card */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: todayAttendance?.hasCheckedIn ? '#dcfce7' : '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {todayAttendance?.hasCheckedOut ? (
                <Moon size={28} color="#6366f1" />
              ) : todayAttendance?.hasCheckedIn ? (
                <Sun size={28} color="#16a34a" />
              ) : (
                <Clock size={28} color="#f59e0b" />
              )}
            </div>
            <div>
              <h2 style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </h2>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                {!todayAttendance?.hasCheckedIn && 'You have not checked in yet'}
                {todayAttendance?.hasCheckedIn && !todayAttendance?.hasCheckedOut && (
                  <>
                    Checked in at {format(new Date(todayAttendance.attendance?.checkIn?.time), 'h:mm a')}
                    {todayAttendance.attendance?.checkIn?.geoTag && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                        <MapPin size={12} />
                        Location recorded
                      </span>
                    )}
                  </>
                )}
                {todayAttendance?.hasCheckedOut && (
                  <>
                    Day complete • {format(new Date(todayAttendance.attendance?.checkIn?.time), 'h:mm a')} - {format(new Date(todayAttendance.attendance?.checkOut?.time), 'h:mm a')}
                  </>
                )}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {!todayAttendance?.hasCheckedIn ? (
              <button 
                className="btn btn-success"
                onClick={handleCheckIn}
                data-testid="check-in-btn"
                style={{ padding: '0.875rem 1.5rem' }}
              >
                <MapPin size={20} />
                Check In (Start Day)
              </button>
            ) : !todayAttendance?.hasCheckedOut ? (
              <button 
                className="btn btn-danger"
                onClick={handleCheckOut}
                data-testid="check-out-btn"
                style={{ padding: '0.875rem 1.5rem' }}
              >
                <MapPin size={20} />
                Check Out (EOTD)
              </button>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                background: '#dcfce7',
                borderRadius: '0.5rem',
                color: '#166534',
                fontWeight: 500
              }}>
                <CheckCircle size={20} />
                Day Complete
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <StatCard 
          label="Working Days" 
          value={monthlyStats?.workingDays || 0}
          icon={Calendar}
          color="#1360C6"
        />
        <StatCard 
          label="Present Days" 
          value={monthlyStats?.presentDays || 0}
          icon={CheckCircle}
          color="#10b981"
        />
        <StatCard 
          label="Absent Days" 
          value={monthlyStats?.absentDays || 0}
          icon={XCircle}
          color="#ef4444"
        />
        <StatCard 
          label="Leaves Used" 
          value={monthlyStats?.leavesTaken || 0}
          icon={Coffee}
          color="#f59e0b"
        />
      </div>

      {/* Calendar */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontWeight: 600 }}>
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="btn btn-secondary"
              style={{ padding: '0.5rem' }}
              data-testid="prev-month-btn"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem' }}
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="btn btn-secondary"
              style={{ padding: '0.5rem' }}
              data-testid="next-month-btn"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '0.5rem',
          marginBottom: '0.75rem'
        }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div 
              key={day}
              style={{
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.75rem',
                color: '#6b7280',
                padding: '0.5rem'
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '0.5rem'
        }}>
          {/* Empty cells for days before month start */}
          {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {days.map(day => {
            const status = getDayStatus(day);
            const record = getAttendanceForDay(day);
            const isTodayDate = isToday(day);

            return (
              <div
                key={day.toISOString()}
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0.5rem',
                  border: isTodayDate ? '2px solid #1360C6' : '1px solid #e5e7eb',
                  background: status === 'present' ? '#dcfce7' : 
                              status === 'half-day' ? '#fef3c7' :
                              status === 'leave' ? '#fee2e2' :
                              '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
              >
                <span style={{
                  fontWeight: isTodayDate ? 700 : 500,
                  fontSize: '0.875rem',
                  color: isTodayDate ? '#1360C6' : '#374151'
                }}>
                  {format(day, 'd')}
                </span>
                {record && (
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: getDayColor(status),
                    marginTop: '0.25rem'
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ 
          display: 'flex', 
          gap: '1.5rem', 
          marginTop: '1.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <LegendItem color="#10b981" label="Present" />
          <LegendItem color="#f59e0b" label="Half Day" />
          <LegendItem color="#ef4444" label="Leave/Absent" />
          <LegendItem color="#6366f1" label="Holiday" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
        <h2 style={{ fontWeight: 600, marginBottom: '1rem' }}>Recent Attendance</h2>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div className="spinner" />
          </div>
        ) : attendanceRecords.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <Calendar size={48} strokeWidth={1.5} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No attendance records for this month</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {attendanceRecords.slice(0, 10).map((record, index) => (
              <div 
                key={record._id || index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.875rem 1rem',
                  background: '#f9fafb',
                  borderRadius: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: getDayColor(record.status)
                  }} />
                  <div>
                    <p style={{ fontWeight: 500 }}>
                      {format(new Date(record.date), 'EEEE, MMMM d')}
                    </p>
                    <p style={{ fontSize: '0.813rem', color: '#6b7280' }}>
                      {record.checkIn?.time && format(new Date(record.checkIn.time), 'h:mm a')}
                      {record.checkOut?.time && ` - ${format(new Date(record.checkOut.time), 'h:mm a')}`}
                    </p>
                  </div>
                </div>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  background: getDayColor(record.status) + '20',
                  color: getDayColor(record.status),
                  textTransform: 'capitalize'
                }}>
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="card" style={{ padding: '1.25rem' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: '0.813rem', color: '#6b7280', marginBottom: '0.375rem' }}>{label}</p>
        <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</p>
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

const LegendItem = ({ color, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <div style={{
      width: '12px',
      height: '12px',
      borderRadius: '3px',
      background: color
    }} />
    <span style={{ fontSize: '0.813rem', color: '#6b7280' }}>{label}</span>
  </div>
);

export default Attendance;
