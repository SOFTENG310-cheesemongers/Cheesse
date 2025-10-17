import type { ReactElement } from 'react'

type Props = { message: string }

export default function InGameMenuResult({ message }: Props): ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
      <h2>Game Over</h2>
      <p>{message}</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button">Play again</button>
        <button type="button">Back to main menu</button>
      </div>
    </div>
  )
}
