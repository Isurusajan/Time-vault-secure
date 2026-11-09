import { Button } from '@/components/ui/button'
import { Bell, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'

import { MobileNav } from './MobileNav'

export function Header() {
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  function handleSignOut() {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-slate-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 w-full shrink-0">
      <div className="flex items-center gap-3">
        <MobileNav />
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Biometric Engine Online</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out" className="rounded-lg hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30">
          <LogOut className="h-4 w-4 text-slate-600 dark:text-slate-400 hover:text-rose-600" />
        </Button>
      </div>
    </header>
  )
}
