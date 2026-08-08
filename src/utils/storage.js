const STORAGE_KEYS = {
  USER: 'calm_moment_user',
  SESSIONS: 'calm_moment_sessions',
};

export function getUser() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export function getSessions() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSession(session) {
  const sessions = getSessions();
  sessions.push({
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36),
    ...session,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

export function getSessionStats() {
  const sessions = getSessions();
  const moodCounts = { good: 0, average: 0, bad: 0, stressful: 0 };
  let completed = 0;

  sessions.forEach(s => {
    if (s.mood) moodCounts[s.mood]++;
    if (s.completed) completed++;
  });

  return {
    total: sessions.length,
    completed,
    moodCounts,
  };
}
