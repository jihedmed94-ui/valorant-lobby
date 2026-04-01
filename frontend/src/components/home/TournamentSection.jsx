function formatDate(value) {
  const timestamp = new Date(value).getTime();
  if (!timestamp) {
    return 'DATE TO BE ANNOUNCED';
  }

  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatCountdown(target, now) {
  const totalSeconds = Math.max(0, Math.floor((new Date(target).getTime() - now) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function getTournamentStatusLabel(tournament, isFull) {
  const status = String(tournament?.status || 'OPEN').toUpperCase();

  if (status === 'HIDDEN') {
    return 'HIDDEN';
  }

  if (isFull) {
    return 'FULL';
  }

  if (status === 'CLOSED' || tournament?.registrationOpen === false) {
    return 'CLOSED';
  }

  return status;
}

export default function TournamentSection({ tournament, archive, now, onRegisterTeam, onOpenLobbies }) {
  const status = String(tournament?.status || 'OPEN').toUpperCase();
  const registrations = Number(tournament?.registrations || 0);
  const slots = Number(tournament?.slots || 0);
  const isVisibleTournament = Boolean(tournament) && status !== 'HIDDEN';
  const isFull = slots > 0 && registrations >= slots;
  const canRegister = isVisibleTournament && tournament?.registrationOpen && !isFull && status !== 'CLOSED';
  const registerLabel = !isVisibleTournament
    ? 'REGISTER TEAM'
    : isFull
      ? 'SLOTS FULL'
      : !tournament?.registrationOpen || status === 'CLOSED'
        ? 'REGISTRATION CLOSED'
        : 'REGISTER TEAM';
  const slotsLabel = `${registrations} / ${slots}`;

  return (
    <section id="tournaments" className="tournament-section">
      <div className="section-header">
        <div>
          <p className="section-kicker">Competitive zone</p>
          <h2>NEXT TOURNAMENT</h2>
        </div>
        <div className="timer-display">
          {isVisibleTournament ? formatCountdown(tournament.date, now) : 'NO ACTIVE EVENT'}
        </div>
      </div>

      {isVisibleTournament ? (
        <div className="tournament-grid">
          <article className="t-card t-card-featured">
            <div className="t-card-head">
              <span className="t-status">{getTournamentStatusLabel(tournament, isFull)}</span>
              <span className="t-slots-badge">
                SLOTS <b>{slotsLabel}</b>
              </span>
            </div>
            <h3 className="t-title">{tournament.title}</h3>
            <div className="t-meta-grid">
              <div className="t-meta-box prize">
                <span className="t-meta-label">PRIZE POOL</span>
                <span className="t-meta-value">{tournament.prize}</span>
              </div>
              <div className="t-meta-box date">
                <span className="t-meta-label">DATE</span>
                <span className="t-meta-value">{formatDate(tournament.date)}</span>
              </div>
            </div>
            <p className="t-info">{tournament.description || 'Registration details will be shared soon.'}</p>
            <div className="tournament-actions-row">
              <button className="request-btn alt tournament-cta" type="button" onClick={onRegisterTeam} disabled={!canRegister}>
                {registerLabel}
              </button>
              <button className="section-btn alt tournament-cta" type="button" onClick={onOpenLobbies}>
                OPEN LOBBIES
              </button>
            </div>
          </article>
        </div>
      ) : null}

      <div className="archive-strip">
        {archive.map((entry) => (
          <article key={entry.id} className="archive-card">
            <span className="mini-label">{formatDate(entry.date)}</span>
            <strong>{entry.title}</strong>
            <p>{entry.winner}</p>
            <p>{entry.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
