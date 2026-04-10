'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [noSchool, setNoSchool] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    displayName: '',
    armLabel: '',
    isCustomName: false,
    customTypeName: '',
    customLevel: '',
    mapsToStandard: 'JSS 1',
  })

  const standardClasses = [
    { category: 'Early Years', options: ['Creche', 'Nursery 1', 'Nursery 2'] },
    { category: 'Primary', options: ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'] },
    { category: 'Junior Secondary', options: ['JSS 1', 'JSS 2', 'JSS 3'] },
    { category: 'Senior Secondary', options: ['SS 1', 'SS 2', 'SS 3'] },
  ]

  useEffect(() => { fetchClasses() }, [])

  const fetchClasses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('school_id, role')
        .eq('id', user.id)
        .single()
      
      if (userError || !userData) {
        setError('User profile not found')
        setLoading(false)
        return
      }

      if (!userData.school_id) {
        setNoSchool(true)
        setLoading(false)
        return
      }

      const { data, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', userData.school_id)
        .order('display_name')
      
      if (classesError) throw classesError
      if (data) setClasses(data)
    } catch (err) { 
      console.error(err)
      setError('Failed to load classes')
    } finally { 
      setLoading(false) 
    }
  }

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { data: userData } = await supabase
        .from('users')
        .select('school_id')
        .eq('id', user.id)
        .single()
      
      if (!userData || !userData.school_id) {
        throw new Error('No school found. Please complete school setup first.')
      }

      const finalDisplayName = formData.isCustomName 
        ? `${formData.customTypeName} ${formData.customLevel}`.trim()
        : formData.displayName

      const { error } = await supabase.from('classes').insert([{
        school_id: userData.school_id,
        display_name: finalDisplayName,
        arm_label: formData.armLabel,
        is_active: true,
      }])

      if (error) throw error
      setShowModal(false)
      fetchClasses()
      setFormData({ displayName: '', armLabel: '', isCustomName: false, customTypeName: '', customLevel: '', mapsToStandard: 'JSS 1' })
      alert('Class created!')
    } catch (err: any) {
      setError(err.message || 'Failed to create class')
    }
  }

  if (noSchool) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">No School Linked</h2>
          <p className="text-yellow-700 mb-4">Your account is not linked to any school yet.</p>
          <button onClick={() => router.push('/setup')} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Complete School Setup →</button>
        </div>
      </div>
    )
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Class</h2>
            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Uses standard names?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="nameType" checked={!formData.isCustomName} onChange={() => setFormData({ ...formData, isCustomName: false })} />
                    <span className="text-sm">Yes (JSS, SS, Primary)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="nameType" checked={formData.isCustomName} onChange={() => setFormData({ ...formData, isCustomName: true })} />
                    <span className="text-sm">No (Year 7, Form 3)</span>
                  </label>
                </div>
              </div>
              {!formData.isCustomName ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class Type</label>
                  <select value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required>
                    <option value="">Select...</option>
                    {standardClasses.map((cat) => (
                      <optgroup key={cat.category} label={cat.category}>
                        {cat.options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                      <input type="text" value={formData.customTypeName} onChange={(e) => setFormData({ ...formData, customTypeName: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="Year" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                      <input type="text" value={formData.customLevel} onChange={(e) => setFormData({ ...formData, customLevel: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="7" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maps to Standard</label>
                    <select value={formData.mapsToStandard} onChange={(e) => setFormData({ ...formData, mapsToStandard: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                      {standardClasses.flatMap(c => c.options).map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arm (Optional)</label>
                <input type="text" value={formData.armLabel} onChange={(e) => setFormData({ ...formData, armLabel: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="A" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}