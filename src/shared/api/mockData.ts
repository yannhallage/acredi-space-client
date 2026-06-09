import type {
  ActivityDay,
  AppNotification,
  CalendarEvent,
  Channel,
  Conversation,
  DashboardData,
  DashboardKpi,
  FileItem,
  FolderItem,
  Meeting,
  Message,
  RecentActivity,
  User,
  Workspace
} from '../types';

export const users: User[] = [
  {
    id: 'u-mohamed',
    name: 'Mohamed Doumbia',
    email: 'mohamed@acredispace.local',
    role: 'Directeur',
    team: 'Direction',
    presence: 'online',
    status: 'Disponible',
    adminRole: 'owner'
  },
  {
    id: 'u-yann',
    name: 'Yann Hallage',
    email: 'yann@acredispace.local',
    role: 'Directeur produit',
    team: 'Produit',
    presence: 'busy',
    status: 'En reunion - Daily Direction',
    adminRole: 'admin'
  },
  {
    id: 'u-issa',
    name: 'Issa Kone',
    email: 'issa@acredispace.local',
    role: 'Directeur technique',
    team: 'Tech',
    presence: 'online',
    status: 'Disponible',
    adminRole: 'admin'
  },
  {
    id: 'u-yeo',
    name: 'Mlle Yeo',
    email: 'yeo@acredispace.local',
    role: 'Lead developpeuse',
    team: 'Produit',
    presence: 'dnd',
    status: 'Concentration',
    adminRole: 'member'
  },
  {
    id: 'u-aicha',
    name: 'Aicha Bamba',
    email: 'aicha@acredispace.local',
    role: 'Designer UI',
    team: 'Design Studio',
    presence: 'online',
    status: 'Disponible',
    adminRole: 'member'
  },
  {
    id: 'u-kouadio',
    name: 'Kouadio Yao',
    email: 'kouadio@acredispace.local',
    role: 'Chef de projet',
    team: 'Commercial',
    presence: 'offline',
    status: 'De retour a 14h',
    adminRole: 'guest'
  }
];

export const workspaces: Workspace[] = [
  { id: 'direction', name: 'Direction', color: '#5B6CFF' },
  { id: 'product', name: 'Produit', color: '#8B7FFF' },
  { id: 'sales', name: 'Commercial', color: '#22C55E' },
  { id: 'design', name: 'Design Studio', color: '#F59E0B' }
];

export const folders: FolderItem[] = [
  { id: 'identity', name: '01 - Identite visuelle', count: 18, color: '#5B6CFF' },
  { id: 'brief', name: '02 - Brief & spec', count: 7, color: '#8B7FFF' },
  { id: 'meetings', name: '03 - Reunions & PV', count: 24, color: '#22C55E' },
  { id: 'marketing', name: '04 - Marketing', count: 11, color: '#F59E0B' }
];

