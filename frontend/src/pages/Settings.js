import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Settings as SettingsIcon,
  Clock,
  MapPin,
  Calendar,
  Save,
  Plus,
  Trash2,
  Globe,
  Users
} from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('working-hours');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/organization-settings');
      setSettings(response.data);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/organization-settings', settings);
      alert('Settings saved successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleWorkingDayChange = (day) => {
    setSettings(prev => ({
      ...prev,
      workingDays: {
        ...prev.workingDays,
        [day]: !prev.workingDays[day]
      }
    }));
  };

  const handleAddOfficeLocation = () => {
    setSettings(prev => ({
      ...prev,
      officeLocations: [
        ...(prev.officeLocations || []),
        {
          name: '',
          address: '',
          coordinates: { latitude: 0, longitude: 0 },
          geofenceRadius: 200,
          isPrimary: false
        }
      ]
    }));
  };

  const handleRemoveOfficeLocation = (index) => {
    setSettings(prev => ({
      ...prev,
      officeLocations: prev.officeLocations.filter((_, i) => i !== index)
    }));
  };

  const handleOfficeLocationChange = (index, field, value) => {
    setSettings(prev => {
      const newLocations = [...prev.officeLocations];
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        newLocations[index] = {
          ...newLocations[index],
          [parent]: {
            ...newLocations[index][parent],
            [child]: value
          }
        };
      } else {
        newLocations[index] = { ...newLocations[index], [field]: value };
      }
      return { ...prev, officeLocations: newLocations };
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Organization Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          data-testid="save-settings-btn"
        >
          {saving ? (
            <>
              <div className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        <button 
          className={`tab ${activeTab === 'working-hours' ? 'active' : ''}`}
          onClick={() => setActiveTab('working-hours')}
        >
          <Clock size={16} style={{ marginRight: '0.5rem' }} />
          Working Hours
        </button>
        <button 
          className={`tab ${activeTab === 'locations' ? 'active' : ''}`}
          onClick={() => setActiveTab('locations')}
        >
          <MapPin size={16} style={{ marginRight: '0.5rem' }} />
          Office Locations
        </button>
        <button 
          className={`tab ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <Calendar size={16} style={{ marginRight: '0.5rem' }} />
          Attendance
        </button>
        <button 
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <Globe size={16} style={{ marginRight: '0.5rem' }} />
          Tasks
        </button>
        <button 
          className={`tab ${activeTab === 'leave' ? 'active' : ''}`}
          onClick={() => setActiveTab('leave')}
        >
          <Users size={16} style={{ marginRight: '0.5rem' }} />
          Leave Policy
        </button>
      </div>

      {/* Working Hours Tab */}
      {activeTab === 'working-hours' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>Working Days & Hours</h3>
          
          {/* Working Days */}
          <div style={{ marginBottom: '2rem' }}>
            <label className="label" style={{ marginBottom: '1rem' }}>Working Days</label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map(day => (
                <button
                  key={day}
                  onClick={() => handleWorkingDayChange(day)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '0.5rem',
                    border: '1px solid',
                    borderColor: settings?.workingDays?.[day] ? '#1360C6' : '#e5e7eb',
                    background: settings?.workingDays?.[day] ? '#1360C6' : 'white',
                    color: settings?.workingDays?.[day] ? 'white' : '#374151',
                    cursor: 'pointer',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                    transition: 'all 0.15s ease'
                  }}
                  data-testid={`day-${day}`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Working Hours */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label className="label">Start Time</label>
              <input
                type="time"
                value={settings?.workingHours?.startTime || '09:00'}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  workingHours: { ...prev.workingHours, startTime: e.target.value }
                }))}
                className="input"
                data-testid="start-time-input"
              />
            </div>
            <div>
              <label className="label">End Time</label>
              <input
                type="time"
                value={settings?.workingHours?.endTime || '18:00'}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  workingHours: { ...prev.workingHours, endTime: e.target.value }
                }))}
                className="input"
                data-testid="end-time-input"
              />
            </div>
            <div>
              <label className="label">Break Duration (minutes)</label>
              <input
                type="number"
                value={settings?.workingHours?.breakDuration || 60}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  workingHours: { ...prev.workingHours, breakDuration: parseInt(e.target.value) }
                }))}
                className="input"
                data-testid="break-duration-input"
              />
            </div>
            <div>
              <label className="label">Total Working Hours</label>
              <input
                type="number"
                value={settings?.workingHours?.totalHours || 8}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  workingHours: { ...prev.workingHours, totalHours: parseInt(e.target.value) }
                }))}
                className="input"
                data-testid="total-hours-input"
              />
            </div>
          </div>
        </div>
      )}

      {/* Locations Tab */}
      {activeTab === 'locations' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ fontWeight: 600 }}>Office Locations</h3>
            <button
              onClick={handleAddOfficeLocation}
              className="btn btn-secondary"
              data-testid="add-location-btn"
            >
              <Plus size={18} />
              Add Location
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(settings?.officeLocations || []).map((location, index) => (
              <div 
                key={index}
                style={{
                  padding: '1.25rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  background: '#fafafa'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={18} color="#1360C6" />
                    <span style={{ fontWeight: 600 }}>Location {index + 1}</span>
                    {location.isPrimary && (
                      <span style={{
                        padding: '0.125rem 0.5rem',
                        background: '#dcfce7',
                        color: '#166534',
                        fontSize: '0.688rem',
                        borderRadius: '9999px'
                      }}>
                        Primary
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveOfficeLocation(index)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer',
                      color: '#ef4444'
                    }}
                    data-testid={`remove-location-${index}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label className="label">Location Name</label>
                    <input
                      type="text"
                      value={location.name || ''}
                      onChange={(e) => handleOfficeLocationChange(index, 'name', e.target.value)}
                      placeholder="e.g., Head Office"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Address</label>
                    <input
                      type="text"
                      value={location.address || ''}
                      onChange={(e) => handleOfficeLocationChange(index, 'address', e.target.value)}
                      placeholder="Enter address"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={location.coordinates?.latitude || 0}
                      onChange={(e) => handleOfficeLocationChange(index, 'coordinates.latitude', parseFloat(e.target.value))}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={location.coordinates?.longitude || 0}
                      onChange={(e) => handleOfficeLocationChange(index, 'coordinates.longitude', parseFloat(e.target.value))}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Geofence Radius (meters)</label>
                    <input
                      type="number"
                      value={location.geofenceRadius || 200}
                      onChange={(e) => handleOfficeLocationChange(index, 'geofenceRadius', parseInt(e.target.value))}
                      className="input"
                      data-testid={`geofence-radius-${index}`}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      Default: 200m
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'end', paddingBottom: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id={`primary-${index}`}
                      checked={location.isPrimary || false}
                      onChange={(e) => {
                        // First, set all to false, then set this one to true
                        setSettings(prev => ({
                          ...prev,
                          officeLocations: prev.officeLocations.map((loc, i) => ({
                            ...loc,
                            isPrimary: i === index ? e.target.checked : false
                          }))
                        }));
                      }}
                    />
                    <label htmlFor={`primary-${index}`} style={{ fontSize: '0.875rem' }}>Primary Location</label>
                  </div>
                </div>
              </div>
            ))}

            {(!settings?.officeLocations || settings.officeLocations.length === 0) && (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <MapPin size={48} strokeWidth={1.5} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>No office locations configured</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>Attendance Settings</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '0.5rem'
            }}>
              <div>
                <p style={{ fontWeight: 500 }}>Require Geotag</p>
                <p style={{ fontSize: '0.813rem', color: '#6b7280' }}>
                  Employees must share their location when marking attendance
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings?.attendance?.requireGeotag || false}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  attendance: { ...prev.attendance, requireGeotag: e.target.checked }
                }))}
                style={{ width: '1.25rem', height: '1.25rem', accentColor: '#1360C6' }}
                data-testid="require-geotag-checkbox"
              />
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '0.5rem'
            }}>
              <div>
                <p style={{ fontWeight: 500 }}>Allow Remote Attendance</p>
                <p style={{ fontSize: '0.813rem', color: '#6b7280' }}>
                  Allow employees to mark attendance from outside office locations
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings?.attendance?.allowRemoteAttendance || false}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  attendance: { ...prev.attendance, allowRemoteAttendance: e.target.checked }
                }))}
                style={{ width: '1.25rem', height: '1.25rem', accentColor: '#1360C6' }}
                data-testid="allow-remote-checkbox"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label">Late Tolerance (minutes)</label>
                <input
                  type="number"
                  value={settings?.attendance?.lateToleranceMinutes || 15}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    attendance: { ...prev.attendance, lateToleranceMinutes: parseInt(e.target.value) }
                  }))}
                  className="input"
                  data-testid="late-tolerance-input"
                />
              </div>
              <div>
                <label className="label">Early Leave Tolerance (minutes)</label>
                <input
                  type="number"
                  value={settings?.attendance?.earlyLeaveToleranceMinutes || 15}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    attendance: { ...prev.attendance, earlyLeaveToleranceMinutes: parseInt(e.target.value) }
                  }))}
                  className="input"
                  data-testid="early-leave-tolerance-input"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>Task Settings</h3>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '0.5rem'
          }}>
            <div>
              <p style={{ fontWeight: 500 }}>Tasks Remote by Default</p>
              <p style={{ fontSize: '0.813rem', color: '#6b7280' }}>
                New tasks will be marked as remote by default
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings?.tasksRemoteByDefault || false}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                tasksRemoteByDefault: e.target.checked
              }))}
              style={{ width: '1.25rem', height: '1.25rem', accentColor: '#1360C6' }}
              data-testid="tasks-remote-default-checkbox"
            />
          </div>
        </div>
      )}

      {/* Leave Policy Tab */}
      {activeTab === 'leave' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>Leave Policy</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label className="label">Paid Leaves Per Month</label>
              <input
                type="number"
                step="0.5"
                value={settings?.leave?.paidLeavesPerMonth || 1.5}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  leave: { ...prev.leave, paidLeavesPerMonth: parseFloat(e.target.value) }
                }))}
                className="input"
                data-testid="paid-leaves-input"
              />
            </div>
            <div>
              <label className="label">Carry Forward Limit</label>
              <input
                type="number"
                value={settings?.leave?.carryForwardLimit || 5}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  leave: { ...prev.leave, carryForwardLimit: parseInt(e.target.value) }
                }))}
                className="input"
                data-testid="carry-forward-input"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'end', paddingBottom: '0.5rem' }}>
              <input
                type="checkbox"
                id="allowHalfDay"
                checked={settings?.leave?.allowHalfDay || false}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  leave: { ...prev.leave, allowHalfDay: e.target.checked }
                }))}
              />
              <label htmlFor="allowHalfDay" style={{ fontSize: '0.875rem' }}>Allow Half-Day Leaves</label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
