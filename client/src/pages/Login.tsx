import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { School, LogIn, UserPlus, Loader2 } from 'lucide-react';

type Mode = 'login' | 'signup';

export default function Login() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'signup') {
      fetch('/api/auth/schools')
        .then(r => r.json())
        .then(data => {
          setSchools(data || []);
          if (data?.length === 1) setSchoolId(data[0].id);
        })
        .catch(() => {});
    }
  }, [mode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) { setError('الاسم مطلوب'); setSubmitting(false); return; }
        if (!schoolId) { setError('يرجى اختيار المدرسة'); setSubmitting(false); return; }
        await signup(email, password, name, schoolId);
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-600 text-white mb-4 shadow-lg">
            <School size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">نظام إدارة المدرسة</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">مدرسة التميز النموذجية</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center">
              {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="د. سامي العلي"
                      required
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school">المدرسة</Label>
                    <select
                      id="school"
                      value={schoolId}
                      onChange={e => setSchoolId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      required
                    >
                      <option value="">اختر المدرسة</option>
                      {schools.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@school.edu"
                  required
                  dir="ltr"
                  className="text-left"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  dir="ltr"
                  className="text-left"
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : mode === 'login' ? (
                  <LogIn className="ml-2 h-4 w-4" />
                ) : (
                  <UserPlus className="ml-2 h-4 w-4" />
                )}
                {submitting ? 'جاري...' : mode === 'login' ? 'دخول' : 'إنشاء حساب'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                className="text-sm text-sky-600 hover:text-sky-700 dark:text-sky-400"
              >
                {mode === 'login' ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب؟ سجل دخولك'}
              </button>
            </div>

            {mode === 'login' && (
              <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center text-xs text-gray-500 dark:text-gray-400">
                <p className="font-medium mb-1">بيانات الدخول التجريبية:</p>
                <p dir="ltr">admin@school.edu / SchoolAdmin2025!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
