import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Plus, LogOut } from 'lucide-react';

const MyMoves = () => {
  const { user, signOut } = useAuth();

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

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Moves</h1>
            <p className="text-muted-foreground">Track your moves and compare quotes from movers.</p>
          </div>
          <Button asChild>
            <Link to="/">
              <Plus className="h-4 w-4 mr-2" />
              Start a new move
            </Link>
          </Button>
        </div>

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
              <Link to="/">Search movers</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MyMoves;