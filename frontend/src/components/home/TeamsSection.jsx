export default function TeamsSection({ teams, onCreateTeam, onViewTournament }) {
  return (
    <section id="teams" className="teams-section">
      <div className="section-header">
        <div>
          <p className="section-kicker">Recruitment zone</p>
          <h2>TEAM PAGES</h2>
        </div>
        <div className="section-actions">
          <button className="section-btn" type="button" onClick={onCreateTeam}>
            CREATE TEAM PAGE
          </button>
          <button className="section-btn alt" type="button" onClick={onViewTournament}>
            VIEW TOURNAMENTS
          </button>
        </div>
      </div>

      <div className="stats-display">
        <div className="stat-card">
          <span className="stat-label">VERIFIED TEAMS</span>
          <span className="stat-value">{teams.filter((team) => team.verified).length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">RECRUITMENT MODE</span>
          <span className="stat-value">OPEN</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">TEAM PAGES</span>
          <span className="stat-value">LIVE</span>
        </div>
      </div>

      <div className="teams-grid">
        {teams.map((team) => (
          <article key={team.id} className="team-card">
            <div className="team-meta">
              <span className={`team-badge ${team.verified ? 'verified' : 'recruiting'}`}>
                {team.verified ? 'VERIFIED' : 'RECRUITING'}
              </span>
              {team.pro ? <span className="team-badge pro">PRO</span> : null}
              <span className="team-tag">{team.tag}</span>
            </div>
            <h3>{team.name}</h3>
            <p>{team.description}</p>
            <p className="team-contact">LOOKING FOR: {team.lookingFor}</p>
            <p className="team-contact">CONTACT: {team.contact}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
