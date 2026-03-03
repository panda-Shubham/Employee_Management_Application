'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Shield } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid admin credentials')
      setLoading(false)
      return
    }

    // Check if user is admin
    const response = await fetch('/api/auth/session')
    const session = await response.json()

    if (session?.user?.role !== 'ADMIN') {
      await signOut({ redirect: false })
      setError('Access denied. Admin credentials required.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Shield className="h-12 w-12 text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-center">Admin Login</h1>
        <p className="text-gray-600 text-center mb-6">Administrator Access Only</p>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <Input
            label="Admin Email"
            labelClassName="text-purple-700 font-semibold"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Admin Password"
            labelClassName="text-purple-700 font-semibold"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
            {loading ? 'Logging in...' : 'Login as Admin'}
          </Button>
        </form>

        <div className="mt-6 p-3 bg-purple-50 rounded text-sm">
          <p className="font-medium text-purple-900">Demo Admin Account:</p>
          <p className="text-purple-700">admin@company.com / password123</p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">
            ← Employee Login
          </Link>
        </div>
      </Card>
    </div>
  )
}