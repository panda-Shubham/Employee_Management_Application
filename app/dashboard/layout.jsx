import { Navigation } from '@/components/Navigation'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  )
}