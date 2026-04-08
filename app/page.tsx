import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-emerald-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-emerald-900 mb-4">
          Wisteria
        </h1>
        <p className="text-xl text-emerald-700 mb-8">
          Result Publishing Platform for Nigerian Schools
        </p>
        
        <div className="flex gap-4 justify-center mb-8">
          <Link
            href="/register"
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Start Free Trial
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50"
          >
            Login
          </Link>
        </div>

        <div className="inline-block px-6 py-3 bg-white rounded-lg shadow mb-8">
          <p className="text-sm text-gray-600">
            🚀 Building in Public — Week 1 of 16
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <Link
            href="/login"
            className="p-4 bg-white rounded-lg shadow hover:shadow-md"
          >
            <p className="font-semibold text-emerald-900">School Login</p>
            <p className="text-sm text-gray-600">Admin, Teachers, Students</p>
          </Link>
          <Link
            href="/result"
            className="p-4 bg-white rounded-lg shadow hover:shadow-md"
          >
            <p className="font-semibold text-emerald-900">Parent Portal</p>
            <p className="text-sm text-gray-600">Check Results</p>
          </Link>
          <Link
            href="/admin"
            className="p-4 bg-white rounded-lg shadow hover:shadow-md"
          >
            <p className="font-semibold text-emerald-900">Super Admin</p>
            <p className="text-sm text-gray-600">Platform Management</p>
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          🇳🇬 Made for Nigerian Schools
        </p>
      </div>
    </main>
  )
}