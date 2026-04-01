import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CommunitySection from '../components/home/CommunitySection';
import CreateLobbyModal from '../components/home/CreateLobbyModal';
import CreateTeamModal from '../components/home/CreateTeamModal';
import FeedSection from '../components/home/FeedSection';
import HeroSection from '../components/home/HeroSection';
import JoinRequestModal from '../components/home/JoinRequestModal';
import RequestsModal from '../components/home/RequestsModal';
import TeamsSection from '../components/home/TeamsSection';
import TournamentSection from '../components/home/TournamentSection';
import { FULL_LOBBY_LIFETIME_MS, OPEN_LOBBY_LIFETIME_MS, PRO_CITY_PASSWORD, PRO_CITY_RANKS } from '../lib/constants';

const TEAM_PAGE_LIFETIME_MS = 24 * 60 * 60 * 1000;
const AUTO_DELETE_REPORT_THRESHOLD = 5;
const LOBBY_CREATE_COOLDOWN_MS = 30 * 1000;
const TOURNAMENT_REGISTER_COOLDOWN_MS = 30 * 1000;
const TEAM_CREATE_COOLDOWN_MS = 30 * 1000;
const ACTION_STORAGE_KEY = 'valorant-react-site-anti-spam-v1';
const DEVICE_ID_KEY = 'valorant-react-site-device-id';

const defaultLobbyForm = {
  name: '',
  code: '',
  have: 1,
  need: 1,
  server: 'Bahrain',
  rank: 'Iron',
  proPassword: '',
};

const defaultTeamForm = {
  name: '',
  tag: '',
  lookingFor: '',
  contact: '',
  description: '',
};

const defaultJoinRequestForm = {
  riotId: '',
  rank: '',
  contact: '',
};

function getLobbyStatus(need) {
  return need === 0 ? 'FULL' : `NEED ${need}`;
}

function getLobbyExpiry(need) {
  return Date.now() + (need === 0 ? FULL_LOBBY_LIFETIME_MS : OPEN_LOBBY_LIFETIME_MS);
}

function getLocalDeviceId() {
  const current = localStorage.getItem(DEVICE_ID_KEY);
  if (current) {
    return current;
  }

  const next = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `device_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(DEVICE_ID_KEY, next);
  return next;
}

function normalizeText(value) {
  return value.trim().toLowerCase();
}

function normalizeTag(value) {
  return value.trim().toUpperCase();
}

function readActionState() {
  try {
    return JSON.parse(localStorage.getItem(ACTION_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeActionState(value) {
  localStorage.setItem(ACTION_STORAGE_KEY, JSON.stringify(value));
}

function hasCooldown(actionKey, cooldownMs) {
  const actionState = readActionState();
  const lastAt = Number(actionState[actionKey] || 0);
  return Date.now() - lastAt < cooldownMs;
}

function touchCooldown(actionKey) {
  const actionState = readActionState();
  actionState[actionKey] = Date.now();
  writeActionState(actionState);
}

function hasReportedLobby(lobbyId) {
  const actionState = readActionState();
  return Boolean(actionState[`report:${lobbyId}`]);
}

function markReportedLobby(lobbyId) {
  const actionState = readActionState();
  actionState[`report:${lobbyId}`] = Date.now();
  writeActionState(actionState);
}

function validateLobbyForm(form) {
  const name = form.name.trim();
  const code = form.code.trim().toUpperCase();
  const have = Number(form.have);
  const need = Number(form.need);

  if (!name || !code || !form.server || !form.rank) {
    return 'ALL LOBBY FIELDS ARE REQUIRED.';
  }

  if (!name.includes('#')) {
    return 'RIOT ID MUST INCLUDE A TAG LIKE PLAYER#1234.';
  }

  if (!/^[A-Z0-9]{4,10}$/.test(code)) {
    return 'PARTY CODE MUST BE 4 TO 10 LETTERS OR NUMBERS.';
  }

  if (Number.isNaN(have) || Number.isNaN(need) || have < 1 || have > 5 || need < 0 || need > 4) {
    return 'PLAYER COUNTS ARE INVALID.';
  }

  if (have + need > 5) {
    return 'WE ARE + NEED CANNOT BE MORE THAN 5 PLAYERS.';
  }

  return '';
}

function validateTeamForm(form, mode) {
  if (!form.name.trim() || !form.tag.trim() || !form.contact.trim() || !form.description.trim()) {
    return 'ALL TEAM FIELDS ARE REQUIRED.';
  }

  if (mode !== 'register' && !form.lookingFor.trim()) {
    return 'LOOKING FOR IS REQUIRED FOR TEAM PAGES.';
  }

  if (!/^[A-Za-z0-9]{2,6}$/.test(form.tag.trim())) {
    return 'TEAM TAG MUST BE 2 TO 6 LETTERS OR NUMBERS.';
  }

  if (mode === 'register' && !form.description.includes('#')) {
    return 'VALORANT ID MUST INCLUDE A TAG LIKE PLAYER#1234.';
  }

  return '';
}

function validateJoinRequestForm(form) {
  if (!form.riotId.trim() || !form.rank.trim() || !form.contact.trim()) {
    return 'ALL REQUEST FIELDS ARE REQUIRED.';
  }

  if (!form.riotId.includes('#')) {
    return 'RIOT ID MUST INCLUDE A TAG LIKE PLAYER#1234.';
  }

  return '';
}

export default function HomePage({ state, setState, stats, viewerId }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search: '', rank: 'ALL', server: 'ALL', status: 'ALL' });
  const [isLobbyModalOpen, setLobbyModalOpen] = useState(false);
  const [isRequestsModalOpen, setRequestsModalOpen] = useState(false);
  const [isJoinRequestModalOpen, setJoinRequestModalOpen] = useState(false);
  const [isTeamModalOpen, setTeamModalOpen] = useState(false);
  const [teamModalMode, setTeamModalMode] = useState('create');
  const [selectedLobby, setSelectedLobby] = useState(null);
  const [lobbyForm, setLobbyForm] = useState(defaultLobbyForm);
  const [teamForm, setTeamForm] = useState(defaultTeamForm);
  const [joinRequestForm, setJoinRequestForm] = useState(defaultJoinRequestForm);
  const [lobbyError, setLobbyError] = useState('');
  const [teamError, setTeamError] = useState('');
  const [joinRequestError, setJoinRequestError] = useState('');
  const [requestNotice, setRequestNotice] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const localDeviceId = getLocalDeviceId();
  const actorId = viewerId || localDeviceId;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('inbox') === '1') {
      setRequestsModalOpen(true);
      params.delete('inbox');
      navigate(
        {
          pathname: location.pathname,
          search: params.toString() ? `?${params.toString()}` : '',
        },
        { replace: true }
      );
    }
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!requestNotice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setRequestNotice(''), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [requestNotice]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      setState((current) => {
        const nextLobbies = current.lobbies.filter((lobby) => (lobby.expiresAt || 0) > currentTime);
        const nextTeams = current.teams.filter((team) => !team.expiresAt || team.expiresAt > currentTime);

        if (nextLobbies.length === current.lobbies.length && nextTeams.length === current.teams.length) {
          return current;
        }

        return {
          ...current,
          lobbies: nextLobbies,
          teams: nextTeams,
          requests: {
            incoming: current.requests.incoming.filter((request) =>
              nextLobbies.some((lobby) => lobby.id === request.lobbyId)
            ),
            outgoing: current.requests.outgoing.filter((request) =>
              nextLobbies.some((lobby) => lobby.id === request.lobbyId)
            ),
          },
        };
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [setState]);

  const filteredLobbies = useMemo(
    () =>
      state.lobbies.filter((lobby) => {
        const matchesSearch = [lobby.name, lobby.server, lobby.rank, lobby.code]
          .join(' ')
          .toLowerCase()
          .includes(filters.search.toLowerCase());
        const matchesRank = filters.rank === 'ALL' || lobby.rank === filters.rank;
        const matchesServer = filters.server === 'ALL' || lobby.server === filters.server;
        const matchesStatus = filters.status === 'ALL' || lobby.status === filters.status;
        return matchesSearch && matchesRank && matchesServer && matchesStatus;
      }),
    [filters, state.lobbies]
  );

  const scopedRequests = useMemo(
    () => ({
      incoming: state.requests.incoming.filter((request) => request.ownerId === actorId && request.status === 'PENDING'),
      outgoing: state.requests.outgoing.filter((request) => request.requesterId === actorId),
    }),
    [actorId, state.requests.incoming, state.requests.outgoing]
  );

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const openCreateTeamModal = () => {
    setTeamModalMode('create');
    setTeamError('');
    setTeamModalOpen(true);
  };

  const openRegisterTeamModal = () => {
    setTeamModalMode('register');
    setTeamError('');
    setTeamModalOpen(true);
  };

  const handleLobbyInput = (event) => {
    const { name, value } = event.target;

    if (name === 'rank' && !PRO_CITY_RANKS.includes(value)) {
      setLobbyForm((current) => ({ ...current, rank: value, proPassword: '' }));
      setLobbyError('');
      return;
    }

    setLobbyForm((current) => ({ ...current, [name]: value }));
    setLobbyError('');
  };

  const handleTeamInput = (event) => {
    const { name, value } = event.target;
    setTeamForm((current) => ({ ...current, [name]: value }));
    setTeamError('');
  };

  const handleJoinRequestInput = (event) => {
    const { name, value } = event.target;
    setJoinRequestForm((current) => ({ ...current, [name]: value }));
    setJoinRequestError('');
  };

  const handleCreateLobby = () => {
    const validationError = validateLobbyForm(lobbyForm);
    if (validationError) {
      setLobbyError(validationError);
      return;
    }

    if (hasCooldown('createLobby', LOBBY_CREATE_COOLDOWN_MS)) {
      setLobbyError('WAIT 30 SECONDS BEFORE POSTING ANOTHER LOBBY.');
      return;
    }

    const normalizedName = normalizeText(lobbyForm.name);
    const normalizedCode = normalizeTag(lobbyForm.code);
    const duplicateLobby = state.lobbies.some(
      (lobby) => normalizeText(lobby.name) === normalizedName || normalizeTag(lobby.code) === normalizedCode
    );

    if (duplicateLobby) {
      setLobbyError('THIS LOBBY OR PARTY CODE IS ALREADY POSTED.');
      return;
    }

    const requiresProCity = PRO_CITY_RANKS.includes(lobbyForm.rank);
    if (requiresProCity && lobbyForm.proPassword !== PRO_CITY_PASSWORD) {
      setLobbyError('PRO CITY PASSWORD IS REQUIRED FOR ASCENDANT, IMMORTAL, AND RADIANT.');
      return;
    }

    const nextNeed = Number(lobbyForm.need);
    const createdAt = Date.now();
    const expiresAt = getLobbyExpiry(nextNeed);

    setState((current) => ({
      ...current,
      lobbies: [
        {
          id: crypto.randomUUID(),
          ownerId: actorId,
          name: lobbyForm.name.trim(),
          code: normalizedCode,
          have: Number(lobbyForm.have),
          need: nextNeed,
          server: lobbyForm.server,
          rank: lobbyForm.rank,
          status: getLobbyStatus(nextNeed),
          createdAt,
          expiresAt,
          lifetimeMs: expiresAt - createdAt,
          pro: requiresProCity,
        },
        ...current.lobbies,
      ],
    }));

    touchCooldown('createLobby');
    setLobbyForm(defaultLobbyForm);
    setLobbyError('');
    setLobbyModalOpen(false);
  };

  const handleCopyCode = async (valueOrLobby) => {
    const code = typeof valueOrLobby === 'string' ? valueOrLobby : valueOrLobby?.code;
    if (!code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setRequestNotice('PARTY CODE COPIED');
    } catch {
      setRequestNotice('COPY FAILED');
    }
  };

  const handleJoinRequest = (lobby) => {
    if (lobby.ownerId === actorId) {
      setRequestsModalOpen(true);
      return;
    }

    const existingRequest = state.requests.outgoing.find(
      (request) => request.lobbyId === lobby.id && request.requesterId === actorId
    );

    if (existingRequest?.status === 'APPROVED' && existingRequest.partyCode) {
      handleCopyCode(existingRequest.partyCode);
      return;
    }

    if (existingRequest?.status === 'PENDING') {
      setRequestsModalOpen(true);
      return;
    }

    setSelectedLobby(lobby);
    setJoinRequestForm({
      riotId: '',
      rank: lobby.rank || '',
      contact: '',
    });
    setJoinRequestError('');
    setJoinRequestModalOpen(true);
  };

  const submitJoinRequest = () => {
    const validationError = validateJoinRequestForm(joinRequestForm);
    if (validationError) {
      setJoinRequestError(validationError);
      return;
    }

    if (!selectedLobby) {
      setJoinRequestError('SELECT A LOBBY FIRST.');
      return;
    }

    const existingRequest = state.requests.outgoing.find(
      (request) => request.lobbyId === selectedLobby.id && request.requesterId === actorId && request.status === 'PENDING'
    );

    if (existingRequest) {
      setJoinRequestModalOpen(false);
      setRequestsModalOpen(true);
      return;
    }

    const requestId = crypto.randomUUID();
    const nextRequest = {
      id: requestId,
      lobbyId: selectedLobby.id,
      lobbyName: selectedLobby.name,
      ownerId: selectedLobby.ownerId || '',
      requesterId: actorId,
      riotId: joinRequestForm.riotId.trim(),
      rank: joinRequestForm.rank.trim(),
      contact: joinRequestForm.contact.trim(),
      status: 'PENDING',
      partyCode: '',
      createdAt: Date.now(),
    };

    setState((current) => ({
      ...current,
      requests: {
        incoming: [
          nextRequest,
          ...current.requests.incoming.filter((request) => request.id !== requestId),
        ],
        outgoing: [
          nextRequest,
          ...current.requests.outgoing.filter(
            (request) => !(request.lobbyId === selectedLobby.id && request.requesterId === actorId)
          ),
        ],
      },
    }));

    setJoinRequestForm(defaultJoinRequestForm);
    setJoinRequestError('');
    setJoinRequestModalOpen(false);
    setRequestsModalOpen(true);
  };

  const handleReportLobby = (lobby) => {
    if (lobby.ownerId === actorId || hasReportedLobby(lobby.id)) {
      return;
    }

    markReportedLobby(lobby.id);

    setState((current) => {
      const matchingReports = current.reports.filter((report) => report.lobbyId === lobby.id);
      const nextReportCount = matchingReports.length + 1;
      const nextReport = {
        id: crypto.randomUUID(),
        lobbyId: lobby.id,
        label: lobby.name,
        reason: `Lobby reported by community (${nextReportCount}/${AUTO_DELETE_REPORT_THRESHOLD})`,
        resolved: false,
        createdAt: Date.now(),
      };
      const nextReports = [nextReport, ...current.reports];

      if (nextReportCount < AUTO_DELETE_REPORT_THRESHOLD) {
        return {
          ...current,
          reports: nextReports,
        };
      }

      return {
        ...current,
        lobbies: current.lobbies.filter((entry) => entry.id !== lobby.id),
        requests: {
          incoming: current.requests.incoming.filter((request) => request.lobbyId !== lobby.id),
          outgoing: current.requests.outgoing.filter((request) => request.lobbyId !== lobby.id),
        },
        reports: nextReports,
      };
    });
  };

  const handleApproveIncomingRequest = (requestId) => {
    setState((current) => {
      const request = current.requests.incoming.find((entry) => entry.id === requestId && entry.ownerId === actorId);
      if (!request) {
        return current;
      }

      const approvedLobby = current.lobbies.find((lobby) => lobby.id === request.lobbyId);
      const lobbies = current.lobbies.map((lobby) => {
        if (lobby.id !== request.lobbyId) {
          return lobby;
        }

        const nextHave = Math.min(5, lobby.have + 1);
        const nextNeed = Math.max(0, 5 - nextHave);
        const nextExpiry = getLobbyExpiry(nextNeed);
        return {
          ...lobby,
          have: nextHave,
          need: nextNeed,
          status: getLobbyStatus(nextNeed),
          expiresAt: nextExpiry,
          lifetimeMs: nextExpiry - (lobby.createdAt || Date.now()),
        };
      });

      return {
        ...current,
        lobbies,
        requests: {
          incoming: current.requests.incoming.filter((entry) => entry.id !== requestId),
          outgoing: current.requests.outgoing.map((entry) =>
            entry.id === requestId
              ? {
                  ...entry,
                  status: 'APPROVED',
                  partyCode: approvedLobby?.code || '',
                }
              : entry
          ),
        },
      };
    });
    setRequestNotice('REQUEST APPROVED');
  };

  const handleRejectIncomingRequest = (requestId) => {
    setState((current) => {
      const request = current.requests.incoming.find((entry) => entry.id === requestId && entry.ownerId === actorId);
      if (!request) {
        return current;
      }

      return {
        ...current,
        requests: {
          incoming: current.requests.incoming.filter((entry) => entry.id !== requestId),
          outgoing: current.requests.outgoing.map((entry) =>
            entry.id === requestId
              ? {
                  ...entry,
                  status: 'REJECTED',
                  partyCode: '',
                }
              : entry
          ),
        },
      };
    });
    setRequestNotice('REQUEST REJECTED');
  };

  const handleCreateTeam = () => {
    const validationError = validateTeamForm(teamForm, teamModalMode);
    if (validationError) {
      setTeamError(validationError);
      return;
    }

    const normalizedTeamName = normalizeText(teamForm.name);
    const normalizedTeamTag = normalizeTag(teamForm.tag);

    if (teamModalMode === 'register') {
      if (hasCooldown('registerTournament', TOURNAMENT_REGISTER_COOLDOWN_MS)) {
        setTeamError('WAIT 30 SECONDS BEFORE SENDING ANOTHER TOURNAMENT REGISTRATION.');
        return;
      }

      const tournamentStatus = String(state.tournament?.status || 'OPEN').toUpperCase();

      if (!state.tournament || tournamentStatus === 'HIDDEN') {
        setTeamError('NO OPEN TOURNAMENT AVAILABLE.');
        return;
      }

      if (tournamentStatus === 'CLOSED') {
        setTeamError('TOURNAMENT REGISTRATION IS CLOSED.');
        return;
      }

      if (!state.tournament.registrationOpen) {
        setTeamError('TOURNAMENT REGISTRATION IS CLOSED.');
        return;
      }

      if (Number(state.tournament.registrations || 0) >= Number(state.tournament.slots || 0)) {
        setTeamError('TOURNAMENT SLOTS ARE FULL.');
        return;
      }

      const duplicateRegistration = (state.tournamentRegistrations || []).some(
        (registration) =>
          normalizeText(registration.teamName) === normalizedTeamName || normalizeTag(registration.tag) === normalizedTeamTag
      );

      if (duplicateRegistration) {
        setTeamError('THIS TEAM IS ALREADY REGISTERED IN THE TOURNAMENT.');
        return;
      }
    }

    if (teamModalMode === 'create') {
      if (hasCooldown('createTeamPage', TEAM_CREATE_COOLDOWN_MS)) {
        setTeamError('WAIT 30 SECONDS BEFORE CREATING ANOTHER TEAM PAGE.');
        return;
      }

      const duplicateTeam = state.teams.some(
        (team) => normalizeText(team.name) === normalizedTeamName || normalizeTag(team.tag) === normalizedTeamTag
      );

      if (duplicateTeam) {
        setTeamError('THIS TEAM NAME OR TAG IS ALREADY USED.');
        return;
      }
    }

    setState((current) => {
      const createdAt = Date.now();

      if (teamModalMode === 'register') {
        const tournamentStatus = String(current.tournament?.status || 'OPEN').toUpperCase();
        const registration = {
          id: crypto.randomUUID(),
          tournamentId: current.tournament?.id || '',
          teamName: teamForm.name.trim(),
          tag: normalizedTeamTag,
          contact: teamForm.contact.trim(),
          description: teamForm.description.trim(),
          createdAt,
          status: 'PENDING',
        };

        const nextRegistrationsCount = Math.min(
          Number(current.tournament?.slots || 0),
          Number(current.tournament?.registrations || 0) + 1
        );
        const shouldStayOpen =
          current.tournament?.registrationOpen !== false &&
          nextRegistrationsCount < Number(current.tournament?.slots || 0) &&
          tournamentStatus !== 'CLOSED' &&
          tournamentStatus !== 'HIDDEN';

        return {
          ...current,
          tournamentRegistrations: [registration, ...(current.tournamentRegistrations || [])],
          tournament: current.tournament
            ? {
                ...current.tournament,
                registrations: nextRegistrationsCount,
                registrationOpen: shouldStayOpen,
              }
            : current.tournament,
        };
      }

      const nextTeam = {
        id: crypto.randomUUID(),
        ...teamForm,
        tag: normalizedTeamTag,
        name: teamForm.name.trim(),
        lookingFor: teamForm.lookingFor.trim(),
        contact: teamForm.contact.trim(),
        description: teamForm.description.trim(),
        verified: false,
        pro: false,
        createdAt,
        expiresAt: createdAt + TEAM_PAGE_LIFETIME_MS,
      };

      return {
        ...current,
        teams: [nextTeam, ...current.teams],
      };
    });

    touchCooldown(teamModalMode === 'register' ? 'registerTournament' : 'createTeamPage');
    setTeamForm(defaultTeamForm);
    setTeamError('');
    setTeamModalOpen(false);
  };

  return (
    <main>
      <HeroSection stats={stats} onExplore={() => scrollTo('feed')} onCreate={() => setLobbyModalOpen(true)} />
      <TournamentSection
        tournament={state.tournament}
        archive={state.archive}
        now={now}
        onRegisterTeam={openRegisterTeamModal}
        onOpenLobbies={() => scrollTo('feed')}
      />
      <FeedSection
        lobbies={filteredLobbies}
        now={now}
        stats={stats}
        filters={filters}
        onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onClearFilters={() => setFilters({ search: '', rank: 'ALL', server: 'ALL', status: 'ALL' })}
        onCreate={() => setLobbyModalOpen(true)}
        onJoin={handleJoinRequest}
        onReport={handleReportLobby}
        onCopyCode={handleCopyCode}
        actorId={actorId}
        outgoingRequests={scopedRequests.outgoing}
      />
      <TeamsSection
        teams={state.teams}
        onCreateTeam={openCreateTeamModal}
        onViewTournament={() => scrollTo('tournaments')}
      />
      <CommunitySection announcements={state.announcements} onViewLobbies={() => scrollTo('feed')} />

      <CreateLobbyModal
        isOpen={isLobbyModalOpen}
        onClose={() => setLobbyModalOpen(false)}
        form={lobbyForm}
        onChange={handleLobbyInput}
        onSubmit={handleCreateLobby}
        error={lobbyError}
      />
      <JoinRequestModal
        isOpen={isJoinRequestModalOpen}
        onClose={() => setJoinRequestModalOpen(false)}
        form={joinRequestForm}
        onChange={handleJoinRequestInput}
        onSubmit={submitJoinRequest}
        lobbyName={selectedLobby?.name || ''}
        error={joinRequestError}
      />
      <RequestsModal
        isOpen={isRequestsModalOpen}
        onClose={() => setRequestsModalOpen(false)}
        requests={scopedRequests}
        onApprove={handleApproveIncomingRequest}
        onReject={handleRejectIncomingRequest}
        onCopyCode={handleCopyCode}
      />
      <CreateTeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setTeamModalOpen(false)}
        form={teamForm}
        onChange={handleTeamInput}
        onSubmit={handleCreateTeam}
        error={teamError}
        mode={teamModalMode}
      />
      <div className={`request-toast${requestNotice ? ' show' : ''}`}>{requestNotice}</div>
    </main>
  );
}
