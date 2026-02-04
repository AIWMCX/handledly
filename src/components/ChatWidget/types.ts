// ChatWidget shared types and interfaces

import type { LucideIcon } from "lucide-react";

export interface ChatWidgetProps {
  className?: string;
  variant?: "floating" | "inline";
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface QuoteSubmission {
  quoteNumber?: string;
  email?: string;
  firstName?: string;
  totalQuote?: number;
}

export interface QuickAction {
  icon: LucideIcon;
  label: string;
  prompt: string;
  priority: boolean;
}

export interface ConversionPrompt {
  message: number;
  text: string;
  cta: string;
}

// Predefined quick actions
export const quickActions: QuickAction[] = [
  { icon: null as any, label: "Get Free Quote", prompt: "I'd like to get a free quote for my move", priority: true },
  { icon: null as any, label: "Book Same-Day", prompt: "I need a same-day moving service", priority: true },
  { icon: null as any, label: "Service Hours", prompt: "What are your hours of operation?", priority: false },
  { icon: null as any, label: "View Pricing", prompt: "How much do you charge for moving?", priority: false },
];

// Proactive conversion prompts shown after message count threshold
export const conversionPrompts: ConversionPrompt[] = [
  { message: 3, text: "💡 Ready to get your personalized quote? I just need a few quick details!", cta: "Start My Quote" },
  { message: 6, text: "📞 Want to talk to someone? Call us at (878) 218-7397 or let me get your quote now!", cta: "Get Quote Now" },
];
