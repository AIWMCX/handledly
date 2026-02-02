import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Styles for the Launch Readiness PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#D4A853',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
    backgroundColor: '#f7fafc',
    padding: 6,
  },
  checklistItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 8,
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#4a5568',
    marginRight: 8,
    marginTop: 1,
  },
  checklistText: {
    flex: 1,
    fontSize: 10,
    color: '#2d3748',
  },
  subItem: {
    paddingLeft: 20,
    marginBottom: 4,
  },
  subItemText: {
    fontSize: 9,
    color: '#4a5568',
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#f59e0b',
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
  },
  warningText: {
    fontSize: 9,
    color: '#92400e',
  },
  infoBox: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#3b82f6',
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
  },
  infoText: {
    fontSize: 9,
    color: '#1e40af',
  },
  codeBlock: {
    backgroundColor: '#1f2937',
    padding: 8,
    marginTop: 8,
    borderRadius: 4,
  },
  codeText: {
    fontSize: 8,
    color: '#e5e7eb',
    fontFamily: 'Courier',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#9ca3af',
  },
  pageNumber: {
    fontSize: 8,
    color: '#9ca3af',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 12,
  },
});

const ChecklistItem = ({ text, indent = false }: { text: string; indent?: boolean }) => (
  <View style={[styles.checklistItem, indent && styles.subItem]}>
    <View style={styles.checkbox} />
    <Text style={indent ? styles.subItemText : styles.checklistText}>{text}</Text>
  </View>
);

export default function LaunchReadinessChecklistPDF() {
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      {/* Page 1: Pricing Verification */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Launch Readiness Checklist</Text>
          <Text style={styles.subtitle}>Handledly Moving Services • {generatedDate}</Text>
        </View>

        <Text style={styles.pageTitle}>1. Pricing Verification Checklist</Text>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ CRITICAL: All pricing must be verified before launch. Iron Law violations can cause customer disputes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Labor Only Rates</Text>
          <ChecklistItem text="2 Movers = $139/hr" />
          <ChecklistItem text="3 Movers = $169/hr" />
          <ChecklistItem text="4 Movers = $239/hr" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Moving with Truck Rates</Text>
          <ChecklistItem text="2 Movers + Truck = $159/hr" />
          <ChecklistItem text="3 Movers + Truck = $189/hr" />
          <ChecklistItem text="3 Movers + 2 Trucks = $219/hr" />
          <ChecklistItem text="4 Movers + Truck = $259/hr" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Iron Law (200+ lb Items)</Text>
          <ChecklistItem text="Iron Law WITH TRUCK displays as $189/hr" />
          <ChecklistItem text="Iron Law LABOR-ONLY displays as $179/hr" />
          <ChecklistItem text="Applies to: Pianos, Gun Safes, Hot Tubs" />
          <ChecklistItem text="Minimum 3 movers required" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pool Table Exception</Text>
          <ChecklistItem text="Pool Tables @ $169/hr (NOT Iron Law)" />
          <ChecklistItem text="2-3 movers allowed" />
          <ChecklistItem text="Flat fee: $350-$550" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specialty Flat Fees</Text>
          <ChecklistItem text="Pianos: $150 / $250 / $350 (Upright/Baby Grand/Full Grand)" />
          <ChecklistItem text="Safes: $100 / $175 / $250 (by weight tier)" />
          <ChecklistItem text="Pool Tables: $350 / $550 (Standard/Slate)" />
          <ChecklistItem text="Hot Tub: $400 flat" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fees & Format</Text>
          <ChecklistItem text="Electronic payment +$5 fee displays" />
          <ChecklistItem text="Quote format = HD-XXXXX everywhere" />
          <ChecklistItem text="$10 negotiation discount available" />
        </View>

        <View style={styles.footer}>
          <Text>Handledly Moving Services - Confidential</Text>
          <Text style={styles.pageNumber}>Page 1 of 4</Text>
        </View>
      </Page>

      {/* Page 2: Jack AI Voice Agent */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Launch Readiness Checklist</Text>
          <Text style={styles.subtitle}>Jack AI Voice Agent Verification</Text>
        </View>

        <Text style={styles.pageTitle}>2. Jack AI Voice Agent Verification</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ElevenLabs Dashboard Configuration</Text>
          <ChecklistItem text="Voice = Matt (deep, professional)" />
          <ChecklistItem text="Speed = 1.1" />
          <ChecklistItem text="Turn Eagerness = Patient" />
          <ChecklistItem text="Turn Timeout = 8-10 seconds" />
          <ChecklistItem text="Interruption Handling = Enabled" />
          <ChecklistItem text="System Prompt v4.0 uploaded" />
          <ChecklistItem text="RAG Knowledge Base v4.0 uploaded" />
          <ChecklistItem text="'Publish' button clicked (live config)" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Jack Response Tests</Text>
          <ChecklistItem text="Test: 'Piano' → Jack quotes $189/hr (NOT $179)" />
          <ChecklistItem text="Test: 'Pool table' → Jack quotes $169/hr (NOT $189)" />
          <ChecklistItem text="Test: 'Gun safe 300 lbs' → Jack quotes $189/hr" />
          <ChecklistItem text="Test: 'Hot tub' → Jack quotes $189/hr + $400 flat" />
          <ChecklistItem text="Test: Jack uses HD-XXXXX quote format" />
          <ChecklistItem text="Test: Jack completes 6-point confirmation" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>90-Second Discovery Flow</Text>
          <ChecklistItem text="Location (from/to addresses)" />
          <ChecklistItem text="Size (bedrooms)" />
          <ChecklistItem text="Access (stairs/elevator)" />
          <ChecklistItem text="Truck need" />
          <ChecklistItem text="Heavy items probe (CRITICAL)" />
          <ChecklistItem text="Quote delivery + close" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6-Point Confirmation Checklist</Text>
          <ChecklistItem text="✓ First name confirmed" />
          <ChecklistItem text="✓ Last name confirmed" />
          <ChecklistItem text="✓ Quote number (HD-XXXXX) stated" />
          <ChecklistItem text="✓ Move date confirmed" />
          <ChecklistItem text="✓ Destination confirmed" />
          <ChecklistItem text="✓ Estimate amount stated" />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Jack must complete ALL 6 points before ending any call. This is mandatory for lead quality.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>Handledly Moving Services - Confidential</Text>
          <Text style={styles.pageNumber}>Page 2 of 4</Text>
        </View>
      </Page>

      {/* Page 3: Customer Journey */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Launch Readiness Checklist</Text>
          <Text style={styles.subtitle}>Customer Journey Verification</Text>
        </View>

        <Text style={styles.pageTitle}>3. Customer Journey Verification</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Homepage (/)</Text>
          <ChecklistItem text="$159/hr rate displays in hero section" />
          <ChecklistItem text="'Get Instant Quote' CTA works" />
          <ChecklistItem text="VoiceAgent floating button visible (bottom-right)" />
          <ChecklistItem text="ChatWidget accessible" />
          <ChecklistItem text="Pricing section shows all tiers" />
          <ChecklistItem text="Iron Law warning visible in Heavy Items tab" />
          <ChecklistItem text="Specialty flat fees visible" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quote Page (/quote)</Text>
          <ChecklistItem text="3-step wizard loads correctly" />
          <ChecklistItem text="Service type selection works" />
          <ChecklistItem text="Date picker works (no timezone issues)" />
          <ChecklistItem text="Phone validation (US +1 only)" />
          <ChecklistItem text="Form submits successfully" />
          <ChecklistItem text="Quote confirmation shows HD-XXXXX format" />
          <ChecklistItem text="Email sent notification appears" />
          <ChecklistItem text="30-second call countdown works" />
          <ChecklistItem text="Quote data stored for Jack context" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Confirmation</Text>
          <ChecklistItem text="Subject contains HD-XXXXX quote number" />
          <ChecklistItem text="Branding correct (Handledly, not HM-)" />
          <ChecklistItem text="Pricing breakdown accurate" />
          <ChecklistItem text="No mention of 'USDOT' or 'BBB A+'" />
          <ChecklistItem text="Reply-to email correct" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Callback Flow</Text>
          <ChecklistItem text="Call triggers after 30 seconds" />
          <ChecklistItem text="Jack receives quote context from web form" />
          <ChecklistItem text="Professional greeting with name" />
          <ChecklistItem text="Quote number referenced in call" />
        </View>

        <View style={styles.footer}>
          <Text>Handledly Moving Services - Confidential</Text>
          <Text style={styles.pageNumber}>Page 3 of 4</Text>
        </View>
      </Page>

      {/* Page 4: Admin & Technical */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Launch Readiness Checklist</Text>
          <Text style={styles.subtitle}>Admin Dashboard & Technical Verification</Text>
        </View>

        <Text style={styles.pageTitle}>4. Admin & Technical Verification</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Dashboard (/admin)</Text>
          <ChecklistItem text="Login works with valid credentials" />
          <ChecklistItem text="Leads table loads" />
          <ChecklistItem text="Quote requests visible" />
          <ChecklistItem text="Pricing Cheat Sheet PDF downloads" />
          <ChecklistItem text="Executive Summary PDF downloads" />
          <ChecklistItem text="Launch Readiness Checklist downloads" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Edge Functions</Text>
          <ChecklistItem text="ai-chat responds to queries" />
          <ChecklistItem text="send-quote-email sends emails" />
          <ChecklistItem text="trigger-confirmation-call triggers calls" />
          <ChecklistItem text="elevenlabs-conversation-token generates token" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Secrets Configured</Text>
          <ChecklistItem text="ELEVENLABS_API_KEY" />
          <ChecklistItem text="ELEVENLABS_AGENT_ID" />
          <ChecklistItem text="RESEND_API_KEY" />
          <ChecklistItem text="FROM_EMAIL" />
          <ChecklistItem text="ADMIN_EMAIL" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>External Activations (Manual)</Text>
          <ChecklistItem text="Google Ads pixel in index.html" />
          <ChecklistItem text="Facebook Pixel in index.html" />
          <ChecklistItem text="ElevenLabs 'Publish' clicked" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Post-Launch Monitoring</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>-- Check recent leads</Text>
            <Text style={styles.codeText}>SELECT * FROM leads ORDER BY created_at DESC LIMIT 10;</Text>
            <Text style={styles.codeText}></Text>
            <Text style={styles.codeText}>-- Check quote requests</Text>
            <Text style={styles.codeText}>SELECT * FROM quote_requests ORDER BY created_at DESC LIMIT 10;</Text>
            <Text style={styles.codeText}></Text>
            <Text style={styles.codeText}>-- Check call status</Text>
            <Text style={styles.codeText}>SELECT full_name, confirmation_call_status, created_at</Text>
            <Text style={styles.codeText}>FROM leads WHERE confirmation_call_status != 'pending'</Text>
            <Text style={styles.codeText}>ORDER BY created_at DESC LIMIT 10;</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Handledly Moving Services - Confidential</Text>
          <Text style={styles.pageNumber}>Page 4 of 4</Text>
        </View>
      </Page>
    </Document>
  );
}