export const files: FileItem[] = [
  {
    id: 'f-brief',
    name: 'Brief identite v0.1.pdf',
    ext: 'pdf',
    color: '#EF4444',
    size: '2.4 Mo',
    modifiedLabel: 'hier',
    modifiedAt: '2026-05-20T14:32:00.000Z',
    authorId: 'u-yann',
    folderId: 'identity',
    sharedWith: ['u-mohamed', 'u-yann', 'u-issa', 'u-yeo', 'u-aicha'],
    selected: true
  },
  {
    id: 'f-design-system',
    name: 'Acredi Space - Design System.fig',
    ext: 'fig',
    color: '#8B7FFF',
    size: '18 Mo',
    modifiedLabel: 'il y a 2 j',
    modifiedAt: '2026-05-19T09:12:00.000Z',
    authorId: 'u-aicha',
    folderId: 'identity',
    sharedWith: ['u-mohamed', 'u-yann', 'u-yeo', 'u-aicha']
  },
  {
    id: 'f-roadmap',
    name: 'Roadmap Q2 - production.xlsx',
    ext: 'xls',
    color: '#22C55E',
    size: '124 Ko',
    modifiedLabel: 'il y a 3 j',
    modifiedAt: '2026-05-18T10:42:00.000Z',
    authorId: 'u-mohamed',
    folderId: 'brief',
    sharedWith: ['u-mohamed', 'u-issa', 'u-kouadio']
  },
  {
    id: 'f-logo',
    name: 'Logo - exports SVG.zip',
    ext: 'zip',
    color: '#71717A',
    size: '486 Ko',
    modifiedLabel: 'il y a 5 j',
    modifiedAt: '2026-05-16T16:04:00.000Z',
    authorId: 'u-yann',
    folderId: 'identity',
    sharedWith: ['u-yann', 'u-aicha', 'u-yeo']
  },
  {
    id: 'f-notes',
    name: 'Note interne - naming.md',
    ext: 'md',
    color: '#5B6CFF',
    size: '12 Ko',
    modifiedLabel: 'il y a 1 sem',
    modifiedAt: '2026-05-14T08:17:00.000Z',
    authorId: 'u-yeo',
    folderId: 'brief',
    sharedWith: ['u-mohamed', 'u-yeo']
  },
  {
    id: 'f-pitch',
    name: 'Presentation soutenance - v3.pptx',
    ext: 'ppt',
    color: '#F59E0B',
    size: '6.8 Mo',
    modifiedLabel: 'il y a 1 sem',
    modifiedAt: '2026-05-13T13:48:00.000Z',
    authorId: 'u-mohamed',
    folderId: 'marketing',
    sharedWith: ['u-mohamed', 'u-kouadio']
  },
  {
    id: 'f-wireframes',
    name: 'Wireframes - flow login.png',
    ext: 'png',
    color: '#8B7FFF',
    size: '1.1 Mo',
    modifiedLabel: 'il y a 2 sem',
    modifiedAt: '2026-05-08T18:04:00.000Z',
    authorId: 'u-aicha',
    folderId: 'identity',
    sharedWith: ['u-aicha', 'u-yeo']
  },
  {
    id: 'f-pv',
    name: 'Proces-verbal reunion 12 mai.docx',
    ext: 'doc',
    color: '#5B6CFF',
    size: '88 Ko',
    modifiedLabel: 'il y a 2 sem',
    modifiedAt: '2026-05-07T11:30:00.000Z',
    authorId: 'u-issa',
    folderId: 'meetings',
    sharedWith: ['u-mohamed', 'u-issa', 'u-yann']
  }
];

export const channels: Channel[] = [
  {
    id: 'general',
    name: 'general',
    description: 'Annonces internes, coordination et decisions communes.',
    unread: 0,
    memberIds: ['u-mohamed', 'u-yann', 'u-issa', 'u-yeo', 'u-aicha', 'u-kouadio'],
    recentFileIds: ['f-roadmap']
  },
  {
    id: 'design-acredi',
    name: 'design-acredi',
    description: "Identite visuelle, exports, design system et validation de la marque.",
    unread: 3,
    memberIds: ['u-mohamed', 'u-yann', 'u-issa', 'u-yeo', 'u-aicha'],
    recentFileIds: ['f-design-system', 'f-brief', 'f-logo']
  },
  {
    id: 'sprint-18',
    name: 'sprint-18',
    description: 'Execution produit du sprint courant.',
    unread: 0,
    memberIds: ['u-mohamed', 'u-issa', 'u-yeo'],
    recentFileIds: ['f-roadmap', 'f-notes']
  },
  {
    id: 'incidents-prod',
    name: 'incidents-prod',
    description: 'Suivi des incidents, priorites et retours client.',
    unread: 1,
    urgent: true,
    memberIds: ['u-mohamed', 'u-issa', 'u-kouadio'],
    recentFileIds: ['f-pv']
  }
];

export const conversations: Conversation[] = [
  { id: 'dm-yann', userId: 'u-yann', unread: 2, lastMessage: "Je depose l'archive vers midi.", updatedAt: '09:24' },
  { id: 'dm-issa', userId: 'u-issa', unread: 0, lastMessage: 'En train d ecrire...', updatedAt: '09:18' },
  { id: 'dm-yeo', userId: 'u-yeo', unread: 0, lastMessage: 'Sprint #18 - review en fin d apres-midi ?', updatedAt: '09:12' },
  { id: 'dm-aicha', userId: 'u-aicha', unread: 1, lastMessage: 'Tu as un retour sur le mock calendrier ?', updatedAt: '08:55' },
  { id: 'dm-kouadio', userId: 'u-kouadio', unread: 0, lastMessage: 'Retour client recu.', updatedAt: 'mar.' }
];

