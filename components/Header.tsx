'use client'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useUserInfo } from '@/hooks/useUserInfo'

export default function Header() {
  const router = useRouter()
  const { userName, schoolName, schoolAbbreviation, loading } = useUserInfo()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white shadow border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-600 text-white px-3 py-1 rounded font-bold">
              {schoolAbbreviation || 'W'}
            </div>
            <div>
              {loading ? (
                <p className="text-sm text-gray-400">Loading...</p>
              ) : (
                <>
                  <h1 className="font-bold text-emerald-900">{schoolName}</h1>
                  <p className="text-xs text-gray-500">Welcome, {userName}</p>
                </>
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}