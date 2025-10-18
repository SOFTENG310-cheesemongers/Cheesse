import type { ReactElement } from 'react'
import { useChessStore } from '../../../app/chessStore'

export default function InGameMenuPause(): ReactElement {
  const { setMenuOpen, selectedSeconds, setRunning } = useChessStore()

  const onResume = () => {
    setMenuOpen(false)
    if (selectedSeconds !== null) setRunning(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <button type="button" onClick={onResume}>Resume game</button>
        <button type="button" onClick={() => window.location.reload()}>Back to main menu</button>
      </div>
    </div>
  )
}
