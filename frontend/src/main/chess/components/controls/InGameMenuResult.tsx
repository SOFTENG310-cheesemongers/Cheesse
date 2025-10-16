import type { ReactElement } from 'react'

export default function InGameMenuResult(): ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
      <h2>Game Over</h2>
      <p>Winner: TBD</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button">Play again</button>
        <button type="button">Back to main menu</button>
      </div>
    </div>
  )
}
