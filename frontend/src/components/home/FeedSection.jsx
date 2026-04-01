import LobbyCard from './LobbyCard';
import LobbyFilters from './LobbyFilters';

export default function FeedSection({
  lobbies,
  now,
  stats,
  filters,
  onFilterChange,
  onClearFilters,
  onCreate,
  onJoin,
  onReport,
  onCopyCode,
  actorId,
  outgoingRequests,
}) {
  const outgoingByLobby = new Map(
    (outgoingRequests || []).map((request) => [request.lobbyId, request])
  );

  return (
    <section id="feed" className="feed-section">
      <div className="section-header">
        <div>
          <p className="section-kicker">Public queue board</p>
          <h2>ACTIVE LOBBIES</h2>
        </div>
        <div className="section-actions">
          <button className="section-btn" type="button" onClick={onCreate}>
            POST LOBBY
          </button>
        </div>
      </div>

      <div className="stats-display">
        <div className="stat-card">
          <span className="stat-label">VISIBLE LOBBIES</span>
          <span className="stat-value">{lobbies.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">LIVE STATUS</span>
          <span className="stat-value stat-live">{stats.livePlayers} PLAYERS ONLINE</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">PENDING REQUESTS</span>
          <span className="stat-value">{stats.pendingRequests}</span>
        </div>
      </div>

      <LobbyFilters filters={filters} onChange={onFilterChange} onClear={onClearFilters} />

      <div className="lobby-grid">
        {lobbies.length ? (
          lobbies.map((lobby) => {
            const request = outgoingByLobby.get(lobby.id);
            const isOwnLobby = lobby.ownerId === actorId;
            const hasApprovedAccess = request?.status === 'APPROVED';

            return (
              <LobbyCard
                key={lobby.id}
                lobby={lobby}
                now={now}
                onJoin={onJoin}
                onReport={onReport}
                onCopyCode={onCopyCode}
                isOwnLobby={isOwnLobby}
                requestState={request?.status || ''}
                visibleCode={isOwnLobby || hasApprovedAccess ? (request?.partyCode || lobby.code) : ''}
              />
            );
          })
        ) : (
          <div className="empty-state">
            <h3>NO ACTIVE LOBBIES</h3>
            <p>Create the first lobby and start filling your stack.</p>
          </div>
        )}
      </div>
    </section>
  );
}
