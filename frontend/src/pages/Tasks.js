import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  ChevronRight,
  Users,
  Clock,
  Globe
} from 'lucide-react';

const Tasks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [activeTab]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let endpoint = '/task/getTaskList';
      
      // Add filter params based on active tab
      const params = new URLSearchParams();
      if (activeTab === 'assigned') {
        params.append('filter', 'assigned');
      } else if (activeTab === 'created') {
        params.append('filter', 'created');
      } else if (activeTab === 'viewer') {
        params.append('filter', 'viewer');
      }

      const queryString = params.toString();
      const response = await api.get(queryString ? `${endpoint}?${queryString}` : endpoint);
      
      // Handle different response formats
      const taskList = response.data?.tasks || response.data || [];
      setTasks(Array.isArray(taskList) ? taskList : []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filterStatus || task.status === filterStatus;
    const matchesPriority = !filterPriority || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

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

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Tasks</h1>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/tasks/new')}
          data-testid="new-task-btn"
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
          data-testid="tab-all"
        >
          All Tasks
        </button>
        <button 
          className={`tab ${activeTab === 'assigned' ? 'active' : ''}`}
          onClick={() => setActiveTab('assigned')}
          data-testid="tab-assigned"
        >
          Assigned to Me
        </button>
        <button 
          className={`tab ${activeTab === 'created' ? 'active' : ''}`}
          onClick={() => setActiveTab('created')}
          data-testid="tab-created"
        >
          Created by Me
        </button>
        <button 
          className={`tab ${activeTab === 'viewer' ? 'active' : ''}`}
          onClick={() => setActiveTab('viewer')}
          data-testid="tab-viewer"
        >
          Viewing
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <Search 
              size={18} 
              style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} 
            />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{ paddingLeft: '2.5rem' }}
              data-testid="search-input"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input"
            style={{ width: 'auto', minWidth: '150px' }}
            data-testid="filter-status"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="For Approval">For Approval</option>
            <option value="Overdue">Overdue</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="input"
            style={{ width: 'auto', minWidth: '150px' }}
            data-testid="filter-priority"
          >
            <option value="">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="card empty-state" style={{ padding: '3rem' }}>
          <Calendar size={48} strokeWidth={1.5} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p style={{ marginBottom: '1rem' }}>No tasks found</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/tasks/new')}
          >
            <Plus size={18} />
            Create your first task
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredTasks.map((task) => (
            <TaskCard 
              key={task._id} 
              task={task} 
              onClick={() => navigate(`/tasks/${task._id}`)}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TaskCard = ({ task, onClick, getStatusBadge, getPriorityBadge }) => {
  const assignedTo = task.doers && task.doers.length > 0 
    ? task.doers.map(d => d.firstName || d.email).join(', ')
    : 'Unassigned';

  return (
    <div 
      className="card"
      onClick={onClick}
      style={{ 
        padding: '1.25rem', 
        cursor: 'pointer',
        transition: 'all 0.15s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.transform = '';
      }}
      data-testid={`task-card-${task._id}`}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        gap: '1rem'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            marginBottom: '0.5rem'
          }}>
            <h3 style={{ fontWeight: 600, fontSize: '1rem', color: '#111827' }}>
              {task.title}
            </h3>
            {task.isRemote && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.125rem 0.5rem',
                background: '#e0f2fe',
                color: '#0284c7',
                fontSize: '0.688rem',
                borderRadius: '4px',
                fontWeight: 500
              }}>
                <Globe size={12} />
                Remote
              </span>
            )}
            {task.isMultiLocation && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.125rem 0.5rem',
                background: '#fef3c7',
                color: '#d97706',
                fontSize: '0.688rem',
                borderRadius: '4px',
                fontWeight: 500
              }}>
                <MapPin size={12} />
                Multi-Location
              </span>
            )}
          </div>
          
          {task.description && (
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#6b7280',
              marginBottom: '0.75rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {task.description}
            </p>
          )}
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            flexWrap: 'wrap',
            fontSize: '0.813rem',
            color: '#6b7280'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Clock size={14} />
              Due: {new Date(task.dueDateTime).toLocaleDateString()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Users size={14} />
              {assignedTo}
            </div>
            {task.locations && task.locations.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <MapPin size={14} />
                {task.locations.length} Location(s)
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <span className={`badge ${getStatusBadge(task.status)}`}>
              {task.status}
            </span>
            <span className={`badge ${getPriorityBadge(task.priority)}`}>
              {task.priority}
            </span>
          </div>
        </div>
        <ChevronRight size={20} color="#9ca3af" />
      </div>
    </div>
  );
};

export default Tasks;
