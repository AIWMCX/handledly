import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SatisfactionPromptProps {
  conversationId: string;
  onSubmit: () => void;
  onSkip: () => void;
}

export const SatisfactionPrompt = ({ conversationId, onSubmit, onSkip }: SatisfactionPromptProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ customer_satisfaction: rating })
        .eq('id', conversationId);
      
      if (error) throw error;
      
      toast.success('Thank you for your feedback!');
      onSubmit();
    } catch (error) {
      console.error('Failed to submit rating:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-background/80 backdrop-blur-sm border-t border-border">
      <p className="text-sm font-medium text-center mb-3">
        How helpful was this conversation?
      </p>
      <div className="flex justify-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                (hoveredRating || rating) >= star
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              )}
            />
          </button>
        ))}
      </div>
      <div className="flex gap-2 justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          disabled={isSubmitting}
        >
          Skip
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
};

export default SatisfactionPrompt;
