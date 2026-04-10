'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const [formData, setFormData] = useState({ displayName: '', armLabel: '' })

  useEffect(() => { fetchClasses() }, [])

  const fetchClasses = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')
    const { data: userData } = await supabase.from('users').select('school_id').eq('id', user.id).single()
    if (!userData?.school_id) { setError('No school linked'); setLoading(false); return }
    const { data } = await supabase.from('classes').select('*').eq('school_id', userData.school_id).order('display_name')
    if (data) setClasses(data)
    setLoading(false)
  }

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: userData } = await supabase.from('users').select('school_id').eq('id', user.id).single()
    if (!userData?.school_id) return setError('No school linked')
    const { error } = await supabase.from('classes').insert([{ school_id: userData.school_id, display_name: formData.displayName, arm_label: formData.armLabel, is_active: true }])
    if (!error) { setShowModal(false); fetchClasses(); setFormData({ displayName: '', armLabel: '' }); alert('Class created!') }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-emerald-900">Classes</h1>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">+ Add Class</button>
      </div>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
      {loading ? <p className="text-gray-600">Loading...</p> : classes.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center"><p className="text-gray-600">No classes yet.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white p-4 rounded-lg shadow border">
              <h3 className="font-bold text-lg">{cls.display_name}</h3>
              {cls.arm_label && <p className="text-sm text-gray-600">Arm: {cls.arm_label}</p>}
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add Class</h2>
            <form onSubmit={handleAddClass} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label><input type="text" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="JSS 1" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Arm (Optional)</label><input type="text" value={formData.armLabel} onChange={(e) => setFormData({ ...formData, armLabel: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="A" /></div>
              <div className="flex gap-4"><button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg">Add</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}