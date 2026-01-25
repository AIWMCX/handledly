# Custom Hooks Documentation

## Overview

The Handledly platform uses 10 custom React hooks to encapsulate reusable logic.

---

## 1. Hook Inventory

| Hook | File | Purpose |
|------|------|---------|
| useAIChat | `src/hooks/useAIChat.ts` | AI chat conversation management |
| useExitIntent | `src/hooks/useExitIntent.ts` | Exit intent detection |
| useFormPersistence | `src/hooks/useFormPersistence.ts` | Form data auto-save |
| useScrollProgress | `src/hooks/useScrollProgress.ts` | Scroll position tracking |
| useSocialProof | `src/hooks/useSocialProof.ts` | Social proof notifications |
| useUTMParams | `src/hooks/useUTMParams.ts` | Marketing attribution |
| use-mobile | `src/hooks/use-mobile.tsx` | Responsive breakpoint |
| use-toast | `src/hooks/use-toast.ts` | Toast notifications |
| useDocumentationGenerator | `src/hooks/useDocumentationGenerator.ts` | PDF generation |
| usePDFExport | `src/hooks/usePDFExport.tsx` | PDF export utility |

---

## 2. useAIChat

**File**: `src/hooks/useAIChat.ts`
**Purpose**: Manage AI chat conversation state and API calls

```typescript
interface UseAIChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  lastAction: ChatAction | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatAction {
  type: 'submit_quote';
  data: QuoteData;
}
```

**Usage**:
```tsx
function ChatWidget() {
  const { messages, isLoading, sendMessage, lastAction } = useAIChat();
  
  const handleSubmit = async (text: string) => {
    await sendMessage(text);
  };
  
  // Handle quote action
  useEffect(() => {
    if (lastAction?.type === 'submit_quote') {
      // Trigger quote flow
    }
  }, [lastAction]);
  
  return (
    <div>
      {messages.map(msg => <MessageBubble key={msg.id} {...msg} />)}
    </div>
  );
}
```

**Features**:
- Conversation history management
- Loading state
- Error handling
- Action extraction from AI responses
- Session ID generation

---

## 3. useExitIntent

**File**: `src/hooks/useExitIntent.ts`
**Purpose**: Detect when user is about to leave the page

```typescript
interface UseExitIntentOptions {
  delay?: number;        // ms before enabling (default: 1000)
  sensitivity?: number;  // pixels from top (default: 20)
  cookieExpiry?: number; // days (default: 7)
}

interface UseExitIntentReturn {
  isTriggered: boolean;
  dismiss: () => void;
  reset: () => void;
}
```

**Usage**:
```tsx
function Page() {
  const { isTriggered, dismiss } = useExitIntent({
    delay: 2000,
    sensitivity: 10,
  });
  
  return (
    <>
      {isTriggered && (
        <ExitIntentModal onClose={dismiss} />
      )}
    </>
  );
}
```

**Detection Methods**:
- Mouse leaving viewport (desktop)
- Back button detection (mobile)
- Tab visibility change

---

## 4. useFormPersistence

**File**: `src/hooks/useFormPersistence.ts`
**Purpose**: Auto-save form data to localStorage

```typescript
interface UseFormPersistenceOptions<T> {
  key: string;
  initialValue: T;
  expiryMinutes?: number; // default: 30
}

interface UseFormPersistenceReturn<T> {
  data: T;
  setData: (value: T | ((prev: T) => T)) => void;
  clearData: () => void;
  lastSaved: Date | null;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}
```

**Usage**:
```tsx
function QuoteFormWizard() {
  const {
    data,
    setData,
    clearData,
    currentStep,
    setCurrentStep,
  } = useFormPersistence({
    key: 'quote-wizard',
    initialValue: defaultFormData,
    expiryMinutes: 60,
  });
  
  const handleChange = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = () => {
    // Submit logic
    clearData(); // Clear on success
  };
  
  return (
    <Form data={data} onChange={handleChange} step={currentStep} />
  );
}
```

**Storage Format**:
```typescript
interface PersistedData<T> {
  data: T;
  savedAt: string; // ISO timestamp
  expiresAt: string;
  step: number;
}
```

---

## 5. useScrollProgress

**File**: `src/hooks/useScrollProgress.ts`
**Purpose**: Track scroll position as percentage

```typescript
interface UseScrollProgressReturn {
  progress: number;        // 0-100
  direction: 'up' | 'down' | null;
  atTop: boolean;
  atBottom: boolean;
}
```

**Usage**:
```tsx
function ScrollProgress() {
  const { progress, atTop } = useScrollProgress();
  
  return (
    <div 
      className={cn(
        "fixed top-0 left-0 h-1 bg-primary transition-all",
        atTop && "opacity-0"
      )}
      style={{ width: `${progress}%` }}
    />
  );
}
```

**Analytics Integration**:
```tsx
function Page() {
  const { progress } = useScrollProgress();
  const [tracked, setTracked] = useState<number[]>([]);
  
  useEffect(() => {
    const milestones = [25, 50, 75, 100];
    milestones.forEach(milestone => {
      if (progress >= milestone && !tracked.includes(milestone)) {
        ConversionEvents.scrollMilestone(milestone, window.location.pathname);
        setTracked(prev => [...prev, milestone]);
      }
    });
  }, [progress, tracked]);
}
```

---

## 6. useSocialProof

**File**: `src/hooks/useSocialProof.ts`
**Purpose**: Generate and rotate social proof notifications

```typescript
interface SocialProofNotification {
  id: string;
  type: 'booking' | 'viewing' | 'recent';
  message: string;
  name?: string;
  neighborhood?: string;
  timestamp: Date;
}

interface UseSocialProofReturn {
  currentNotification: SocialProofNotification | null;
  isVisible: boolean;
  dismiss: () => void;
}
```

**Usage**:
```tsx
function SocialProofBanner() {
  const { currentNotification, isVisible, dismiss } = useSocialProof();
  
  if (!isVisible || !currentNotification) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      onDoubleClick={dismiss}
    >
      {currentNotification.message}
    </motion.div>
  );
}
```

**Notification Types**:
```typescript
// Booking notification
"Sarah from Cherry Creek just booked a 2BR move!"

// Viewing notification
"3 people are viewing this page"

// Recent notification
"Michael just requested a quote"
```

---

## 7. useUTMParams

**File**: `src/hooks/useUTMParams.ts`
**Purpose**: Capture and persist UTM marketing parameters

```typescript
interface UTMParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  lead_source: string;
}

interface UseUTMParamsReturn {
  params: UTMParams;
  hasUTM: boolean;
  getAttribution: () => UTMParams;
}
```

**Usage**:
```tsx
function QuoteForm() {
  const { getAttribution } = useUTMParams();
  
  const handleSubmit = async (formData: FormData) => {
    const attribution = getAttribution();
    
    await supabase.from('leads').insert({
      ...formData,
      ...attribution,
    });
  };
}
```

**Persistence**:
- Captures from URL on first visit
- Stores in sessionStorage
- Survives navigation within session
- Attached to all lead submissions

---

## 8. use-mobile

**File**: `src/hooks/use-mobile.tsx`
**Purpose**: Detect mobile viewport

```typescript
const MOBILE_BREAKPOINT = 768;

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}
```

**Usage**:
```tsx
function Component() {
  const isMobile = useIsMobile();
  
  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}
```

---

## 9. use-toast

**File**: `src/hooks/use-toast.ts`
**Purpose**: Toast notification management

```typescript
interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  variant?: 'default' | 'destructive';
}

interface UseToastReturn {
  toasts: Toast[];
  toast: (props: Omit<Toast, 'id'>) => { dismiss: () => void };
  dismiss: (id?: string) => void;
}
```

**Usage**:
```tsx
function Form() {
  const { toast } = useToast();
  
  const handleSuccess = () => {
    toast({
      title: "Success!",
      description: "Your quote has been submitted.",
    });
  };
  
  const handleError = () => {
    toast({
      title: "Error",
      description: "Something went wrong.",
      variant: "destructive",
    });
  };
}
```

---

## 10. usePDFExport

**File**: `src/hooks/usePDFExport.tsx`
**Purpose**: Generate and download PDF reports

```typescript
interface UsePDFExportReturn {
  isGenerating: boolean;
  generatePDF: (data: ReportData) => Promise<void>;
  error: string | null;
}
```

**Usage**:
```tsx
function AdminDashboard() {
  const { isGenerating, generatePDF } = usePDFExport();
  
  const handleExport = async () => {
    const data = await fetchDashboardData();
    await generatePDF(data);
  };
  
  return (
    <Button onClick={handleExport} disabled={isGenerating}>
      {isGenerating ? 'Generating...' : 'Export PDF'}
    </Button>
  );
}
```

**Uses**: @react-pdf/renderer

---

## 11. Best Practices

### Hook Naming
- Prefix with `use`
- Descriptive action names
- Match file name to export name

### State Management
- Use `useState` for simple state
- Use `useReducer` for complex state
- Clean up effects properly

### Performance
- Memoize expensive calculations
- Use `useCallback` for handlers passed as props
- Debounce rapid state updates

### Error Handling
```typescript
function useAsyncData<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    let cancelled = false;
    
    setIsLoading(true);
    fetcher()
      .then(result => {
        if (!cancelled) setData(result);
      })
      .catch(err => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    
    return () => { cancelled = true; };
  }, []);
  
  return { data, error, isLoading };
}
```

---

*Last Updated: January 25, 2026*
