import { useCallback, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export function useLogoutConfirm() {
  const { signOut } = useAuth()
  const [open, setOpen] = useState(false)

  const requestLogout = useCallback(() => setOpen(true), [])
  const cancelLogout = useCallback(() => setOpen(false), [])

  const confirmLogout = useCallback(() => {
    setOpen(false)
    void signOut()
  }, [signOut])

  return {
    logoutConfirmOpen: open,
    requestLogout,
    cancelLogout,
    confirmLogout,
  }
}
