import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Search, MessageSquare, User, Bot, RefreshCw, Star } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePaginatedConversations } from '@/hooks/usePaginatedQuery';
import PaginationControls from '@/components/admin/PaginationControls';
import ExportDropdown from '@/components/admin/ExportDropdown';
import { useDataExport } from '@/hooks/useDataExport';

const Conversations = () => {
  const { exportConversations, isExporting } = useDataExport();
  const [search, setSearch] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  const {
    data: conversations,
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
  } = usePaginatedConversations({ pageSize: 25 });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['admin-messages', selectedConversation?.id],
    queryFn: async () => {
      if (!selectedConversation?.id) return [];
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', selectedConversation.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedConversation?.id,
  });

  const filteredConversations = conversations?.filter((conv) => {
    const leadName = conv.leads?.full_name?.toLowerCase() || '';
    const sessionId = conv.session_id.toLowerCase();
    return leadName.includes(search.toLowerCase()) || sessionId.includes(search.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-500/20 text-green-400'
      : 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Chat Conversations</h1>
        <div className="flex gap-2">
          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <ExportDropdown
            onExportCSV={() => exportConversations('csv')}
            onExportJSON={() => exportConversations('json')}
            isExporting={isExporting}
            label="Export"
          />
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">
            All Conversations ({totalCount.toLocaleString()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredConversations?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No conversations yet</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead>Session ID</TableHead>
                      <TableHead>Lead</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConversations?.map((conv) => (
                      <TableRow key={conv.id} className="border-border/50">
                        <TableCell className="font-mono text-sm">
                          {conv.session_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {conv.leads ? (
                            <div>
                              <p className="font-medium">{conv.leads.full_name}</p>
                              <p className="text-xs text-muted-foreground">{conv.leads.email}</p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Anonymous</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(conv.status)}>
                            {conv.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {conv.customer_satisfaction ? (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{conv.customer_satisfaction}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {conv.source_page || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(conv.started_at), 'MMM d, h:mm a')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedConversation(conv)}
                          >
                            View Messages
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

      {/* Conversation Detail Sheet */}
      <Sheet open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          {selectedConversation && (
            <>
              <SheetHeader>
                <SheetTitle>Conversation History</SheetTitle>
                <SheetDescription>
                  Session: {selectedConversation.session_id.slice(0, 16)}...
                  {selectedConversation.leads && (
                    <span className="block mt-1">
                      Lead: {selectedConversation.leads.full_name}
                    </span>
                  )}
                  {selectedConversation.customer_satisfaction && (
                    <span className="flex items-center gap-1 mt-1">
                      Customer Rating: 
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {selectedConversation.customer_satisfaction}/5
                    </span>
                  )}
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="mt-6 h-[calc(100vh-200px)]">
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : messages?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No messages in this conversation
                  </p>
                ) : (
                  <div className="space-y-4 pr-4">
                    {messages?.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`p-2 rounded-full ${
                          msg.role === 'user' 
                            ? 'bg-primary/20' 
                            : 'bg-muted'
                        }`}>
                          {msg.role === 'user' ? (
                            <User className="h-4 w-4 text-primary" />
                          ) : (
                            <Bot className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className={`flex-1 max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                          <div className={`inline-block p-3 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(msg.created_at), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Conversations;
