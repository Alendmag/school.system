import { createClient } from '@supabase/supabase-js';
import type { Request, Response, NextFunction } from 'express';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  try {
    const envPath = resolve(import.meta.dirname, '..', '.env');
    const content = readFileSync(envPath, 'utf-8');
    const vars: Record<string, string> = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) vars[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
    }
    return vars;
  } catch { return {}; }
}

const env = loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '';
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '';

const adminKey = SERVICE_ROLE_KEY || ANON_KEY;

export const supabaseAdmin = createClient(SUPABASE_URL, adminKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const supabaseAuth = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      schoolId?: string;
      userRole?: string;
      userName?: string;
      accessToken?: string;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'غير مصرح - يرجى تسجيل الدخول' });
  }

  const token = authHeader.slice(7);

  const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ message: 'جلسة غير صالحة أو منتهية الصلاحية' });
  }

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('school_id, role, name')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!profile) {
    return res.status(403).json({ message: 'لا يوجد ملف تعريف مرتبط بهذا الحساب' });
  }

  req.userId = user.id;
  req.schoolId = profile.school_id;
  req.userRole = profile.role;
  req.userName = profile.name;
  req.accessToken = token;
  next();
}

export function requireAuth(req: Request, res: Response): string | null {
  if (!req.schoolId) {
    res.status(401).json({ message: 'غير مصرح' });
    return null;
  }
  return req.schoolId;
}

export function getJwt(req: Request): string | undefined {
  return req.accessToken;
}
