import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../stores/auth'
import { LayoutDashboard, Search, Image, Link2, Settings, LogOut, Menu, ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Username Search', href: '/username', icon: Search },
  { name: 'Image Search', href: '/image', icon: Image },
  { name: 'Link Analysis', href: '/link', icon: Link2 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const sidebarVariants = {
  open: { width: 256, opacity: 1 },
  closed: { width: 80, opacity: 1 },
  mobileOpen: { x: 0, opacity: 1 },
  mobileClosed: { x: -300, opacity: 0 },
}

const navItemVariants = {
  open: { opacity: 1, x: 0 },
  closed: { opacity: 0, x: -20 },
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const pageTransition = {
  type: 'tween',
  ease: [0.25, 0.46, 0.45, 0.94],
  duration: 0.3,
}

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebarAnimation = mobileMenuOpen
    ? (sidebarOpen ? 'mobileOpen' : 'mobileClosed')
    : (sidebarOpen ? 'open' : 'closed')

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950">
      {/* Background ambient glow */}
      <motion.div
        className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
        animate={{
          background: [
            'radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)',
            'radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.03) 0%, transparent 50%)',
            'radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Mobile menu backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className="fixed top-0 left-0 z-50 h-full bg-white dark:bg-dark-900 border-r border-dark-200 dark:border-dark-700 lg:translate-x-0"
        variants={sidebarVariants}
        animate={sidebarAnimation}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={clsx('flex h-16 items-center px-4 border-b border-dark-200 dark:border-dark-700', sidebarOpen && 'justify-between')}>
            <motion.div
              layout
              className="flex items-center gap-2"
              initial={false}
            >
              <motion.div
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search className="w-5 h-5 text-white" />
              </motion.div>
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.span
                    key="logo-text"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="font-bold text-lg text-dark-900 dark:text-white"
                  >
                    OSINT
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={clsx('p-1 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 lg:hidden', !sidebarOpen && 'ml-auto')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Main navigation">
            <AnimatePresence mode="popLayout">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  variants={navItemVariants}
                  custom={sidebarOpen ? 'open' : 'closed'}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                >
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 shadow-sm shadow-primary-500/20'
                          : 'text-dark-600 hover:bg-dark-100 dark:text-dark-400 dark:hover:bg-dark-800',
                        !sidebarOpen && 'justify-center px-2'
                      )
                    }
                    title={sidebarOpen ? undefined : item.name}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <motion.span
                      layout
                      className="w-5 h-5 flex-shrink-0"
                      whileHover={{ scale: 1.15, rotate: 3 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <item.icon className="w-5 h-5" aria-hidden="true" />
                    </motion.span>
                    <AnimatePresence mode="wait">
                      {sidebarOpen && (
                        <motion.span
                          key={item.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.15 }}
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </NavLink>
                </motion.div>
              ))}
            </AnimatePresence>
          </nav>

          {/* User & Logout */}
          <div className="p-3 border-t border-dark-200 dark:border-dark-700">
            <motion.div
              className={clsx('flex items-center gap-3 px-3 py-2', !sidebarOpen && 'justify-center')}
              whileHover={{ x: sidebarOpen ? 4 : 0 }}
            >
              <motion.div
                className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0"
                whileHover={{ scale: 1.1, rotate: 3 }}
              >
                <Search className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </motion.div>
              <AnimatePresence mode="wait">
                {sidebarOpen && user && (
                  <motion.div
                    key="user-info"
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="flex-1 min-w-0 overflow-hidden"
                  >
                    <p className="text-sm font-medium text-dark-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-dark-500 dark:text-dark-400 font-mono">{user.keyPrefix}...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <motion.button
              onClick={handleLogout}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-dark-600 hover:bg-dark-100 dark:text-dark-400 dark:hover:bg-dark-800 transition-all duration-200',
                !sidebarOpen && 'justify-center px-2'
              )}
              title={sidebarOpen ? undefined : 'Logout'}
              whileHover={{ x: sidebarOpen ? 4 : 0, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.span
                layout
                className="w-5 h-5 flex-shrink-0"
                whileHover={{ rotate: -15, scale: 1.1 }}
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
              </motion.span>
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.span
                    key="logout-text"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <motion.main
        className={clsx(
          'min-h-screen transition-all duration-300 lg:pl-64',
          sidebarOpen ? 'pl-64' : 'pl-20'
        )}
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-dark-950/80 backdrop-blur-sm border-b border-dark-200 dark:border-dark-700">
          <div className="flex h-full items-center justify-between px-4 lg:px-6">
            <motion.button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800"
              aria-label="Open menu"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="w-6 h-6" />
            </motion.button>

            <div className="flex-1 lg:flex-none" />

            <motion.div
              layout
              className="flex items-center gap-4"
              initial={false}
            >
              <motion.div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-100 dark:bg-dark-800"
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              >
                <span className="text-xs font-mono text-dark-500 dark:text-dark-400">v1.0.0</span>
              </motion.div>
            </motion.div>
          </div>
        </header>

        {/* Page content with transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
            className="p-4 lg:p-6"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </motion.main>
    </div>
  )
}