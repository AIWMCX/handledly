import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, LogOut, MapPin, Calendar, CheckCircle2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface Quote {
  id: string;
  quote_number: string | null;
  total_price: number;
  base_price: number;
  estimated_hours: number | null;
  crew_size: number | null;
  notes: string | null;
  status: string;
  created_at: string;
  moving_company_id: string;
  moving_companies?: {
    company_name: string;
    average_rating: number | null;
    total_reviews: number | null;
  } | null;
}

interface MoveRequest {
  id: string;
  status: string;
  move_type: string;
  move_size: string;
  origin_zip: string | null;
  dest_zip: string | null;
  origin_city: string | null;
  dest_city: string | null;
  preferred_move_date: string | null;
  created_at: string;
  quotes: Quote[];
}

const STATUS_LABEL: Record<string, { label: string; tone: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Awaiting quotes', tone: 'secondary' },
  quoted: { label: 'Quotes received', tone: 'default' },
  booked: { label: 'Booked', tone: 'default' },
  cancelled: { label: 'Cancelled', tone: 'destructive' },
  expired: { label: 'Expired', tone: 'outline' },
};

const MyMoves = () => {
  const { user, signOut } = useAuth();
  const [requests, setRequests] = useState<MoveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    if (!user) return;
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!customer) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('move_requests')
      .select(`
        id, status, move_type, move_size, origin_zip, dest_zip,
        origin_city, dest_city, preferred_move_date, created_at,
        quotes (
          id, quote_number, total_price, base_price, estimated_hours,
          crew_size, notes, status, created_at, moving_company_id,
          moving_companies ( company_name, average_rating, total_reviews )
        )
      `)
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[MyMoves] load failed', error);
    } else {
      setRequests((data ?? []) as unknown as MoveRequest[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
    if (!user) return;

    // Realtime: refresh whenever a quote on any of my requests changes
    const channel = supabase
      .channel('my-moves-quotes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, () => loadRequests())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'move_requests' }, () => loadRequests())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const acceptQuote = async (quoteId: string, moverName?: string) => {
    const { error } = await supabase
      .from('quotes')
      .update({ status: 'accepted' })
      .eq('id', quoteId);
    if (error) {
      toast.error('Could not accept this quote. Please try again.');
      console.error(error);
      return;
    }
    toast.success(`Booked! ${moverName ?? 'Your mover'} will reach out to confirm details.`);
    loadRequests();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg">Handledly</Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Moves</h1>
            <p className="text-muted-foreground">Live quotes from verified movers in your area.</p>
          </div>
          <Button asChild>
            <Link to="/quote">
              <Plus className="h-4 w-4 mr-2" />
              Start a new move
            </Link>
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : requests.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader className="text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
                <Package className="h-7 w-7 text-muted-foreground" />
              </div>
              <CardTitle>No moves yet</CardTitle>
              <CardDescription>
                When you submit a move request, your quotes from verified movers will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link to="/quote">Get free quotes</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {requests.map((req) => {
              const status = STATUS_LABEL[req.status] ?? { label: req.status, tone: 'outline' as const };
              return (
                <Card key={req.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {req.move_size.replace(/-/g, ' ')} · {req.move_type.replace(/-/g, ' ')}
                        </CardTitle>
                        <CardDescription className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> {req.origin_zip ?? '—'} → {req.dest_zip ?? '—'}
                          </span>
                          {req.preferred_move_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(req.preferred_move_date).toLocaleDateString()}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <Badge variant={status.tone}>{status.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {req.quotes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Movers are reviewing your request. Quotes typically arrive within a few hours.
                      </p>
                    ) : (
                      <div className="grid gap-3">
                        {req.quotes
                          .sort((a, b) => a.total_price - b.total_price)
                          .map((q) => (
                            <div
                              key={q.id}
                              className="border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 font-medium">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  {q.moving_companies?.company_name ?? 'Verified mover'}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {q.crew_size ? `${q.crew_size} movers` : null}
                                  {q.crew_size && q.estimated_hours ? ' · ' : ''}
                                  {q.estimated_hours ? `~${q.estimated_hours} hrs` : null}
                                  {q.quote_number ? ` · ${q.quote_number}` : ''}
                                </div>
                                {q.notes && (
                                  <p className="text-sm mt-1 text-muted-foreground line-clamp-2">{q.notes}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="text-2xl font-bold">${q.total_price.toLocaleString()}</div>
                                  <div className="text-xs text-muted-foreground">total estimate</div>
                                </div>
                                {q.status === 'accepted' ? (
                                  <Badge className="gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Booked
                                  </Badge>
                                ) : req.status === 'booked' ? (
                                  <Badge variant="outline">Closed</Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => acceptQuote(q.id, q.moving_companies?.company_name)}
                                  >
                                    Accept
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyMoves;