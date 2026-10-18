/**
 * Email validation utility according to user specifications:
 * - Compulsory '@'
 * - Full domain provider name (not truncated like gma, gmai, @gma, yaho)
 * - Must end with '.com' (specifically rejecting .c and .co)
 */

export function getEmailMistake(email, touched = false) {
  const val = (email || '').trim().toLowerCase()
  if (!val) return ''

  // 1. Must include '@'
  if (!val.includes('@')) {
    return touched ? 'Must include "@" (e.g. user@gmail.com)' : ''
  }

  const parts = val.split('@')
  if (parts.length > 2) {
    return 'Email can only have one "@" symbol'
  }

  const user = parts[0]
  const domain = parts[1] || ''

  if (!user) {
    return 'Must include a username before "@" (e.g. user@gmail.com)'
  }

  if (!domain) {
    return touched ? 'Must include a domain after "@" (e.g. user@gmail.com)' : ''
  }

  // Check incomplete host before dot or when no dot yet
  const dotIndex = domain.lastIndexOf('.')
  const host = dotIndex !== -1 ? domain.substring(0, dotIndex) : domain
  const ext = dotIndex !== -1 ? domain.substring(dotIndex + 1) : ''

  if (['gma', 'gmai', 'gm'].includes(host)) {
    return 'Please write the full domain "gmail.com" (not @gma or @gmai)'
  }

  if (['yaho', 'yah'].includes(host)) {
    return 'Please write the full domain "yahoo.com" (not @yaho)'
  }

  if (['hotm', 'hotmai', 'outl', 'outloo'].includes(host)) {
    return 'Please write the full domain name (e.g. @outlook.com or @hotmail.com)'
  }

  // If no dot yet
  if (dotIndex === -1) {
    return touched ? 'Email must include a full domain ending in .com (e.g. user@gmail.com)' : ''
  }

  // Check invalid/incomplete extensions (.c or .co)
  if (ext === 'c' || ext === 'co') {
    return 'Email must end with ".com", not ".c" or ".co" (e.g. user@gmail.com)'
  }

  if (!ext || ext.length < 2) {
    return 'Email must end with a full extension like ".com" (e.g. user@gmail.com)'
  }

  if (['gmail', 'yahoo', 'hotmail', 'outlook', 'icloud'].includes(host) && ext !== 'com') {
    return `Please enter "${host}.com" (not .${ext})`
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(val)) {
    return 'Please enter a valid email address ending in .com (e.g. user@gmail.com)'
  }

  return ''
}
