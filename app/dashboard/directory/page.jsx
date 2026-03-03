'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

export default function DirectoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchUsers()
    }
  }, [session])

  useEffect(() => {
    if (search) {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.department?.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [search, users])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data)
      setFilteredUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6 text-gray-700">
      <div>
        <h1 className="text-3xl font-bold">Employee Directory</h1>
        <p className="text-gray-600 mt-2">Find and connect with colleagues</p>
      </div>

      <Input
        placeholder="Search by name, email, or department..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <Card key={user._id}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{user.name}</h3>
                {user.position && (
                  <p className="text-sm text-gray-600">{user.position}</p>
                )}
              </div>
              {user.role === 'ADMIN' && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  Admin
                </span>
              )}
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <div>✉️ {user.email}</div>
              {user.department && <div>🏢 {user.department}</div>}
            </div>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <p className="text-center text-gray-500 py-8">
            No employees found matching your search.
          </p>
        </Card>
      )}
    </div>
  )
}