import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Mail, Lock, ArrowLeft, User as UserIcon, Building2, Phone } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const customerSignupSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const moverSignupSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name'),
  companyName: z.string().min(2, 'Please enter your company name'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Please enter a phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const emailSchema = z.object({ email: z.string().email('Please enter a valid email address') });

type Mode = 'login' | 'signup' | 'reset';
type SignupRole = 'customer' | 'mover';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get('mode') as Mode) || 'login';
  const initialRole = (searchParams.get('role') as SignupRole) || 'customer';
  const redirectTo = searchParams.get('redirect') || '';

  const [mode, setMode] = useState<Mode>(initialMode);
  const [signupRole, setSignupRole] = useState<SignupRole>(initialRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signUp, user, isAdmin, isMover, isCustomer, isLoading, needsMoverOnboarding } = useAuth();
  const navigate = useNavigate();

  // Role-based redirect after login
  useEffect(() => {
    if (isLoading || !user) return;
    if (redirectTo) {
      navigate(redirectTo);
      return;
    }
    if (isAdmin) navigate('/admin');
    else if (isMover) navigate(needsMoverOnboarding ? '/mover/onboarding' : '/mover/dashboard');
    else if (isCustomer) navigate('/my-moves');
  }, [user, isAdmin, isMover, isCustomer, isLoading, redirectTo, navigate, needsMoverOnboarding]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setSuccessMessage(null);
  };

  const handlePasswordReset = async () => {
    setError(null);
    setSuccessMessage(null);
    const v = emailSchema.safeParse({ email });
    if (!v.success) return setError(v.error.errors[0].message);
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) setError(error.message);
      else setSuccessMessage('Password reset email sent. Check your inbox.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    const v = loginSchema.safeParse({ email, password });
    if (!v.success) return setError(v.error.errors[0].message);
    setIsSubmitting(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message.includes('Invalid login credentials')
          ? 'Invalid email or password.'
          : error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const schema = signupRole === 'mover' ? moverSignupSchema : customerSignupSchema;
    const payload = signupRole === 'mover'
      ? { fullName, companyName, email, phone, password }
      : { fullName, email, phone, password };
    const v = schema.safeParse(payload);
    if (!v.success) return setError(v.error.errors[0].message);

    setIsSubmitting(true);
    try {
      const { error, needsEmailConfirm } = await signUp(email, password, {
        role: signupRole,
        fullName,
        phone,
        companyName: signupRole === 'mover' ? companyName : undefined,
      });
      if (error) {
        setError(error.message.includes('already registered')
          ? 'This email is already registered. Please sign in instead.'
          : error.message);
      } else if (needsEmailConfirm) {
        // Email confirmation required — user is NOT signed in yet.
        setSuccessMessage(
          signupRole === 'mover'
            ? "Account created. Check your inbox to verify, then sign in to finish company onboarding."
            : 'Account created. Check your inbox to verify, then sign in.'
        );
        setMode('login');
        setPassword('');
      } else {
        // Auto-confirmed: user is signed in. The redirect effect will route based on role.
        setSuccessMessage(
          signupRole === 'mover'
            ? 'Account created — taking you to company onboarding…'
            : 'Account created — welcome aboard!'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset password'}
            </CardTitle>
            <CardDescription>
              {mode === 'login'
                ? 'Sign in to continue to Handledly'
                : mode === 'signup'
                ? 'Choose how you want to use Handledly'
                : 'Enter your email and we\u2019ll send a reset link'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert className="mb-4 border-success/50 bg-success/10">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            {mode === 'signup' && (
              <Tabs value={signupRole} onValueChange={(v) => setSignupRole(v as SignupRole)} className="mb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="customer">I&apos;m moving</TabsTrigger>
                  <TabsTrigger value="mover">I&apos;m a mover</TabsTrigger>
                </TabsList>
                <TabsContent value="customer" className="text-xs text-muted-foreground mt-2">
                  Get free quotes from verified moving companies.
                </TabsContent>
                <TabsContent value="mover" className="text-xs text-muted-foreground mt-2">
                  Join the marketplace. 1.5% commission, free CRM. Payouts launching soon.
                </TabsContent>
              </Tabs>
            )}

            <form onSubmit={mode === 'login' ? handleLogin : mode === 'reset' ? (e) => { e.preventDefault(); handlePasswordReset(); } : handleSignup} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <Field icon={UserIcon} id="full-name" label="Full name" placeholder="Jane Doe" value={fullName} onChange={setFullName} disabled={isSubmitting} />
                  {signupRole === 'mover' && (
                    <Field icon={Building2} id="company-name" label="Company name" placeholder="Acme Moving Co." value={companyName} onChange={setCompanyName} disabled={isSubmitting} />
                  )}
                </>
              )}

              <Field icon={Mail} id="email" type="email" label="Email" placeholder="you@example.com" value={email} onChange={setEmail} disabled={isSubmitting} />

              {mode === 'signup' && (
                <Field icon={Phone} id="phone" type="tel" label={signupRole === 'mover' ? 'Business phone' : 'Phone (optional)'} placeholder="(555) 123-4567" value={phone} onChange={setPhone} disabled={isSubmitting} />
              )}

              {mode !== 'reset' && (
                <Field icon={Lock} id="password" type="password" label="Password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" value={password} onChange={setPassword} disabled={isSubmitting} />
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'login' && (isSubmitting ? 'Signing in...' : 'Sign In')}
                {mode === 'signup' && (isSubmitting ? 'Creating account...' : signupRole === 'mover' ? 'Create mover account' : 'Create customer account')}
                {mode === 'reset' && (isSubmitting ? 'Sending...' : 'Send reset link')}
              </Button>

              <div className="text-center text-sm space-y-2 pt-2">
                {mode === 'login' && (
                  <>
                    <button type="button" onClick={() => switchMode('reset')} className="text-muted-foreground hover:text-primary hover:underline block w-full">
                      Forgot your password?
                    </button>
                    <button type="button" onClick={() => switchMode('signup')} className="text-primary hover:underline">
                      New to Handledly? Create an account
                    </button>
                  </>
                )}
                {mode === 'signup' && (
                  <button type="button" onClick={() => switchMode('login')} className="text-primary hover:underline">
                    Already have an account? Sign in
                  </button>
                )}
                {mode === 'reset' && (
                  <button type="button" onClick={() => switchMode('login')} className="text-primary hover:underline">
                    Back to sign in
                  </button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

interface FieldProps {
  icon: React.ComponentType<{ className?: string }>;
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
}

function Field({ icon: Icon, id, label, placeholder, value, onChange, type = 'text', disabled }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input id={id} type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="pl-10" disabled={disabled} />
      </div>
    </div>
  );
}

export default Auth;