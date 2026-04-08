export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-emerald-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-emerald-900 mb-4">
          Welcome to Wisteria
        </h1>
        <p className="text-xl text-emerald-700 mb-8">
          Admin Dashboard (Day 2)
        </p>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">
            ✅ You are logged in!
          </p>
          <p className="text-gray-600 mt-2">
            Next: Build school setup wizard
          </p>
        </div>
      </div>
    </main>
  )
}