import { Router } from 'express';
import { supabase } from '../services/supabaseClient';
import { requireAuth } from '../middleware/auth';
import { encryptToken, getGoogleCalendarConnectionStatus } from '../services/googleCalendarService';

const router = Router();
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

function getGoogleRedirectUri() {
  return `${process.env.API_PUBLIC_URL || 'http://localhost:4006'}/api/auth/google/callback`;
}

function getFrontendUrl() {
  return process.env.FRONTEND_URL || 'http://localhost:5173';
}

function parseState(value: unknown) {
  if (typeof value !== 'string') {
    return { next: '/' };
  }

  try {
    const parsed = JSON.parse(value);
    return {
      next: typeof parsed.next === 'string' ? parsed.next : '/',
    };
  } catch {
    return { next: '/' };
  }
}

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });

    // data contains session and user
    return res.json({ session: data.session, user: data.user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      return res.status(401).json({ error: error?.message || 'Invalid refresh token' });
    }

    return res.json({ session: data.session, user: data.user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: error?.message || 'Invalid token' });
    }

    return res.json({ user: data.user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Optional: logout (client can also just drop tokens)
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(400).json({ error: 'No token provided' });

    // Supabase signOut intended for client; here we call via helper endpoint
    // The supabase-js server SDK does not accept an explicit token to sign out,
    // but we can revoke the refresh token via the Admin API if needed.

    // For now, respond OK and let client drop tokens.
    return res.json({ message: 'Logged out on client (drop tokens)' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/google/url', async (req, res) => {
  const next = typeof req.query.next === 'string' ? req.query.next : '/';
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return res.status(500).json({ error: 'GOOGLE_CLIENT_ID nao configurado.' });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile https://www.googleapis.com/auth/calendar.events',
    access_type: 'offline',
    prompt: 'consent',
    state: JSON.stringify({ next }),
  });

  return res.json({ url: `${GOOGLE_AUTH_URL}?${params.toString()}` });
});

router.get('/google/status', requireAuth, async (req, res) => {
  const userId = (req as any).user.id as string;
  const status = await getGoogleCalendarConnectionStatus(userId);
  return res.json(status);
});

router.get('/google/callback', async (req, res) => {
  const code = typeof req.query.code === 'string' ? req.query.code : '';
  const { next } = parseState(req.query.state);
  const frontendUrl = getFrontendUrl();

  if (!code) {
    return res.redirect(`${frontendUrl}/login?error=google_oauth_missing_code`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.redirect(`${frontendUrl}/login?error=google_oauth_missing_config`);
  }

  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGoogleRedirectUri(),
      grant_type: 'authorization_code',
    }),
  });

  const googleTokens = await tokenResponse.json();
  if (!tokenResponse.ok || !googleTokens.id_token || !googleTokens.access_token) {
    return res.redirect(`${frontendUrl}/login?error=google_oauth_token_exchange_failed`);
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: googleTokens.id_token,
  });

  if (error || !data.session || !data.user) {
    return res.redirect(`${frontendUrl}/login?error=google_oauth_failed`);
  }

  const expiresAt = new Date(Date.now() + Number(googleTokens.expires_in || 3600) * 1000).toISOString();

  await supabase.from('google_calendar_connections').upsert(
    {
      user_id: data.user.id,
      google_email: data.user.email,
      calendar_id: 'primary',
      access_token_encrypted: encryptToken(googleTokens.access_token),
      refresh_token_encrypted: googleTokens.refresh_token
        ? encryptToken(googleTokens.refresh_token)
        : undefined,
      expires_at: expiresAt,
      sync_enabled: true,
      sync_direction: 'app_to_google',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  const params = new URLSearchParams({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: String(data.session.expires_in),
    user: JSON.stringify({
      id: data.user.id,
      email: data.user.email,
    }),
    next,
  });

  return res.redirect(`${frontendUrl}/login?${params.toString()}`);
});

export default router;