export const messages: Message[] = [
  {
    id: 'm-1',
    channelId: 'design-acredi',
    authorId: 'u-yann',
    when: '09:14',
    content: 'Petite question avant le daily : on bloque la piste 3 pour le logo ? Issa a parle du polygone hier soir, je suis aussi convaincu.'
  },
  {
    id: 'm-2',
    channelId: 'design-acredi',
    authorId: 'u-issa',
    when: '09:16',
    content: "De mon cote c'est valide. Le bi-ton sur l'hex tient meme a 16px.",
    reactions: [
      { emoji: 'OK', count: 3 },
      { emoji: '+1', count: 2 }
    ]
  },
  {
    id: 'm-3',
    channelId: 'design-acredi',
    authorId: 'u-mohamed',
    when: '09:18',
    content: "OK on acte la piste 3. Yann, tu prepares les exports SVG ce matin ? Je lance Mlle Yeo sur les tokens design des cet aprem.",
    reactions: [{ emoji: 'vu', count: 4 }]
  },
  {
    id: 'm-4',
    channelId: 'design-acredi',
    authorId: 'u-yann',
    when: '09:20',
    content: "Recu. Je depose une archive logo-piste-3-v1.zip dans le canal d'ici midi.",
    attachmentId: 'f-logo'
  },
  {
    id: 'm-5',
    channelId: 'design-acredi',
    authorId: 'u-yeo',
    when: '09:23',
    content: 'Parfait. Je serai bonne pour integrer les tokens dans le repo en debut d aprem.'
  },
  {
    id: 'm-dm-1',
    conversationId: 'dm-yann',
    authorId: 'u-mohamed',
    when: '17:42',
    content: "Salut Yann, j'ai vu ton retour sur la piste 3. On bloque dessus ?"
  },
  {
    id: 'm-dm-2',
    conversationId: 'dm-yann',
    authorId: 'u-yann',
    when: '17:51',
    content: "Oui c'est valide de mon cote. Mlle Yeo est aussi convaincue. On lance la production des exports demain matin."
  },
  {
    id: 'm-dm-3',
    conversationId: 'dm-yann',
    authorId: 'u-yann',
    when: '17:52',
    content: 'Faut juste valider la permutation des facettes pour la version mobile, sur petits ecrans le 5B6CFF a droite est un peu lourd.'
  },
  {
    id: 'm-dm-4',
    conversationId: 'dm-yann',
    authorId: 'u-mohamed',
    when: '17:55',
    content: 'OK, on en reparle demain a 9:30. Je prepare une comparaison.'
  },
  {
    id: 'm-dm-5',
    conversationId: 'dm-yann',
    authorId: 'u-yann',
    when: '09:18',
    content: "Hello, c'est bon pour 9:30 ? J'ai aussi 2-3 idees sur l'animation hover.",
    attachmentId: 'f-wireframes'
  },
  {
    id: 'm-dm-6',
    conversationId: 'dm-yann',
    authorId: 'u-mohamed',
    when: '09:22',
    content: 'Top, on se cale la-dessus. Je suis dans le bureau dans 10 min.'
  },
  {
    id: 'm-dm-issa-1',
    conversationId: 'dm-issa',
    authorId: 'u-issa',
    when: '09:18',
    content: 'Le token accent est pret, je regarde maintenant les etats focus.'
  },
  {
    id: 'm-dm-aicha-1',
    conversationId: 'dm-aicha',
    authorId: 'u-aicha',
    when: '08:55',
    content: 'Tu as un retour sur le mock calendrier ? Je peux ajuster la densite.'
  }
];

