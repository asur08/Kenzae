import { verifySignedToken } from './verify-staff';

export default async function handler(
  req: { method?: string; headers?: Record<string, string>; body?: { token?: string } },
  res: { status: (code: number) => { json: (data: unknown) => void } }
): Promise<void> {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const authHeader = req.headers?.['authorization'] || '';
  const headerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const token = headerToken || req.body?.token;

  if (!token) {
    res.status(401).json({ success: false, valid: false, error: 'NO_TOKEN_PROVIDED' });
    return;
  }

  const secret = process.env.STAFF_JWT_SECRET || 'kenzae-boutique-secret-key-mulanthuruthy-2026';
  const verification = verifySignedToken(token, secret);

  if (!verification.valid) {
    res.status(401).json({ success: false, valid: false, error: 'INVALID_OR_EXPIRED_TOKEN' });
    return;
  }

  res.status(200).json({
    success: true,
    valid: true,
    role: verification.payload?.role,
    expiresAt: verification.payload?.expiresAt,
  });
}
