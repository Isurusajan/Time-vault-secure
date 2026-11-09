import { Link, useLocation } from 'react-router-dom'
import { Clock, LayoutDashboard, Users, CheckCircle2, BarChart3, Settings, Calendar, MapPin, UserMinus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function Sidebar() {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)

  const navigation = [
    // ... same nav items ... 
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Employees',
      href: '/employees',
      icon: Users,
    },
    {
      name: 'Attendance',
      href: '/attendance',
      icon: Clock,
    },
    {
      name: 'Time Off',
      href: '/time-off',
      icon: Calendar,
    },
    {
      name: 'On Leave',
      href: '/on-leave',
      icon: UserMinus,
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
    },
    {
      name: 'Locations',
      href: '/locations',
      icon: MapPin,
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ]

  return (
    <div className="w-64 border-r border-slate-200/80 dark:border-slate-800 bg-card flex-col hidden md:flex shrink-0 h-screen sticky top-0 shadow-sm">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="relative bg-slate-900 p-2.5 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-200">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" strokeWidth={2.5} />
            <div className="absolute inset-0 bg-emerald-500/20 blur-md rounded-xl pointer-events-none" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-950 via-slate-800 to-slate-900 dark:from-white dark:to-slate-300">
              Time Vault
            </span>
            <span className="text-[10px] font-mono tracking-widest text-emerald-600 dark:text-emerald-400 uppercase font-bold">
              Secure Biometrics
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Workspace
        </div>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                  )}
                />
                <span>{item.name}</span>
              </div>
              {isActive && (
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>

      {user && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
            <div className="relative">
              <Avatar className="h-9 w-9 border border-slate-200">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName} ${user.lastName}`} />
                <AvatarFallback className="bg-slate-900 text-white font-semibold text-xs">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {user.companyName || user.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
