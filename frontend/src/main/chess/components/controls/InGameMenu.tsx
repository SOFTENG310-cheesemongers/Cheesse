import React from 'react'
import './InGameMenu.css'
import { useChessStore } from '../../../app/chessStore'

type InGameMenuProps = {
  open: boolean
  onClose?: () => void
  children?: React.ReactNode
}

export default function InGameMenu({ open, onClose, children }: InGameMenuProps) {
  if (!open) return null

  const { menuMode } = useChessStore()

  const handleOverlayClick = (e: React.MouseEvent) => {
    // close when clicking the overlay itself, but never close from overlay clicks when showing results
    if (e.target === e.currentTarget && onClose && menuMode !== 'result') onClose()
  }

  return (
    <div className="igm-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="igm-box">
        <div className="igm-content">{children}</div>
      </div>
    </div>
  )
}
