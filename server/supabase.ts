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
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '';

interface SupabaseResponse<T = any> {
  data: T | null;
  error: string | null;
  count?: number;
}

export async function supabaseQuery<T = any>(
  table: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    filters?: string;
    body?: any;
    select?: string;
    order?: string;
    limit?: number;
    headers?: Record<string, string>;
    prefer?: string;
    onConflict?: string;
    jwt?: string;
  } = {}
): Promise<SupabaseResponse<T>> {
  const { method = 'GET', filters = '', body, select, order, limit, prefer, onConflict, jwt } = options;

  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  const params: string[] = [];
  if (filters) params.push(filters);
  if (select) params.push(`select=${encodeURIComponent(select)}`);
  if (order) params.push(`order=${encodeURIComponent(order)}`);
  if (limit) params.push(`limit=${limit}`);
  if (onConflict) params.push(`on_conflict=${encodeURIComponent(onConflict)}`);
  if (params.length > 0) url += '?' + params.join('&');

  const authKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  const bearerToken = jwt || authKey;

  const headers: Record<string, string> = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${bearerToken}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (prefer) {
    headers['Prefer'] = prefer;
  } else if (method === 'GET') {
    headers['Prefer'] = 'count=exact';
  } else {
    headers['Prefer'] = 'return=representation';
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errBody = await res.text();
      return { data: null, error: errBody };
    }

    const text = await res.text();
    if (!text) return { data: null, error: null };
    return { data: JSON.parse(text), error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export function schoolFilter(schoolId: string, extra?: string): string {
  let f = `school_id=eq.${schoolId}`;
  if (extra) f += '&' + extra;
  return f;
}

export { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY };
