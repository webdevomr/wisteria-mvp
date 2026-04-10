'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useUserInfo() {
  const [userInfo, setUserInfo] = useState({
    userName: '',
    schoolName: '',
    schoolAbbreviation: '',
    loading: true,
  })

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setUserInfo({ userName: '', schoolName: '', schoolAbbreviation: '', loading: false })
          return
        }

        const { data: userData } = await supabase
          .from('users')
          .select('full_name, school_id')
          .eq('id', user.id)
          .single()

        if (userData?.school_id) {
          const { data: schoolData } = await supabase
            .from('schools')
            .select('name, abbreviation')
            .eq('id', userData.school_id)
            .single()

          setUserInfo({
            userName: userData.full_name || 'User',
            schoolName: schoolData?.name || 'School',
            schoolAbbreviation: schoolData?.abbreviation || '',
            loading: false,
          })
        } else {
          setUserInfo({
            userName: userData?.full_name || 'User',
            schoolName: 'Not linked',
            schoolAbbreviation: '',
            loading: false,
          })
        }
      } catch (error) {
        console.error('Error fetching user info:', error)
        setUserInfo({ userName: '', schoolName: '', schoolAbbreviation: '', loading: false })
      }
    }

    fetchUserInfo()
  }, [])

  return userInfo
}