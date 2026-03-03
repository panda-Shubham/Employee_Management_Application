import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function NotFound() {
  return (
    <div className="min-h-screen text-gray-700 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <h2 className="text-4xl font-bold mb-4">404</h2>
        <p className="text-xl font-semibold mb-2">Page Not Found</p>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist.
        </p>
        <Link href="/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
      </Card>
    </div>
  )
}