import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ArrowLeft,
  Plus,
  Minus,
  MapPin,
  Calendar,
  Users,
  Upload,
  X,
  Globe,
  AlertCircle
} from 'lucide-react';

const AddTask = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState([]);
  const [orgSettings, setOrgSettings] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDateTime: '',
    priority: 'Medium',
    doers: [],
    viewers: [],
    isRemote: false,
    isMultiLocation: false,
    locations: [{ name: 'Location 1', description: '', address: '' }]
  });

  useEffect(() => {
    fetchEmployees();
    fetchOrgSettings();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data || []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const fetchOrgSettings = async () => {
    try {
      const response = await api.get('/organization-settings');
      setOrgSettings(response.data);
      // Auto-set remote if org default
      if (response.data?.tasksRemoteByDefault) {
        setFormData(prev => ({ ...prev, isRemote: true }));
      }
    } catch (err) {
      console.error('Failed to fetch org settings:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDoerChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, doers: selectedOptions }));
  };

  const handleViewerChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, viewers: selectedOptions }));
  };

  const handleLocationChange = (index, field, value) => {
    const newLocations = [...formData.locations];
    newLocations[index] = { ...newLocations[index], [field]: value };
    setFormData(prev => ({ ...prev, locations: newLocations }));
  };

  const addLocation = () => {
    const newIndex = formData.locations.length + 1;
    setFormData(prev => ({
      ...prev,
      locations: [...prev.locations, { name: `Location ${newIndex}`, description: '', address: '' }],
      isMultiLocation: prev.locations.length >= 1
    }));
  };

  const removeLocation = (index) => {
    if (formData.locations.length <= 1) return;
    const newLocations = formData.locations.filter((_, i) => i !== index);
    // Rename locations
    const renamedLocations = newLocations.map((loc, i) => ({
      ...loc,
      name: loc.name.startsWith('Location') ? `Location ${i + 1}` : loc.name
    }));
    setFormData(prev => ({
      ...prev,
      locations: renamedLocations,
      isMultiLocation: renamedLocations.length > 1
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    if (formData.doers.length === 0) {
      setError('Please assign at least one doer');
      return;
    }

    if (!formData.dueDateTime) {
      setError('Due date is required');
      return;
    }

    try {
      setLoading(true);

      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDateTime: new Date(formData.dueDateTime).toISOString(),
        priority: formData.priority,
        doers: formData.doers,
        viewers: formData.viewers,
        isRemote: formData.isRemote,
        isMultiLocation: formData.locations.length > 1,
        locations: formData.locations.map((loc, index) => ({
          name: loc.name || `Location ${index + 1}`,
          description: loc.description,
          address: loc.address,
          order: index + 1
        }))
      };

      const response = await api.post('/task', taskData);
      navigate(`/tasks/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
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
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create New Task</h1>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          color: '#dc2626',
          fontSize: '0.875rem'
        }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 600, marginBottom: '1.25rem' }}>Task Details</h2>
          
          {/* Title */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="label">Task Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              className="input"
              required
              data-testid="task-title-input"
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              className="input"
              rows={4}
              style={{ resize: 'vertical' }}
              data-testid="task-description-input"
            />
          </div>

          {/* Due Date & Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="label">Due Date *</label>
              <input
                type="datetime-local"
                name="dueDateTime"
                value={formData.dueDateTime}
                onChange={handleChange}
                className="input"
                required
                data-testid="task-due-date-input"
              />
            </div>
            <div>
              <label className="label">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input"
                data-testid="task-priority-select"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Remote Task Toggle */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '0.5rem',
            marginBottom: '1.25rem'
          }}>
            <input
              type="checkbox"
              id="isRemote"
              name="isRemote"
              checked={formData.isRemote}
              onChange={handleChange}
              style={{ width: '1.25rem', height: '1.25rem', accentColor: '#1360C6' }}
              data-testid="is-remote-checkbox"
            />
            <label htmlFor="isRemote" style={{ flex: 1, cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                <Globe size={18} color="#1360C6" />
                Remote Task
              </div>
              <p style={{ fontSize: '0.813rem', color: '#6b7280', marginTop: '0.25rem' }}>
                This task can be completed remotely without location verification
                {orgSettings?.tasksRemoteByDefault && ' (Organization default)'}
              </p>
            </label>
          </div>
        </div>

        {/* Assignments */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 600, marginBottom: '1.25rem' }}>Assignments</h2>

          {/* Doers */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="label">Assign To (Doers) *</label>
            <select
              multiple
              value={formData.doers}
              onChange={handleDoerChange}
              className="input"
              style={{ height: '120px' }}
              data-testid="task-doers-select"
            >
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} ({emp.designation || emp.role})
                </option>
              ))}
            </select>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.375rem' }}>
              Hold Ctrl/Cmd to select multiple
            </p>
          </div>

          {/* Viewers */}
          <div>
            <label className="label">Viewers (Optional)</label>
            <select
              multiple
              value={formData.viewers}
              onChange={handleViewerChange}
              className="input"
              style={{ height: '100px' }}
              data-testid="task-viewers-select"
            >
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} ({emp.designation || emp.role})
                </option>
              ))}
            </select>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.375rem' }}>
              Viewers can see task progress and approve locations
            </p>
          </div>
        </div>

        {/* Locations */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1.25rem'
          }}>
            <div>
              <h2 style={{ fontWeight: 600 }}>Task Locations</h2>
              <p style={{ fontSize: '0.813rem', color: '#6b7280', marginTop: '0.25rem' }}>
                {formData.locations.length > 1 
                  ? `Multi-location task with ${formData.locations.length} locations`
                  : 'Add more locations for multi-location tasks'
                }
              </p>
            </div>
            <button
              type="button"
              onClick={addLocation}
              className="btn btn-secondary"
              data-testid="add-location-btn"
            >
              <Plus size={18} />
              Add Location
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {formData.locations.map((location, index) => (
              <div 
                key={index}
                style={{
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  background: '#fafafa'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    color: '#1360C6',
                    fontWeight: 600
                  }}>
                    <MapPin size={18} />
                    Location {index + 1}
                  </div>
                  {formData.locations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLocation(index)}
                      className="btn btn-ghost"
                      style={{ padding: '0.375rem', color: '#ef4444' }}
                      data-testid={`remove-location-${index}`}
                    >
                      <Minus size={18} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label className="label">Location Name</label>
                    <input
                      type="text"
                      value={location.name}
                      onChange={(e) => handleLocationChange(index, 'name', e.target.value)}
                      placeholder="e.g., Client Office, Site A"
                      className="input"
                      data-testid={`location-name-${index}`}
                    />
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <textarea
                      value={location.description}
                      onChange={(e) => handleLocationChange(index, 'description', e.target.value)}
                      placeholder="What needs to be done at this location"
                      className="input"
                      rows={2}
                      data-testid={`location-description-${index}`}
                    />
                  </div>
                  <div>
                    <label className="label">Address</label>
                    <input
                      type="text"
                      value={location.address}
                      onChange={(e) => handleLocationChange(index, 'address', e.target.value)}
                      placeholder="Enter address"
                      className="input"
                      data-testid={`location-address-${index}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            data-testid="submit-task-btn"
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }} />
                Creating...
              </>
            ) : (
              <>
                <Plus size={18} />
                Create Task
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTask;
