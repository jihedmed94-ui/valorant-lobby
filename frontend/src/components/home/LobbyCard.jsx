function getTimeAgo(value, now) {
  const diffMinutes = Math.max(1, Math.floor((now - value) / 60000));
  if (diffMinutes < 60) {
    return `${diffMinutes} MINS AGO`;
  }

  const hours = Math.floor(diffMinutes / 60);
  return `${hours} HOURS AGO`;
}

function statusClass(status) {
  return status.toLowerCase().replace(/\s+/g, '');
}

function formatCountdown(value, now) {
  const totalSeconds = Math.max(0, Math.ceil((value - now) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function getTimeBarWidth(lobby, now) {
  const totalLifetime = lobby.lifetimeMs || Math.max(1, (lobby.expiresAt || now) - (lobby.createdAt || now));
  const remaining = Math.max(0, (lobby.expiresAt || now) - now);
  return Math.max(0, Math.min(100, (remaining / totalLifetime) * 100));
}

export default function LobbyCard({ lobby, now, onJoin, onReport, onCopyCode, isOwnLobby, requestState, visibleCode }) {
  const isFull = lobby.status === 'FULL';
  const timeBarWidth = getTimeBarWidth(lobby, now);
  const hasApprovedAccess = requestState === 'APPROVED';
  const isPending = requestState === 'PENDING';
  const joinLabel = isOwnLobby
    ? 'YOUR LOBBY'
    : hasApprovedAccess
      ? 'COPY CODE'
      : isPending
        ? 'REQUEST PENDING'
        : 'JOIN REQUEST';

  const handlePrimaryAction = () => {
    if (hasApprovedAccess) {
      onCopyCode(lobby);
      return;
    }

    onJoin(lobby);
  };

  return (
    <article className={`post-card ${lobby.pro ? 'pro-entry' : ''}`}>
      <div className="post-top">
        <div className="post-info">
          <div className="post-meta">
            <span className={`status-badge ${statusClass(lobby.status)}`}>{lobby.status}</span>
            {lobby.pro ? <span className="pro-badge">PRO CITY</span> : null}
            <span className="post-time">{getTimeAgo(lobby.createdAt, now)}</span>
          </div>
          {typeof lobby.expiresAt === 'number' ? (
            <div className="full-lobby-countdown">
              {isFull ? 'FULL LOBBY REMOVES IN ' : 'LOBBY REMOVES IN '} {formatCountdown(lobby.expiresAt, now)}
            </div>
          ) : null}
          <h3>{lobby.name}</h3>
          <p>
            {lobby.rank} | {lobby.server} | Need {lobby.need}
          </p>
          <div className="post-code-preview">PARTY CODE: {visibleCode || 'HIDDEN'}</div>
        </div>
        <div className="post-side">
          <span className="slot-badge">{lobby.have}/5 READY</span>
          <button className="request-btn alt" type="button" onClick={handlePrimaryAction} disabled={isFull && !isOwnLobby && !hasApprovedAccess}>
            {joinLabel}
          </button>
          {!isOwnLobby ? (
            <button className="section-btn danger" type="button" onClick={() => onReport(lobby)}>
              REPORT
            </button>
          ) : null}
        </div>
      </div>
      <div className="time-bar-container">
        <div className="time-bar-fill" style={{ width: `${timeBarWidth}%` }}></div>
      </div>
    </article>
  );
}

