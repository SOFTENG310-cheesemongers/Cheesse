import type { ReactElement, KeyboardEvent } from 'react'

type Props = { message: string }

export default function InGameMenuResult({ message }: Props): ReactElement {

  const getResultMessage = (message: string) => {
    switch (message) {
      case 'white':
        return 'White wins!';
      case 'black':
        return 'Black wins!';
      default:
        return message;
    }
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      <h2 style={{ margin: 0 }}>Game Over</h2>
      <p style={{ margin: 0 }}>And the winner is...</p>
      <h1 style={{
        margin: '6px 0 0 0',
        color: message === 'white' ? '#ffffff' : '#000000',
      }}>{getResultMessage(message)}</h1>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 12 }}>
        <button
          type="button"
          onClick={() => window.location.reload()}
          onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') window.location.reload()
          }}
        >
          Back to main menu
        </button>
      </div>
    </div>
  )
}
