import CryptoJS from 'crypto-js'

// Get encryption key from environment variable
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'wisteria-mvp-default-key-change-in-prod'

// Encrypt sensitive data (DOB, Phone, Email)
export function encrypt(text: string): string {
  if (!text) return ''
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString()
}

// Decrypt sensitive data
export function decrypt(ciphertext: string): string {
  if (!ciphertext) return ''
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

// Hash phone number for search (one-way, cannot be reversed)
export function hashPhone(phone: string): string {
  if (!phone) return ''
  return CryptoJS.HmacSHA256(phone, ENCRYPTION_KEY).toString()
}

// Normalize Nigerian phone number (remove spaces, ensure +234 or 0)
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '').replace(/-/g, '')
  
  if (cleaned.startsWith('+234')) {
    return cleaned
  }
  if (cleaned.startsWith('234')) {
    return '+' + cleaned
  }
  if (cleaned.startsWith('0')) {
    return '+234' + cleaned.slice(1)
  }
  
  return '+234' + cleaned
}