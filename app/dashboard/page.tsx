import Link from 'next/link'

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-emerald-900 mb-8">School Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/classes" className="bg-white p-6 rounded-lg shadow hover:shadow-md">
          <h3 className="font-bold text-lg mb-2">Classes</h3>
          <p className="text-gray-600">Manage classes and arms</p>
        </Link>
        
        <Link href="/dashboard/students" className="bg-white p-6 rounded-lg shadow hover:shadow-md">
          <h3 className="font-bold text-lg mb-2">Students</h3>
          <p className="text-gray-600">Add and manage students</p>
        </Link>
        
        <Link href="/setup" className="bg-white p-6 rounded-lg shadow hover:shadow-md">
          <h3 className="font-bold text-lg mb-2">School Setup</h3>
          <p className="text-gray-600">Complete your profile</p>
        </Link>
      </div>
    </main>
  )
}