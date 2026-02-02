import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Shield, ShieldOff, UserPlus, Search, Loader2, Users, ShieldCheck, Clock, UserCheck, UserX } from 'lucide-react';
import { format } from 'date-fns';

// Authorized admin emails whitelist - must match AuthContext.tsx
const AUTHORIZED_ADMIN_EMAILS = [
  'shcherbakou.edu@gmail.com',
  'saych.88@gmail.com',
  'nevulis22@gmail.com',
  'beltovbogdan@gmail.com',
] as const;

interface AdminUser {
  role_id: string;
  user_id: string;
  email: string;
  role: string;
  role_created_at: string;
}

const UserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch all admin users with emails using the new security definer function
  const { data: adminUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users-with-email'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_users_with_email');
      if (error) throw error;
      return data as AdminUser[];
    },
  });

  // Add admin role mutation
  const addAdminMutation = useMutation({
    mutationFn: async (email: string) => {
      // Look up the user ID by email using our security definer function
      const { data: userId, error: lookupError } = await supabase
        .rpc('get_user_id_by_email', { email_input: email });
      
      if (lookupError || !userId) {
        throw new Error('User not found. They must sign up first before being granted admin access.');
      }

      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: 'admin' as const }]);

      if (error) {
        if (error.code === '23505') {
          throw new Error('This user already has admin access.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-with-email'] });
      setNewAdminEmail('');
      setIsAddDialogOpen(false);
      toast({
        title: 'Admin Added',
        description: 'User has been granted admin access.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Remove admin role mutation
  const removeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-with-email'] });
      toast({
        title: 'Admin Removed',
        description: 'Admin access has been revoked.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to remove admin access.',
        variant: 'destructive',
      });
    },
  });

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an email address.',
        variant: 'destructive',
      });
      return;
    }
    addAdminMutation.mutate(newAdminEmail.trim().toLowerCase());
  };

  // Filter users by email
  const filteredUsers = adminUsers?.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Get emails that are whitelisted but don't have accounts/roles yet
  const activeAdminEmails = adminUsers?.map(u => u.email.toLowerCase()) || [];
  const pendingWhitelistEmails = AUTHORIZED_ADMIN_EMAILS.filter(
    email => !activeAdminEmails.includes(email.toLowerCase())
  );

  const stats = {
    totalAdmins: adminUsers?.length || 0,
    pendingSignups: pendingWhitelistEmails.length,
    recentlyAdded: adminUsers?.filter(u => {
      const addedDate = new Date(u.role_created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return addedDate > weekAgo;
    }).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">Manage admin access and user roles</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Admins</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAdmins}</div>
            <p className="text-xs text-muted-foreground">With database role</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Signup</CardTitle>
            <UserX className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pendingSignups}</div>
            <p className="text-xs text-muted-foreground">Whitelisted, no account</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recently Added</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentlyAdded}</div>
            <p className="text-xs text-muted-foreground">Added in last 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Secure</div>
            <p className="text-xs text-muted-foreground">Dual-layer auth</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Signups Alert */}
      {pendingWhitelistEmails.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <UserX className="h-4 w-4" />
              Pending Admin Signups
            </CardTitle>
            <CardDescription className="text-amber-600 dark:text-amber-500">
              These emails are whitelisted but haven't created accounts yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {pendingWhitelistEmails.map(email => (
                <Badge key={email} variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700">
                  {email}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>Users with administrative privileges</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Admin</DialogTitle>
                  <DialogDescription>
                    Grant admin access to an existing user. They must have signed up first.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="Enter user email address"
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddAdmin}
                    disabled={addAdminMutation.isPending}
                  >
                    {addAdminMutation.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Grant Access
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Table */}
          {isLoadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg">No admins found</h3>
              <p className="text-muted-foreground text-sm">
                {searchTerm ? 'Try a different search term' : 'Add your first admin user to get started'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Whitelisted</TableHead>
                    <TableHead>Added On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const isWhitelisted = AUTHORIZED_ADMIN_EMAILS.includes(user.email.toLowerCase() as typeof AUTHORIZED_ADMIN_EMAILS[number]);
                    return (
                      <TableRow key={user.role_id}>
                        <TableCell className="font-medium">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20">
                            <Shield className="h-3 w-3 mr-1" />
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isWhitelisted ? (
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700">
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700">
                              <ShieldOff className="h-3 w-3 mr-1" />
                              No
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(user.role_created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <ShieldOff className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Admin Access?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will revoke admin privileges for <strong>{user.email}</strong>. They will no longer
                                  be able to access the admin panel.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => removeAdminMutation.mutate(user.user_id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove Access
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;