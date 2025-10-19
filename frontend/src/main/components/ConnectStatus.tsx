import './ConnectStatus.css';

export interface ConnectStatusProps {
  connected: boolean;
  connecting?: boolean;
  error?: string | null;
}

/**
 * ConnectStatus component - Shows connection state with spinner.
 * @param {ConnectStatusProps} props - The connection status props.
 * @returns {JSX.Element} - The rendered connection status component.
 */
export default function ConnectStatus({ connected, connecting, error }: ConnectStatusProps) {
  if (connected) {
    return (
      <div className="connect-status connect-status-online">
        <span className="status-dot status-dot-online"></span>
        <span>Online</span>
      </div>
    );
  }

  if (connecting) {
    return (
      <div className="connect-status connect-status-connecting">
        <span className="status-spinner"></span>
        <span>Connecting...</span>
      </div>
    );
  }

  return (
    <div className="connect-status connect-status-offline">
      <span className="status-dot status-dot-offline"></span>
      <span>{error || 'Servers unavailable — trying to connect'}</span>
    </div>
  );
}
