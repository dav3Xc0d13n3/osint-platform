import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { LayoutDashboard, Search, Image, Link2, Settings, LogOut, Menu, X, ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Username Search', href: '/username', icon: Search },
  { name: 'Image Search', href: '/image', icon: Image },
  { name: 'Link Analysis', href: '/link', icon: Link2 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950">
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-full bg-white dark:bg-dark-900 border-r border-dark-200 dark:border-dark-700 transition-all duration-300 lg:translate-x-0',
          sidebarOpen ? 'w-64' : 'w-20',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={clsx('flex h-16 items-center px-4 border-b border-dark-200 dark:border-dark-700', sidebarOpen && 'justify-between')}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && (
                <span className="font-bold text-lg text-dark-900 dark:text-white">OSINT</span>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={clsx('p-1 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 lg:hidden', !sidebarOpen && 'ml-auto')}
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Main navigation">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-dark-600 hover:bg-dark-100 dark:text-dark-400 dark:hover:bg-dark-800',
                    !sidebarOpen && 'justify-center px-2'
                  )
                }
                title={sidebarOpen ? undefined : item.name}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {sidebarOpen && <span>{item.name}</span>}
              </NavLink>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="p-3 border-t border-dark-200 dark:border-dark-700">
            <div className={clsx('flex items-center gap-3 px-3 py-2', !sidebarOpen && 'justify-center')}>
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              {sidebarOpen && user && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-dark-500 dark:text-dark-400 font-mono">{user.keyPrefix}...</p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-dark-600 hover:bg-dark-100 dark:text-dark-400 dark:hover:bg-dark-800 transition-colors',
                !sidebarOpen && 'justify-center px-2'
              )}
              title={sidebarOpen ? undefined : 'Logout'}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={clsx(
          'min-h-screen transition-all duration-300 lg:pl-64',
          sidebarOpen ? 'pl-64' : 'pl-20'
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-dark-950/80 backdrop-blur-sm border-b border-dark-200 dark:border-dark-700">
          <div className="flex h-full items-center justify-between px-4 lg:px-6">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-100 dark:bg-dark-800">
                <span className="text-xs font-mono text-dark-500 dark:text-dark-400">v1.0.0</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}