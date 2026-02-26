import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Search,
  Users,
  ChevronRight,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';

const Employees = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      const employeeList = response.data?.employees || response.data || [];
      setEmployees(Array.isArray(employeeList) ? employeeList : []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      emp.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !filterRole || emp.role === filterRole;
    return matchesSearch && matchesRole;
  });

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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Employees
      </h1>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
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
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{ paddingLeft: '2.5rem' }}
              data-testid="search-employees"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="input"
            style={{ width: 'auto', minWidth: '150px' }}
            data-testid="filter-role"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="supervisor">Supervisor</option>
            <option value="employee">Employee</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <StatCard 
          label="Total Employees" 
          value={employees.length}
          color="#1360C6"
        />
        <StatCard 
          label="Admins" 
          value={employees.filter(e => e.role === 'admin').length}
          color="#dc2626"
        />
        <StatCard 
          label="Supervisors" 
          value={employees.filter(e => e.role === 'supervisor').length}
          color="#1d4ed8"
        />
        <StatCard 
          label="Employees" 
          value={employees.filter(e => e.role === 'employee').length}
          color="#16a34a"
        />
      </div>

      {/* Employees List */}
      {filteredEmployees.length === 0 ? (
        <div className="card empty-state" style={{ padding: '3rem' }}>
          <Users size={48} strokeWidth={1.5} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>No employees found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredEmployees.map(emp => {
            const roleStyle = getRoleBadge(emp.role);
            return (
              <div
                key={emp._id}
                className="card"
                onClick={() => navigate(`/employees/${emp._id}`)}
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
                data-testid={`employee-${emp._id}`}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div 
                      className="avatar avatar-lg"
                      style={{ background: '#1360C6' }}
                    >
                      {emp.firstName?.[0]}{emp.lastName?.[0]}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                        {emp.firstName} {emp.lastName}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        {emp.designation || emp.role}
                      </p>
                      <div style={{ 
                        display: 'flex', 
                        gap: '1rem',
                        fontSize: '0.813rem',
                        color: '#6b7280'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Mail size={14} />
                          {emp.email}
                        </span>
                        {emp.contactNumber && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <Phone size={14} />
                            {emp.contactNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      padding: '0.375rem 0.875rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      background: roleStyle.bg,
                      color: roleStyle.color,
                      textTransform: 'capitalize'
                    }}>
                      {emp.role}
                    </span>
                    <ChevronRight size={20} color="#9ca3af" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className="card" style={{ padding: '1.25rem' }}>
    <p style={{ fontSize: '0.813rem', color: '#6b7280', marginBottom: '0.375rem' }}>{label}</p>
    <p style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{value}</p>
  </div>
);

export default Employees;
