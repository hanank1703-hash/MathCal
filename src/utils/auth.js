import { getUser, setUser, clearUser } from './storage';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function decodeJwtPayload(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(json);
}

export function isAuthenticated() {
  return getUser() !== null;
}

export function getCurrentUser() {
  return getUser();
}

export function signInWithGoogle() {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_CLIENT_ID) {
      reject(new Error('Missing VITE_GOOGLE_CLIENT_ID in .env file'));
      return;
    }

    if (!window.google?.accounts?.id) {
      reject(new Error('Google Identity Services not loaded'));
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        try {
          const payload = decodeJwtPayload(response.credential);
          const user = {
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            photoUrl: payload.picture || null,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };
          setUser(user);
          resolve(user);
        } catch (err) {
          reject(err);
        }
      },
      auto_select: false,
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        const buttonDiv = document.createElement('div');
        buttonDiv.id = '__g_signin_popup';
        buttonDiv.style.position = 'fixed';
        buttonDiv.style.top = '50%';
        buttonDiv.style.left = '50%';
        buttonDiv.style.transform = 'translate(-50%, -50%)';
        buttonDiv.style.zIndex = '10000';
        buttonDiv.style.background = '#1a1a36';
        buttonDiv.style.padding = '2rem';
        buttonDiv.style.borderRadius = '20px';
        buttonDiv.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)';
        document.body.appendChild(buttonDiv);

        window.google.accounts.id.renderButton(buttonDiv, {
          theme: 'filled_blue',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: 280,
        });

        const overlay = document.createElement('div');
        overlay.id = '__g_signin_overlay';
        overlay.style.cssText =
          'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;';
        overlay.onclick = () => {
          overlay.remove();
          buttonDiv.remove();
          reject(new Error('Sign-in cancelled'));
        };
        document.body.insertBefore(overlay, buttonDiv);
      }
    });
  });
}

export function signOut() {
  if (window.google?.accounts?.id) {
    window.google.accounts.id.disableAutoSelect();
  }
  clearUser();
}
