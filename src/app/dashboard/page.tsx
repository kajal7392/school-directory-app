'use client';

import Link from "next/link";
import './dashboard.css';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';

export default function Home() {
  const [stats, setStats] = useState({
    schoolCount: 0,
    lastAdded: '',
    mostViewed: '',
    favouritesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/school-stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError((err as Error).message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const { schoolCount, lastAdded, mostViewed, favouritesCount } = stats;

  const { user, logout, getAvatar, getAvatarColor } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="dashboard-container">
        {/* Top Navigation Bar */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>🏫 School Dashboard</h1>
            <div className="header-tagline">Comprehensive School Management System</div>
          </div>
          <div className="header-right">
            <div className="admin-profile">
              <div className="admin-avatar" style={{ backgroundColor: getAvatarColor() }}>
                {getAvatar()}
              </div>
              <div className="admin-info">
                <div className="admin-name">{user.username}</div>
                <div className="admin-role">{user.role}</div>
              </div>
            </div>
            <button 
              className="logout-btn" 
              aria-label="Logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        <div className="dashboard-main">
          {/* Sidebar Navigation */}
          <aside className="dashboard-sidebar">
            <div className="sidebar-top">
              <div className="sidebar-header">
                <h2>Navigation</h2>
              </div>
              <nav aria-label="Main Navigation">
                <ul className="sidebar-nav-list">
                  <li>
                    <Link href="/" className="nav-link logo-link">
                      <span className="nav-icon">🏫</span>
                      EduManage
                    </Link>
                  </li>
                  <li>
                    <Link href="/" className="nav-link">
                      <span className="nav-icon"></span>
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/showSchools" className="nav-link">
                      <span className="nav-icon"></span>
                      View Schools
                    </Link>
                  </li>
                  {user.role === 'admin' && (
                    <li>
                      <Link href="/addSchool" className="nav-link">
                        <span className="nav-icon"></span>
                        Add School
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
            </div>
            
            <div className="sidebar-stats">
              <h3>School Stats</h3>
              {loading ? (
                <p>Loading stats...</p>
              ) : error ? (
                <p className="error">Error: {error}</p>
              ) : (
                <>
                  <p className="mb-2">
                    <span className="font-bold">{schoolCount}</span> Schools Added
                  </p>
                  <p className="mb-2">
                    Last Added: <span className="italic">{lastAdded}</span>
                  </p>
                  <p className="mb-2">
                    Most Viewed: <span className="font-semibold">{mostViewed}</span>
                  </p>
                </>
              )}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="dashboard-content">
            {/* Welcome Section */}
            <section className="welcome-section">
              <div className="welcome-header">
                <div className="welcome-text">
                  <h2> Welcome, Admin!</h2>
                  <p>Manage your school database efficiently with our admin tools.</p>
                </div>
                <div className="date-display">
                  <span className="calendar-icon">📅</span> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              
              <div className="action-buttons">
                {user.role === 'admin' && (
                  <Link href="/addSchool" className="btn btn-primary">
                    <span className="btn-icon"></span> Add New School
                  </Link>
                )}
                <Link href="/showSchools" className="btn btn-secondary">
                  <span className="btn-icon"></span> View All Schools
                </Link>
              </div>
            </section>

            {/* Features Section */}
            <section className="feature-list">
              <h3>Admin Panel Features</h3>
              <div className="feature-grid">
                <div className="feature-item">
                  <div className="feature-icon" style={{ backgroundColor: "#3B82F6" }}>
                    🏫
                  </div>
                  <div className="feature-content">
                    <h4>School Management</h4>
                    <p>Manage multiple schools with comprehensive admin tools</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon" style={{ backgroundColor: "#10B981" }}>
                    👨‍🎓
                  </div>
                  <div className="feature-content">
                    <h4>Student Records</h4>
                    <p>Access and manage complete student information</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon" style={{ backgroundColor: "#F59E0B" }}>
                    📈
                  </div>
                  <div className="feature-content">
                    <h4>Performance Analytics</h4>
                    <p>Track academic performance with detailed reports</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon" style={{ backgroundColor: "#3B82F6" }}>
                    📅
                  </div>
                  <div className="feature-content">
                    <h4>Scheduling</h4>
                    <p>Create and manage class schedules and events</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon" style={{ backgroundColor: "#F59E0B" }}>
                    🔒
                  </div>
                  <div className="feature-content">
                    <h4>Access Control</h4>
                    <p>Manage user permissions and role-based access</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon" style={{ backgroundColor: "#10B981" }}>
                    📊
                  </div>
                  <div className="feature-content">
                    <h4>Data Export</h4>
                    <p>Export school data to multiple formats for reporting</p>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
