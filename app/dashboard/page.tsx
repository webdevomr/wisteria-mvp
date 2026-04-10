'use client'

import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); router.refresh() }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-emerald-900">School Dashboard</h1>
        <button onClick={handleLogout} className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50">Logout</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/classes" className="bg-white p-6 rounded-lg shadow hover:shadow-md"><h3 className="font-bold text-lg mb-2">Classes</h3><p className="text-gray-600">Manage classes and arms</p></Link>
        <Link href="/dashboard/students" className="bg-white p-6 rounded-lg shadow hover:shadow-md"><h3 className="font-bold text-lg mb-2">Students</h3><p className="text-gray-600">Add and manage students</p></Link>
        <Link href="/setup" className="bg-white p-6 rounded-lg shadow hover:shadow-md"><h3 className="font-bold text-lg mb-2">School Setup</h3><p className="text-gray-600">Complete your profile</p></Link>
      </div>
    </main>
  )
}