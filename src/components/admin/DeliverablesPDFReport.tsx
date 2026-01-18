import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Register a clean font
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Inter',
  },
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1e40af',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  documentTitle: {
    fontSize: 22,
    fontWeight: 600,
    color: '#0f172a',
    marginTop: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1e40af',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    color: '#64748b',
    width: 160,
  },
  value: {
    fontSize: 10,
    color: '#0f172a',
    fontWeight: 600,
    flex: 1,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 700,
    color: '#475569',
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableCell: {
    fontSize: 9,
    color: '#334155',
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  statCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1e40af',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTop: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
  badge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '4 8',
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 600,
  },
  highlightBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  highlightTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#1e40af',
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 10,
    color: '#334155',
    lineHeight: 1.5,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    fontSize: 8,
    color: '#94a3b8',
  },
});

export interface PDFReportData {
  totalLeads: number;
  newLeadsToday: number;
  totalChats: number;
  totalQuotes: number;
  totalRevenue: number;
  conversionRate: number;
  completedCalls: number;
  upcomingAppointments: number;
  recentLeads: Array<{
    full_name: string;
    email: string;
    status: string;
    created_at: string;
    estimated_quote: number | null;
  }>;
}

interface DeliverablesPDFReportProps {
  data: PDFReportData;
}

const DeliverablesPDFReport = ({ data }: DeliverablesPDFReportProps) => {
  const generatedDate = format(new Date(), 'MMMM d, yyyy');
  const generatedTime = format(new Date(), 'h:mm a');

  return (
    <Document>
      {/* Page 1: Cover & Executive Summary */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>Handledly</Text>
          <Text style={styles.subtitle}>Moving Services SaaS Platform</Text>
          <Text style={styles.documentTitle}>Project Deliverables Report</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightTitle}>Development Investment: $9,000</Text>
            <Text style={styles.highlightText}>
              This document provides a comprehensive overview of all deliverables included in the 
              Handledly Moving Services SaaS platform development. The project encompasses a complete 
              web application with AI-powered features, automated workflows, and enterprise-grade security.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Platform Metrics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{data.totalLeads}</Text>
              <Text style={styles.statLabel}>Total Leads Generated</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>${data.totalRevenue.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Quote Value</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{data.totalChats}</Text>
              <Text style={styles.statLabel}>AI Chat Conversations</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{data.conversionRate}%</Text>
              <Text style={styles.statLabel}>Conversion Rate</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Overview</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Project Name:</Text>
            <Text style={styles.value}>Handledly Moving Services</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Platform Type:</Text>
            <Text style={styles.value}>SaaS Web Application</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Development Cost:</Text>
            <Text style={styles.value}>$9,000</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Estimated Market Value:</Text>
            <Text style={styles.value}>$22,000+</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Launch Readiness:</Text>
            <Text style={styles.value}>90% Complete</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Report Generated:</Text>
            <Text style={styles.value}>{generatedDate} at {generatedTime}</Text>
          </View>
        </View>

        <Text style={styles.pageNumber}>Page 1 of 3</Text>
      </Page>

      {/* Page 2: Technical Deliverables */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>Handledly</Text>
          <Text style={styles.documentTitle}>Technical Deliverables</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frontend Development</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Category</Text>
              <Text style={styles.tableHeaderCell}>Count</Text>
              <Text style={styles.tableHeaderCell}>Details</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Application Routes</Text>
              <Text style={styles.tableCell}>24</Text>
              <Text style={styles.tableCell}>Public, Admin, Service Pages</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>UI Components</Text>
              <Text style={styles.tableCell}>80+</Text>
              <Text style={styles.tableCell}>shadcn/ui + Custom Components</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Form Wizards</Text>
              <Text style={styles.tableCell}>2</Text>
              <Text style={styles.tableCell}>Quote Form, Contact Form</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Admin Panels</Text>
              <Text style={styles.tableCell}>7</Text>
              <Text style={styles.tableCell}>Dashboard, Leads, Calls, Settings</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backend Infrastructure</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Component</Text>
              <Text style={styles.tableHeaderCell}>Count</Text>
              <Text style={styles.tableHeaderCell}>Description</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Database Tables</Text>
              <Text style={styles.tableCell}>8</Text>
              <Text style={styles.tableCell}>Leads, Quotes, Appointments, etc.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Edge Functions</Text>
              <Text style={styles.tableCell}>6</Text>
              <Text style={styles.tableCell}>AI Chat, Calls, Email, SMS</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>RLS Policies</Text>
              <Text style={styles.tableCell}>25+</Text>
              <Text style={styles.tableCell}>Enterprise Security</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Rate Limiters</Text>
              <Text style={styles.tableCell}>4</Text>
              <Text style={styles.tableCell}>Abuse Prevention</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI & Automation</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Feature</Text>
              <Text style={styles.tableHeaderCell}>Provider</Text>
              <Text style={styles.tableHeaderCell}>Capability</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Chat Assistant</Text>
              <Text style={styles.tableCell}>Lovable AI (Gemini)</Text>
              <Text style={styles.tableCell}>24/7 Customer Support</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Voice Agent</Text>
              <Text style={styles.tableCell}>ElevenLabs</Text>
              <Text style={styles.tableCell}>Confirmation Calls</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Email Automation</Text>
              <Text style={styles.tableCell}>Resend</Text>
              <Text style={styles.tableCell}>Quote Confirmations</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>SMS Notifications</Text>
              <Text style={styles.tableCell}>Twilio</Text>
              <Text style={styles.tableCell}>Lead Alerts</Text>
            </View>
          </View>
        </View>

        <Text style={styles.pageNumber}>Page 2 of 3</Text>
      </Page>

      {/* Page 3: Recent Activity & Pending Items */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>Handledly</Text>
          <Text style={styles.documentTitle}>Activity & Next Steps</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Lead Activity</Text>
          {data.recentLeads.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Name</Text>
                <Text style={styles.tableHeaderCell}>Email</Text>
                <Text style={styles.tableHeaderCell}>Status</Text>
                <Text style={styles.tableHeaderCell}>Quote</Text>
              </View>
              {data.recentLeads.slice(0, 8).map((lead, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{lead.full_name}</Text>
                  <Text style={styles.tableCell}>{lead.email}</Text>
                  <Text style={styles.tableCell}>{lead.status.toUpperCase()}</Text>
                  <Text style={styles.tableCell}>
                    {lead.estimated_quote ? `$${lead.estimated_quote.toLocaleString()}` : '-'}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.highlightText}>No leads recorded yet.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Items (Client Action Required)</Text>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              1. Provide Google Ads Conversion ID for tracking setup{'\n'}
              2. Provide Facebook Pixel ID for retargeting{'\n'}
              3. Configure ElevenLabs post-call webhook in dashboard{'\n'}
              4. Complete DNS configuration for custom domain{'\n'}
              5. Approve end-to-end testing schedule
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technology Stack</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Frontend:</Text>
            <Text style={styles.value}>React 18, TypeScript, Tailwind CSS</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Backend:</Text>
            <Text style={styles.value}>Lovable Cloud (Supabase)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>AI/ML:</Text>
            <Text style={styles.value}>Lovable AI, ElevenLabs</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Communications:</Text>
            <Text style={styles.value}>Twilio, Resend</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Analytics:</Text>
            <Text style={styles.value}>Google Analytics 4, Custom Events</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Confidential - Prepared for Client Review | Generated on {generatedDate}
          </Text>
        </View>

        <Text style={styles.pageNumber}>Page 3 of 3</Text>
      </Page>
    </Document>
  );
};

export default DeliverablesPDFReport;
