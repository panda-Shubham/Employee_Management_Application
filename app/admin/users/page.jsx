// app/admin/users/page.jsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  Search,
  Shield,
  ShieldOff,
  UserX,
  UserCheck,
  Users,
  Crown,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'

// ─── Stat Card ────────────────────────────────────────────────────────────────
// Updated to Light Theme: White background, subtle shadow, and solid text colors
function StatCard({ label, value, colorClass }) {
  return (
    <Card className="p-5 shadow-sm border-gray-100">
      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
    </Card>
  )
}

// ─── Badge ───────────────────────────────────────────────────────────────────
// Updated to soft pastel backgrounds with high-contrast text
function Badge({ label, color }) {
  const colors = {
    purple: 'bg-violet-100 text-violet-700 border-violet-200',
    red:    'bg-red-100    text-red-700    border-red-200',
    blue:   'bg-blue-100   text-blue-700   border-blue-200',
    green:  'bg-green-100  text-green-700  border-green-200',
    gray:   'bg-gray-100   text-gray-600   border-gray-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-tight ${colors[color] ?? colors.gray}`}>
      {label}
    </span>
  )
}

// ─── Action Button ────────────────────────────────────────────────────────────
function ActionButton({ onClick, icon: Icon, label, variant, disabled }) {
  const variants = {
    red:    'bg-white text-red-600 border-gray-200 hover:bg-red-50 hover:border-red-200',
    green:  'bg-white text-green-600 border-gray-200 hover:bg-green-50 hover:border-green-200',
    purple: 'bg-white text-violet-600 border-gray-200 hover:bg-violet-50 hover:border-violet-200',
    gray:   'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200 disabled:opacity-50 ${variants[variant]}`}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{label}</span>
    </button>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, isAdmin, isActive }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2
      ${!isActive ? 'bg-gray-100 text-gray-400 border-gray-200' :
        isAdmin   ? 'bg-violet-100 text-violet-700 border-violet-200' :
                    'bg-blue-100   text-blue-700   border-blue-200'}`}>
      {initials}
    </div>
  )
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => { fetchUsers() }, [])

  useEffect(() => {
    let result = [...users]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(u => 
        u.name?.toLowerCase().includes(q) || 
        u.email?.toLowerCase().includes(q)
      )
    }
    if (filterRole !== 'ALL') result = result.filter(u => u.role === filterRole)
    if (filterStatus === 'ACTIVE') result = result.filter(u => u.isActive)
    if (filterStatus === 'INACTIVE') result = result.filter(u => !u.isActive)
    setFiltered(result)
  }, [search, filterRole, filterStatus, users])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users'); const data = await res.json();
      setUsers(data)
    } finally { setLoading(false) }
  }

  // Stats logic matches your previous logic
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    admins: users.filter(u => u.role === 'ADMIN').length
  }

  if (loading) return <div className="text-center py-20 text-gray-500">Loading Users...</div>

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage accounts, roles, and system access</p>
      </div>

      {/* Stats - Using the light palette from Analytics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Users" value={stats.total} colorClass="text-gray-900" />
        <StatCard label="Active" value={stats.active} colorClass="text-green-600" />
        <StatCard label="Inactive" value={stats.inactive} colorClass="text-red-600" />
        <StatCard label="Admins" value={stats.admins} colorClass="text-violet-600" />
      </div>

      {/* Filters & Table */}
      <Card className="overflow-hidden border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            {['ALL', 'ADMIN', 'EMPLOYEE'].map(r => (
              <button 
                key={r}
                onClick={() => setFilterRole(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filterRole === r ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-4 font-bold">User Information</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {filtered.map(user => (
                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} isAdmin={user.role === 'ADMIN'} isActive={user.isActive} />
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge 
                      label={user.role} 
                      color={user.role === 'ADMIN' ? 'purple' : 'blue'} 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Badge 
                      label={user.isActive ? 'Active' : 'Inactive'} 
                      color={user.isActive ? 'green' : 'gray'} 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {/* Action buttons styled with the light theme variants */}
                      <button className="p-2 hover:bg-gray-100 rounded-md text-gray-500 transition-colors">
                        <Shield className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-md text-red-500 transition-colors">
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
