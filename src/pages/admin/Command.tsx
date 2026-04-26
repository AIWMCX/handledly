import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Radio, CheckCircle2, AlertTriangle, RefreshCcw, X } from 'lucide-react';
import { toast } from 'sonner';

type RequestRow = {
  id: string;
  status: string;
  move_type: string;
  move_size: string;
  origin_zip: string | null;
  dest_zip: string | null;
  preferred_move_date: string | null;
  created_at: string;
  broadcast_count: number | null;
  last_broadcast_at: string | null;
  confirmation_call_status: string | null;
  customers: { first_name: string | null; last_name: string | null; email: string } | null;
  quotes: Array<{ id: string; total_price: number; status: string; moving_company_id: string }>;
};

type BookingRow = {
  id: string;
  booking_number: string;
  status: string;
  move_date: string;
  total_price: number;
  confirmation_call_status: string | null;
  created_at: string;
  customers: { first_name: string | null; last_name: string | null; email: string } | null;
  moving_companies: { company_name: string } | null;
};

const STATUS_TONES: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  quoted: 'default',
  booked: 'default',
  confirmed: 'default',
  cancelled: 'destructive',
  expired: 'outline',
  resolved: 'outline',
};

const Command = () => {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const [reqRes, bookRes] = await Promise.all([
      supabase
        .from('move_requests')
        .select(`
          id, status, move_type, move_size, origin_zip, dest_zip, preferred_move_date,
          created_at, broadcast_count, last_broadcast_at, confirmation_call_status,
          customers ( first_name, last_name, email ),
          quotes ( id, total_price, status, moving_company_id )
        `)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('bookings')
        .select(`
          id, booking_number, status, move_date, total_price, confirmation_call_status, created_at,
          customers ( first_name, last_name, email ),
          moving_companies ( company_name )
        `)
        .order('created_at', { ascending: false })
        .limit(100),
    ]);

    if (reqRes.data) setRequests(reqRes.data as unknown as RequestRow[]);
    if (bookRes.data) setBookings(bookRes.data as unknown as BookingRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel('admin-command')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'move_requests' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const stuck = useMemo(
    () => requests.filter((r) => r.status === 'pending' && r.quotes.length === 0 && hoursSince(r.created_at) > 4),
    [requests],
  );

  const forceBroadcast = async (id: string) => {
    setBusyId(id);
    try {
      const { data, error } = await supabase.rpc('broadcast_move_request', { _move_request_id: id });
      if (error) throw error;
      toast.success(`Broadcast to ${data ?? 0} additional movers.`);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Broadcast failed.');
    } finally {
      setBusyId(null);
    }
  };

  const resolveRequest = async (id: string) => {
    setBusyId(id);
    try {
      const { error } = await supabase
        .from('move_requests')
        .update({ status: 'cancelled', notes: 'Resolved/closed by admin from Command Center.' })
        .eq('id', id);
      if (error) throw error;
      toast.success('Request resolved.');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Could not resolve.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Radio className="h-7 w-7" /> Command Center</h1>
          <p className="text-muted-foreground">Live marketplace pipeline — requests, quotes, bookings.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCcw className="h-4 w-4 mr-2" /> Refresh</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Pending requests" value={requests.filter((r) => r.status === 'pending').length} />
        <StatCard label="Quoted" value={requests.filter((r) => r.status === 'quoted').length} />
        <StatCard label="Booked" value={requests.filter((r) => r.status === 'booked').length} />
        <StatCard label="Stuck (>4h, no quotes)" value={stuck.length} tone={stuck.length > 0 ? 'destructive' : 'default'} />
      </div>

      {stuck.length > 0 && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" /> Stuck requests need attention
            </CardTitle>
            <CardDescription>No mover quoted within 4 hours. Force re-broadcast or close.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {stuck.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 border rounded-md p-3 flex-wrap">
                <div className="text-sm">
                  <div className="font-medium">{r.customers?.first_name ?? r.customers?.email ?? 'Customer'} · {r.move_size} {r.move_type}</div>
                  <div className="text-muted-foreground">{r.origin_zip} → {r.dest_zip} · {hoursSince(r.created_at)}h ago · {r.broadcast_count ?? 0} movers notified</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => forceBroadcast(r.id)} disabled={busyId === r.id}>
                    {busyId === r.id ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Radio className="h-3.5 w-3.5 mr-1.5" />}
                    Force broadcast
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => resolveRequest(r.id)} disabled={busyId === r.id}>
                    <X className="h-3.5 w-3.5 mr-1.5" /> Close
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Move Requests ({requests.length})</TabsTrigger>
          <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Card>
            <CardContent className="pt-4">
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Size / type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Quotes</TableHead>
                      <TableHead>Movers</TableHead>
                      <TableHead>Call</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="font-medium">{r.customers?.first_name ?? '—'} {r.customers?.last_name ?? ''}</div>
                          <div className="text-xs text-muted-foreground">{r.customers?.email}</div>
                        </TableCell>
                        <TableCell className="text-xs">{r.origin_zip ?? '—'} → {r.dest_zip ?? '—'}</TableCell>
                        <TableCell className="text-xs">{r.move_size} · {r.move_type}</TableCell>
                        <TableCell><Badge variant={STATUS_TONES[r.status] ?? 'outline'}>{r.status}</Badge></TableCell>
                        <TableCell>{r.quotes.length}</TableCell>
                        <TableCell>{r.broadcast_count ?? 0}</TableCell>
                        <TableCell><CallStatusBadge status={r.confirmation_call_status} /></TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="sm" variant="outline" onClick={() => forceBroadcast(r.id)} disabled={busyId === r.id || r.status === 'booked'}>Re-broadcast</Button>
                          {r.status !== 'booked' && r.status !== 'cancelled' && (
                            <Button size="sm" variant="ghost" onClick={() => resolveRequest(r.id)} disabled={busyId === r.id}>Close</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {requests.length === 0 && (
                      <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No move requests yet.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Mover</TableHead>
                    <TableHead>Move date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Call</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs">{b.booking_number}</TableCell>
                      <TableCell>
                        <div className="text-sm">{b.customers?.first_name ?? '—'}</div>
                        <div className="text-xs text-muted-foreground">{b.customers?.email}</div>
                      </TableCell>
                      <TableCell className="text-sm">{b.moving_companies?.company_name ?? '—'}</TableCell>
                      <TableCell className="text-sm">{new Date(b.move_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm font-medium">${Math.round(b.total_price).toLocaleString()}</TableCell>
                      <TableCell><Badge variant={STATUS_TONES[b.status] ?? 'outline'}>{b.status}</Badge></TableCell>
                      <TableCell><CallStatusBadge status={b.confirmation_call_status} /></TableCell>
                    </TableRow>
                  ))}
                  {bookings.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No bookings yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

function StatCard({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'destructive' }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className={`text-3xl font-bold mt-1 ${tone === 'destructive' ? 'text-destructive' : ''}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function CallStatusBadge({ status }: { status: string | null }) {
  if (!status || status === 'pending') return <Badge variant="outline">Pending</Badge>;
  if (status === 'completed' || status === 'qualified') return <Badge className="gap-1"><CheckCircle2 className="h-3 w-3" /> Confirmed</Badge>;
  if (status === 'calling' || status === 'confirmation_in_progress') return <Badge variant="secondary" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Calling</Badge>;
  if (status.includes('fail') || status === 'timeout') return <Badge variant="destructive">Failed</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function hoursSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
}

export default Command;