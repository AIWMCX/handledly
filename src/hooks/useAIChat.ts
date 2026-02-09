import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateQuote, type ServiceType as CalcServiceType } from '@/lib/quoteCalculator';
import { generateId, withRetry } from '@/lib/apiUtils';
import { ConversionEvents } from '@/lib/analytics';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuoteData {
  fullName: string;
  email: string;
  phone: string;
  moveFromAddress?: string;
  moveToAddress?: string;
  moveDate?: string;
  serviceType?: string;
  bedrooms?: number;
  specialItems?: string[];
  notes?: string;
}

export interface QuoteSubmissionResult {
  success: boolean;
  quoteNumber?: string;
  totalQuote?: number;
  firstName?: string;
  email?: string;
  leadId?: string;
}

interface UseAIChatOptions {
  onError?: (error: string) => void;
  onQuoteSubmitted?: (result: QuoteSubmissionResult) => void;
}

// Map service types
const mapToCalcServiceType = (serviceType?: string): CalcServiceType => {
  const mapping: Record<string, CalcServiceType> = {
    'local-moving': 'local-moving',
    'residential': 'local-moving',
    'long-distance': 'local-moving',
    'same-day': 'local-moving',
    'piano-moving': 'heavy-items',
    'pool-table': 'heavy-items',
    'safe-moving': 'heavy-items',
    'heavy-items': 'heavy-items',
    'junk-removal': 'heavy-items',
    'moving-help': 'local-moving',
  };
  return mapping[serviceType || 'local-moving'] || 'local-moving';
};

const mapCrewConfig = (bedrooms: number): string => {
  if (bedrooms <= 2) return 'moving-2-movers';
  if (bedrooms === 3) return 'moving-3-movers';
  return 'moving-4-movers';
};

const splitName = (fullName: string): { firstName: string; lastName: string } => {
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] || 'Friend';
  const lastName = nameParts.slice(1).join(' ') || '';
  return { firstName, lastName };
};

const generateQuoteNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `HM-${year}-${random}`;
};

export function useAIChat({ onError, onQuoteSubmitted }: UseAIChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [quoteSubmission, setQuoteSubmission] = useState<QuoteSubmissionResult | null>(null);
  const [isQuoteSubmitted, setIsQuoteSubmitted] = useState(false);
  
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const conversationHistoryRef = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const chatStartTimeRef = useRef<number>(Date.now());
  const messageCountRef = useRef<number>(0);

  // Process quote submission
  const processQuoteSubmission = useCallback(async (quoteData: QuoteData): Promise<QuoteSubmissionResult> => {
    console.log('[useAIChat] Processing quote submission via submit-quote edge function:', quoteData);
    
    try {
      const { firstName, lastName } = splitName(quoteData.fullName);
      const bedrooms = quoteData.bedrooms || 2;

      // Use the secure submit-quote edge function (same as QuoteFormWizard)
      const { data: result, error } = await supabase.functions.invoke('submit-quote', {
        body: {
          fullName: quoteData.fullName,
          email: quoteData.email,
          phone: quoteData.phone,
          serviceType: quoteData.serviceType || 'local-moving',
          moveFromAddress: quoteData.moveFromAddress || null,
          moveToAddress: quoteData.moveToAddress || null,
          moveDate: quoteData.moveDate || null,
          bedrooms,
          notes: quoteData.notes || 'Quote submitted via AI chat',
          lead_source: 'ai-chat',
          conversationId, // For server-side lead linkage
        }
      });

      if (error) {
        console.error('[useAIChat] submit-quote error:', error);
        throw new Error(error.message || 'Failed to submit quote');
      }

      if (!result || result.error) {
        console.error('[useAIChat] submit-quote returned error:', result?.error);
        throw new Error(result?.error || 'Quote submission failed');
      }

      console.log('[useAIChat] Quote submitted successfully:', result);

      // Extract data from edge function response
      // The submit-quote edge function already triggers email and call
      const { leadId, quoteNumber, quote: quoteResult, verificationToken: serverToken } = result;

      // Return success result
      const submissionResult: QuoteSubmissionResult = {
        success: true,
        quoteNumber,
        totalQuote: quoteResult?.total || 0,
        firstName,
        email: quoteData.email,
        leadId,
      };

      setQuoteSubmission(submissionResult);
      setIsQuoteSubmitted(true);
      onQuoteSubmitted?.(submissionResult);

      // Track quote submission analytics
      ConversionEvents.chatQuoteSubmitted(quoteNumber, submissionResult.totalQuote, quoteData.serviceType);

      console.log('[useAIChat] Quote submitted successfully:', quoteNumber);
      return submissionResult;

    } catch (error) {
      console.error('[useAIChat] Quote submission failed:', error);
      return { success: false };
    }
  }, [conversationId, onQuoteSubmitted]);

  // Create a new conversation in the database
  const createConversation = useCallback(async () => {
    try {
      const convId = crypto.randomUUID();
      
      const { error } = await supabase
        .from('chat_conversations')
        .insert({
          id: convId,
          session_id: sessionIdRef.current,
          source_page: window.location.pathname,
          status: 'active',
          metadata: {
            user_agent: navigator.userAgent,
            referrer: document.referrer,
            started_at: new Date().toISOString(),
            ai_powered: true,
          },
        });

      if (error) {
        console.error('Failed to create conversation:', error);
        return null;
      }
      
      setConversationId(convId);
      return convId;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return null;
    }
  }, []);

  // Save a message to the database
  const saveMessage = useCallback(async (
    role: 'user' | 'assistant',
    content: string
  ) => {
    if (!conversationId) return;
    
    try {
      await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        role: role === 'assistant' ? 'agent' : role,
        content,
        message_type: 'text',
      });
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  }, [conversationId]);

  // Start the chat session
  const startChat = useCallback(async (variant: 'floating' | 'inline' = 'floating') => {
    setIsLoading(true);
    
    // Reset state
    sessionIdRef.current = crypto.randomUUID();
    conversationHistoryRef.current = [];
    chatStartTimeRef.current = Date.now();
    messageCountRef.current = 0;
    setMessages([]);
    setQuoteSubmission(null);
    setIsQuoteSubmitted(false);

    // Track chat started
    ConversionEvents.chatStarted(variant, window.location.pathname);
    
    try {
      const newConversationId = await createConversation();
      
      // Add greeting message
      const greetingMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "Hey! I'm Jack with Handledly. What can I help you with?",
        timestamp: new Date(),
      };
      
      setMessages([greetingMessage]);
      conversationHistoryRef.current.push({
        role: 'assistant',
        content: greetingMessage.content,
      });
      
      // Save greeting to database
      if (newConversationId) {
        await supabase.from('chat_messages').insert({
          conversation_id: newConversationId,
          role: 'agent',
          content: greetingMessage.content,
          message_type: 'text',
        });
      }
      
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to start chat:', error);
      onError?.('Failed to start chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [createConversation, onError]);

  // End the chat session
  const endChat = useCallback(async () => {
    // Track chat ended with stats
    const durationSeconds = Math.round((Date.now() - chatStartTimeRef.current) / 1000);
    ConversionEvents.chatEnded(messageCountRef.current, durationSeconds, isQuoteSubmitted);

    if (conversationId) {
      try {
        await supabase
          .from('chat_conversations')
          .update({
            status: 'ended',
            ended_at: new Date().toISOString(),
          })
          .eq('id', conversationId);
      } catch (error) {
        console.error('Failed to end conversation:', error);
      }
    }
    
    setIsConnected(false);
    setMessages([]);
    setConversationId(null);
    setQuoteSubmission(null);
    setIsQuoteSubmitted(false);
    conversationHistoryRef.current = [];
  }, [conversationId, isQuoteSubmitted]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !isConnected || isLoading) return;

    const isFirstMessage = messageCountRef.current === 0;
    messageCountRef.current++;

    // Track message sent
    ConversionEvents.chatMessageSent(content.trim().length, isFirstMessage);

    // Detect quote-related intent
    const quoteKeywords = ['quote', 'price', 'cost', 'estimate', 'how much', 'pricing'];
    if (quoteKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
      ConversionEvents.chatQuoteRequested(window.location.pathname);
    }

    // Add user message to UI
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    conversationHistoryRef.current.push({
      role: 'user',
      content: content.trim(),
    });
    
    // Save user message to database
    await saveMessage('user', content.trim());
    
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: content.trim(),
          conversationHistory: conversationHistoryRef.current.slice(-10),
          sessionId: sessionIdRef.current,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to get response');
      }

      if (!data?.response) {
        throw new Error('No response received');
      }

      // Check if there's a quote action to process
      if (data.action?.type === 'submit_quote' && data.action.data) {
        await processQuoteSubmission(data.action.data);
      }

      // Add assistant response to UI
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      conversationHistoryRef.current.push({
        role: 'assistant',
        content: data.response,
      });
      
      // Save assistant message to database
      await saveMessage('assistant', data.response);

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message to UI
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I apologize, I'm having trouble responding right now. Please try again, or call us at (878) 218-7397 for immediate assistance.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      onError?.(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, isLoading, saveMessage, onError, processQuoteSubmission]);

  // NOTE: linkLeadToConversation removed - RLS now prevents client-side updates
  // Lead linking is handled server-side by edge functions using service role

  return {
    messages,
    isLoading,
    isConnected,
    conversationId,
    quoteSubmission,
    isQuoteSubmitted,
    startChat,
    endChat,
    sendMessage,
  };
}
