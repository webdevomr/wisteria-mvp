'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({
    schoolName: '',
    subdomain: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    fullName: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleNext = () => {
    if (step === 1 && (!formData.schoolName || !formData.subdomain || !formData.email)) {
      setError('Please fill in all required fields')
      return
    }
    if (step === 2 && (!formData.password || !formData.fullName)) {
      setError('Please fill in all required fields')
      return
    }
    setError('')
    setStep(step + 1)
  }

  const handleBack = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Step 1: Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      // Step 2: Create school record
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .insert([
          {
            name: formData.schoolName,
            subdomain: formData.subdomain.toLowerCase().replace(/\s/g, ''),
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            status: 'pending',
          },
        ])
        .select()
        .single()

      if (schoolError) throw schoolError

      // Step 3: Create user record linked to school
      const { error: userError } = await supabase.from('users').insert([
        {
          id: authData.user.id,
          email: formData.email,
          role: 'school_admin',
          school_id: schoolData.id,
          full_name: formData.fullName,
          phone: formData.phone,
        },
      ])

      if (userError) throw userError

      alert('Registration successful! Please check your email to confirm.')
      router.push('/login')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-emerald-50">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-emerald-900 mb-2 text-center">
          Register Your School
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Step {step} of 3
        </p>

        {/* Progress Bar */}
        <div className="flex mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex-1 h-2 ${
                i <= step ? 'bg-emerald-600' : 'bg-gray-200'
              } ${i > 1 ? 'ml-1' : ''}`}
            />
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: School Details */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Name *
                </label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Green Springs School"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subdomain *
                </label>
                <div className="flex">
                  <input
                    type="text"
                    name="subdomain"
                    value={formData.subdomain}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="greensprings"
                    required
                  />
                  <span className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                    .wisteria.ng
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Your school portal will be: {formData.subdomain || 'yourname'}.wisteria.ng
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="admin@school.ng"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="+234 800 000 0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="123 Education Street, Lagos"
                />
              </div>
            </>
          )}

          {/* Step 2: Admin Details */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Mr. Adeola Johnson"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 8 characters
                </p>
              </div>
            </>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="bg-emerald-50 p-4 rounded-lg">
              <h3 className="font-semibold text-emerald-900 mb-2">
                Review Your Information
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>School:</strong> {formData.schoolName}</p>
                <p><strong>Portal:</strong> {formData.subdomain}.wisteria.ng</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Admin:</strong> {formData.fullName}</p>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                ️ Your school will be in "pending" status until approved by super admin.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Complete Registration'}
              </button>
            )}
          </div>
        </form>

        <p className="mt-6 text-sm text-gray-600 text-center">
          Already have an account?{' '}
          <a href="/login" className="text-emerald-600 hover:underline">
            Login
          </a>
        </p>

        <p className="mt-4 text-xs text-gray-400 text-center">
          🇳🇬 Built for Nigerian Schools
        </p>
      </div>
    </main>
  )
}