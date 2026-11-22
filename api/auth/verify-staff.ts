import crypto from 'crypto';

interface StaffLoginRequest {
  passcode?: string;
  email?: string;
  password?: string;
}

interface StaffLoginResponse {
  success: boolean;
  token?: string;
  role?: string;
  expiresAt?: number;
  error?: string;
}

const JWT_SECRET = process.env.STAFF_JWT_SECRET || 'kenzae-boutique-secret-key-mulanthuruthy-2026';
const VALID_PASSCODE = process.env.STAFF_PASSCODE || 'kenzae2026';

function signToken(payload: Record<string, unknown>, secret: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifySignedToken(token: string, secret: string): { valid: boolean; payload?: Record<string, unknown> } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false };
    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSig) return { valid: false };

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return { valid: false };
    }
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

export async function authenticateStaff(
  body: StaffLoginRequest,
  customSecret?: string,
  customPasscode?: string
): Promise<{ status: number; body: StaffLoginResponse }> {
  const passcode = (body?.passcode || '').trim();

  if (!passcode) {
    return {
      status: 400,
      body: { success: false, error: 'Please enter the boutique staff passcode.' },
    };
  }

  const validPasscode = customPasscode || process.env.STAFF_PASSCODE || 'kenzae2026';
  const secret = customSecret || process.env.STAFF_JWT_SECRET || 'kenzae-boutique-secret-key-mulanthuruthy-2026';

  // Timing-safe comparison to prevent side-channel timing attacks
  const inputBuffer = Buffer.from(passcode);
  const targetBuffer = Buffer.from(validPasscode);

  const isValid =
    inputBuffer.length === targetBuffer.length &&
    crypto.timingSafeEqual(inputBuffer, targetBuffer);

  if (!isValid) {
    return {
      status: 401,
      body: {
        success: false,
        error: 'Incorrect staff passcode. Please verify with boutique management.',
      },
    };
  }

  // 12-hour session expiry
  const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
  const token = signToken(
    {
      role: 'boutique_staff',
      issuedAt: Date.now(),
      expiresAt,
    },
    secret
  );

  return {
    status: 200,
    body: {
      success: true,
      token,
      role: 'boutique_staff',
      expiresAt,
    },
  };
}

export default async function handler(
  req: { method?: string; body?: StaffLoginRequest },
  res: { status: (code: number) => { json: (data: unknown) => void } }
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED', message: 'Use POST /api/auth/verify-staff' });
    return;
  }

  try {
    const result = await authenticateStaff(req.body || {});
    res.status(result.status).json(result.body);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'AUTH_SERVER_ERROR',
      message: err instanceof Error ? err.message : 'Internal server error during staff authentication',
    });
  }
}
