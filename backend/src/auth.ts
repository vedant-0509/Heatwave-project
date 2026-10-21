import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { HttpError } from './errors.js';
import { env } from './config.js';
import { User } from './models/User.js';

type Role = 'admin' | 'analyst';
export interface AuthenticatedRequest extends Request { user?: { id: string; email: string; role: Role }; }

function base64Url(value: string | Buffer): string {
  return Buffer.from(value).toString('base64url');
}

function passwordHash(password: string, salt = crypto.randomBytes(16).toString('hex')): string {
  const derived = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, expected] = stored.split(':');
  if (!salt || !expected) return false;
  const actual = passwordHash(password, salt).split(':')[1];
  return Boolean(actual && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected)));
}

function tokenFor(user: { id: string; email: string; role: Role }): string {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64Url(JSON.stringify({ sub: user.id, email: user.email, role: user.role, exp: Math.floor(Date.now() / 1000) + 86400 }));
  const signature = base64Url(crypto.createHmac('sha256', env.JWT_SECRET).update(`${header}.${payload}`).digest());
  return `${header}.${payload}.${signature}`;
}

function parseToken(token: string): { id: string; email: string; role: Role } {
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) throw new HttpError(401, 'Invalid authentication token.');
  const expected = base64Url(crypto.createHmac('sha256', env.JWT_SECRET).update(`${header}.${payload}`).digest());
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new HttpError(401, 'Invalid authentication token.');
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { sub?: string; email?: string; role?: Role; exp?: number };
  if (!data.sub || !data.email || !data.role || !data.exp || data.exp < Date.now() / 1000) throw new HttpError(401, 'Authentication token is expired or malformed.');
  return { id: data.sub, email: data.email, role: data.role };
}

export async function register(email: string, password: string) {
  if (env.USE_MONGODB !== 'true') throw new HttpError(503, 'Authentication requires USE_MONGODB=true.');
  const normalized = email.trim().toLowerCase();
  if (password.length < 8) throw new HttpError(422, 'Password must contain at least 8 characters.');
  if (await User.exists({ email: normalized })) throw new HttpError(409, 'An account with this email already exists.');
  const role = (await User.countDocuments()) === 0 ? 'admin' : 'analyst';
  const user = await User.create({ email: normalized, passwordHash: passwordHash(password), role });
  return { token: tokenFor({ id: String(user._id), email: user.email, role }), user: { id: String(user._id), email: user.email, role } };
}

export async function login(email: string, password: string) {
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user || !verifyPassword(password, user.passwordHash)) throw new HttpError(401, 'Invalid email or password.');
  return { token: tokenFor({ id: String(user._id), email: user.email, role: user.role }), user: { id: String(user._id), email: user.email, role: user.role } };
}

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  try {
    const header = req.header('authorization');
    if (!header?.startsWith('Bearer ')) throw new HttpError(401, 'Authentication is required.');
    req.user = parseToken(header.slice(7));
    next();
  } catch (error) { next(error); }
}

export function requireRole(role: Role) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (req.user?.role !== role) return next(new HttpError(403, 'This action requires administrator access.'));
    next();
  };
}
