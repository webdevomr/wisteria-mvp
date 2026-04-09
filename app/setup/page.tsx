'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SchoolSetupPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({
    schoolName: '',
    abbreviation: '',
    motto: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logoUrl: '',
    brandColor: '#059669',
    principalName: '',
    principalSignatureUrl: '',
    stampUrl: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Auto-suggest abbreviation from school name
  const handleSchoolNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData({ ...formData, schoolName: name })
    
    // Auto-generate abbreviation (first letter of each word, max 4 chars)
    if (!formData.abbreviation || formData.abbreviation.length === 0) {
      const abbrev = name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 4)
      setFormData(prev => ({ ...prev, abbreviation: abbrev }))
    }
  }

  const handleNext = () => {
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get user's school_id
      const { data: userData } = await supabase
        .from('users')
        .select('school_id')
        .eq('id', user.id)
        .single()

      if (!userData?.school_id) throw new Error('No school found for this user')

      // Update school record
      const { error: updateError } = await supabase
        .from('schools')
        .update({
          name: formData.schoolName,
          abbreviation: formData.abbreviation.toUpperCase(),
          motto: formData.motto,
          address: formData.address,
          phone: formData.phone,
          email_enc: formData.email,
          website: formData.website,
          logo_url: formData.logoUrl,
          brand_color: formData.brandColor,
          principal_name: formData.principalName,
          principal_signature_url: formData.principalSignatureUrl,
          stamp_url: formData.stampUrl,
          status: 'pending',
        })
        .eq('id', userData.school_id)

      if (updateError) throw updateError

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Setup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-emerald-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-emerald-900 mb-2 text-center">
          School Setup Wizard
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Step {step} of 6
        </p>

        {/* Progress Bar */}
        <div className="flex mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: School Identity */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-emerald-900">
                School Identity
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Name *
                </label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleSchoolNameChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Green Springs School"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Abbreviation *
                </label>
                <input
                  type="text"
                  name="abbreviation"
                  value={formData.abbreviation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="GSS"
                  maxLength={4}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Student IDs will be: {formData.abbreviation || 'XXX'}-0001, {formData.abbreviation || 'XXX'}-0002...
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Motto
                </label>
                <input
                  type="text"
                  name="motto"
                  value={formData.motto}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Excellence in Education"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Contact Details */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-emerald-900">
                Contact Details
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="123 Education Street, Lagos"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
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
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="info@school.ng"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="www.school.ng"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Branding */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-emerald-900">
                Logo & Branding
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Color
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="color"
                    name="brandColor"
                    value={formData.brandColor}
                    onChange={handleChange}
                    className="h-10 w-20 border border-gray-300 rounded"
                  />
                  <span className="text-gray-600">{formData.brandColor}</span>
                </div>
              </div>

              {/* Live Preview */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Live Preview:
                </p>
                <div
                  className="rounded-lg p-4 text-white"
                  style={{ backgroundColor: formData.brandColor }}
                >
                  <p className="font-bold text-lg">{formData.schoolName || 'Your School'}</p>
                  <p className="text-sm opacity-90">{formData.motto || 'School Motto'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL (Optional)
                </label>
                <input
                  type="url"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Signatures & Stamp */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-emerald-900">
                Signatures & Stamp
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Principal Name
                </label>
                <input
                  type="text"
                  name="principalName"
                  value={formData.principalName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Mr. Ade Okafor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Principal Signature URL
                </label>
                <input
                  type="url"
                  name="principalSignatureUrl"
                  value={formData.principalSignatureUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://example.com/signature.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  For now, paste a URL. File upload coming soon.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Stamp URL
                </label>
                <input
                  type="url"
                  name="stampUrl"
                  value={formData.stampUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://example.com/stamp.png"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Academic Calendar */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-emerald-900">
                Academic Calendar
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Session
                </label>
                <input
                  type="text"
                  name="sessionName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="2025/2026"
                  defaultValue="2025/2026"
                />
              </div>

              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm text-emerald-800">
                  ℹ️ You will configure term dates after completing setup.
                </p>
              </div>
            </div>
          )}

          {/* STEP 6: Preview & Confirm */}
          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-emerald-900">
                Review & Confirm
              </h2>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><strong>School:</strong> {formData.schoolName}</p>
                <p><strong>Abbreviation:</strong> {formData.abbreviation}</p>
                <p><strong>Motto:</strong> {formData.motto}</p>
                <p><strong>Color:</strong> {formData.brandColor}</p>
                <p><strong>Principal:</strong> {formData.principalName}</p>
              </div>

              <div
                className="rounded-lg p-6 text-white text-center"
                style={{ backgroundColor: formData.brandColor }}
              >
                <p className="font-bold text-2xl">{formData.schoolName || 'Your School'}</p>
                <p className="text-sm opacity-90">{formData.motto || 'School Motto'}</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            )}
            {step < 6 ? (
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
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </form>

        <p className="mt-6 text-xs text-gray-400 text-center">
          🇳 Built for Nigerian Schools
        </p>
      </div>
    </main>
  )
}