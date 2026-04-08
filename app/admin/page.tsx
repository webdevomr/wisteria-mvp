'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [schools, setSchools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching schools:', error)
    } else {
      setSchools(data || [])
    }
    setLoading(false)
  }

  const approveSchool = async (schoolId: string) => {
    const { error } = await supabase
      .from('schools')
      .update({ status: 'approved' })
      .eq('id', schoolId)

    if (error) {
      alert('Failed to approve school')
    } else {
      alert('School approved!')
      fetchSchools()
    }
  }

  const rejectSchool = async (schoolId: string) => {
    const { error } = await supabase
      .from('schools')
      .update({ status: 'rejected' })
      .eq('id', schoolId)

    if (error) {
      alert('Failed to reject school')
    } else {
      alert('School rejected')
      fetchSchools()
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-900 mb-2">
          Super Admin Dashboard
        </h1>
        <p className="text-gray-600 mb-8">
          Manage school registrations and platform settings
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Schools</p>
            <p className="text-3xl font-bold text-emerald-900">
              {schools.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Pending Approval</p>
            <p className="text-3xl font-bold text-orange-600">
              {schools.filter((s) => s.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Approved</p>
            <p className="text-3xl font-bold text-emerald-600">
              {schools.filter((s) => s.status === 'approved').length}
            </p>
          </div>
        </div>

        {/* Schools Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              School Registrations
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-600">Loading...</div>
          ) : schools.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              No schools registered yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      School
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Subdomain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {schools.map((school) => (
                    <tr key={school.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {school.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {school.subdomain}.wisteria.ng
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {school.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            school.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : school.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {school.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(school.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {school.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveSchool(school.id)}
                              className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectSchool(school.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {school.status !== 'pending' && (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-emerald-50 rounded-lg">
          <p className="text-sm text-emerald-800">
            💡 <strong>Tip:</strong> New schools start with "pending" status.
            Approve them to activate their portal.
          </p>
        </div>
      </div>
    </main>
  )
}