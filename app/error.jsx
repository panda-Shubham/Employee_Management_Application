'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center text-gray-700 justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-6">
          We encountered an error. Please try again.
        </p>
        <Button onClick={reset}>Try again</Button>
      </Card>
    </div>
  )
}