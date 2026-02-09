import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  move_from_address?: string | null;
  move_to_address?: string | null;
  move_date?: string | null;
  bedrooms?: number | null;
  property_type?: string | null;
  estimated_quote?: number | null;
  specialty_items?: string[] | null;
}

interface CreateJobDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateJobDialog = ({ lead, open, onOpenChange }: CreateJobDialogProps) => {
  const queryClient = useQueryClient();
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('08:00');
  const [estimatedDuration, setEstimatedDuration] = useState('4');
  const [totalPrice, setTotalPrice] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [status, setStatus] = useState('scheduled');

  // Pre-fill when lead changes
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && lead) {
      setScheduledDate(lead.move_date || '');
      setTotalPrice(lead.estimated_quote?.toString() || '');
      setSpecialInstructions('');
      setStatus('scheduled');
    }
    onOpenChange(isOpen);
  };

  const createJobMutation = useMutation({
    mutationFn: async () => {
      if (!lead) throw new Error('No lead selected');
      if (!scheduledDate) throw new Error('Scheduled date is required');

      const { error } = await supabase.from('jobs').insert({
        lead_id: lead.id,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        estimated_duration: parseFloat(estimatedDuration) || null,
        total_price: totalPrice ? parseFloat(totalPrice) : null,
        move_from_address: lead.move_from_address || null,
        move_to_address: lead.move_to_address || null,
        bedrooms: lead.bedrooms || null,
        property_type: lead.property_type || null,
        special_instructions: specialInstructions || null,
        status,
      });

      if (error) throw error;

      // Update lead status to booked
      await supabase
        .from('leads')
        .update({ status: 'booked' })
        .eq('id', lead.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leads-paginated'] });
      toast.success('Job created successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to create job: ${error.message}`);
    },
  });

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Job from Lead</DialogTitle>
          <DialogDescription>
            Creating job for <strong>{lead.full_name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Pre-filled info */}
          <div className="grid grid-cols-2 gap-3 text-sm p-3 rounded-lg bg-muted/50">
            <div>
              <span className="text-muted-foreground">From:</span>
              <p className="font-medium">{lead.move_from_address || 'Not set'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">To:</span>
              <p className="font-medium">{lead.move_to_address || 'Not set'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Bedrooms:</span>
              <p className="font-medium">{lead.bedrooms || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Quote:</span>
              <p className="font-medium text-primary">
                {lead.estimated_quote ? `$${lead.estimated_quote.toLocaleString()}` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Editable fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled-date">Move Date *</Label>
              <Input
                id="scheduled-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled-time">Time</Label>
              <Input
                id="scheduled-time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Est. Hours</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="24"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total-price">Total Price ($)</Label>
              <Input
                id="total-price"
                type="number"
                min="0"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Job Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Special Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="Notes about heavy items, access, etc."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createJobMutation.mutate()}
              disabled={!scheduledDate || createJobMutation.isPending}
            >
              {createJobMutation.isPending ? 'Creating...' : 'Create Job'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJobDialog;
