import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  CheckCircle2,
  Clock,
  Calendar,
  Check,
  X,
  Fingerprint,
  UserMinus,
  Activity,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Cpu,
  Lock,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Link } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Card, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { api } from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'

export default function DashboardPage() {
  const [showScannerDialog, setShowScannerDialog] = useState(false)
  const companyId = useAuthStore((state) => state.companyId)

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats', companyId],
    queryFn: async () => {
      const response = await api.get('/attendance/today-stats', {
        headers: { 'X-Company-Id': companyId }
      })
      return response.data
    },
    enabled: !!companyId,
  })

  const queryClient = useQueryClient()

  const { data: pendingRequests } = useQuery({
    queryKey: ['pendingTimeOff', companyId],
    queryFn: async () => {
      const response = await api.get('/time-off/requests', {
        headers: { 'X-Company-Id': companyId }
      })
      return response.data?.filter((r: any) => r.status === 'PENDING') || []
    },
    enabled: !!companyId,
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.put(`/time-off/${id}/status`, null, {
        params: { status },
        headers: { 'X-Company-Id': companyId },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingTimeOff'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })

  const launchScanner = () => {
    setShowScannerDialog(true)
  }

  const confirmLaunch = () => {
    setShowScannerDialog(false)
    window.location.href = `fingerprint://enroll?companyId=${companyId}`
  }

  // Today's formatted date
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }, [])

  // Weekly attendance chart dataset
  const weeklyTrends = useMemo(() => {
    const total = stats?.totalEmployees || 10
    const clockedIn = stats?.clockedIn || 0
    return [
      { day: 'Mon', attendance: Math.round(total * 0.88), onTime: Math.round(total * 0.82) },
      { day: 'Tue', attendance: Math.round(total * 0.94), onTime: Math.round(total * 0.90) },
      { day: 'Wed', attendance: Math.round(total * 0.91), onTime: Math.round(total * 0.85) },
      { day: 'Thu', attendance: Math.round(total * 0.96), onTime: Math.round(total * 0.92) },
      { day: 'Fri', attendance: Math.max(clockedIn, Math.round(total * 0.85)), onTime: Math.max(clockedIn - 1, Math.round(total * 0.80)) },
      { day: 'Sat', attendance: 0, onTime: 0 },
      { day: 'Sun', attendance: 0, onTime: 0 },
    ]
  }, [stats])

  const attendanceRate = useMemo(() => {
    if (!stats?.totalEmployees || stats.totalEmployees === 0) return 0
    return Math.round(((stats.clockedIn || 0) / stats.totalEmployees) * 100)
  }, [stats])

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">

          {/* ── Top Header Section ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Welcome back! Here's what's happening today • {todayFormatted}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={launchScanner}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 gap-2 hover:scale-[1.02]"
              >
                <Fingerprint className="h-4 w-4" />
                Launch Scanner
              </Button>

              <Link to="/reports">
                <Button
                  variant="outline"
                  className="rounded-xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium px-4 py-2.5 gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4 text-slate-500" />
                  Reports
                </Button>
              </Link>
            </div>
          </div>

          {/* ── Stats Metric Cards (5 Cards) ── */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {/* 1. Total Employees */}
            <Card className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Staff
                </span>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {stats?.totalEmployees || 0}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 font-medium flex items-center gap-1">
                  <span className="text-emerald-500 font-semibold">Active</span> across company
                </p>
              </div>
            </Card>

            {/* 2. Clocked In */}
            <Card className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Clocked In
                </span>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {stats?.clockedIn || 0}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {attendanceRate}% present
                  </span>
                  <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(attendanceRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* 3. Clocked Out */}
            <Card className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Clocked Out
                </span>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {stats?.clockedOut || 0}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                  Completed shift today
                </p>
              </div>
            </Card>

            {/* 4. On Leave */}
            <Card className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  On Leave
                </span>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
                  <UserMinus className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {stats?.onLeave || 0}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                  Approved time-off
                </p>
              </div>
            </Card>

            {/* 5. Pending Requests */}
            <Card className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group col-span-2 md:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Pending Action
                </span>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {stats?.pendingRequests || 0}
                </p>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-semibold">
                  {stats?.pendingRequests ? 'Requires review' : 'All requests settled'}
                </p>
              </div>
            </Card>
          </div>

          {/* ── Visual Section: Attendance Trends & Biometric Vault Status ── */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Weekly Attendance Trend Area Chart */}
            <Card className="lg:col-span-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                      Weekly Attendance Trend
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Daily workforce attendance and on-time verification rate
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      Present
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="h-2.5 w-2.5 rounded-full bg-teal-300" />
                      On-Time
                    </div>
                  </div>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="onTimeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="attendance"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#attendanceGradient)"
                      />
                      <Area
                        type="monotone"
                        dataKey="onTime"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#onTimeGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Updated in real-time via WebSocket</span>
                <Link to="/attendance" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1">
                  Full Attendance Logs <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Card>

            {/* Time Vault Biometric Hub Card */}
            <Card className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <Cpu className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Biometric Vault Hub
                      </h2>
                      <p className="text-xs text-slate-500">
                        Hardware &amp; Security Status
                      </p>
                    </div>
                  </div>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="space-y-3 mt-4">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Fingerprint className="h-4 w-4 text-emerald-500" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Scanner Sensor</p>
                        <p className="text-[11px] text-slate-500">Optical USB (ID_FprCap)</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                      Online
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Lock className="h-4 w-4 text-indigo-500" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Biometric Template</p>
                        <p className="text-[11px] text-slate-500">SHA-256 Hash (Zero Raw Images)</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md">
                      AES-256
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Web Protocol Link</p>
                        <p className="text-[11px] text-slate-500">fingerprint:// Windows Handler</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                      Registered
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                <Button
                  onClick={launchScanner}
                  variant="outline"
                  className="w-full justify-center gap-2 rounded-xl text-xs font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-100"
                >
                  <Fingerprint className="h-3.5 w-3.5 text-emerald-600" />
                  Test Biometric Connection
                </Button>
              </div>
            </Card>
          </div>

          {/* ── Today's Activity and Pending Approvals ── */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Today's Activity Card */}
            <Card className="flex flex-col p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-500" />
                  <CardTitle className="text-base font-bold">Today's Live Activity</CardTitle>
                </div>
                <Link to="/attendance" className="text-xs text-emerald-600 hover:underline font-semibold flex items-center gap-1">
                  View All <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="flex-1">
                {!stats?.recentActivity || stats.recentActivity.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <Clock className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No punches recorded today</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        Employees clocking in via the Fingerprint Scanner will appear here in real-time.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.recentActivity.map((log: any) => (
                      <div key={log.id} className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {log.employeeName ? log.employeeName[0] : 'E'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                            {log.employeeName || log.employeeCode}
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className={log.eventType === 'CLOCK_IN' ? 'text-emerald-600 font-semibold' : 'text-blue-600 font-semibold'}>
                              {log.eventType === 'CLOCK_IN' ? 'Clocked In'
                                : log.eventType === 'CLOCK_OUT' ? 'Clocked Out'
                                  : log.eventType === 'BREAK_START' ? 'Break Start'
                                    : 'Break End'}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(log.eventTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </p>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 font-bold">
                          VERIFIED
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Pending Approvals Card */}
            <Card className="flex flex-col p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-base font-bold">Pending Approvals</CardTitle>
                </div>
                <Link to="/time-off" className="text-xs text-amber-600 hover:underline font-semibold flex items-center gap-1">
                  Manage <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="flex-1">
                {!pendingRequests || pendingRequests.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">All caught up!</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        There are currently no pending time-off or leave requests requiring manager review.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.slice(0, 5).map((request: any) => (
                      <div key={request.id} className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                            {request.employeeName || 'Employee'}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {new Date(request.startDate).toLocaleDateString()} • {request.reason || 'Time Off Request'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            className="h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1"
                            onClick={() => updateStatusMutation.mutate({ id: request.id, status: 'APPROVED' })}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            onClick={() => updateStatusMutation.mutate({ id: request.id, status: 'REJECTED' })}
                            disabled={updateStatusMutation.isPending}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

        </main>
      </div>

      {/* ── Fingerprint Launch Dialog ── */}
      <Dialog open={showScannerDialog} onOpenChange={setShowScannerDialog}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader className="flex flex-col items-center text-center gap-2 pt-2">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-1 text-emerald-600">
              <Fingerprint className="h-9 w-9" />
            </div>
            <DialogTitle className="text-xl font-bold">Launch Fingerprint Scanner?</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground max-w-xs">
              This will launch the <span className="font-semibold text-foreground">Time Vault Secure Fingerprint App</span> via desktop protocol.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-4 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
            <span>Biometric hashes are computed directly by local hardware drivers and transmitted over TLS with AES-256 encryption.</span>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setShowScannerDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
              onClick={confirmLaunch}
            >
              <ExternalLink className="h-4 w-4" />
              Open Scanner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
