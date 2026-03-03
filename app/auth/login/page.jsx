'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Users } from 'lucide-react'

export default function LoginPage() {
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
      setError('Invalid email or password')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100 px-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Users className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-center">Employee Login</h1>
        <p className="text-gray-600 text-center mb-6">Access your workspace</p>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <Input
            label="Email"
            labelClassName="text-blue-700 font-semibold"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            labelClassName="text-blue-700 font-semibold"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="text-center text-blue-600 mt-4 text-sm">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>

        

        <div className="mt-4 pt-4 border-t text-center">
          <Link href="/auth/admin-login" className="text-sm text-purple-600 hover:text-purple-800 font-medium">
            Admin Login →
          </Link>
        </div>
      </Card>
    </div>
  )
}