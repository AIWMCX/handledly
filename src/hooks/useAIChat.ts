import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseAIChatOptions {
  onError?: (error: string) => void;
}

export function useAIChat({ onError }: UseAIChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const conversationHistoryRef = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

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
  const startChat = useCallback(async () => {
    setIsLoading(true);
    
    // Generate new session ID
    sessionIdRef.current = crypto.randomUUID();
    conversationHistoryRef.current = [];
    setMessages([]);
    
    try {
      const newConversationId = await createConversation();
      
      // Add greeting message
      const greetingMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "Hi! I'm Jack, the Handledly moving assistant. How can I help you today? I can provide instant quotes, answer questions about our services, or help schedule your move.",
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
    conversationHistoryRef.current = [];
  }, [conversationId]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !isConnected || isLoading) return;

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
        content: "I apologize, I'm having trouble responding right now. Please try again, or call us at (720) 555-0123 for immediate assistance.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      onError?.(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, isLoading, saveMessage, onError]);

  // Link a lead to the current conversation
  const linkLeadToConversation = useCallback(async (leadId: string) => {
    if (!conversationId) return;
    
    try {
      await supabase
        .from('chat_conversations')
        .update({ lead_id: leadId })
        .eq('id', conversationId);
    } catch (error) {
      console.error('Failed to link lead to conversation:', error);
    }
  }, [conversationId]);

  return {
    messages,
    isLoading,
    isConnected,
    conversationId,
    startChat,
    endChat,
    sendMessage,
    linkLeadToConversation,
  };
}
