import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ShieldX, Home, LogOut } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type RequiredRole = 'admin' | 'mover' | 'customer' | 'any';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean; // legacy
  requireRole?: RequiredRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = true, requireRole }) => {
  const { user, isAdmin, isMover, isCustomer, isLoading, signOut } = useAuth();
  const navigate = useNavigate();

  // Resolve effective required role (requireRole wins; fall back to legacy requireAdmin)
  const role: RequiredRole = requireRole ?? (requireAdmin ? 'admin' : 'any');

  useEffect(() => {
    if (!isLoading && !user) {
      const here = window.location.pathname + window.location.search;
      navigate(`/auth?redirect=${encodeURIComponent(here)}`);
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Non-admin role checks: render a friendly access denied for the right audience.
  if (role === 'mover' && !isMover && !isAdmin) {
    return <AccessDenied message="This area is for moving companies." onSignOut={signOut} />;
  }
  if (role === 'customer' && !isCustomer && !isAdmin) {
    return <AccessDenied message="This area is for customers." onSignOut={signOut} />;
  }
  if (role === 'any') {
    return <>{children}</>;
  }

  // Admin-only path below.
  if (role !== 'admin') {
    return <>{children}</>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldX className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Admin Access Required
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Your account ({user.email}) doesn\u2019t have admin privileges.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => navigate('/')}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
            <Button
              onClick={async () => {
                await signOut();
                navigate('/auth');
              }}
              variant="outline"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out & Use Different Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

function AccessDenied({ message, onSignOut }: { message: string; onSignOut: () => Promise<void> }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle>Access restricted</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={() => navigate('/')} className="w-full">
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
          <Button
            onClick={async () => { await onSignOut(); navigate('/auth'); }}
            variant="outline"
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedRoute;
