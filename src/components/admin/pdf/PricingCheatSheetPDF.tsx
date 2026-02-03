import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Brand colors
const NAVY = '#1E3A5F';
const GOLD = '#F9B233';
const WHITE = '#FFFFFF';
const LIGHT_GRAY = '#F5F5F5';
const DARK_GRAY = '#333333';
const WARNING_BG = '#FFF3CD';

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    backgroundColor: WHITE,
  },
  header: {
    backgroundColor: NAVY,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: WHITE,
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
  },
  headerSubtitle: {
    color: GOLD,
    fontSize: 10,
  },
  pageTitle: {
    color: NAVY,
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 15,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  column: {
    flex: 1,
  },
  sectionTitle: {
    backgroundColor: NAVY,
    color: WHITE,
    padding: 8,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 0,
  },
  table: {
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableRowAlt: {
    backgroundColor: LIGHT_GRAY,
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
    flex: 1,
  },
  tableCellBold: {
    padding: 8,
    fontSize: 10,
    flex: 1,
    fontFamily: 'Helvetica-Bold',
  },
  priceCell: {
    padding: 8,
    fontSize: 10,
    flex: 1,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
  },
  ironLawBox: {
    backgroundColor: WARNING_BG,
    borderWidth: 2,
    borderColor: GOLD,
    padding: 15,
    marginTop: 20,
  },
  ironLawTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 8,
    textAlign: 'center',
  },
  ironLawText: {
    fontSize: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  ironLawBold: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginVertical: 8,
  },
  ironLawTriggers: {
    fontSize: 9,
    color: DARK_GRAY,
    textAlign: 'center',
    marginTop: 5,
  },
  notIronLaw: {
    backgroundColor: '#E8F5E9',
    padding: 8,
    marginTop: 10,
    textAlign: 'center',
  },
  notIronLawText: {
    fontSize: 9,
    color: '#2E7D32',
    fontFamily: 'Helvetica-Bold',
  },
  specialtySection: {
    marginBottom: 15,
  },
  flatFeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  flatFeeRowAlt: {
    backgroundColor: LIGHT_GRAY,
  },
  flatFeeLabel: {
    fontSize: 9,
  },
  flatFeePrice: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
  },
  hourlyNote: {
    backgroundColor: NAVY,
    padding: 6,
    marginTop: 0,
  },
  hourlyNoteText: {
    color: WHITE,
    fontSize: 8,
    textAlign: 'center',
  },
  quickRefSection: {
    marginBottom: 15,
  },
  quickRefTitle: {
    backgroundColor: NAVY,
    color: WHITE,
    padding: 6,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 5,
  },
  bullet: {
    width: 15,
    fontSize: 9,
  },
  bulletText: {
    fontSize: 9,
    flex: 1,
  },
  checkItem: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingLeft: 5,
  },
  checkMark: {
    width: 15,
    fontSize: 9,
    color: '#2E7D32',
  },
  checkText: {
    fontSize: 8,
    flex: 1,
  },
  scriptBox: {
    backgroundColor: LIGHT_GRAY,
    padding: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
  },
  scriptTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 3,
  },
  scriptText: {
    fontSize: 7,
    fontStyle: 'italic',
    color: DARK_GRAY,
  },
  neverDoBox: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#C62828',
    padding: 10,
    marginTop: 10,
  },
  neverDoTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#C62828',
    marginBottom: 5,
  },
  neverDoItem: {
    fontSize: 8,
    marginBottom: 2,
    color: DARK_GRAY,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: DARK_GRAY,
  },
  footerVersion: {
    fontSize: 8,
    color: NAVY,
    fontFamily: 'Helvetica-Bold',
  },
  poolTableSection: {
    marginBottom: 15,
  },
  poolTableHeader: {
    backgroundColor: '#2E7D32',
    color: WHITE,
    padding: 8,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  poolTableNote: {
    backgroundColor: '#E8F5E9',
    padding: 6,
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  poolTableNoteText: {
    fontSize: 8,
    color: '#2E7D32',
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
  },
});

// Page 1: Core Pricing
const CorePricingPage = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>HANDLEDLY PRICING</Text>
        <Text style={styles.headerSubtitle}>Crew Reference Sheet</Text>
      </View>
      <Text style={styles.headerSubtitle}>Version 4.0 • February 2026</Text>
    </View>

    <Text style={styles.pageTitle}>Core Pricing Rates</Text>

    <View style={styles.twoColumn}>
      {/* Labor Only */}
      <View style={styles.column}>
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>LABOR ONLY (No Truck)</Text>
          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={styles.tableCellBold}>Crew Size</Text>
            <Text style={styles.priceCell}>Hourly Rate</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>2 Movers</Text>
            <Text style={styles.priceCell}>$139/hr</Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={styles.tableCell}>3 Movers</Text>
            <Text style={styles.priceCell}>$169/hr</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>4 Movers</Text>
            <Text style={styles.priceCell}>$239/hr</Text>
          </View>
        </View>
      </View>

      {/* Moving with Truck */}
      <View style={styles.column}>
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>MOVING WITH TRUCK</Text>
          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={styles.tableCellBold}>Crew + Truck</Text>
            <Text style={styles.priceCell}>Hourly Rate</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>2 Movers + Truck</Text>
            <Text style={styles.priceCell}>$159/hr</Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={styles.tableCell}>3 Movers + Truck</Text>
            <Text style={styles.priceCell}>$189/hr</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>4 Movers + Truck</Text>
            <Text style={styles.priceCell}>$259/hr</Text>
          </View>
        </View>
      </View>
    </View>

    {/* Iron Law Box */}
    <View style={styles.ironLawBox}>
      <Text style={styles.ironLawTitle}>⚠️ 200LB IRON LAW ⚠️</Text>
      <Text style={styles.ironLawText}>
        Any item weighing 200+ pounds requires MINIMUM 3 MOVERS
      </Text>
      <Text style={styles.ironLawBold}>
        WITH TRUCK: $189/hr • LABOR-ONLY: $179/hr
      </Text>
      <Text style={styles.ironLawTriggers}>
        Triggers: Piano (any type) • Gun Safe • Safe 200+ lbs
      </Text>
      <View style={styles.notIronLaw}>
        <Text style={styles.notIronLawText}>
          ✓ POOL TABLE is NOT Iron Law → $169/hr with 2-3 movers
        </Text>
      </View>
    </View>

    {/* Footer */}
    <View style={styles.footer}>
      <Text style={styles.footerText}>Handledly Moving • Colorado</Text>
      <Text style={styles.footerText}>Page 1 of 3</Text>
      <Text style={styles.footerVersion}>HD-XXXXX Quote Format</Text>
    </View>
  </Page>
);

// Page 2: Specialty Items
const SpecialtyItemsPage = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>SPECIALTY ITEMS</Text>
        <Text style={styles.headerSubtitle}>Flat Fees + Hourly Rates</Text>
      </View>
      <Text style={styles.headerSubtitle}>Version 4.0 • February 2026</Text>
    </View>

    <View style={styles.twoColumn}>
      {/* Piano Moving */}
      <View style={styles.column}>
        <View style={styles.specialtySection}>
          <Text style={styles.sectionTitle}>🎹 PIANO MOVING</Text>
          <View style={styles.flatFeeRow}>
            <Text style={styles.flatFeeLabel}>Upright Piano</Text>
            <Text style={styles.flatFeePrice}>$150 flat</Text>
          </View>
          <View style={[styles.flatFeeRow, styles.flatFeeRowAlt]}>
            <Text style={styles.flatFeeLabel}>Baby Grand Piano</Text>
            <Text style={styles.flatFeePrice}>$250 flat</Text>
          </View>
          <View style={styles.flatFeeRow}>
            <Text style={styles.flatFeeLabel}>Grand Piano</Text>
            <Text style={styles.flatFeePrice}>$350 flat</Text>
          </View>
          <View style={styles.hourlyNote}>
            <Text style={styles.hourlyNoteText}>
              All Pianos @ $189/hr (Iron Law - 3 movers min)
            </Text>
          </View>
        </View>

        {/* Safe Moving */}
        <View style={styles.specialtySection}>
          <Text style={styles.sectionTitle}>🔐 SAFE MOVING</Text>
          <View style={styles.flatFeeRow}>
            <Text style={styles.flatFeeLabel}>Small Safe (&lt;200 lbs)</Text>
            <Text style={styles.flatFeePrice}>$100 flat</Text>
          </View>
          <View style={[styles.flatFeeRow, styles.flatFeeRowAlt]}>
            <Text style={styles.flatFeeLabel}>Medium Safe (200-500 lbs)</Text>
            <Text style={styles.flatFeePrice}>$175 flat</Text>
          </View>
          <View style={styles.flatFeeRow}>
            <Text style={styles.flatFeeLabel}>Large Safe (500+ lbs)</Text>
            <Text style={styles.flatFeePrice}>$250 flat</Text>
          </View>
          <View style={styles.hourlyNote}>
            <Text style={styles.hourlyNoteText}>
              Safes 200+ lbs @ $189/hr (Iron Law - 3 movers min)
            </Text>
          </View>
        </View>
      </View>

      {/* Pool Table & Other */}
      <View style={styles.column}>
        {/* Pool Table - NOT Iron Law */}
        <View style={styles.poolTableSection}>
          <Text style={styles.poolTableHeader}>🎱 POOL TABLE (NOT IRON LAW!)</Text>
          <View style={styles.flatFeeRow}>
            <Text style={styles.flatFeeLabel}>Move Only (assembled)</Text>
            <Text style={styles.flatFeePrice}>$350 flat</Text>
          </View>
          <View style={[styles.flatFeeRow, styles.flatFeeRowAlt]}>
            <Text style={styles.flatFeeLabel}>Full Service (disassemble/reassemble)</Text>
            <Text style={styles.flatFeePrice}>$550 flat</Text>
          </View>
          <View style={styles.poolTableNote}>
            <Text style={styles.poolTableNoteText}>
              Pool Tables @ $169/hr with 2-3 movers
            </Text>
            <Text style={[styles.poolTableNoteText, { marginTop: 3, fontSize: 7 }]}>
              Specialized handling - does NOT trigger Iron Law
            </Text>
          </View>
        </View>

        {/* Other Specialty Items */}
        <View style={styles.specialtySection}>
          <Text style={styles.sectionTitle}>📦 OTHER SPECIALTY ITEMS</Text>
          <View style={styles.flatFeeRow}>
            <Text style={styles.flatFeeLabel}>Gym Equipment (per piece)</Text>
            <Text style={styles.flatFeePrice}>$125 flat</Text>
          </View>
          <View style={[styles.flatFeeRow, styles.flatFeeRowAlt]}>
            <Text style={styles.flatFeeLabel}>Motorcycle</Text>
            <Text style={styles.flatFeePrice}>$200 flat</Text>
          </View>
          <View style={styles.hourlyNote}>
            <Text style={styles.hourlyNoteText}>
              Specialty items = Final pricing verified by staff
            </Text>
          </View>
        </View>
      </View>
    </View>

    {/* Fees & Discounts */}
    <View style={[styles.specialtySection, { marginTop: 10 }]}>
      <Text style={styles.sectionTitle}>💵 FEES & DISCOUNTS</Text>
      <View style={styles.twoColumn}>
        <View style={styles.column}>
          <View style={styles.flatFeeRow}>
            <Text style={styles.flatFeeLabel}>Electronic Payment Fee</Text>
            <Text style={styles.flatFeePrice}>+$5</Text>
          </View>
        </View>
        <View style={styles.column}>
          <View style={styles.flatFeeRow}>
            <Text style={styles.flatFeeLabel}>Negotiation Discount (hesitant customers)</Text>
            <Text style={[styles.flatFeePrice, { color: '#2E7D32' }]}>-$10</Text>
          </View>
        </View>
      </View>
    </View>

    {/* Footer */}
    <View style={styles.footer}>
      <Text style={styles.footerText}>Handledly Moving • Colorado</Text>
      <Text style={styles.footerText}>Page 2 of 3</Text>
      <Text style={styles.footerVersion}>HD-XXXXX Quote Format</Text>
    </View>
  </Page>
);

// Page 3: Quick Reference
const QuickReferencePage = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>QUICK REFERENCE</Text>
        <Text style={styles.headerSubtitle}>Crew Sizing & Scripts</Text>
      </View>
      <Text style={styles.headerSubtitle}>Version 4.0 • February 2026</Text>
    </View>

    <View style={styles.twoColumn}>
      {/* Crew Sizing */}
      <View style={styles.column}>
        <View style={styles.quickRefSection}>
          <Text style={styles.quickRefTitle}>👥 CREW SIZING GUIDE</Text>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Studio / 1 BDR → 2 movers + truck</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>2 BDR → 2-3 movers + truck</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>3 BDR → 3 movers + truck</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>4+ BDR → 4 movers + truck</Text>
          </View>
          <View style={[styles.bulletItem, { marginTop: 5 }]}>
            <Text style={styles.bullet}>⚠️</Text>
            <Text style={[styles.bulletText, { fontFamily: 'Helvetica-Bold' }]}>
              200lb+ item → 3+ movers (Iron Law)
            </Text>
          </View>
        </View>

        {/* What's Included */}
        <View style={styles.quickRefSection}>
          <Text style={styles.quickRefTitle}>✓ WHAT'S INCLUDED</Text>
          <View style={styles.checkItem}>
            <Text style={styles.checkMark}>✓</Text>
            <Text style={styles.checkText}>Crew, truck, fuel, mileage</Text>
          </View>
          <View style={styles.checkItem}>
            <Text style={styles.checkMark}>✓</Text>
            <Text style={styles.checkText}>Moving blankets, straps, dollies</Text>
          </View>
          <View style={styles.checkItem}>
            <Text style={styles.checkMark}>✓</Text>
            <Text style={styles.checkText}>Basic disassembly/reassembly</Text>
          </View>
          <View style={styles.checkItem}>
            <Text style={styles.checkMark}>✓</Text>
            <Text style={[styles.checkText, { fontFamily: 'Helvetica-Bold' }]}>
              NO stair fees, NO elevator fees
            </Text>
          </View>
          <View style={styles.checkItem}>
            <Text style={styles.checkMark}>✓</Text>
            <Text style={styles.checkText}>Free 2nd truck if addresses nearby</Text>
          </View>
        </View>
      </View>

      {/* Scripts */}
      <View style={styles.column}>
        <View style={styles.quickRefSection}>
          <Text style={styles.quickRefTitle}>💬 KEY SCRIPTS</Text>
          
          <View style={styles.scriptBox}>
            <Text style={styles.scriptTitle}>Price Objection:</Text>
            <Text style={styles.scriptText}>
              "That rate covers your full crew, our truck and fuel, all moving blankets 
              and straps—no hidden fees."
            </Text>
          </View>

          <View style={styles.scriptBox}>
            <Text style={styles.scriptTitle}>Iron Law Explanation:</Text>
            <Text style={styles.scriptText}>
              "For items over 200 pounds—like pianos and gun safes—we require a 
              three-person crew at $189/hr. This protects your item, our team, 
              and your property."
            </Text>
          </View>

          <View style={styles.scriptBox}>
            <Text style={styles.scriptTitle}>Competitor Comparison:</Text>
            <Text style={styles.scriptText}>
              "We set the crew size correctly upfront so you're not surprised on 
              move day. Some companies quote 2 movers knowing they'll need 3."
            </Text>
          </View>
        </View>
      </View>
    </View>

    {/* Never Do Box */}
    <View style={styles.neverDoBox}>
      <Text style={styles.neverDoTitle}>🚫 NEVER DO</Text>
      <View style={styles.twoColumn}>
        <View style={styles.column}>
          <Text style={styles.neverDoItem}>• Send 2 movers for 200lb+ items</Text>
          <Text style={styles.neverDoItem}>• Skip the heavy-item probe question</Text>
          <Text style={styles.neverDoItem}>• Promise labor-only for Iron Law items</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.neverDoItem}>• Quote pool tables at Iron Law rate</Text>
          <Text style={styles.neverDoItem}>• Discount below posted minimums</Text>
          <Text style={styles.neverDoItem}>• Add stair/elevator fees</Text>
        </View>
      </View>
    </View>

    {/* Footer */}
    <View style={styles.footer}>
      <Text style={styles.footerText}>Handledly Moving • (720) 907-2174</Text>
      <Text style={styles.footerText}>Page 3 of 3</Text>
      <Text style={styles.footerVersion}>Print • Laminate • Keep with Crew</Text>
    </View>
  </Page>
);

// Main Document
const PricingCheatSheetPDF: React.FC = () => (
  <Document>
    <CorePricingPage />
    <SpecialtyItemsPage />
    <QuickReferencePage />
  </Document>
);

export default PricingCheatSheetPDF;