export const calendarEvents: CalendarEvent[] = [
  {
    id: 'ev-daily',
    title: 'Daily Direction',
    date: '2026-05-23',
    time: '10:30',
    duration: '30 min',
    color: '#5B6CFF',
    attendeeIds: ['u-mohamed', 'u-yann', 'u-issa'],
    status: 'live',
    location: 'Salle Nimba'
  },
  {
    id: 'ev-design',
    title: 'Revue design Acredi Space',
    date: '2026-05-23',
    time: '14:00',
    duration: '1 h',
    color: '#8B7FFF',
    attendeeIds: ['u-yann', 'u-aicha', 'u-yeo'],
    status: 'upcoming',
    location: 'Visio'
  },
  {
    id: 'ev-client',
    title: 'Sync clients - ACME',
    date: '2026-05-23',
    time: '16:30',
    duration: '45 min',
    color: '#22C55E',
    attendeeIds: ['u-mohamed', 'u-issa', 'u-kouadio'],
    status: 'upcoming',
    location: 'Salle Baobab'
  },
  {
    id: 'ev-retro',
    title: 'Retro sprint #18',
    date: '2026-05-24',
    time: '11:00',
    duration: '50 min',
    color: '#F59E0B',
    attendeeIds: ['u-mohamed', 'u-issa', 'u-yeo', 'u-aicha'],
    status: 'upcoming',
    location: 'Visio'
  },
  {
    id: 'ev-brief-identity',
    title: 'Brief identite',
    date: '2026-05-03',
    time: '10:00',
    duration: '45 min',
    color: '#8B7FFF',
    attendeeIds: ['u-yann', 'u-aicha'],
    status: 'done',
    location: 'Design Studio'
  },
  {
    id: 'ev-sprint-kickoff',
    title: 'Sprint #18 kickoff',
    date: '2026-05-04',
    time: '09:00',
    duration: '1 h',
    color: '#22C55E',
    attendeeIds: ['u-mohamed', 'u-issa', 'u-yeo'],
    status: 'done',
    location: 'Salle Baobab'
  },
  {
    id: 'ev-daily-05',
    title: 'Daily Direction',
    date: '2026-05-05',
    time: '10:30',
    duration: '30 min',
    color: '#5B6CFF',
    attendeeIds: ['u-mohamed', 'u-yann', 'u-issa'],
    status: 'done',
    location: 'Salle Nimba'
  },
  {
    id: 'ev-sync-acme-05',
    title: 'Sync clients ACME',
    date: '2026-05-05',
    time: '15:30',
    duration: '45 min',
    color: '#22C55E',
    attendeeIds: ['u-mohamed', 'u-issa', 'u-kouadio'],
    status: 'done',
    location: 'Salle Baobab'
  },
  {
    id: 'ev-revue-design-07',
    title: 'Revue design',
    date: '2026-05-07',
    time: '14:00',
    duration: '1 h',
    color: '#8B7FFF',
    attendeeIds: ['u-yann', 'u-aicha', 'u-yeo'],
    status: 'done',
    location: 'Design Studio'
  },
  {
    id: 'ev-soutenance-11',
    title: 'Soutenance v1',
    date: '2026-05-11',
    time: '09:30',
    duration: '1 h',
    color: '#F59E0B',
    attendeeIds: ['u-mohamed', 'u-yann'],
    status: 'done',
    location: 'Visio'
  },
  {
    id: 'ev-daily-12',
    title: 'Daily Direction',
    date: '2026-05-12',
    time: '10:30',
    duration: '30 min',
    color: '#5B6CFF',
    attendeeIds: ['u-mohamed', 'u-yann', 'u-issa'],
    status: 'done',
    location: 'Salle Nimba'
  },
  {
    id: 'ev-one-to-one-yann',
    title: '1:1 Yann',
    date: '2026-05-12',
    time: '11:00',
    duration: '30 min',
    color: '#8B7FFF',
    attendeeIds: ['u-mohamed', 'u-yann'],
    status: 'done',
    location: 'Bureau produit'
  },
  {
    id: 'ev-workshop-logo',
    title: 'Workshop logo',
    date: '2026-05-14',
    time: '14:00',
    duration: '1 h',
    color: '#8B7FFF',
    attendeeIds: ['u-yann', 'u-aicha', 'u-yeo'],
    status: 'done',
    location: 'Design Studio'
  },
  {
    id: 'ev-comite-direction',
    title: 'Comite direction',
    date: '2026-05-18',
    time: '16:00',
    duration: '1 h',
    color: '#EF4444',
    attendeeIds: ['u-mohamed', 'u-yann', 'u-issa'],
    status: 'done',
    location: 'Salle Direction'
  },
  {
    id: 'ev-daily-19',
    title: 'Daily Direction',
    date: '2026-05-19',
    time: '10:30',
    duration: '30 min',
    color: '#5B6CFF',
    attendeeIds: ['u-mohamed', 'u-yann', 'u-issa'],
    status: 'done',
    location: 'Salle Nimba'
  },
  {
    id: 'ev-revue-design-v2',
    title: 'Revue design v2',
    date: '2026-05-20',
    time: '11:00',
    duration: '1 h',
    color: '#8B7FFF',
    attendeeIds: ['u-yann', 'u-aicha', 'u-yeo'],
    status: 'done',
    location: 'Design Studio'
  },
  {
    id: 'ev-atelier-mobile',
    title: 'Atelier UX mobile',
    date: '2026-05-22',
    time: '09:00',
    duration: '1 h',
    color: '#F59E0B',
    attendeeIds: ['u-yann', 'u-aicha'],
    status: 'upcoming',
    location: 'Design Studio'
  },
  {
    id: 'ev-pres-soutenance',
    title: 'Pres. soutenance',
    date: '2026-05-25',
    time: '11:00',
    duration: '1 h',
    color: '#F59E0B',
    attendeeIds: ['u-mohamed', 'u-yann'],
    status: 'upcoming',
    location: 'Visio'
  },
  {
    id: 'ev-daily-26',
    title: 'Daily Direction',
    date: '2026-05-26',
    time: '10:30',
    duration: '30 min',
    color: '#5B6CFF',
    attendeeIds: ['u-mohamed', 'u-yann', 'u-issa'],
    status: 'upcoming',
    location: 'Salle Nimba'
  },
  {
    id: 'ev-demo-acme',
    title: 'Demo client ACME',
    date: '2026-05-28',
    time: '15:00',
    duration: '45 min',
    color: '#22C55E',
    attendeeIds: ['u-mohamed', 'u-issa', 'u-kouadio'],
    status: 'upcoming',
    location: 'Salle Baobab'
  }
];

export const meetings: Meeting[] = calendarEvents.map((event) => ({
  id: event.id.replace('ev-', 'meet-'),
  title: event.title,
  time: event.time,
  duration: event.duration,
  room: event.location,
  live: event.status === 'live',
  attendeeIds: event.attendeeIds
}));

export const notifications: AppNotification[] = [
  {
    id: 'n-1',
    type: 'file',
    title: 'Nouveau fichier partage',
    body: 'Yann a depose Logo - exports SVG.zip dans design-acredi.',
    createdAt: 'il y a 14 min',
    unread: true,
    actorId: 'u-yann',
    target: 'f-logo'
  },
  {
    id: 'n-2',
    type: 'message',
    title: 'Mention dans #design-acredi',
    body: 'Mlle Yeo vous a mentionne sur les tokens du design system.',
    createdAt: 'il y a 32 min',
    unread: true,
    actorId: 'u-yeo',
    target: 'design-acredi'
  },
  {
    id: 'n-3',
    type: 'meeting',
    title: 'Daily Direction en cours',
    body: 'La reunion a demarre dans Salle Nimba.',
    createdAt: 'maintenant',
    unread: true,
    actorId: 'u-yann',
    target: 'meet-daily'
  },
  {
    id: 'n-4',
    type: 'system',
    title: 'Archivage termine',
    body: '12 fichiers anciens du canal design ont ete archives.',
    createdAt: 'il y a 3 h',
    unread: false
  }
];

const kpis: DashboardKpi[] = [
  { label: 'Reunions cette semaine', value: '47', delta: '+12%', trend: 'up', data: [22, 28, 25, 31, 34, 41, 47], color: '#5B6CFF' },
  { label: 'Fichiers actifs', value: '1 284', delta: '+86', trend: 'up', data: [1100, 1140, 1180, 1190, 1210, 1240, 1284], color: '#8B7FFF' },
  { label: 'Messages envoyes', value: '3 412', delta: '-4%', trend: 'down', data: [3800, 3700, 3600, 3500, 3550, 3460, 3412], color: '#F59E0B' },
  { label: 'Membres actifs', value: '38 / 42', delta: '+3', trend: 'up', data: [30, 32, 33, 35, 35, 37, 38], color: '#22C55E' }
];

const activity: ActivityDay[] = [
  { day: 'Lun', meetings: 8, messages: 412, files: 18 },
  { day: 'Mar', meetings: 11, messages: 538, files: 22 },
  { day: 'Mer', meetings: 6, messages: 287, files: 14 },
  { day: 'Jeu', meetings: 12, messages: 624, files: 31 },
  { day: 'Ven', meetings: 9, messages: 491, files: 26 },
  { day: 'Sam', meetings: 1, messages: 64, files: 3 },
  { day: 'Dim', meetings: 0, messages: 28, files: 1 }
];

const recentActivity: RecentActivity[] = [
  { id: 'ra-1', actorId: 'u-yann', verb: 'a partage', target: 'Brief identite v0.1.pdf', when: '14 min', icon: 'file' },
  { id: 'ra-2', actorId: 'u-issa', verb: 'a commente', target: 'Roadmap Q2 - production', when: '32 min', icon: 'message' },
  { id: 'ra-3', actorId: 'u-yeo', verb: 'a termine', target: 'Sprint #18 - login', when: '1 h', icon: 'star' },
  { id: 'ra-4', actorId: 'u-mohamed', verb: 'a archive', target: '12 fichiers anciens du canal #design', when: '3 h', icon: 'folder' }
];

export const dashboard: DashboardData = {
  kpis,
  activity,
  recentActivity,
  upcomingMeetings: meetings
};
