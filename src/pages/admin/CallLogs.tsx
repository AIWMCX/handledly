import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Search, Filter, Phone, FileText, RefreshCw, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePaginatedCallLogs } from '@/hooks/usePaginatedQuery';
import PaginationControls from '@/components/admin/PaginationControls';
import ExportDropdown from '@/components/admin/ExportDropdown';
import { useDataExport } from '@/hooks/useDataExport';

const CallLogs = () => {
  const { exportCallLogs, isExporting } = useDataExport();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const {
    data: leads,
    totalCount,
    page,
    pageSize,
    totalPages,
    isLoading,
    isFetching,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    setPageSize,
    refetch,
  } = usePaginatedCallLogs({ pageSize: 25 });

  const filteredLeads = leads?.filter((lead) => {
    const matchesSearch =
      lead.full_name.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.includes(search);
    const matchesStatus = statusFilter === 'all' || lead.confirmation_call_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-500/20 text-green-400',
      failed: 'bg-red-500/20 text-red-400',
      failed_sms_sent: 'bg-orange-500/20 text-orange-400',
      timeout: 'bg-yellow-500/20 text-yellow-400',
      calling: 'bg-blue-500/20 text-blue-400',
      'no-answer': 'bg-yellow-500/20 text-yellow-400',
      'in-progress': 'bg-blue-500/20 text-blue-400',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Call Logs</h1>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="failed_sms_sent">SMS Fallback</SelectItem>
              <SelectItem value="timeout">Timeout</SelectItem>
              <SelectItem value="calling">In Progress</SelectItem>
            </SelectContent>
          </Select>
          <ExportDropdown
            onExportCSV={() => exportCallLogs('csv', { status: statusFilter })}
            onExportJSON={() => exportCallLogs('json', { status: statusFilter })}
            onExportTXT={() => exportCallLogs('txt', { status: statusFilter })}
            isExporting={isExporting}
            label="Export"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">
            Call History ({totalCount.toLocaleString()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredLeads?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No call logs found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead>Lead</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Retries</TableHead>
                      <TableHead>Call Time</TableHead>
                      <TableHead>Has Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads?.map((lead) => (
                      <TableRow key={lead.id} className="border-border/50">
                        <TableCell>
                          <div>
                            <p className="font-medium">{lead.full_name}</p>
                            <p className="text-xs text-muted-foreground">{lead.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{lead.phone}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(lead.confirmation_call_status || '')}>
                            {lead.confirmation_call_status || 'unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {lead.call_retry_count > 0 ? (
                            <div className="flex items-center gap-1">
                              <RotateCcw className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{lead.call_retry_count}/3</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {lead.confirmation_call_time
                            ? format(new Date(lead.confirmation_call_time), 'MMM d, h:mm a')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {lead.call_notes || lead.call_transcript ? (
                            <Badge variant="secondary">
                              <FileText className="h-3 w-3 mr-1" />
                              Yes
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLead(lead)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <PaginationControls
                page={page}
                pageSize={pageSize}
                totalCount={totalCount}
                totalPages={totalPages}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                isFetching={isFetching}
                onPageChange={goToPage}
                onPageSizeChange={setPageSize}
                onNextPage={nextPage}
                onPreviousPage={previousPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Call Detail Sheet */}
      <Sheet open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          {selectedLead && (
            <>
              <SheetHeader>
                <SheetTitle>Call Details</SheetTitle>
                <SheetDescription>
                  {selectedLead.full_name} - {selectedLead.phone}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Call Info */}
                <div className="p-4 rounded-lg bg-background/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={getStatusColor(selectedLead.confirmation_call_status || '')}>
                      {selectedLead.confirmation_call_status || 'unknown'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Retry Attempts</span>
                    <span className="text-sm">{selectedLead.call_retry_count || 0}/3</span>
                  </div>
                  {selectedLead.next_retry_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Next Retry</span>
                      <span className="text-sm">
                        {format(new Date(selectedLead.next_retry_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Call Time</span>
                    <span className="text-sm">
                      {selectedLead.confirmation_call_time
                        ? format(new Date(selectedLead.confirmation_call_time), 'MMMM d, yyyy h:mm a')
                        : 'Not recorded'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Email Sent</span>
                    <Badge variant={selectedLead.email_sent ? 'default' : 'secondary'}>
                      {selectedLead.email_sent ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>

                {/* Call Notes */}
                {selectedLead.call_notes && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-foreground">Call Notes</h3>
                    <div className="p-4 rounded-lg bg-background/50">
                      <p className="text-sm whitespace-pre-wrap">{selectedLead.call_notes}</p>
                    </div>
                  </div>
                )}

                {/* Call Transcript */}
                {selectedLead.call_transcript && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-foreground">Call Transcript</h3>
                    <ScrollArea className="h-64">
                      <div className="p-4 rounded-lg bg-background/50">
                        <p className="text-sm whitespace-pre-wrap font-mono">
                          {selectedLead.call_transcript}
                        </p>
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* No Data Message */}
                {!selectedLead.call_notes && !selectedLead.call_transcript && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notes or transcript available for this call</p>
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

export default CallLogs;
