const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

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
  } = {}
): Promise<SupabaseResponse<T>> {
  const { method = 'GET', filters = '', body, select, order, limit, prefer, onConflict } = options;

  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  const params: string[] = [];

  if (filters) params.push(filters);
  if (select) params.push(`select=${encodeURIComponent(select)}`);
  if (order) params.push(`order=${encodeURIComponent(order)}`);
  if (limit) params.push(`limit=${limit}`);
  if (onConflict) params.push(`on_conflict=${encodeURIComponent(onConflict)}`);

  if (params.length > 0) {
    url += '?' + params.join('&');
  }

  const headers: Record<string, string> = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (prefer) {
    headers['Prefer'] = prefer;
  } else if (method === 'POST') {
    headers['Prefer'] = 'return=representation';
  } else if (method === 'PATCH') {
    headers['Prefer'] = 'return=representation';
  } else if (method === 'DELETE') {
    headers['Prefer'] = 'return=representation';
  } else if (method === 'GET') {
    headers['Prefer'] = 'count=exact';
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const contentRange = res.headers.get('content-range');
    let count: number | undefined;
    if (contentRange) {
      const match = contentRange.match(/\/(\d+|\*)/);
      if (match && match[1] !== '*') count = parseInt(match[1]);
    }

    if (!res.ok) {
      const errBody = await res.text();
      return { data: null, error: errBody };
    }

    const text = await res.text();
    if (!text) return { data: null, error: null, count };

    const data = JSON.parse(text);
    return { data, error: null, count };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export function schoolFilter(schoolId: string, extra?: string): string {
  let f = `school_id=eq.${schoolId}`;
  if (extra) f += '&' + extra;
  return f;
}

export { SUPABASE_URL, SUPABASE_KEY };
