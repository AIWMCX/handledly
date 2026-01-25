import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { PDFBarChart, PDFDonutChart, PDFProgressRing, PDFScoreBar, PDFLineChart } from './charts';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 700 },
  ],
});

// Brand Colors
const colors = {
  navy: '#1E3A5F',
  gold: '#F9B233',
  white: '#FFFFFF',
  slate: '#64748b',
  dark: '#0f172a',
  light: '#f8fafc',
  border: '#e2e8f0',
  success: '#22C55E',
  warning: '#F59E0B',
  info: '#3B82F6',
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: colors.white,
    padding: 40,
    fontFamily: 'Inter',
  },
  coverPage: {
    flexDirection: 'column',
    backgroundColor: colors.navy,
    padding: 0,
    fontFamily: 'Inter',
  },
  coverContent: {
    flex: 1,
    padding: 60,
    justifyContent: 'center',
  },
  coverTitle: {
    fontSize: 42,
    fontWeight: 700,
    color: colors.white,
    marginBottom: 12,
  },
  coverSubtitle: {
    fontSize: 18,
    color: colors.gold,
    marginBottom: 40,
  },
  coverDivider: {
    width: 80,
    height: 4,
    backgroundColor: colors.gold,
    marginBottom: 40,
  },
  coverMeta: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: colors.navy,
    paddingBottom: 15,
  },
  logo: {
    fontSize: 24,
    fontWeight: 700,
    color: colors.navy,
  },
  pageTitle: {
    fontSize: 14,
    color: colors.slate,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.navy,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  col: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: colors.light,
    borderRadius: 8,
    padding: 16,
    width: '23%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 700,
    color: colors.navy,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9,
    color: colors.slate,
  },
  highlightBox: {
    backgroundColor: '#FEF7E8',
    borderRadius: 8,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.gold,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.navy,
    marginBottom: 8,
  },
  highlightValue: {
    fontSize: 32,
    fontWeight: 700,
    color: colors.gold,
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 10,
    color: colors.dark,
    lineHeight: 1.5,
  },
  comparisonBox: {
    backgroundColor: colors.light,
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  comparisonLabel: {
    fontSize: 10,
    color: colors.slate,
  },
  comparisonValue: {
    fontSize: 10,
    fontWeight: 600,
    color: colors.dark,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.navy,
    padding: 10,
    borderRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 700,
    color: colors.white,
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableCell: {
    fontSize: 9,
    color: colors.dark,
    flex: 1,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.warning,
    marginRight: 10,
  },
  checklistText: {
    fontSize: 10,
    color: colors.dark,
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: colors.slate,
  },
  pageNumber: {
    fontSize: 8,
    color: colors.slate,
  },
  chartContainer: {
    backgroundColor: colors.light,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.dark,
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 8,
    color: colors.slate,
  },
});

export interface ExecutivePDFData {
  totalLeads: number;
  totalRevenue: number;
  totalChats: number;
  conversionRate: number;
  completedCalls: number;
  upcomingAppointments: number;
  leadsByDay: { label: string; value: number }[];
  recentLeads: Array<{
    full_name: string;
    email: string;
    status: string;
    estimated_quote: number | null;
  }>;
}

interface ExecutiveSummaryPDFProps {
  data: ExecutivePDFData;
}

const ExecutiveSummaryPDF = ({ data }: ExecutiveSummaryPDFProps) => {
  const generatedDate = format(new Date(), 'MMMM d, yyyy');

  // Investment breakdown data
  const investmentBreakdown = [
    { label: 'UI/UX Design', value: 4000, color: colors.navy },
    { label: 'Frontend Dev', value: 7500, color: colors.info },
    { label: 'Backend', value: 4500, color: colors.success },
    { label: 'AI Integration', value: 3500, color: colors.gold },
    { label: 'Other', value: 2825, color: colors.slate },
  ];

  // 3-year projections
  const projections = [
    { x: 'Y1', y: 252000 },
    { x: 'Y2', y: 576000 },
    { x: 'Y3', y: 1152000 },
  ];

  // Audit scores
  const auditScores = [
    { label: 'Architecture', score: 7.5, color: colors.info },
    { label: 'Code Quality', score: 7.0, color: colors.navy },
    { label: 'Security', score: 6.0, color: colors.warning },
    { label: 'Performance', score: 7.0, color: colors.success },
    { label: 'AI Reliability', score: 7.5, color: colors.gold },
    { label: 'UX/Product', score: 8.0, color: colors.info },
  ];

  return (
    <Document>
      {/* Page 1: Cover */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverContent}>
          <Text style={styles.coverTitle}>Handledly</Text>
          <Text style={styles.coverSubtitle}>Moving Services SaaS Platform</Text>
          <View style={styles.coverDivider} />
          <Text style={{ ...styles.coverTitle, fontSize: 28, marginBottom: 8 }}>
            Executive Summary
          </Text>
          <Text style={{ ...styles.coverSubtitle, fontSize: 14, marginBottom: 60 }}>
            Investor & Client Presentation
          </Text>
          <Text style={styles.coverMeta}>Document Version: 1.0</Text>
          <Text style={styles.coverMeta}>Generated: {generatedDate}</Text>
          <Text style={styles.coverMeta}>Classification: Confidential</Text>
        </View>
        <View style={{ backgroundColor: colors.gold, height: 8 }} />
      </Page>

      {/* Page 2: Investment & ROI */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>Handledly</Text>
          <Text style={styles.pageTitle}>Investment & ROI Analysis</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <View style={{ ...styles.col, marginRight: 16 }}>
              <View style={styles.highlightBox}>
                <Text style={styles.highlightTitle}>Development Investment</Text>
                <Text style={styles.highlightValue}>$9,000</Text>
                <Text style={styles.highlightText}>
                  Complete SaaS platform including AI integration, automated workflows, 
                  and enterprise security.
                </Text>
              </View>
            </View>
            <View style={styles.col}>
              <View style={{ ...styles.highlightBox, backgroundColor: '#E8F5E9', borderLeftColor: colors.success }}>
                <Text style={styles.highlightTitle}>Market Value</Text>
                <Text style={{ ...styles.highlightValue, color: colors.success }}>$22,325</Text>
                <Text style={styles.highlightText}>
                  147% savings compared to traditional agency development costs.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investment Breakdown</Text>
          <View style={styles.chartContainer}>
            <PDFBarChart
              data={investmentBreakdown}
              width={515}
              height={150}
              horizontal
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Value Comparison</Text>
          <View style={styles.comparisonBox}>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>WordPress Template</Text>
              <Text style={styles.comparisonValue}>$500 - $2,000</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>DIY Internal Build</Text>
              <Text style={styles.comparisonValue}>$15,000+ (time cost)</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Custom Agency Build</Text>
              <Text style={styles.comparisonValue}>$25,000 - $50,000</Text>
            </View>
            <View style={{ ...styles.comparisonRow, borderBottomWidth: 0, backgroundColor: '#E8F5E9', margin: -8, marginTop: 8, padding: 8, borderRadius: 4 }}>
              <Text style={{ ...styles.comparisonLabel, fontWeight: 600, color: colors.success }}>Handledly Investment</Text>
              <Text style={{ ...styles.comparisonValue, color: colors.success }}>$9,000 (Best Value)</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Confidential - Handledly Executive Summary</Text>
          <Text style={styles.pageNumber}>Page 2 of 6</Text>
        </View>
      </Page>

      {/* Page 3: Live Metrics */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>Handledly</Text>
          <Text style={styles.pageTitle}>Live Platform Metrics</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Performance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{data.totalLeads}</Text>
              <Text style={styles.statLabel}>Total Leads</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>${data.totalRevenue.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Quote Value</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{data.totalChats}</Text>
              <Text style={styles.statLabel}>AI Conversations</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{data.conversionRate}%</Text>
              <Text style={styles.statLabel}>Conversion Rate</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lead Activity (Last 7 Days)</Text>
          <View style={styles.chartContainer}>
            <PDFBarChart
              data={data.leadsByDay}
              width={515}
              height={160}
              barColor={colors.navy}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Leads</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Name</Text>
            <Text style={styles.tableHeaderCell}>Email</Text>
            <Text style={styles.tableHeaderCell}>Status</Text>
            <Text style={styles.tableHeaderCell}>Quote</Text>
          </View>
          {data.recentLeads.slice(0, 6).map((lead, index) => (
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

        <View style={styles.footer}>
          <Text style={styles.footerText}>Confidential - Handledly Executive Summary</Text>
          <Text style={styles.pageNumber}>Page 3 of 6</Text>
        </View>
      </Page>

      {/* Page 4: Technology & Architecture */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>Handledly</Text>
          <Text style={styles.pageTitle}>Technology & Architecture</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Inventory</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Application Routes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>80+</Text>
              <Text style={styles.statLabel}>UI Components</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Database Tables</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>6</Text>
              <Text style={styles.statLabel}>Edge Functions</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technology Stack</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Layer</Text>
            <Text style={styles.tableHeaderCell}>Technology</Text>
            <Text style={styles.tableHeaderCell}>Purpose</Text>
          </View>
          {[
            ['Frontend', 'React 18 + TypeScript', 'Modern UI Framework'],
            ['Styling', 'Tailwind CSS + shadcn/ui', 'Design System'],
            ['Backend', 'Lovable Cloud (Supabase)', 'Database & Auth'],
            ['AI Chat', 'Lovable AI (Gemini 3 Flash)', '24/7 Customer Support'],
            ['Voice Agent', 'ElevenLabs + Twilio', 'Confirmation Calls'],
            ['Email', 'Resend API', 'Transactional Emails'],
            ['Analytics', 'Custom + GA4', 'Conversion Tracking'],
          ].map((row, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{row[0]}</Text>
              <Text style={styles.tableCell}>{row[1]}</Text>
              <Text style={styles.tableCell}>{row[2]}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI & Automation Features</Text>
          <View style={styles.row}>
            <View style={{ ...styles.col, marginRight: 16 }}>
              <View style={styles.comparisonBox}>
                <Text style={{ fontSize: 11, fontWeight: 600, color: colors.dark, marginBottom: 8 }}>AI Chat Assistant</Text>
                <Text style={{ fontSize: 9, color: colors.slate, lineHeight: 1.5 }}>
                  24/7 availability, instant quote generation, context-aware conversations, 
                  seamless lead capture integration.
                </Text>
              </View>
            </View>
            <View style={styles.col}>
              <View style={styles.comparisonBox}>
                <Text style={{ fontSize: 11, fontWeight: 600, color: colors.dark, marginBottom: 8 }}>Voice Agent ("Jack")</Text>
                <Text style={{ fontSize: 9, color: colors.slate, lineHeight: 1.5 }}>
                  Automated confirmation calls within 30 seconds of quote submission, 
                  natural voice synthesis, call tracking.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Confidential - Handledly Executive Summary</Text>
          <Text style={styles.pageNumber}>Page 4 of 6</Text>
        </View>
      </Page>

      {/* Page 5: Revenue Projections */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>Handledly</Text>
          <Text style={styles.pageTitle}>Revenue Projections</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3-Year Growth Forecast</Text>
          <View style={styles.chartContainer}>
            <PDFLineChart
              data={projections}
              width={515}
              height={180}
              color={colors.success}
              fillArea
            />
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={{ ...styles.legendDot, backgroundColor: colors.success }} />
                <Text style={styles.legendText}>Year 1: $252,000 (21 jobs/mo)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={{ ...styles.legendDot, backgroundColor: colors.success }} />
                <Text style={styles.legendText}>Year 2: $576,000 (48 jobs/mo)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={{ ...styles.legendDot, backgroundColor: colors.success }} />
                <Text style={styles.legendText}>Year 3: $1,152,000 (96 jobs/mo)</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Scenario Analysis</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Scenario</Text>
            <Text style={styles.tableHeaderCell}>Jobs/Month</Text>
            <Text style={styles.tableHeaderCell}>Avg. Job</Text>
            <Text style={styles.tableHeaderCell}>Monthly Rev</Text>
            <Text style={styles.tableHeaderCell}>Annual Rev</Text>
          </View>
          {[
            ['Conservative', '15', '$800', '$12,000', '$144,000'],
            ['Moderate', '30', '$1,000', '$30,000', '$360,000'],
            ['Aggressive', '50', '$1,200', '$60,000', '$720,000'],
            ['Scale', '100', '$1,500', '$150,000', '$1,800,000'],
          ].map((row, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{row[0]}</Text>
              <Text style={styles.tableCell}>{row[1]}</Text>
              <Text style={styles.tableCell}>{row[2]}</Text>
              <Text style={styles.tableCell}>{row[3]}</Text>
              <Text style={{ ...styles.tableCell, fontWeight: 600 }}>{row[4]}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightTitle}>Break-Even Analysis</Text>
            <Text style={styles.highlightText}>
              With an investment of $9,000 and average job value of $1,000, the platform 
              achieves break-even at 9 completed jobs. At 3 jobs per week, ROI is achieved 
              within the first month of operation.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Confidential - Handledly Executive Summary</Text>
          <Text style={styles.pageNumber}>Page 5 of 6</Text>
        </View>
      </Page>

      {/* Page 6: Audit & Launch Readiness */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>Handledly</Text>
          <Text style={styles.pageTitle}>Audit Results & Launch Readiness</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <View style={{ width: 140, alignItems: 'center' }}>
              <PDFProgressRing
                percentage={90}
                size={100}
                strokeWidth={10}
                color={colors.success}
                label="Complete"
              />
              <Text style={{ fontSize: 10, color: colors.slate, marginTop: 8 }}>Launch Readiness</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 20 }}>
              <Text style={styles.sectionTitle}>Audit Scores</Text>
              {auditScores.map((score, index) => (
                <View key={index} style={{ marginBottom: 6 }}>
                  <PDFScoreBar
                    label={score.label}
                    score={score.score}
                    maxScore={10}
                    width={360}
                    color={score.color}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completed Deliverables</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[
              'Full React Application',
              'AI Chat Integration',
              'Voice Agent Setup',
              'Quote Calculator',
              'Admin Dashboard',
              'Lead Management',
              'Email Automation',
              'SMS Notifications',
              'RLS Security',
              'Rate Limiting',
              'SEO Optimization',
              'Mobile Responsive',
            ].map((item, index) => (
              <View key={index} style={styles.checklistItem}>
                <View style={styles.checkIcon} />
                <Text style={styles.checklistText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Items (Client Action Required)</Text>
          <View style={{ gap: 8 }}>
            {[
              'Provide Google Ads Conversion ID',
              'Provide Facebook Pixel ID',
              'Configure ElevenLabs Webhook',
              'Complete DNS Configuration',
              'Approve E2E Testing Schedule',
            ].map((item, index) => (
              <View key={index} style={styles.checklistItem}>
                <View style={styles.pendingIcon} />
                <Text style={styles.checklistText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ ...styles.highlightBox, marginTop: 20 }}>
          <Text style={styles.highlightTitle}>Launch Status: Conditional Go</Text>
          <Text style={styles.highlightText}>
            The platform is 90% complete and ready for launch pending client configuration items. 
            Estimated time to complete remaining items: 2-3 hours with client collaboration.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Confidential - Handledly Executive Summary</Text>
          <Text style={styles.pageNumber}>Page 6 of 6</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ExecutiveSummaryPDF;
