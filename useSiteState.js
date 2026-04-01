import { useEffect, useMemo, useRef, useState } from 'react';
import { defaultAnnouncements, defaultArchive, defaultLobbies, defaultReports, defaultRequests, defaultTeams, defaultTournament } from '../lib/mockData';
import { bootstrapFirebaseServices } from '../lib/firebase';

const STORAGE_KEY = 'valorant-react-site-state-v3';
const FIREBASE_STATE_PATH = 'siteStateV3';

function buildDefaultState() {
  return {
    lobbies: defaultLobbies,
    teams: defaultTeams,
    announcements: defaultAnnouncements,
    tournament: defaultTournament,
    tournamentRegistrations: [],
    archive: defaultArchive,
    requests: defaultRequests,
    reports: defaultReports,
    livePlayers: 1,
  };
}

function normalizeState(savedState) {
  const defaults = buildDefaultState();
  const tournamentRegistrations = Array.isArray(savedState?.tournamentRegistrations)
    ? savedState.tournamentRegistrations
    : defaults.tournamentRegistrations;

  const tournament = savedState?.tournament
    ? {
        ...savedState.tournament,
        registrations: tournamentRegistrations.length,
      }
    : savedState?.tournament === null
      ? null
      : defaults.tournament;

  return {
    ...defaults,
    ...savedState,
    tournament,
    lobbies: Array.isArray(savedState?.lobbies) ? savedState.lobbies : defaults.lobbies,
    teams: Array.isArray(savedState?.teams) ? savedState.teams : defaults.teams,
    announcements: Array.isArray(savedState?.announcements) ? savedState.announcements : defaults.announcements,
    archive: Array.isArray(savedState?.archive) ? savedState.archive : defaults.archive,
    reports: Array.isArray(savedState?.reports) ? savedState.reports : defaults.reports,
    tournamentRegistrations,
    requests: {
      incoming: Array.isArray(savedState?.requests?.incoming) ? savedState.requests.incoming : [],
      outgoing: Array.isArray(savedState?.requests?.outgoing) ? savedState.requests.outgoing : [],
    },
    livePlayers: defaults.livePlayers,
  };
}

function getSyncState(value) {
  const normalized = normalizeState(value);
  const { livePlayers, ...rest } = normalized;
  return rest;
}

function readInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      throw new Error('missing');
    }
    return normalizeState(JSON.parse(raw));
  } catch {
    return buildDefaultState();
  }
}

export default function useSiteState() {
  const [state, setState] = useState(readInitialState);
  const [viewerId, setViewerId] = useState('');
  const remoteReadyRef = useRef(false);
  const applyingRemoteRef = useRef(false);
  const lastSerializedRef = useRef('');
  const firebaseRefRef = useRef(null);

  useEffect(() => {
    const normalized = normalizeState(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }, [state]);

  useEffect(() => {
    let detached = false;
    let siteRef = null;
    let onlineUsersRef = null;
    let connectedRef = null;
    let presenceRef = null;

    bootstrapFirebaseServices().then((services) => {
      if (detached || !services?.database) {
        return;
      }

      setViewerId(services.uid || '');
      siteRef = services.database.ref(FIREBASE_STATE_PATH);
      firebaseRefRef.current = siteRef;

      siteRef.on('value', (snapshot) => {
        if (detached) {
          return;
        }

        const remoteValue = snapshot.val();
        remoteReadyRef.current = true;

        if (!remoteValue) {
          const syncState = getSyncState(readInitialState());
          lastSerializedRef.current = JSON.stringify(syncState);
          siteRef.set(syncState);
          return;
        }

        const normalized = normalizeState(remoteValue);
        const syncState = getSyncState(normalized);
        const serialized = JSON.stringify(syncState);

        if (serialized === lastSerializedRef.current) {
          return;
        }

        applyingRemoteRef.current = true;
        lastSerializedRef.current = serialized;
        setState((current) => ({ ...normalized, livePlayers: current.livePlayers }));
        window.setTimeout(() => {
          applyingRemoteRef.current = false;
        }, 0);
      });

      onlineUsersRef = services.database.ref('onlineUsers');
      onlineUsersRef.on('value', (snapshot) => {
        if (detached) {
          return;
        }

        const count = Math.max(1, snapshot.numChildren() || 0);
        setState((current) => (current.livePlayers === count ? current : { ...current, livePlayers: count }));
      });

      connectedRef = services.database.ref('.info/connected');
      presenceRef = services.database.ref(`onlineUsers/${services.uid || 'guest'}`);
      connectedRef.on('value', (snapshot) => {
        if (detached || snapshot.val() !== true || !presenceRef) {
          return;
        }

        presenceRef.onDisconnect().remove();
        presenceRef.set(true);
      });
    });

    return () => {
      detached = true;
      if (siteRef) {
        siteRef.off();
      }
      if (onlineUsersRef) {
        onlineUsersRef.off();
      }
      if (connectedRef) {
        connectedRef.off();
      }
    };
  }, []);

  useEffect(() => {
    if (!remoteReadyRef.current || applyingRemoteRef.current || !firebaseRefRef.current) {
      return;
    }

    const syncState = getSyncState(state);
    const serialized = JSON.stringify(syncState);

    if (serialized === lastSerializedRef.current) {
      return;
    }

    lastSerializedRef.current = serialized;
    firebaseRefRef.current.set(syncState);
  }, [state]);

  const stats = useMemo(() => {
    const pendingRequests = [...state.requests.incoming, ...state.requests.outgoing].filter((item) => item.status === 'PENDING').length;

    return {
      visibleLobbies: state.lobbies.length,
      pendingRequests,
      verifiedTeams: state.teams.filter((team) => team.verified).length,
      livePlayers: state.livePlayers,
    };
  }, [state]);

  return { state, setState, stats, viewerId };
}
