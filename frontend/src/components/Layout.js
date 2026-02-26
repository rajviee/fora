import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ListTodo,
  Clock,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  DollarSign,
  Bell
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ListTodo, label: 'Tasks', path: '/tasks' },
    { icon: Clock, label: 'Attendance', path: '/attendance' },
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
    ...(user?.role === 'admin' ? [
      { icon: Users, label: 'Employees', path: '/employees' },
      { icon: DollarSign, label: 'Salary', path: '/salary' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ] : []),
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: '260px',
          minWidth: '260px',
          background: 'white',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 30,
          transform: window.innerWidth < 768 && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.3s ease'
        }}
        data-testid="sidebar"
      >
        {/* Logo */}
        <div style={{ 
          padding: '1.25rem 1rem', 
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              background: '#1360C6', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700
            }}>
              F
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.125rem', color: '#103362' }}>
              ForaTask
            </span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            style={{ 
              padding: '0.25rem', 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer',
              display: window.innerWidth >= 768 ? 'none' : 'block'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  background: isActive ? '#1360C6' : 'transparent',
                  color: isActive ? 'white' : '#4b5563'
                })}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <item.icon size={20} />
                <span style={{ fontWeight: 500 }}>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div style={{ 
          padding: '1rem', 
          borderTop: '1px solid #e5e7eb',
          background: '#f9fafb'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <div 
              className="avatar avatar-md"
              style={{ background: '#1360C6' }}
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontWeight: 500, 
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280',
                textTransform: 'capitalize'
              }}>
                {user?.role}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.625rem',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              color: '#6b7280',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.15s ease'
            }}
            data-testid="logout-btn"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        marginLeft: '260px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <header
          style={{
            height: '64px',
            background: 'white',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            position: 'sticky',
            top: 0,
            zIndex: 20
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ 
              padding: '0.5rem', 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer',
              display: window.innerWidth >= 768 ? 'none' : 'flex'
            }}
            data-testid="menu-toggle"
          >
            <Menu size={24} />
          </button>
          
          <div style={{ flex: 1 }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              style={{ 
                padding: '0.5rem', 
                background: 'transparent', 
                border: 'none',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <Bell size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div 
                className="avatar avatar-md"
                style={{ background: '#1360C6' }}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'capitalize' }}>
                  {user?.role}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          [data-testid="sidebar"] {
            transform: ${sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'} !important;
            z-index: 50 !important;
          }
          [data-testid="sidebar"] + div {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
