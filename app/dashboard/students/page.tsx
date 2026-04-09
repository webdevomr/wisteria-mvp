'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { encrypt, hashPhone, normalizePhone } from '@/lib/encryption'

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Male',
    dob: '',
    parentPhone: '',
    classId: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { data: userData } = await supabase.from('users').select('school_id').eq('id', user.id).single()
    if (!userData) return

    const { data: classesData } = await supabase.from('classes').select('id, display_name, arm_label').eq('school_id', userData.school_id)
    const { data: studentsData } = await supabase.from('students').select('*').eq('school_id', userData.school_id).limit(50)

    if (classesData) setClasses(classesData)
    if (studentsData) setStudents(studentsData)
    setLoading(false)
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: userData } = await supabase.from('users').select('school_id').eq('id', user.id).single()
    if (!userData) return

    // Generate Student ID via RPC
    const { data: idData } = await supabase.rpc('get_next_id', {
      p_school_id: userData.school_id,
      p_entity_type: 'student'
    })

    const studentId = idData || 'STD-0001'

    // Encrypt sensitive data
    const dobEnc = encrypt(formData.dob)
    const phoneNormalized = normalizePhone(formData.parentPhone)
    const phoneEnc = encrypt(phoneNormalized)
    const phoneHash = hashPhone(phoneNormalized)

    const { error } = await supabase.from('students').insert([{
      school_id: userData.school_id,
      student_id: studentId,
      full_name: formData.fullName,
      gender: formData.gender,
      date_of_birth_enc: dobEnc,
      parent_phone_enc: phoneEnc,
      parent_phone_hash: phoneHash,
      class_id: formData.classId,
      status: 'active',
    }])

    if (!error) {
      setShowModal(false)
      fetchData()
      setFormData({ fullName: '', gender: 'Male', dob: '', parentPhone: '', classId: '' })
      alert(`Student added! ID: ${studentId}`)
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-emerald-900">Students</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          + Add Student
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : students.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600">No students yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 text-sm font-mono text-emerald-700">{student.student_id}</td>
                  <td className="px-6 py-4 text-sm">{student.full_name}</td>
                  <td className="px-6 py-4 text-sm">{student.class_id ? 'Assigned' : 'Unassigned'}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800">{student.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add Student</h2>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DOB</label>
                  <input type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone</label>
                <input type="tel" value={formData.parentPhone} onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="08012345678" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required>
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.display_name} {cls.arm_label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}