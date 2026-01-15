import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Search, Filter, Eye, Phone, Mail, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// CSV Export utility
const exportToCSV = (data: any[], filename: string) => {
  if (!data.length) return;
  
  const headers = ['Name', 'Email', 'Phone', 'Move Date', 'Quote', 'Status', 'Lead Source', 'Created At'];
  const rows = data.map(lead => [
    lead.full_name,
    lead.email,
    lead.phone,
    lead.move_date || '',
    lead.estimated_quote || '',
    lead.status,
    lead.lead_source || 'website',
    format(new Date(lead.created_at), 'yyyy-MM-dd HH:mm'),
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  toast.success('CSV exported successfully');
};

const Leads = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ['admin-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
      toast.success('Lead status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const filteredLeads = leads?.filter((lead) => {
    const matchesSearch =
      lead.full_name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.includes(search);
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-500/20 text-blue-400',
      contacted: 'bg-yellow-500/20 text-yellow-400',
      booked: 'bg-green-500/20 text-green-400',
      completed: 'bg-primary/20 text-primary',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Leads Management</h1>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => exportToCSV(filteredLeads || [], 'leads')}
            disabled={!filteredLeads?.length}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">All Leads ({filteredLeads?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Move Date</TableHead>
                    <TableHead>Quote</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No leads found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads?.map((lead) => (
                      <TableRow key={lead.id} className="border-border/50">
                        <TableCell className="font-medium">{lead.full_name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm">{lead.email}</span>
                            <span className="text-xs text-muted-foreground">{lead.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.move_date ? format(new Date(lead.move_date), 'MMM d, yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          {lead.estimated_quote ? `$${lead.estimated_quote.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={lead.status}
                            onValueChange={(value) => updateStatusMutation.mutate({ id: lead.id, status: value })}
                          >
                            <SelectTrigger className="w-28 h-8">
                              <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="booked">Booked</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(lead.created_at), 'MMM d, h:mm a')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedLead(lead)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Detail Sheet */}
      <Sheet open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedLead && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedLead.full_name}</SheetTitle>
                <SheetDescription>Lead details and history</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Contact Info */}
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLead.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLead.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Move Details */}
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Move Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">From</p>
                      <p>{selectedLead.move_from_address || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">To</p>
                      <p>{selectedLead.move_to_address || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Move Date</p>
                      <p>{selectedLead.move_date ? format(new Date(selectedLead.move_date), 'MMMM d, yyyy') : 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Property Type</p>
                      <p>{selectedLead.property_type || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bedrooms</p>
                      <p>{selectedLead.bedrooms || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quote</p>
                      <p className="font-semibold text-primary">
                        {selectedLead.estimated_quote ? `$${selectedLead.estimated_quote.toLocaleString()}` : 'Not calculated'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Specialty Items */}
                {selectedLead.specialty_items && selectedLead.specialty_items.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-foreground">Specialty Items</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.specialty_items.map((item: string, i: number) => (
                        <Badge key={i} variant="secondary">{item}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Call History */}
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Call History</h3>
                  <div className="p-4 rounded-lg bg-background/50 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge className={
                        selectedLead.confirmation_call_status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : selectedLead.confirmation_call_status === 'failed'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }>
                        {selectedLead.confirmation_call_status || 'pending'}
                      </Badge>
                    </div>
                    {selectedLead.confirmation_call_time && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Call</span>
                        <span>{format(new Date(selectedLead.confirmation_call_time), 'MMM d, h:mm a')}</span>
                      </div>
                    )}
                    {selectedLead.call_notes && (
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-muted-foreground mb-1">Notes</p>
                        <p>{selectedLead.call_notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Call Transcript */}
                {selectedLead.call_transcript && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-foreground">Call Transcript</h3>
                    <div className="p-4 rounded-lg bg-background/50 text-sm max-h-48 overflow-y-auto">
                      <p className="whitespace-pre-wrap">{selectedLead.call_transcript}</p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedLead.notes && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-foreground">Additional Notes</h3>
                    <p className="text-sm text-muted-foreground">{selectedLead.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Leads;
