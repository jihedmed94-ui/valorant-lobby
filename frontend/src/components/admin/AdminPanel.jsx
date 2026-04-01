import { useEffect, useMemo, useState } from 'react';

const ANNOUNCEMENT_CATEGORIES = ['Tournament', 'Community', 'Live', 'Alert'];
const TOURNAMENT_STATUSES = ['OPEN', 'LIVE', 'CLOSED', 'HIDDEN'];

function formatDate(value) {
  if (!value) {
    return 'NO DATE';
  }

  const timestamp = new Date(value).getTime();
  if (!timestamp) {
    return 'NO DATE';
  }

  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function createTournamentForm(tournament) {
  return {
    title: tournament?.title || '',
    date: tournament?.date ? String(tournament.date).slice(0, 16) : '',
    slots: tournament?.slots || 16,
    prize: tournament?.prize || '',
    status: TOURNAMENT_STATUSES.includes(tournament?.status) ? tournament.status : 'OPEN',
    description: tournament?.description || '',
    registrationOpen: tournament?.registrationOpen ?? true,
  };
}

function buildHiddenTournamentSnapshot(tournament, reason) {
  return {
    id: tournament?.id || crypto.randomUUID(),
    title: tournament?.title || 'Tournament',
    date: tournament?.date || '',
    prize: tournament?.prize || 'TBA',
    slots: Number(tournament?.slots || 16),
    registrations: 0,
    description: tournament?.description || '',
    registrationOpen: false,
    status: 'HIDDEN',
    hiddenReason: reason,
    createdAt: tournament?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
}

export default function AdminPanel({ state, setState, onLock }) {
  const [tournamentForm, setTournamentForm] = useState(() => createTournamentForm(state.tournament));
  const [archiveWinner, setArchiveWinner] = useState('');
  const [archiveNote, setArchiveNote] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setTournamentForm(createTournamentForm(state.tournament));
  }, [state.tournament]);

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setMessage(''), 2400);
    return () => window.clearTimeout(timeoutId);
  }, [message]);

  const reportedLobbyIds = useMemo(
    () => new Set(state.reports.map((report) => report.lobbyId).filter(Boolean)),
    [state.reports]
  );

  const registrationsCount = state.tournamentRegistrations?.length || 0;
  const setToast = (value) => setMessage(value);

  const handleTournamentChange = (event) => {
    const { name, value } = event.target;
    setTournamentForm((current) => ({ ...current, [name]: value }));
  };

  const handleTournamentSave = () => {
    if (!tournamentForm.title.trim() || !tournamentForm.date) {
      setToast('ADD TOURNAMENT TITLE AND DATE');
      return;
    }

    const normalizedStatus = TOURNAMENT_STATUSES.includes(tournamentForm.status) ? tournamentForm.status : 'OPEN';
    const slots = Math.max(2, Number(tournamentForm.slots) || 16);

    setState((current) => {
      const registrationCount = current.tournamentRegistrations?.length || 0;
      const nextRegistrationOpen =
        Boolean(tournamentForm.registrationOpen) &&
        registrationCount < slots &&
        normalizedStatus !== 'CLOSED' &&
        normalizedStatus !== 'HIDDEN';

      return {
        ...current,
        tournament: {
          id: current.tournament?.id || crypto.randomUUID(),
          title: tournamentForm.title.trim(),
          date: tournamentForm.date,
          slots,
          prize: tournamentForm.prize.trim() || 'TBA',
          status: normalizedStatus,
          registrations: registrationCount,
          description: tournamentForm.description.trim(),
          registrationOpen: nextRegistrationOpen,
          hiddenReason: normalizedStatus === 'HIDDEN' ? current.tournament?.hiddenReason || 'hidden' : '',
          createdAt: current.tournament?.createdAt || Date.now(),
          updatedAt: Date.now(),
        },
      };
    });

    setToast('TOURNAMENT SAVED');
  };

  const handleTournamentVisibility = () => {
    if (!state.tournament) {
      setToast('SAVE A TOURNAMENT FIRST');
      return;
    }

    setState((current) => {
      const isHidden = current.tournament?.status === 'HIDDEN';
      return {
        ...current,
        tournament: {
          ...current.tournament,
          status: isHidden ? 'OPEN' : 'HIDDEN',
          hiddenReason: isHidden ? '' : 'hidden',
          updatedAt: Date.now(),
        },
      };
    });

    setToast(state.tournament.status === 'HIDDEN' ? 'TOURNAMENT SHOWN' : 'TOURNAMENT HIDDEN');
  };

  const handleRegistrationToggle = () => {
    if (!state.tournament) {
      setToast('SAVE A TOURNAMENT FIRST');
      return;
    }

    if ((state.tournamentRegistrations?.length || 0) >= Number(state.tournament.slots || 0)) {
      setToast('TOURNAMENT IS FULL');
      return;
    }

    setState((current) => ({
      ...current,
      tournament: {
        ...current.tournament,
        registrationOpen: !current.tournament.registrationOpen,
        updatedAt: Date.now(),
      },
    }));

    setToast(state.tournament.registrationOpen ? 'REGISTRATION CLOSED' : 'REGISTRATION OPENED');
  };

  const handleTournamentDelete = () => {
    setState((current) => ({
      ...current,
      tournament: null,
      tournamentRegistrations: [],
    }));
    setArchiveWinner('');
    setArchiveNote('');
    setToast('TOURNAMENT REMOVED');
  };

  const handleArchiveTournament = () => {
    if (!state.tournament) {
      setToast('NO TOURNAMENT TO ARCHIVE');
      return;
    }

    setState((current) => ({
      ...current,
      archive: [
        {
          id: crypto.randomUUID(),
          title: current.tournament.title,
          winner: archiveWinner.trim() || 'TBA',
          note: archiveNote.trim() || current.tournament.description || 'Winner archived from admin page.',
          date: current.tournament.date,
          status: current.tournament.status || 'CLOSED',
          slots: Number(current.tournament.slots || 16),
          registrations: current.tournamentRegistrations?.length || 0,
          time: Date.now(),
        },
        ...current.archive,
      ],
      tournament: buildHiddenTournamentSnapshot(current.tournament, 'archived'),
      tournamentRegistrations: [],
    }));

    setArchiveWinner('');
    setArchiveNote('');
    setToast('TOURNAMENT ARCHIVED');
  };

  const handleDeleteLobby = (lobbyId) => {
    setState((current) => ({
      ...current,
      lobbies: current.lobbies.filter((lobby) => lobby.id !== lobbyId),
      requests: {
        incoming: current.requests.incoming.filter((request) => request.lobbyId !== lobbyId),
        outgoing: current.requests.outgoing.filter((request) => request.lobbyId !== lobbyId),
      },
      reports: current.reports.filter((report) => report.lobbyId !== lobbyId),
    }));

    setToast('LOBBY DELETED');
  };

  const handleDeleteReportedLobbies = () => {
    if (!reportedLobbyIds.size) {
      setToast('NO REPORTED LOBBIES LINKED');
      return;
    }

    setState((current) => ({
      ...current,
      lobbies: current.lobbies.filter((lobby) => !reportedLobbyIds.has(lobby.id)),
      requests: {
        incoming: current.requests.incoming.filter((request) => !reportedLobbyIds.has(request.lobbyId)),
        outgoing: current.requests.outgoing.filter((request) => !reportedLobbyIds.has(request.lobbyId)),
      },
      reports: current.reports.filter((report) => !reportedLobbyIds.has(report.lobbyId)),
    }));

    setToast('REPORTED LOBBIES REMOVED');
  };

  const handleTeamPatch = (teamId, patch) => {
    setState((current) => ({
      ...current,
      teams: current.teams.map((team) => (team.id === teamId ? { ...team, ...patch } : team)),
    }));
  };

  const handleDeleteTeam = (teamId) => {
    setState((current) => ({
      ...current,
      teams: current.teams.filter((team) => team.id !== teamId),
    }));

    setToast('TEAM DELETED');
  };

  const handleDeleteRegistration = (registrationId) => {
    setState((current) => {
      const nextRegistrations = current.tournamentRegistrations.filter((registration) => registration.id !== registrationId);

      return {
        ...current,
        tournamentRegistrations: nextRegistrations,
        tournament: current.tournament
          ? {
              ...current.tournament,
              registrations: nextRegistrations.length,
              updatedAt: Date.now(),
            }
          : current.tournament,
      };
    });

    setToast('REGISTRATION DELETED');
  };

  const handleReportPatch = (reportId, patch) => {
    setState((current) => ({
      ...current,
      reports: current.reports.map((report) => (report.id === reportId ? { ...report, ...patch } : report)),
    }));
  };

  const handleDeleteReport = (reportId) => {
    setState((current) => ({
      ...current,
      reports: current.reports.filter((report) => report.id !== reportId),
    }));

    setToast('REPORT DELETED');
  };

  const handleClearArchiveEntry = (entryId) => {
    setState((current) => ({
      ...current,
      archive: current.archive.filter((entry) => entry.id !== entryId),
    }));

    setToast('ARCHIVE ENTRY DELETED');
  };

  const handleAnnouncementChange = (announcementId, field, value) => {
    setState((current) => ({
      ...current,
      announcements: current.announcements.map((announcement) =>
        announcement.id === announcementId ? { ...announcement, [field]: value } : announcement
      ),
    }));
  };

  const handleAddAnnouncement = () => {
    setState((current) => ({
      ...current,
      announcements: [
        {
          id: crypto.randomUUID(),
          category: 'Community',
          title: 'NEW ANNOUNCEMENT',
          body: 'Write your new announcement here.',
        },
        ...current.announcements,
      ],
    }));

    setToast('ANNOUNCEMENT ADDED');
  };

  const handleDeleteAnnouncement = (announcementId) => {
    setState((current) => ({
      ...current,
      announcements: current.announcements.filter((announcement) => announcement.id !== announcementId),
    }));

    setToast('ANNOUNCEMENT DELETED');
  };

  return (
    <section id="adminApp" className="admin-workspace">
      <div className="section-header">
        <div>
          <p className="section-kicker">Tournament operations</p>
          <h2>ADMIN PANEL</h2>
        </div>
        <div className="section-actions">
          <button className="section-btn alt" type="button" onClick={() => setTournamentForm(createTournamentForm(state.tournament))}>
            REFRESH FORM
          </button>
          <button className="section-btn danger" type="button" onClick={onLock}>
            LOCK PANEL
          </button>
        </div>
      </div>

      <div className="stats-display tournament-admin-stats">
        <div className="stat-card">
          <span className="stat-label">ACTIVE STATUS</span>
          <span className="stat-value">{state.tournament?.status || 'HIDDEN'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">REGISTRATION</span>
          <span className="stat-value">{state.tournament?.registrationOpen ? 'OPEN' : 'CLOSED'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">REGISTERED TEAMS</span>
          <span className="stat-value">{registrationsCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">ARCHIVE ENTRIES</span>
          <span className="stat-value">{state.archive.length}</span>
        </div>
      </div>

      <div className="admin-layout">
        <article className="admin-card">
          <span className="panel-tag">Active tournament</span>
          <h2>CREATE OR UPDATE</h2>
          <div className="gate-form">
            <label htmlFor="adminTournamentTitle">TITLE</label>
            <input id="adminTournamentTitle" name="title" value={tournamentForm.title} onChange={handleTournamentChange} placeholder="Tournament title" />
            <div className="admin-inline-grid">
              <div>
                <label htmlFor="adminTournamentDate">DATE</label>
                <input id="adminTournamentDate" name="date" type="datetime-local" value={tournamentForm.date} onChange={handleTournamentChange} />
              </div>
              <div>
                <label htmlFor="adminTournamentSlots">SLOTS</label>
                <input id="adminTournamentSlots" name="slots" type="number" min="2" value={tournamentForm.slots} onChange={handleTournamentChange} />
              </div>
            </div>
            <div className="admin-inline-grid">
              <div>
                <label htmlFor="adminTournamentPrize">PRIZE</label>
                <input id="adminTournamentPrize" name="prize" value={tournamentForm.prize} onChange={handleTournamentChange} placeholder="5000" />
              </div>
              <div>
                <label htmlFor="adminTournamentStatus">STATUS</label>
                <select id="adminTournamentStatus" name="status" value={tournamentForm.status} onChange={handleTournamentChange}>
                  {TOURNAMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <label htmlFor="adminTournamentDescription">SHORT NOTE</label>
            <textarea id="adminTournamentDescription" name="description" rows="3" value={tournamentForm.description} onChange={handleTournamentChange} placeholder="Single elimination / bo1 / check-in 30 min before start" />
            <label className="toggle-row" htmlFor="adminTournamentRegistration">
              <input
                id="adminTournamentRegistration"
                type="checkbox"
                checked={Boolean(tournamentForm.registrationOpen)}
                onChange={(event) => setTournamentForm((current) => ({ ...current, registrationOpen: event.target.checked }))}
              />
              <span>REGISTRATION IS OPEN</span>
            </label>
          </div>
          <div className="admin-action-row" style={{ marginTop: 16 }}>
            <button className="section-btn" type="button" onClick={handleTournamentSave}>
              SAVE TOURNAMENT
            </button>
            <button className="section-btn alt" type="button" onClick={handleRegistrationToggle}>
              OPEN / CLOSE REGISTRATION
            </button>
            <button className="section-btn alt" type="button" onClick={handleTournamentVisibility}>
              {state.tournament?.status === 'HIDDEN' ? 'SHOW TOURNAMENT' : 'HIDE TOURNAMENT'}
            </button>
            <button className="section-btn danger" type="button" onClick={handleTournamentDelete}>
              DELETE TOURNAMENT
            </button>
          </div>
        </article>

        <article className="admin-card">
          <span className="panel-tag">Finish event</span>
          <h2>ARCHIVE WINNER</h2>
          <div className="gate-form">
            <label htmlFor="archiveWinner">WINNER</label>
            <input id="archiveWinner" value={archiveWinner} onChange={(event) => setArchiveWinner(event.target.value)} placeholder="Team name" />
            <label htmlFor="archiveNote">NOTE</label>
            <input id="archiveNote" value={archiveNote} onChange={(event) => setArchiveNote(event.target.value)} placeholder="Grand final result / MVP / short note" />
          </div>
          <div className="admin-action-row" style={{ marginTop: 16 }}>
            <button className="section-btn" type="button" onClick={handleArchiveTournament}>
              ARCHIVE TOURNAMENT
            </button>
          </div>
          <div className="summary-box" style={{ marginTop: 16 }}>
            <strong>{state.tournament?.title || 'NO ACTIVE TOURNAMENT'}</strong>
            <p>Date: {state.tournament ? formatDate(state.tournament.date) : 'TBA'}</p>
            <p>Status: {state.tournament?.status || 'HIDDEN'}</p>
            <p>Registration: {state.tournament?.registrationOpen ? 'Open' : 'Closed'}</p>
            <p>Teams registered: {registrationsCount}</p>
          </div>
        </article>
      </div>

      <section>
        <div className="section-header">
          <div>
            <p className="section-kicker">Community board</p>
            <h2>ANNOUNCEMENTS</h2>
          </div>
          <div className="section-actions">
            <button className="section-btn" type="button" onClick={handleAddAnnouncement}>
              ADD ANNOUNCEMENT
            </button>
          </div>
        </div>
        <div className="admin-list">
          {state.announcements.map((announcement) => (
            <article key={announcement.id} className="admin-entry">
              <div className="admin-entry-head">
                <div>
                  <strong>{announcement.title}</strong>
                  <p>{announcement.category}</p>
                </div>
                <button className="admin-icon-btn danger" type="button" onClick={() => handleDeleteAnnouncement(announcement.id)}>
                  ×
                </button>
              </div>
              <label>CATEGORY</label>
              <select value={announcement.category} onChange={(event) => handleAnnouncementChange(announcement.id, 'category', event.target.value)}>
                {ANNOUNCEMENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <label>TITLE</label>
              <input value={announcement.title} onChange={(event) => handleAnnouncementChange(announcement.id, 'title', event.target.value)} />
              <label>BODY</label>
              <textarea rows="4" value={announcement.body} onChange={(event) => handleAnnouncementChange(announcement.id, 'body', event.target.value)} />
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="section-header">
          <div>
            <p className="section-kicker">Current tournament</p>
            <h2>REGISTRATIONS</h2>
          </div>
        </div>
        <div className="admin-list">
          {registrationsCount ? (
            state.tournamentRegistrations.map((registration) => (
              <article key={registration.id} className="admin-entry">
                <div className="admin-entry-head">
                  <div>
                    <strong>{registration.teamName}</strong>
                    <p>{registration.tag}</p>
                  </div>
                  <button className="admin-icon-btn danger" type="button" onClick={() => handleDeleteRegistration(registration.id)}>
                    ×
                  </button>
                </div>
                <p>{registration.description}</p>
                <p>{registration.contact}</p>
                <small>{registration.status} / {formatDate(registration.createdAt)}</small>
              </article>
            ))
          ) : (
            <article className="admin-entry">
              <p>NO TOURNAMENT REGISTRATIONS YET.</p>
            </article>
          )}
        </div>
      </section>

      <section>
        <div className="section-header">
          <div>
            <p className="section-kicker">Lobby moderation</p>
            <h2>LOBBIES</h2>
          </div>
          <div className="section-actions">
            <button className="section-btn danger" type="button" onClick={handleDeleteReportedLobbies}>
              DELETE REPORTED LOBBIES
            </button>
          </div>
        </div>
        <div className="admin-list">
          {state.lobbies.length ? (
            state.lobbies.map((lobby) => (
              <article key={lobby.id} className="admin-entry">
                <div className="admin-entry-head">
                  <div>
                    <strong>{lobby.name}</strong>
                    <p>{lobby.server} / {lobby.rank} / {lobby.status}</p>
                  </div>
                  <button className="admin-icon-btn danger" type="button" onClick={() => handleDeleteLobby(lobby.id)}>
                    ×
                  </button>
                </div>
                <p>CODE: {lobby.code}</p>
                <p>PLAYERS: {lobby.have}/5</p>
                <small>{reportedLobbyIds.has(lobby.id) ? 'REPORTED LOBBY' : 'NO REPORT LINKED'}</small>
              </article>
            ))
          ) : (
            <article className="admin-entry">
              <p>NO LOBBIES FOUND.</p>
            </article>
          )}
        </div>
      </section>

      <section>
        <div className="section-header">
          <div>
            <p className="section-kicker">Team control</p>
            <h2>TEAMS</h2>
          </div>
        </div>
        <div className="admin-list">
          {state.teams.map((team) => (
            <article key={team.id} className="admin-entry">
              <div className="admin-entry-head">
                <div>
                  <strong>{team.name}</strong>
                  <p>{team.tag} / {team.lookingFor}</p>
                </div>
                <button className="admin-icon-btn danger" type="button" onClick={() => handleDeleteTeam(team.id)}>
                  ×
                </button>
              </div>
              <p>{team.description}</p>
              <p>{team.contact}</p>
              <small>{team.expiresAt ? `EXPIRES ${formatDate(team.expiresAt)}` : 'NO PUBLIC EXPIRY'}</small>
              <div className="admin-action-row">
                <button className="section-btn alt" type="button" onClick={() => handleTeamPatch(team.id, { verified: !team.verified })}>
                  {team.verified ? 'UNVERIFY' : 'VERIFY'} TEAM
                </button>
                <button className="section-btn alt" type="button" onClick={() => handleTeamPatch(team.id, { pro: !team.pro })}>
                  {team.pro ? 'REMOVE PRO' : 'MARK PRO'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="section-header">
          <div>
            <p className="section-kicker">Player moderation</p>
            <h2>REPORTS</h2>
          </div>
        </div>
        <div className="admin-list">
          {state.reports.map((report) => (
            <article key={report.id} className="admin-entry">
              <div className="admin-entry-head">
                <div>
                  <strong>{report.label}</strong>
                  <p>{report.reason}</p>
                </div>
                <button className="admin-icon-btn danger" type="button" onClick={() => handleDeleteReport(report.id)}>
                  ×
                </button>
              </div>
              <small>{report.resolved ? 'RESOLVED' : 'PENDING REVIEW'}</small>
              <div className="admin-action-row">
                <button className="section-btn alt" type="button" onClick={() => handleReportPatch(report.id, { resolved: !report.resolved })}>
                  {report.resolved ? 'MARK PENDING' : 'MARK RESOLVED'}
                </button>
                {report.lobbyId ? (
                  <button className="section-btn danger" type="button" onClick={() => handleDeleteLobby(report.lobbyId)}>
                    DELETE RELATED LOBBY
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="section-header">
          <div>
            <p className="section-kicker">Past events</p>
            <h2>ARCHIVE</h2>
          </div>
        </div>
        <div className="admin-list">
          {state.archive.map((entry) => (
            <article key={entry.id} className="admin-entry">
              <div className="admin-entry-head">
                <div>
                  <strong>{entry.title}</strong>
                  <p>{entry.winner}</p>
                </div>
                <button className="admin-icon-btn danger" type="button" onClick={() => handleClearArchiveEntry(entry.id)}>
                  ×
                </button>
              </div>
              <p>{entry.note}</p>
              <small>{formatDate(entry.date)}</small>
            </article>
          ))}
        </div>
      </section>

      <div id="adminToast" className={message ? 'show' : ''}>
        {message}
      </div>
    </section>
  );
}

