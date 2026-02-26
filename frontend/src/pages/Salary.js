import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Users,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

const Salary = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salaryConfig, setSalaryConfig] = useState(null);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newComponent, setNewComponent] = useState({ name: '', type: 'earning', amount: 0, isPercentage: false });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchSalaryData(selectedEmployee._id);
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data || []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaryData = async (employeeId) => {
    try {
      const [configRes, recordsRes] = await Promise.all([
        api.get(`/salary/config/${employeeId}`),
        api.get(`/salary/records/${employeeId}`)
      ]);
      setSalaryConfig(configRes.data);
      setSalaryRecords(recordsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch salary data:', err);
      setSalaryConfig(null);
      setSalaryRecords([]);
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedEmployee || !salaryConfig) return;

    try {
      await api.put(`/salary/config/${selectedEmployee._id}`, salaryConfig);
      setEditing(false);
      fetchSalaryData(selectedEmployee._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save salary config');
    }
  };

  const handleAddComponent = () => {
    if (!newComponent.name.trim()) return;
    
    setSalaryConfig(prev => ({
      ...prev,
      components: [...(prev?.components || []), { ...newComponent, isFixed: true }]
    }));
    setNewComponent({ name: '', type: 'earning', amount: 0, isPercentage: false });
  };

  const handleRemoveComponent = (index) => {
    setSalaryConfig(prev => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index)
    }));
  };

  const generateSalary = async (month) => {
    if (!selectedEmployee) return;

    try {
      await api.post(`/salary/generate/${selectedEmployee._id}`, { month });
      fetchSalaryData(selectedEmployee._id);
      alert('Salary generated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate salary');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Salary Management
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
        {/* Employee List */}
        <div className="card" style={{ padding: '1rem', height: 'fit-content' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem', padding: '0 0.5rem' }}>Employees</h3>
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <div className="spinner" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {employees.map(emp => (
                <div
                  key={emp._id}
                  onClick={() => setSelectedEmployee(emp)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    background: selectedEmployee?._id === emp._id ? '#f0f7ff' : 'transparent',
                    border: selectedEmployee?._id === emp._id ? '1px solid #1360C6' : '1px solid transparent'
                  }}
                  data-testid={`salary-employee-${emp._id}`}
                >
                  <div 
                    className="avatar avatar-sm"
                    style={{ background: '#1360C6' }}
                  >
                    {emp.firstName?.[0]}{emp.lastName?.[0]}
                  </div>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      {emp.firstName} {emp.lastName}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {emp.designation || emp.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Salary Configuration */}
        <div>
          {!selectedEmployee ? (
            <div className="card empty-state" style={{ padding: '3rem' }}>
              <Users size={48} strokeWidth={1.5} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Select an employee to view salary details</p>
            </div>
          ) : (
            <>
              {/* Config Card */}
              <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <h3 style={{ fontWeight: 600 }}>
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Salary Configuration</p>
                  </div>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="btn btn-secondary"
                      data-testid="edit-salary-btn"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setEditing(false)}
                        className="btn btn-secondary"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveConfig}
                        className="btn btn-primary"
                        data-testid="save-salary-btn"
                      >
                        <Save size={16} />
                        Save
                      </button>
                    </div>
                  )}
                </div>

                {salaryConfig ? (
                  <div>
                    {/* Basic Salary */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label className="label">Basic Salary</label>
                      <input
                        type="number"
                        value={salaryConfig.basicSalary || 0}
                        onChange={(e) => setSalaryConfig(prev => ({ 
                          ...prev, 
                          basicSalary: parseFloat(e.target.value) 
                        }))}
                        disabled={!editing}
                        className="input"
                        style={{ maxWidth: '200px' }}
                        data-testid="basic-salary-input"
                      />
                    </div>

                    {/* Components */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ fontWeight: 500, marginBottom: '1rem' }}>Salary Components</h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {(salaryConfig.components || []).map((comp, index) => (
                          <div 
                            key={index}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              padding: '0.75rem 1rem',
                              background: comp.type === 'earning' ? '#f0fdf4' : '#fef2f2',
                              borderRadius: '0.5rem'
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <span style={{ fontWeight: 500 }}>{comp.name}</span>
                              <span style={{ 
                                fontSize: '0.75rem', 
                                marginLeft: '0.5rem',
                                color: comp.type === 'earning' ? '#16a34a' : '#dc2626'
                              }}>
                                ({comp.type})
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 500 }}>
                                {comp.isPercentage ? `${comp.amount}%` : `₹${comp.amount?.toLocaleString()}`}
                              </span>
                              {editing && (
                                <button
                                  onClick={() => handleRemoveComponent(index)}
                                  style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    cursor: 'pointer',
                                    color: '#ef4444'
                                  }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Component */}
                      {editing && (
                        <div style={{ 
                          marginTop: '1rem',
                          padding: '1rem',
                          background: '#f9fafb',
                          borderRadius: '0.5rem'
                        }}>
                          <h5 style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.75rem' }}>
                            Add Component
                          </h5>
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                            gap: '0.75rem',
                            alignItems: 'end'
                          }}>
                            <div>
                              <label className="label">Name</label>
                              <input
                                type="text"
                                value={newComponent.name}
                                onChange={(e) => setNewComponent(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., HRA"
                                className="input"
                              />
                            </div>
                            <div>
                              <label className="label">Type</label>
                              <select
                                value={newComponent.type}
                                onChange={(e) => setNewComponent(prev => ({ ...prev, type: e.target.value }))}
                                className="input"
                              >
                                <option value="earning">Earning</option>
                                <option value="deduction">Deduction</option>
                              </select>
                            </div>
                            <div>
                              <label className="label">Amount</label>
                              <input
                                type="number"
                                value={newComponent.amount}
                                onChange={(e) => setNewComponent(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                                className="input"
                              />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <input
                                type="checkbox"
                                id="isPercentage"
                                checked={newComponent.isPercentage}
                                onChange={(e) => setNewComponent(prev => ({ ...prev, isPercentage: e.target.checked }))}
                              />
                              <label htmlFor="isPercentage" style={{ fontSize: '0.875rem' }}>Percentage</label>
                            </div>
                            <button
                              onClick={handleAddComponent}
                              className="btn btn-primary"
                              data-testid="add-component-btn"
                            >
                              <Plus size={16} />
                              Add
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Standard Deductions */}
                    <div>
                      <h4 style={{ fontWeight: 500, marginBottom: '1rem' }}>Standard Deductions</h4>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '1rem' 
                      }}>
                        <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                              type="checkbox"
                              checked={salaryConfig.standardDeductions?.pf?.enabled || false}
                              onChange={(e) => setSalaryConfig(prev => ({
                                ...prev,
                                standardDeductions: {
                                  ...prev.standardDeductions,
                                  pf: { ...prev.standardDeductions?.pf, enabled: e.target.checked }
                                }
                              }))}
                              disabled={!editing}
                            />
                            <span style={{ fontWeight: 500 }}>Provident Fund (PF)</span>
                          </div>
                          {salaryConfig.standardDeductions?.pf?.enabled && (
                            <input
                              type="number"
                              value={salaryConfig.standardDeductions?.pf?.percentage || 12}
                              onChange={(e) => setSalaryConfig(prev => ({
                                ...prev,
                                standardDeductions: {
                                  ...prev.standardDeductions,
                                  pf: { ...prev.standardDeductions?.pf, percentage: parseFloat(e.target.value) }
                                }
                              }))}
                              disabled={!editing}
                              className="input"
                              style={{ marginTop: '0.5rem' }}
                              placeholder="Percentage"
                            />
                          )}
                        </div>
                        <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                              type="checkbox"
                              checked={salaryConfig.standardDeductions?.professionalTax?.enabled || false}
                              onChange={(e) => setSalaryConfig(prev => ({
                                ...prev,
                                standardDeductions: {
                                  ...prev.standardDeductions,
                                  professionalTax: { ...prev.standardDeductions?.professionalTax, enabled: e.target.checked }
                                }
                              }))}
                              disabled={!editing}
                            />
                            <span style={{ fontWeight: 500 }}>Professional Tax</span>
                          </div>
                          {salaryConfig.standardDeductions?.professionalTax?.enabled && (
                            <input
                              type="number"
                              value={salaryConfig.standardDeductions?.professionalTax?.amount || 200}
                              onChange={(e) => setSalaryConfig(prev => ({
                                ...prev,
                                standardDeductions: {
                                  ...prev.standardDeductions,
                                  professionalTax: { ...prev.standardDeductions?.professionalTax, amount: parseFloat(e.target.value) }
                                }
                              }))}
                              disabled={!editing}
                              className="input"
                              style={{ marginTop: '0.5rem' }}
                              placeholder="Amount"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <DollarSign size={48} strokeWidth={1.5} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No salary configuration found</p>
                    <button
                      onClick={() => setSalaryConfig({
                        basicSalary: 0,
                        components: [],
                        standardDeductions: {
                          pf: { enabled: true, percentage: 12 },
                          professionalTax: { enabled: true, amount: 200 }
                        }
                      })}
                      className="btn btn-primary"
                      style={{ marginTop: '1rem' }}
                    >
                      Create Configuration
                    </button>
                  </div>
                )}
              </div>

              {/* Salary Records */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{ fontWeight: 600 }}>Salary History</h3>
                  <button
                    onClick={() => {
                      const month = prompt('Enter month (YYYY-MM):', format(new Date(), 'yyyy-MM'));
                      if (month) generateSalary(month);
                    }}
                    className="btn btn-primary"
                    data-testid="generate-salary-btn"
                  >
                    <Calendar size={16} />
                    Generate Salary
                  </button>
                </div>

                {salaryRecords.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <Calendar size={48} strokeWidth={1.5} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No salary records found</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th>Basic</th>
                          <th>Earnings</th>
                          <th>Deductions</th>
                          <th>Net Salary</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salaryRecords.map((record) => (
                          <tr key={record._id}>
                            <td>{record.month}</td>
                            <td>₹{record.basicSalary?.toLocaleString()}</td>
                            <td style={{ color: '#16a34a' }}>₹{record.totalEarnings?.toLocaleString()}</td>
                            <td style={{ color: '#dc2626' }}>₹{record.totalDeductions?.toLocaleString()}</td>
                            <td style={{ fontWeight: 600 }}>₹{record.netSalary?.toLocaleString()}</td>
                            <td>
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                background: record.status === 'paid' ? '#dcfce7' : '#fef3c7',
                                color: record.status === 'paid' ? '#166534' : '#92400e',
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Salary;
