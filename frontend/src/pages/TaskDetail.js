import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Edit2,
  Send,
  Globe,
  Check,
  X,
  Calendar,
  FileText,
  Upload,
  Trash2,
  AtSign
} from 'lucide-react';

const TaskDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState([]);

  const fetchTask = useCallback(async () => {
    try {
      const [taskRes, timelineRes, discussionsRes] = await Promise.all([
        api.get(`/task/${id}`),
        api.get(`/task/${id}/timeline`),
        api.get(`/task/${id}/discussions`)
      ]);
      setTask(taskRes.data);
      setTimeline(timelineRes.data || []);
      setDiscussions(discussionsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch task:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data || []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  useEffect(() => {
    fetchTask();
    fetchEmployees();
  }, [fetchTask]);

  const isDoer = task?.doers?.some(d => d._id === user?._id);
  const isViewer = task?.viewers?.some(v => v._id === user?._id);
  const isCreator = task?.createdBy?._id === user?._id;
  const canEdit = isDoer || isViewer || isCreator || user?.role === 'admin';

  const updateTaskStatus = async (status) => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await api.patch(`/task/${id}/status`, {
            status,
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          });
          fetchTask();
        } catch (err) {
          alert(err.response?.data?.message || 'Failed to update status');
        }
      },
      (error) => {
        alert('Unable to get location: ' + error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  const updateLocationStatus = async (locationId, status, remarks = '') => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await api.patch(`/task/${id}/location/${locationId}`, {
            status,
            remarks,
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          });
          fetchTask();
        } catch (err) {
          alert(err.response?.data?.message || 'Failed to update location');
        }
      },
      (error) => {
        alert('Unable to get location: ' + error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  const approveLocation = async (locationId) => {
    try {
      await api.patch(`/task/${id}/location/${locationId}/approve`);
      fetchTask();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve location');
    }
  };

  const approveTask = async () => {
    try {
      await api.patch(`/task/${id}/approve`);
      fetchTask();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve task');
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      // Extract mentions from comment
      const mentionRegex = /@(\w+)/g;
      const mentions = [];
      let match;
      while ((match = mentionRegex.exec(newComment)) !== null) {
        const mentioned = employees.find(e => 
          e.firstName?.toLowerCase() === match[1].toLowerCase() ||
          e.email?.split('@')[0].toLowerCase() === match[1].toLowerCase()
        );
        if (mentioned) {
          mentions.push(mentioned._id);
        }
      }

      await api.post(`/task/${id}/discussions`, {
        content: newComment.trim(),
        mentions
      });
      setNewComment('');
      fetchTask();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="card empty-state" style={{ padding: '3rem' }}>
        <AlertTriangle size={48} style={{ marginBottom: '1rem', color: '#f59e0b' }} />
        <p>Task not found</p>
        <button className="btn btn-primary" onClick={() => navigate('/tasks')} style={{ marginTop: '1rem' }}>
          Back to Tasks
        </button>
      </div>
    );
  }

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
          onClick={() => navigate('/tasks')}
          className="btn btn-ghost"
          style={{ padding: '0.5rem' }}
          data-testid="back-btn"
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{task.title}</h1>
            {task.isRemote && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.625rem',
                background: '#e0f2fe',
                color: '#0284c7',
                fontSize: '0.75rem',
                borderRadius: '4px',
                fontWeight: 500
              }}>
                <Globe size={14} />
                Remote
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className={`badge ${getStatusBadge(task.status)}`}>{task.status}</span>
            <span className={`badge priority-${task.priority?.toLowerCase()}`}>{task.priority}</span>
          </div>
        </div>

        {/* Actions */}
        {isDoer && task.status !== 'Completed' && task.status !== 'For Approval' && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {task.status === 'Pending' && (
              <button
                className="btn btn-primary"
                onClick={() => updateTaskStatus('In Progress')}
                data-testid="start-task-btn"
              >
                Start Task
              </button>
            )}
            {task.status === 'In Progress' && (
              <button
                className="btn btn-success"
                onClick={() => updateTaskStatus('For Approval')}
                data-testid="submit-approval-btn"
              >
                <Check size={18} />
                Submit for Approval
              </button>
            )}
          </div>
        )}
        
        {(isViewer || isCreator || user?.role === 'admin') && task.status === 'For Approval' && (
          <button
            className="btn btn-success"
            onClick={approveTask}
            data-testid="approve-task-btn"
          >
            <CheckCircle size={18} />
            Approve Task
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        <button 
          className={`tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button 
          className={`tab ${activeTab === 'locations' ? 'active' : ''}`}
          onClick={() => setActiveTab('locations')}
        >
          Locations ({task.locations?.length || 0})
        </button>
        <button 
          className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline ({timeline.length})
        </button>
        <button 
          className={`tab ${activeTab === 'discussion' ? 'active' : ''}`}
          onClick={() => setActiveTab('discussion')}
        >
          Discussion ({discussions.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'details' && (
        <TaskDetails task={task} />
      )}

      {activeTab === 'locations' && (
        <TaskLocations 
          task={task}
          isDoer={isDoer}
          isViewer={isViewer || isCreator || user?.role === 'admin'}
          canEdit={canEdit}
          updateLocationStatus={updateLocationStatus}
          approveLocation={approveLocation}
          fetchTask={fetchTask}
        />
      )}

      {activeTab === 'timeline' && (
        <TaskTimeline timeline={timeline} />
      )}

      {activeTab === 'discussion' && (
        <TaskDiscussions 
          discussions={discussions}
          newComment={newComment}
          setNewComment={setNewComment}
          addComment={addComment}
          submitting={submitting}
          employees={employees}
        />
      )}
    </div>
  );
};

const TaskDetails = ({ task }) => (
  <div className="card" style={{ padding: '1.5rem' }}>
    <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Task Information</h3>
    
    {task.description && (
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ fontSize: '0.813rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>
          Description
        </label>
        <p style={{ color: '#374151' }}>{task.description}</p>
      </div>
    )}

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
      <InfoItem 
        icon={Calendar} 
        label="Due Date" 
        value={new Date(task.dueDateTime).toLocaleString()} 
      />
      <InfoItem 
        icon={Users} 
        label="Assigned To" 
        value={task.doers?.map(d => `${d.firstName} ${d.lastName}`).join(', ') || 'Unassigned'} 
      />
      <InfoItem 
        icon={Users} 
        label="Viewers" 
        value={task.viewers?.map(v => `${v.firstName} ${v.lastName}`).join(', ') || 'None'} 
      />
      <InfoItem 
        icon={Users} 
        label="Created By" 
        value={`${task.createdBy?.firstName} ${task.createdBy?.lastName}`} 
      />
      <InfoItem 
        icon={Clock} 
        label="Created At" 
        value={new Date(task.createdAt).toLocaleString()} 
      />
      {task.isMultiLocation && (
        <InfoItem 
          icon={MapPin} 
          label="Type" 
          value="Multi-Location Task" 
        />
      )}
    </div>
  </div>
);

const InfoItem = ({ icon: Icon, label, value }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
      <Icon size={14} color="#6b7280" />
      <label style={{ fontSize: '0.813rem', color: '#6b7280' }}>{label}</label>
    </div>
    <p style={{ fontWeight: 500 }}>{value}</p>
  </div>
);

const TaskLocations = ({ task, isDoer, isViewer, canEdit, updateLocationStatus, approveLocation, fetchTask }) => {
  const [editingLocation, setEditingLocation] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [remarks, setRemarks] = useState({});

  const handleEditLocation = async (locationId) => {
    try {
      await api.patch(`/task/${task._id}/location/${locationId}/edit`, {
        name: editForm.name,
        description: editForm.description
      });
      setEditingLocation(null);
      fetchTask();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update location');
    }
  };

  const getLocationStatusBadge = (status) => {
    const styles = {
      'Pending': { bg: '#fef3c7', color: '#92400e' },
      'In Progress': { bg: '#dbeafe', color: '#1d4ed8' },
      'Completed': { bg: '#d1fae5', color: '#065f46' },
      'Approved': { bg: '#dcfce7', color: '#166534' }
    };
    return styles[status] || styles['Pending'];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {(task.locations || []).map((location, index) => {
        const statusStyle = getLocationStatusBadge(location.status);
        const isEditing = editingLocation === location._id;

        return (
          <div key={location._id || index} className="card" style={{ padding: '1.25rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#1360C6',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600
                }}>
                  {index + 1}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    style={{ width: '200px' }}
                    data-testid={`edit-location-name-${index}`}
                  />
                ) : (
                  <div>
                    <h4 style={{ fontWeight: 600 }}>{location.name}</h4>
                    {location.address && (
                      <p style={{ fontSize: '0.813rem', color: '#6b7280' }}>{location.address}</p>
                    )}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  background: statusStyle.bg,
                  color: statusStyle.color
                }}>
                  {location.status}
                </span>
                {canEdit && !isEditing && (
                  <button
                    onClick={() => {
                      setEditingLocation(location._id);
                      setEditForm({ name: location.name, description: location.description || '' });
                    }}
                    className="btn btn-ghost"
                    style={{ padding: '0.375rem' }}
                    data-testid={`edit-location-btn-${index}`}
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {isEditing ? (
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input"
                  rows={2}
                  data-testid={`edit-location-description-${index}`}
                />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button
                    onClick={() => handleEditLocation(location._id)}
                    className="btn btn-primary btn-sm"
                    data-testid={`save-location-btn-${index}`}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingLocation(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              location.description && (
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#6b7280',
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  background: '#f9fafb',
                  borderRadius: '0.375rem'
                }}>
                  {location.description}
                </p>
              )
            )}

            {/* Location Geotag Info */}
            {location.geoTag && (
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}>
                <MapPin size={14} />
                Last update: {location.geoTag.latitude?.toFixed(6)}, {location.geoTag.longitude?.toFixed(6)}
                {location.geoTag.updatedAt && ` at ${new Date(location.geoTag.updatedAt).toLocaleString()}`}
              </div>
            )}

            {/* Doer Actions */}
            {isDoer && location.status !== 'Completed' && location.status !== 'Approved' && (
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label className="label">Remarks</label>
                  <input
                    type="text"
                    value={remarks[location._id] || ''}
                    onChange={(e) => setRemarks(prev => ({ ...prev, [location._id]: e.target.value }))}
                    placeholder="Add remarks for this location"
                    className="input"
                    data-testid={`location-remarks-${index}`}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {location.status === 'Pending' && (
                    <button
                      onClick={() => updateLocationStatus(location._id, 'In Progress', remarks[location._id])}
                      className="btn btn-primary"
                      style={{ fontSize: '0.813rem', padding: '0.5rem 1rem' }}
                      data-testid={`start-location-btn-${index}`}
                    >
                      <MapPin size={16} />
                      Start
                    </button>
                  )}
                  {location.status === 'In Progress' && (
                    <button
                      onClick={() => updateLocationStatus(location._id, 'Completed', remarks[location._id])}
                      className="btn btn-success"
                      style={{ fontSize: '0.813rem', padding: '0.5rem 1rem' }}
                      data-testid={`complete-location-btn-${index}`}
                    >
                      <Check size={16} />
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Viewer Approval */}
            {isViewer && location.status === 'Completed' && (
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                <button
                  onClick={() => approveLocation(location._id)}
                  className="btn btn-success"
                  style={{ fontSize: '0.813rem' }}
                  data-testid={`approve-location-btn-${index}`}
                >
                  <CheckCircle size={16} />
                  Approve Location
                </button>
              </div>
            )}
          </div>
        );
      })}

      {(!task.locations || task.locations.length === 0) && (
        <div className="card empty-state" style={{ padding: '2rem' }}>
          <MapPin size={48} strokeWidth={1.5} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>No locations added to this task</p>
        </div>
      )}
    </div>
  );
};

const TaskTimeline = ({ timeline }) => (
  <div className="card" style={{ padding: '1.5rem' }}>
    <h3 style={{ fontWeight: 600, marginBottom: '1.25rem' }}>Activity Timeline</h3>
    
    {timeline.length === 0 ? (
      <div className="empty-state" style={{ padding: '2rem' }}>
        <Clock size={48} strokeWidth={1.5} style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <p>No activity yet</p>
      </div>
    ) : (
      <div style={{ position: 'relative' }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute',
          left: '15px',
          top: '0',
          bottom: '0',
          width: '2px',
          background: '#e5e7eb'
        }} />

        {timeline.map((item, index) => (
          <div 
            key={item._id || index}
            style={{
              position: 'relative',
              paddingLeft: '2.5rem',
              paddingBottom: index === timeline.length - 1 ? 0 : '1.5rem'
            }}
          >
            {/* Timeline dot */}
            <div style={{
              position: 'absolute',
              left: '8px',
              top: '4px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: getEventColor(item.eventType),
              border: '2px solid white'
            }} />

            <div>
              <p style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                {item.description || getEventDescription(item)}
              </p>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                fontSize: '0.813rem',
                color: '#6b7280'
              }}>
                <span>{item.createdBy?.firstName || 'System'}</span>
                <span>•</span>
                <span>{new Date(item.createdAt).toLocaleString()}</span>
              </div>
              {item.geoTag && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.375rem',
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  marginTop: '0.25rem'
                }}>
                  <MapPin size={12} />
                  {item.geoTag.latitude?.toFixed(6)}, {item.geoTag.longitude?.toFixed(6)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const getEventColor = (eventType) => {
  const colors = {
    'task_created': '#1360C6',
    'status_changed': '#3b82f6',
    'location_updated': '#f59e0b',
    'location_completed': '#10b981',
    'location_approved': '#059669',
    'task_completed': '#10b981',
    'task_approved': '#059669',
    'attendance_start': '#6366f1',
    'attendance_end': '#8b5cf6',
    'remark_added': '#6b7280'
  };
  return colors[eventType] || '#6b7280';
};

const getEventDescription = (item) => {
  const descriptions = {
    'task_created': 'Task created',
    'status_changed': `Status changed to ${item.newStatus}`,
    'location_updated': `Location "${item.locationName}" updated`,
    'location_completed': `Location "${item.locationName}" completed`,
    'location_approved': `Location "${item.locationName}" approved`,
    'task_completed': 'Task marked as complete',
    'task_approved': 'Task approved'
  };
  return descriptions[item.eventType] || item.eventType;
};

const TaskDiscussions = ({ discussions, newComment, setNewComment, addComment, submitting, employees }) => (
  <div className="card" style={{ padding: '1.5rem' }}>
    <h3 style={{ fontWeight: 600, marginBottom: '1.25rem' }}>Discussion</h3>

    {/* Comment Form */}
    <form onSubmit={addComment} style={{ marginBottom: '1.5rem' }}>
      <div style={{ position: 'relative' }}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment... Use @name to mention someone"
          className="input"
          rows={3}
          style={{ paddingRight: '3rem' }}
          data-testid="comment-input"
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="btn btn-primary"
          style={{
            position: 'absolute',
            right: '0.5rem',
            bottom: '0.5rem',
            padding: '0.5rem'
          }}
          data-testid="send-comment-btn"
        >
          <Send size={18} />
        </button>
      </div>
      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.375rem' }}>
        Use @name to tag team members
      </p>
    </form>

    {/* Comments List */}
    {discussions.length === 0 ? (
      <div className="empty-state" style={{ padding: '2rem' }}>
        <MessageSquare size={48} strokeWidth={1.5} style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <p>No comments yet. Start the discussion!</p>
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {discussions.map((comment, index) => (
          <div 
            key={comment._id || index}
            style={{
              display: 'flex',
              gap: '0.75rem',
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '0.5rem'
            }}
          >
            <div 
              className="avatar avatar-md"
              style={{ background: '#1360C6', flexShrink: 0 }}
            >
              {comment.createdBy?.firstName?.[0]}{comment.createdBy?.lastName?.[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '0.375rem'
              }}>
                <span style={{ fontWeight: 500 }}>
                  {comment.createdBy?.firstName} {comment.createdBy?.lastName}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p style={{ color: '#374151', whiteSpace: 'pre-wrap' }}>
                {highlightMentions(comment.content)}
              </p>
              {comment.mentions && comment.mentions.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.375rem',
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#1360C6'
                }}>
                  <AtSign size={12} />
                  Mentioned: {comment.mentions.map(m => m.firstName).join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const highlightMentions = (text) => {
  if (!text) return text;
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) => 
    part.startsWith('@') ? (
      <span key={i} style={{ color: '#1360C6', fontWeight: 500 }}>{part}</span>
    ) : part
  );
};

export default TaskDetail;
