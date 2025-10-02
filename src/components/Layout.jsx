import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
      end={to === '/'}
    >
      {label}
    </NavLink>
  )
}

export default function Layout() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="brand">VMS</span>
          <p>Vaccination Management</p>
        </div>
        <nav className="nav">
          <NavItem to="/" label="Dashboard" />
          <NavItem to="/campaigns" label="Campaigns" />
          <NavItem to="/bookings" label="Bookings" />
          <NavItem to="/reviews" label="Reviews" />
        </nav>
        <button className="logout" onClick={handleLogout}>
          Log out
        </button>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="topbar-content">
            <div>
              <h1>Welcome back{user?.username ? `, ${user.username}` : ''}</h1>
              <p className="muted">Manage campaigns, bookings, and feedback in one place.</p>
            </div>
            {user && (
              <div className="profile-card">
                <span className="chip">{user.role}</span>
                <span>{user.email}</span>
              </div>
            )}
          </div>
        </header>
        <main className="workspace">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
