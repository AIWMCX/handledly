import { DollarSign, Calendar, Clock, Sparkles } from "lucide-react";

// Quick actions with icons defined inline (to avoid circular deps)
const quickActionsData = [
  { icon: DollarSign, label: "Get Free Quote", prompt: "I'd like to get a free quote for my move", priority: true },
  { icon: Calendar, label: "Book Same-Day", prompt: "I need a same-day moving service", priority: true },
  { icon: Clock, label: "Service Hours", prompt: "What are your hours of operation?", priority: false },
  { icon: Sparkles, label: "View Pricing", prompt: "How much do you charge for moving?", priority: false },
];

interface QuickActionsProps {
  onAction: (label: string, prompt: string) => void;
  showSecondary?: boolean;
  showLabel?: boolean;
}

export function QuickActions({ onAction, showSecondary = false, showLabel = false }: QuickActionsProps) {
  const priorityActions = quickActionsData.filter(a => a.priority);
  const secondaryActions = quickActionsData.filter(a => !a.priority);

  return (
    <div className="px-4 pb-2">
      {showLabel && (
        <p className="text-xs text-muted-foreground mb-2">How can I help?</p>
      )}
      <div className="flex flex-wrap gap-2">
        {priorityActions.map((action) => (
          <button
            key={action.label}
            onClick={() => onAction(action.label, action.prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 text-xs font-medium text-foreground transition-colors"
          >
            <action.icon className="w-3 h-3 text-primary" />
            {action.label}
          </button>
        ))}
        {showSecondary && secondaryActions.map((action) => (
          <button
            key={action.label}
            onClick={() => onAction(action.label, action.prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-xs font-medium text-foreground transition-colors"
          >
            <action.icon className="w-3 h-3 text-muted-foreground" />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
