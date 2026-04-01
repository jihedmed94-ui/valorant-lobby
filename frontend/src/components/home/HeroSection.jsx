export default function HeroSection({ stats, onExplore, onCreate }) {
  return (
    <section className="hero">
      <div className="hero-copy hero-copy-wide">
        <p className="eyebrow">Tunisia&apos;s tactical queue board</p>
        <h1>
          BUILD YOUR <span className="val-text">VALORANT</span> TEAM FAST
        </h1>
        <p className="hero-text">
          Post your lobby, filter by rank and server, and find players without wasting time.
        </p>
        <div className="hero-actions">
          <button className="hero-btn primary" type="button" onClick={onExplore}>
            EXPLORE LOBBIES
          </button>
          <button className="hero-btn secondary" type="button" onClick={onCreate}>
            CREATE LOBBY
          </button>
        </div>
        <div className="hero-mini-stats">
          <div className="mini-stat">
            <span className="mini-label">LIVE PLAYERS</span>
            <strong>{stats.livePlayers} ONLINE</strong>
          </div>
          <div className="mini-stat">
            <span className="mini-label">OPEN REQUESTS</span>
            <strong>{stats.pendingRequests} ACTIVE</strong>
          </div>
          <div className="mini-stat">
            <span className="mini-label">REGISTERED TEAMS</span>
            <strong>{stats.verifiedTeams} TEAMS</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
