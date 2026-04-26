import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, LogOut, ClipboardList, Users, DollarSign, Inbox, Settings } from 'lucide-react';

const MoverDashboard = () => {
  const { user, signOut, companyId } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg">Handledly for Movers</Link>
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
        {!companyId ? (
          <Card className="border-dashed mb-8">
            <CardHeader className="text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
                <Building2 className="h-7 w-7 text-muted-foreground" />
              </div>
              <CardTitle>Finish setting up your company</CardTitle>
              <CardDescription>
                We need a few details \u2014 licensing, insurance, service area, and rates \u2014 before you can receive leads.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild><Link to="/mover/onboarding">Start onboarding</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-muted-foreground">Lead requests, quotes, and your CRM.</p>
              </div>
              <div className="flex gap-2">
                <Button asChild><Link to="/mover/inbox"><Inbox className="h-4 w-4 mr-2" /> Open inbox</Link></Button>
                <Button asChild variant="outline"><Link to="/mover/onboarding"><Settings className="h-4 w-4 mr-2" /> Profile</Link></Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <DashCard icon={ClipboardList} title="Open requests" desc="0 waiting for a quote" />
              <DashCard icon={Users} title="Active customers" desc="0 in your CRM" />
              <DashCard icon={DollarSign} title="This month" desc="$0 booked" />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

function DashCard({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{desc}</CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

export default MoverDashboard;