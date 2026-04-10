'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const [editingClass, setEditingClass] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    displayName: '',
    isCustomName: false,
    customTypeName: '',
    customLevel: '',
    mapsToStandard: 'JSS 1',
  })

  const [subclassArms, setSubclassArms] = useState<string[]>([''])

  const standardClasses = [
    'Creche', 'Nursery 1', 'Nursery 2',
    'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
    'JSS 1', 'JSS 2', 'JSS 3',
    'SS 1', 'SS 2', 'SS 3',
  ]

  useEffect(() => { fetchClasses() }, [])

  const fetchClasses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: userData } = await supabase.from('users').select('school_id').eq('id', user.id).single()
      if (!userData?.school_id) { setError('No school linked'); setLoading(false); return }

      const { data } = await supabase.from('classes').select('*').eq('school_id', userData.school_id).is('parent_class_id', null).order('display_name')
      if (data) setClasses(data)
    } catch (err) { console.error(err); setError('Failed to load classes') }
    finally { setLoading(false) }
  }

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: userData } = await supabase.from('users').select('school_id').eq('id', user.id).single()
      if (!userData?.school_id) { setError('No school linked'); return }

      const finalDisplayName = formData.isCustomName
        ? `${formData.customTypeName} ${formData.customLevel}`.trim()
        : formData.displayName

      const validArms = subclassArms.filter(arm => arm.trim() !== '')

      if (validArms.length === 0) {
        const { error } = await supabase.from('classes').insert([{
          school_id: userData.school_id,
          name: finalDisplayName,
          display_name: finalDisplayName,
          arm: null,
          arm_label: null,
          is_custom_name: formData.isCustomName,
          custom_type_name: formData.isCustomName ? formData.customTypeName : null,
          custom_level: formData.isCustomName ? formData.customLevel : null,
          maps_to_standard: formData.isCustomName ? formData.mapsToStandard : formData.displayName,
          is_active: true,
        }])
        if (error) throw error
      } else {
        const { data: mainClassData, error: mainError } = await supabase
          .from('classes')
          .insert([{
            school_id: userData.school_id,
            name: finalDisplayName,
            display_name: finalDisplayName,
            arm: null,
            arm_label: null,
            is_custom_name: formData.isCustomName,
            custom_type_name: formData.isCustomName ? formData.customTypeName : null,
            custom_level: formData.isCustomName ? formData.customLevel : null,
            maps_to_standard: formData.isCustomName ? formData.mapsToStandard : formData.displayName,
            is_active: true,
          }])
          .select()
          .single()

        if (mainError) throw mainError

        const subclassInsertions = validArms.map(arm => ({
          school_id: userData.school_id,
          parent_class_id: mainClassData.id,
          name: `${finalDisplayName} ${arm}`,
          display_name: `${finalDisplayName} ${arm}`,
          arm: arm,
          arm_label: arm,
          is_custom_name: formData.isCustomName,
          custom_type_name: formData.isCustomName ? formData.customTypeName : null,
          custom_level: formData.isCustomName ? formData.customLevel : null,
          maps_to_standard: formData.isCustomName ? formData.mapsToStandard : formData.displayName,
          is_active: true,
        }))

        const { error: subclassError } = await supabase.from('classes').insert(subclassInsertions)
        if (subclassError) throw subclassError
      }

      setShowModal(false)
      fetchClasses()
      setFormData({ displayName: '', isCustomName: false, customTypeName: '', customLevel: '', mapsToStandard: 'JSS 1' })
      setSubclassArms([''])
      alert(`Class created with ${validArms.length} subclass(es)!`)
    } catch (err: any) { setError(err.message || 'Failed to create class') }
  }

  const handleEditClass = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: userData } = await supabase.from('users').select('school_id').eq('id', user.id).single()
      if (!userData?.school_id) { setError('No school linked'); return }

      const { error: updateError } = await supabase
        .from('classes')
        .update({
          display_name: formData.displayName,
          name: formData.displayName,
          is_custom_name: formData.isCustomName,
          custom_type_name: formData.isCustomName ? formData.customTypeName : null,
          custom_level: formData.isCustomName ? formData.customLevel : null,
          maps_to_standard: formData.isCustomName ? formData.mapsToStandard : formData.displayName,
        })
        .eq('id', editingClass.id)

      if (updateError) throw updateError

      const { data: existingSubclasses } = await supabase
        .from('classes')
        .select('id, arm_label')
        .eq('parent_class_id', editingClass.id)

      if (existingSubclasses) {
        const existingArms = existingSubclasses.map(s => s.arm_label)
        const armsToDelete = existingSubclasses.filter(s => !subclassArms.includes(s.arm_label))
        
        if (armsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('classes')
            .delete()
            .in('id', armsToDelete.map(s => s.id))
          
          if (deleteError) throw deleteError
        }

        const newArms = subclassArms.filter(arm => !existingArms.includes(arm) && arm.trim() !== '')
        
        if (newArms.length > 0) {
          const subclassInsertions = newArms.map(arm => ({
            school_id: userData.school_id,
            parent_class_id: editingClass.id,
            name: `${formData.displayName} ${arm}`,
            display_name: `${formData.displayName} ${arm}`,
            arm: arm,
            arm_label: arm,
            is_custom_name: formData.isCustomName,
            is_active: true,
          }))

          const { error: insertError } = await supabase.from('classes').insert(subclassInsertions)
          if (insertError) throw insertError
        }
      }

      setShowEditModal(false)
      fetchClasses()
      alert('Class updated successfully!')
    } catch (err: any) { setError(err.message || 'Failed to update class') }
  }

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('This will delete the class and all its subclasses. Are you sure?')) {
      return
    }

    try {
      const { error: subclassError } = await supabase
        .from('classes')
        .delete()
        .eq('parent_class_id', classId)
      
      if (subclassError) throw subclassError

      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId)
      
      if (error) throw error
      
      fetchClasses()
      alert('Class deleted successfully!')
    } catch (err: any) {
      alert(err.message || 'Failed to delete class')
    }
  }

  const openEditModal = (cls: any) => {
    setEditingClass(cls)
    setFormData({
      displayName: cls.display_name || cls.name,
      isCustomName: cls.is_custom_name || false,
      customTypeName: cls.custom_type_name || '',
      customLevel: cls.custom_level || '',
      mapsToStandard: cls.maps_to_standard || 'JSS 1',
    })
    setSubclassArms([''])
    setShowEditModal(true)
  }

  const addSubclassField = () => {
    setSubclassArms([...subclassArms, ''])
  }

  const removeSubclassField = (index: number) => {
    const newArms = subclassArms.filter((_, i) => i !== index)
    setSubclassArms(newArms.length > 0 ? newArms : [''])
  }

  const updateSubclassField = (index: number, value: string) => {
    const newArms = [...subclassArms]
    newArms[index] = value
    setSubclassArms(newArms)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
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
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{cls.display_name || cls.name}</h3>
                    {cls.is_custom_name && <p className="text-xs text-emerald-600 mt-1">Maps to: {cls.maps_to_standard}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(cls)} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Edit</button>
                    <button onClick={() => handleDeleteClass(cls.id)} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Delete</button>
                  </div>
                </div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                    <select value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required>
                      <option value="">Select...</option>
                      {standardClasses.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label><input type="text" value={formData.customTypeName} onChange={(e) => setFormData({ ...formData, customTypeName: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="Year" required /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Level</label><input type="text" value={formData.customLevel} onChange={(e) => setFormData({ ...formData, customLevel: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="7" required /></div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Maps to Standard</label>
                      <select value={formData.mapsToStandard} onChange={(e) => setFormData({ ...formData, mapsToStandard: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                        {standardClasses.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                      </select>
                    </div>
                  </>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Subclasses/Arms (Optional)</label>
                    <button type="button" onClick={addSubclassField} className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200">+ Add Arm</button>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Add arms like A, B, C, Science, Arts, etc.</p>
                  
                  {subclassArms.map((arm, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input type="text" value={arm} onChange={(e) => updateSubclassField(index, e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder={`Arm ${index + 1}`} />
                      {subclassArms.length > 1 && (
                        <button type="button" onClick={() => removeSubclassField(index)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">✕</button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => { setShowModal(false); setSubclassArms(['']); }} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg">Add Class</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditModal && editingClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Class</h2>
              <form onSubmit={handleEditClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                  <input type="text" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Subclasses/Arms</label>
                    <button type="button" onClick={addSubclassField} className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200">+ Add Arm</button>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Current arms will be kept. Add new ones or remove unwanted ones.</p>
                  
                  {subclassArms.map((arm, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input type="text" value={arm} onChange={(e) => updateSubclassField(index, e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder={`Arm ${index + 1}`} />
                      {subclassArms.length > 1 && (
                        <button type="button" onClick={() => removeSubclassField(index)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">✕</button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg">Update</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}