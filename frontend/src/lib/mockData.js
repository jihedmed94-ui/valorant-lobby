export const defaultTournament = {
  id: 'spring-cup',
  title: 'VALORANT SPRING CUP',
  date: '2026-04-04T20:00:00',
  slots: 16,
  prize: 'TBA',
  status: 'OPEN',
  registrations: 6,
  description: 'Single elimination / bo1 / check-in 30 min before start',
};

export const defaultLobbies = [];

export const defaultTeams = [
  { id: 'team-1', name: 'North Seven', tag: 'N7', lookingFor: 'Initiator / Flex', contact: 'discord.gg/team', description: 'Competitive Tunisian roster looking for disciplined players.', verified: true, pro: true, createdAt: Date.now() - 1200000 },
  { id: 'team-2', name: 'Midnight Push', tag: 'MNP', lookingFor: 'Controller', contact: '@midnightpush', description: 'Scrim-focused team building a consistent five stack.', verified: false, pro: false, createdAt: Date.now() - 5400000 }
];

export const defaultAnnouncements = [
  { id: 'ann-1', category: 'Tournament', title: 'Tournament tools are live', body: 'Registration, countdown, and event archive support are now part of the site.' },
  { id: 'ann-2', category: 'Community', title: 'Join requests are now reviewed', body: 'Lobby owners can approve or reject requests before sharing access.' },
  { id: 'ann-3', category: 'Live', title: 'Tournament admin is ready', body: 'Create events, open registration, and archive winners from the admin page.' }
];

export const defaultArchive = [
  { id: 'arc-1', title: 'Winter Clash', winner: 'North Seven', note: 'Closed with a clean 3-1 final.', date: '2026-02-14T19:00:00' }
];

export const defaultRequests = {
  incoming: [],
  outgoing: []
};

export const defaultReports = [
  { id: 'rep-1', label: 'Aymen#VAL', reason: 'Spam / fake lobby', resolved: false }
];
