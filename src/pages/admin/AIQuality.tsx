import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Star, 
  MessageSquare, 
  Flag, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  Users,
  Bot,
  User,
  RefreshCw
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import ExportDropdown from '@/components/admin/ExportDropdown';
import { useDataExport } from '@/hooks/useDataExport';

const AIQuality = () => {
  const { exportAIQualityReviews, isExporting } = useDataExport();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [reviewFilter, setReviewFilter] = useState<string>('unreviewed');
  
  // Review form state
  const [qualityScore, setQualityScore] = useState(0);
  const [accuracyScore, setAccuracyScore] = useState(0);
  const [flagged, setFlagged] = useState(false);
  const [improvementCategory, setImprovementCategory] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  // Fetch conversations for review
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['ai-quality-conversations', reviewFilter],
    queryFn: async () => {
      let query = supabase
        .from('chat_conversations')
        .select(`
          *,
          leads (full_name, email),
          ai_quality_reviews (id)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (reviewFilter === 'unreviewed') {
        query = query.eq('quality_reviewed', false);
      } else if (reviewFilter === 'flagged') {
        query = query.eq('quality_reviewed', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch messages for selected conversation
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['ai-quality-messages', selectedConversation?.id],
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

  // Fetch quality metrics
  const { data: metrics } = useQuery({
    queryKey: ['ai-quality-metrics'],
    queryFn: async () => {
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      
      // Get reviews from last 7 days
      const { data: reviews, error: reviewsError } = await supabase
        .from('ai_quality_reviews')
        .select('*')
        .gte('created_at', sevenDaysAgo);
      
      if (reviewsError) throw reviewsError;
      
      // Get conversations with satisfaction ratings
      const { data: satisfied, error: satisfiedError } = await supabase
        .from('chat_conversations')
        .select('customer_satisfaction')
        .not('customer_satisfaction', 'is', null)
        .gte('created_at', sevenDaysAgo);
      
      if (satisfiedError) throw satisfiedError;
      
      // Get total unreviewed
      const { count: unreviewedCount } = await supabase
        .from('chat_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('quality_reviewed', false);
      
      const avgQuality = reviews?.length 
        ? reviews.reduce((sum, r) => sum + (r.quality_score || 0), 0) / reviews.length 
        : 0;
      
      const avgSatisfaction = satisfied?.length
        ? satisfied.reduce((sum, c) => sum + (c.customer_satisfaction || 0), 0) / satisfied.length
        : 0;
      
      const flaggedCount = reviews?.filter(r => r.flagged_for_improvement).length || 0;
      
      return {
        reviewedThisWeek: reviews?.length || 0,
        avgQualityScore: avgQuality.toFixed(1),
        avgSatisfaction: avgSatisfaction.toFixed(1),
        flaggedCount,
        unreviewedCount: unreviewedCount || 0,
      };
    },
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!selectedConversation?.id || !user?.id) throw new Error('Missing data');
      
      // Insert review
      const { error: reviewError } = await supabase
        .from('ai_quality_reviews')
        .insert({
          conversation_id: selectedConversation.id,
          reviewed_by: user.id,
          quality_score: qualityScore,
          accuracy_score: accuracyScore,
          flagged_for_improvement: flagged,
          improvement_category: flagged ? improvementCategory : null,
          review_notes: reviewNotes || null,
        });
      
      if (reviewError) throw reviewError;
      
      // Mark conversation as reviewed
      const { error: updateError } = await supabase
        .from('chat_conversations')
        .update({ quality_reviewed: true })
        .eq('id', selectedConversation.id);
      
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success('Review submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['ai-quality-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['ai-quality-metrics'] });
      setSelectedConversation(null);
      resetForm();
    },
    onError: () => {
      toast.error('Failed to submit review');
    },
  });

  const resetForm = () => {
    setQualityScore(0);
    setAccuracyScore(0);
    setFlagged(false);
    setImprovementCategory('');
    setReviewNotes('');
  };

  const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              "h-5 w-5 transition-colors",
              value >= star
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">AI Quality Monitoring</h1>
        <div className="flex gap-2">
          <Select value={reviewFilter} onValueChange={setReviewFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unreviewed">Unreviewed</SelectItem>
              <SelectItem value="all">All Conversations</SelectItem>
              <SelectItem value="flagged">Reviewed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['ai-quality-conversations'] })}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <ExportDropdown
            onExportCSV={() => exportAIQualityReviews('csv')}
            onExportJSON={() => exportAIQualityReviews('json')}
            isExporting={isExporting}
            label="Export"
          />
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs">Reviewed (7d)</span>
            </div>
            <p className="text-2xl font-bold">{metrics?.reviewedThisWeek || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-card/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Star className="h-4 w-4" />
              <span className="text-xs">Avg Quality</span>
            </div>
            <p className="text-2xl font-bold">{metrics?.avgQualityScore || '0.0'}/5</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-card/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Customer Rating</span>
            </div>
            <p className="text-2xl font-bold">{metrics?.avgSatisfaction || '0.0'}/5</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-card/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Flag className="h-4 w-4" />
              <span className="text-xs">Flagged</span>
            </div>
            <p className="text-2xl font-bold">{metrics?.flaggedCount || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-card/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs">Pending Review</span>
            </div>
            <p className="text-2xl font-bold">{metrics?.unreviewedCount || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversations List */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversations to Review
          </CardTitle>
          <CardDescription>
            Sample conversations for quality assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : conversations?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>All caught up! No conversations pending review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations?.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer"
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {conv.leads?.full_name || 'Anonymous User'}
                      </span>
                      {conv.customer_satisfaction && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {conv.customer_satisfaction}
                        </Badge>
                      )}
                      {conv.quality_reviewed && (
                        <Badge className="bg-green-500/20 text-green-400">
                          Reviewed
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(conv.started_at), 'MMM d, yyyy h:mm a')}
                      {conv.source_page && ` • ${conv.source_page}`}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Review
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Sheet */}
      <Sheet open={!!selectedConversation} onOpenChange={() => {
        setSelectedConversation(null);
        resetForm();
      }}>
        <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
          <SheetHeader>
            <SheetTitle>Review Conversation</SheetTitle>
            <SheetDescription>
              {selectedConversation?.leads?.full_name || 'Anonymous User'}
              {' • '}
              {selectedConversation && format(new Date(selectedConversation.started_at), 'MMM d, h:mm a')}
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 flex flex-col gap-4 mt-4 overflow-hidden">
            {/* Conversation Messages */}
            <div className="flex-1 overflow-hidden">
              <h3 className="font-medium mb-2">Conversation</h3>
              <ScrollArea className="h-[40vh] rounded-lg border border-border/50 bg-background/50 p-4">
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages?.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-2",
                          msg.role === 'user' ? 'flex-row-reverse' : ''
                        )}
                      >
                        <div className={cn(
                          "p-1.5 rounded-full shrink-0",
                          msg.role === 'user' ? 'bg-primary/20' : 'bg-muted'
                        )}>
                          {msg.role === 'user' ? (
                            <User className="h-3 w-3 text-primary" />
                          ) : (
                            <Bot className="h-3 w-3" />
                          )}
                        </div>
                        <div className={cn(
                          "max-w-[80%] p-2 rounded-lg text-sm",
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Review Form */}
            <div className="space-y-4 border-t border-border/50 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Quality Score</label>
                  <StarRating value={qualityScore} onChange={setQualityScore} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Accuracy Score</label>
                  <StarRating value={accuracyScore} onChange={setAccuracyScore} />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="flagged"
                  checked={flagged}
                  onCheckedChange={(checked) => setFlagged(checked as boolean)}
                />
                <label htmlFor="flagged" className="text-sm font-medium cursor-pointer">
                  Flag for improvement
                </label>
              </div>
              
              {flagged && (
                <Select value={improvementCategory} onValueChange={setImprovementCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select improvement category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accuracy">Accuracy Issues</SelectItem>
                    <SelectItem value="tone">Tone/Style</SelectItem>
                    <SelectItem value="completeness">Incomplete Response</SelectItem>
                    <SelectItem value="hallucination">Hallucination</SelectItem>
                    <SelectItem value="off-topic">Off-topic</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              <div>
                <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Any observations or suggestions..."
                  rows={2}
                />
              </div>
              
              <Button
                className="w-full"
                onClick={() => submitReviewMutation.mutate()}
                disabled={qualityScore === 0 || accuracyScore === 0 || submitReviewMutation.isPending}
              >
                {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AIQuality;
