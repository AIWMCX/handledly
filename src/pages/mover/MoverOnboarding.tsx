import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, ShieldCheck, MapPin, DollarSign, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FormState {
  company_name: string;
  legal_name: string;
  primary_email: string;
  primary_phone: string;
  website: string;
  year_founded: string;
  description: string;
  dot_number: string;
  mc_number: string;
  state_license: string;
  insurance_policy: string;
  insurance_expires_at: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  service_states: string;
  service_zip_codes: string;
  base_rate_local: string;
  base_rate_long_distance: string;
  minimum_charge: string;
}

const EMPTY: FormState = {
  company_name: '', legal_name: '', primary_email: '', primary_phone: '', website: '',
  year_founded: '', description: '', dot_number: '', mc_number: '', state_license: '',
  insurance_policy: '', insurance_expires_at: '', address_street: '', address_city: '',
  address_state: 'CO', address_zip: '', service_states: 'CO', service_zip_codes: '',
  base_rate_local: '', base_rate_long_distance: '', minimum_charge: '',
};

const MoverOnboarding = () => {
  const { user, companyId } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string>('pending_verification');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      if (!companyId) {
        // Pre-fill email/phone from auth
        setForm((f) => ({ ...f, primary_email: user.email ?? '' }));
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('moving_companies')
        .select('*')
        .eq('id', companyId)
        .maybeSingle();
      if (data) {
        setStatus(data.status ?? 'pending_verification');
        setVerified(!!data.insurance_verified);
        setForm({
          company_name: data.company_name ?? '',
          legal_name: data.legal_name ?? '',
          primary_email: data.primary_email ?? user.email ?? '',
          primary_phone: data.primary_phone ?? '',
          website: data.website ?? '',
          year_founded: data.year_founded?.toString() ?? '',
          description: data.description ?? '',
          dot_number: data.dot_number ?? '',
          mc_number: data.mc_number ?? '',
          state_license: data.state_license ?? '',
          insurance_policy: data.insurance_policy ?? '',
          insurance_expires_at: data.insurance_expires_at ?? '',
          address_street: data.address_street ?? '',
          address_city: data.address_city ?? '',
          address_state: data.address_state ?? 'CO',
          address_zip: data.address_zip ?? '',
          service_states: (data.service_states ?? ['CO']).join(', '),
          service_zip_codes: (data.service_zip_codes ?? []).join(', '),
          base_rate_local: data.base_rate_local?.toString() ?? '',
          base_rate_long_distance: data.base_rate_long_distance?.toString() ?? '',
          minimum_charge: data.minimum_charge?.toString() ?? '',
        });
      }
      setLoading(false);
    };
    load();
  }, [user, companyId]);

  const handleChange = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!form.company_name || !form.primary_email || !form.primary_phone || !form.dot_number || !form.insurance_policy) {
      toast.error('Company, contact, DOT, and insurance are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        company_name: form.company_name,
        legal_name: form.legal_name || form.company_name,
        primary_email: form.primary_email,
        primary_phone: form.primary_phone,
        website: form.website || null,
        year_founded: form.year_founded ? parseInt(form.year_founded, 10) : null,
        description: form.description || null,
        dot_number: form.dot_number,
        mc_number: form.mc_number || null,
        state_license: form.state_license || null,
        insurance_policy: form.insurance_policy,
        insurance_expires_at: form.insurance_expires_at || null,
        address_street: form.address_street || null,
        address_city: form.address_city || null,
        address_state: form.address_state || 'CO',
        address_zip: form.address_zip || null,
        service_states: form.service_states.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean),
        service_zip_codes: form.service_zip_codes.split(',').map((s) => s.trim()).filter(Boolean),
        base_rate_local: form.base_rate_local ? parseFloat(form.base_rate_local) : null,
        base_rate_long_distance: form.base_rate_long_distance ? parseFloat(form.base_rate_long_distance) : null,
        minimum_charge: form.minimum_charge ? parseFloat(form.minimum_charge) : null,
        onboarding_completed: true,
        // status stays at pending_verification — admin flips to 'active' after manual review
      };

      let resolvedCompanyId = companyId;
      if (companyId) {
        const { error } = await supabase.from('moving_companies').update(payload).eq('id', companyId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('moving_companies')
          .insert({ ...payload, status: 'pending_verification' })
          .select('id')
          .single();
        if (error) throw error;
        resolvedCompanyId = data.id;
        // Link the user to the new company
        const { error: linkErr } = await supabase
          .from('moving_company_users')
          .insert({ moving_company_id: data.id, user_id: user.id, role: 'owner' });
        if (linkErr) throw linkErr;
      }

      toast.success('Application submitted! Our team will verify your details within 24 hours.');
      // Brief delay so the toast renders, then go to dashboard
      setTimeout(() => navigate('/mover/dashboard'), 800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not save. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/mover/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <div className="font-semibold">Handledly for Movers</div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Company onboarding</h1>
            {status === 'active' ? (
              <Badge className="gap-1"><ShieldCheck className="h-3 w-3" /> Verified</Badge>
            ) : (
              <Badge variant="secondary">Pending verification</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Submit your licensing, insurance, service area, and rates. We verify within 24 hours, then start sending you live leads.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Company</CardTitle>
              <CardDescription>Public-facing details customers will see.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Company name *" id="company_name" value={form.company_name} onChange={handleChange('company_name')} />
              <Field label="Legal name" id="legal_name" value={form.legal_name} onChange={handleChange('legal_name')} />
              <Field label="Primary email *" id="primary_email" type="email" value={form.primary_email} onChange={handleChange('primary_email')} />
              <Field label="Primary phone *" id="primary_phone" type="tel" value={form.primary_phone} onChange={handleChange('primary_phone')} />
              <Field label="Website" id="website" value={form.website} onChange={handleChange('website')} placeholder="https://" />
              <Field label="Year founded" id="year_founded" type="number" value={form.year_founded} onChange={handleChange('year_founded')} />
              <div className="md:col-span-2">
                <Label htmlFor="description">Short description</Label>
                <Textarea id="description" rows={3} value={form.description} onChange={handleChange('description')} placeholder="Family-owned, 10 years moving Front Range..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Licensing &amp; insurance</CardTitle>
              <CardDescription>Required for verification. We confirm DOT/MC numbers via FMCSA before activating you.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="USDOT number *" id="dot_number" value={form.dot_number} onChange={handleChange('dot_number')} />
              <Field label="MC number" id="mc_number" value={form.mc_number} onChange={handleChange('mc_number')} />
              <Field label="State license" id="state_license" value={form.state_license} onChange={handleChange('state_license')} />
              <Field label="Insurance policy # *" id="insurance_policy" value={form.insurance_policy} onChange={handleChange('insurance_policy')} />
              <Field label="Insurance expires" id="insurance_expires_at" type="date" value={form.insurance_expires_at} onChange={handleChange('insurance_expires_at')} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Service area</CardTitle>
              <CardDescription>Statewide for launch — list every state and ZIP you cover.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Street" id="address_street" value={form.address_street} onChange={handleChange('address_street')} />
              <Field label="City" id="address_city" value={form.address_city} onChange={handleChange('address_city')} />
              <Field label="State" id="address_state" value={form.address_state} onChange={handleChange('address_state')} />
              <Field label="ZIP" id="address_zip" value={form.address_zip} onChange={handleChange('address_zip')} />
              <div className="md:col-span-2">
                <Label htmlFor="service_states">Service states (comma-separated)</Label>
                <Input id="service_states" value={form.service_states} onChange={handleChange('service_states')} placeholder="CO, WY, NM" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="service_zip_codes">Service ZIP codes (comma-separated, optional)</Label>
                <Textarea id="service_zip_codes" rows={2} value={form.service_zip_codes} onChange={handleChange('service_zip_codes')} placeholder="80202, 80203, 80204..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Standard rates</CardTitle>
              <CardDescription>Used as your default when quoting. You can override per request.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Field label="Local rate ($/hr)" id="base_rate_local" type="number" value={form.base_rate_local} onChange={handleChange('base_rate_local')} placeholder="159" />
              <Field label="Long-distance ($/mi)" id="base_rate_long_distance" type="number" value={form.base_rate_long_distance} onChange={handleChange('base_rate_long_distance')} placeholder="2.50" />
              <Field label="Minimum charge ($)" id="minimum_charge" type="number" value={form.minimum_charge} onChange={handleChange('minimum_charge')} placeholder="318" />
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/mover/dashboard')}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {companyId ? 'Save changes' : 'Submit for verification'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

function Field({ label, id, value, onChange, type = 'text', placeholder }: {
  label: string; id: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}

export default MoverOnboarding;