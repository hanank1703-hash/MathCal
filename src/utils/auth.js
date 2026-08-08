import { getUser, setUser, clearUser } from './storage';

export function isAuthenticated() {
  return getUser() !== null;
}

export function getCurrentUser() {
  return getUser();
}

export async function signInWithGoogle() {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const user = {
    id: 'user_' + Date.now().toString(36),
    name: 'You',
    email: '',
    photoUrl: null,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  setUser(user);
  return user;
}

export function signOut() {
  clearUser();
}
