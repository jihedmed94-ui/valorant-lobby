import { RANKS, SERVERS, STATUSES } from '../../lib/constants';

export default function LobbyFilters({ filters, onChange, onClear }) {
  return (
    <div className="feed-toolbar">
      <div className="filter-grid">
        <div className="field">
          <label htmlFor="searchInput">SEARCH</label>
          <input
            id="searchInput"
            type="text"
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder="Riot ID, team, server..."
          />
        </div>
        <div className="field">
          <label htmlFor="rankFilter">RANK</label>
          <select id="rankFilter" value={filters.rank} onChange={(event) => onChange('rank', event.target.value)}>
            <option value="ALL">All ranks</option>
            {RANKS.map((rank) => (
              <option key={rank} value={rank}>
                {rank}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="serverFilter">SERVER</label>
          <select id="serverFilter" value={filters.server} onChange={(event) => onChange('server', event.target.value)}>
            <option value="ALL">All servers</option>
            {SERVERS.map((server) => (
              <option key={server} value={server}>
                {server}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="statusFilter">STATUS</label>
          <select id="statusFilter" value={filters.status} onChange={(event) => onChange('status', event.target.value)}>
            <option value="ALL">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="toolbar-actions">
        <div className="filter-switch">
          <button className="filter-btn is-active" type="button">
            ALL LOBBIES
          </button>
        </div>
        <button className="toolbar-btn alt" type="button" onClick={onClear}>
          CLEAR FILTERS
        </button>
      </div>
    </div>
  );
}
