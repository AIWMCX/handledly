import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MapPin, Calendar, Inbox, Send, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BroadcastRow {
  id: string;
  move_request_id: string;
  broadcast_at: string;
  viewed_at: string | null;
  responded_at: string | null;
  move_requests: {
    id: string;
    move_type: string;
    move_size: string;
    origin_zip: string | null;
    dest_zip: string | null;
    origin_city: string | null;
    dest_city: string | null;
    preferred_move_date: string | null;
    notes: string | null;
    status: string;
    created_at: string;
  } | null;
  myQuote?: { id: string; total_price: number; status: string } | null;
}

const MoverInbox = () => {
  const { user, companyId } = useAuth();
  const [rows, setRows] = useState<BroadcastRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'quoted'>('open');

  const load = async () => {
    if (!companyId) return;
    const { data: broadcasts, error } = await supabase
      .from('mover_broadcasts')
      .select(`
        id, move_request_id, broadcast_at, viewed_at, responded_at,
        move_requests (
          id, move_type, move_size, origin_zip, dest_zip,
          origin_city, dest_city, preferred_move_date, notes, status, created_at
        )
      `)
      .eq('moving_company_id', companyId)
      .order('broadcast_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[MoverInbox] load failed', error);
      setLoading(false);
      return;
    }

    // Pull this mover's quotes for these requests
    const reqIds = (broadcasts ?? []).map((b) => b.move_request_id);
    let quotesByReq = new Map<string, { id: string; total_price: number; status: string }>();
    if (reqIds.length) {
      const { data: quotes } = await supabase
        .from('quotes')
        .select('id, total_price, status, move_request_id')
        .eq('moving_company_id', companyId)
        .in('move_request_id', reqIds);
      quotesByReq = new Map((quotes ?? []).map((q) => [q.move_request_id, q]));
    }

    setRows(((broadcasts ?? []) as BroadcastRow[]).map((b) => ({
      ...b,
      myQuote: quotesByReq.get(b.move_request_id) ?? null,
    })));
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (!companyId) return;
    const channel = supabase
      .channel('mover-inbox')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mover_broadcasts', filter: `moving_company_id=eq.${companyId}` }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes', filter: `moving_company_id=eq.${companyId}` }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'move_requests' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const visible = useMemo(() => {
    if (filter === 'all') return rows;
    if (filter === 'quoted') return rows.filter((r) => r.myQuote);
    return rows.filter((r) => !r.myQuote && r.move_requests?.status !== 'booked');
  }, [rows, filter]);

  if (!companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Finish onboarding first</CardTitle>
            <CardDescription>Complete your company profile to start receiving move requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild><Link to="/mover/onboarding">Go to onboarding</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/mover/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <span className="text-sm text-muted-foreground">{user?.email}</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2"><Inbox className="h-7 w-7" /> Inbox</h1>
            <p className="text-muted-foreground">Live move requests broadcast to your service area.</p>
          </div>
          <div className="flex gap-2">
            {(['open', 'quoted', 'all'] as const).map((f) => (
              <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)}>
                {f === 'open' ? 'Open' : f === 'quoted' ? 'My quotes' : 'All'}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading inbox...
          </div>
        ) : visible.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader className="text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
                <Inbox className="h-7 w-7 text-muted-foreground" />
              </div>
              <CardTitle>No requests right now</CardTitle>
              <CardDescription>New requests appear here in real time as customers submit them.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-4">
            {visible.map((row) => (
              <RequestCard key={row.id} row={row} companyId={companyId} onRefresh={load} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

function RequestCard({ row, companyId, onRefresh }: { row: BroadcastRow; companyId: string; onRefresh: () => void }) {
  const r = row.move_requests;
  if (!r) return null;
  const booked = r.status === 'booked';
  const myQuote = row.myQuote;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="text-base">
              {r.move_size.replace(/-/g, ' ')} · {r.move_type.replace(/-/g, ' ')}
            </CardTitle>
            <CardDescription className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {r.origin_zip ?? '—'} → {r.dest_zip ?? '—'}</span>
              {r.preferred_move_date && (
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(r.preferred_move_date).toLocaleDateString()}</span>
              )}
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Sent {timeAgo(row.broadcast_at)}</span>
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            {booked ? (
              <Badge variant="outline">Closed — booked elsewhere</Badge>
            ) : myQuote ? (
              <Badge className="gap-1"><CheckCircle2 className="h-3 w-3" /> You quoted ${Math.round(myQuote.total_price).toLocaleString()}</Badge>
            ) : (
              <Badge variant="secondary">Open</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      {(r.notes || (!booked && !myQuote)) && (
        <CardContent className="flex items-end justify-between gap-4 flex-wrap">
          {r.notes && <p className="text-sm text-muted-foreground line-clamp-2 flex-1 min-w-0">{r.notes}</p>}
          {!booked && !myQuote && (
            <QuoteDialog moveRequestId={r.id} companyId={companyId} onSubmitted={onRefresh} />
          )}
        </CardContent>
      )}
    </Card>
  );
}

function QuoteDialog({ moveRequestId, companyId, onSubmitted }: { moveRequestId: string; companyId: string; onSubmitted: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [base, setBase] = useState('');
  const [hours, setHours] = useState('3');
  const [crew, setCrew] = useState('2');
  const [notes, setNotes] = useState('');

  const total = useMemo(() => {
    const b = parseFloat(base) || 0;
    const h = parseFloat(hours) || 0;
    return b * h;
  }, [base, hours]);

  const submit = async () => {
    if (!base) {
      toast.error('Set your hourly rate to send a quote.');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('quotes').insert({
        move_request_id: moveRequestId,
        moving_company_id: companyId,
        base_price: parseFloat(base),
        total_price: total,
        estimated_hours: parseFloat(hours),
        crew_size: parseInt(crew, 10),
        notes: notes || null,
        status: 'pending',
        quote_type: 'standard',
      });
      if (error) throw error;
      toast.success('Quote sent!');
      setOpen(false);
      onSubmitted();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not send quote.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Send className="h-3.5 w-3.5 mr-1.5" /> Send quote</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send a quote</DialogTitle>
          <DialogDescription>The customer sees your offer next to other movers'. Lowest total price ranks first.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="base">Hourly rate ($)</Label>
              <Input id="base" type="number" value={base} onChange={(e) => setBase(e.target.value)} placeholder="159" />
            </div>
            <div>
              <Label htmlFor="hours">Estimated hours</Label>
              <Input id="hours" type="number" value={hours} onChange={(e) => setHours(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="crew">Crew size</Label>
              <Input id="crew" type="number" value={crew} onChange={(e) => setCrew(e.target.value)} />
            </div>
            <div className="rounded-md border bg-muted/40 p-3">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="text-2xl font-bold">${total.toLocaleString()}</div>
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Note to customer (optional)</Label>
            <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Includes truck, fuel, blankets, and a 5-star crew." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Send quote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default MoverInbox;