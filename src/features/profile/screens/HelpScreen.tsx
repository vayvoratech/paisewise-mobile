import React, { useState, useMemo } from 'react';
import {
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { FAQS, FAQ_CATEGORIES, SEBI_SCORES_INFO, FaqItem } from '../help.data';
import { FaqAccordionItem } from '../components/FaqAccordionItem';

export default function HelpScreen() {
  const navigation = useNavigation<any>();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | FaqItem['category']>('ALL');
  const [openFaqIds, setOpenFaqIds] = useState<string[]>(['faq-1', 'faq-5']);

  // Filter FAQs based on category & search query
  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCategory =
        selectedCategory === 'ALL' || faq.category === selectedCategory;

      const qLower = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !qLower ||
        faq.question.toLowerCase().includes(qLower) ||
        faq.answer.toLowerCase().includes(qLower) ||
        (faq.highlights && faq.highlights.some((h) => h.toLowerCase().includes(qLower)));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenUrl = async (url: string, title: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported || Platform.OS === 'web') {
        await Linking.openURL(url);
      } else {
        Alert.alert('Unable to open link', `Could not navigate to: ${url}`);
      }
    } catch {
      Alert.alert('Opening Link', `Opening ${title} in browser: ${url}`);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(url, '_blank');
      }
    }
  };

  const handleCallHelpline = (phoneNumber: string) => {
    const cleanNum = phoneNumber.replace(/\s+/g, '');
    const telUrl = `tel:${cleanNum}`;
    if (Platform.OS === 'web') {
      Alert.alert(
        'SEBI Investor Helpline',
        `Toll-Free Helpline: ${phoneNumber}\nHours: ${SEBI_SCORES_INFO.hours}\nCall directly from your mobile device.`
      );
    } else {
      Linking.openURL(telUrl).catch(() => {
        Alert.alert('Helpline', `Please dial: ${phoneNumber}`);
      });
    }
  };

  const handleEmailSupport = (email: string, subject: string) => {
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = mailtoUrl;
    } else {
      Linking.openURL(mailtoUrl).catch(() => {
        Alert.alert('Support Email', `Write to: ${email}`);
      });
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <Text style={styles.headerSubtitle}>FAQ Accordion & SEBI SCORES Portal</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search FAQs, trading rules, DPDP, SEBI..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPills}
        >
          {FAQ_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                style={[styles.catPill, isSelected && styles.catPillActive]}
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(cat.value)}
              >
                <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ======================================================== */}
        {/* SECTION 1: FAQ ACCORDIONS */}
        {/* ======================================================== */}
        <View style={styles.faqSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{filteredFaqs.length} Available</Text>
            </View>
          </View>

          {filteredFaqs.length > 0 ? (
            <View style={styles.faqsList}>
              {filteredFaqs.map((faq) => (
                <FaqAccordionItem
                  key={faq.id}
                  item={faq}
                  isOpen={openFaqIds.includes(faq.id)}
                  onToggle={() => toggleFaq(faq.id)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔎</Text>
              <Text style={styles.emptyTitle}>No matching FAQs found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search query or selecting "All FAQs".
              </Text>
              <TouchableOpacity
                style={styles.resetSearchBtn}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
              >
                <Text style={styles.resetSearchText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ======================================================== */}
        {/* SECTION 2: SEBI SCORES PORTAL & GRIEVANCE REDRESSAL */}
        {/* ======================================================== */}
        <View style={styles.sebiCard}>
          {/* Header Banner */}
          <View style={styles.sebiBanner}>
            <View style={styles.sebiBadge}>
              <Text style={styles.sebiBadgeText}>REGULATORY MECHANISM</Text>
            </View>
            <Text style={styles.sebiTitle}>SEBI SCORES 2.0 Portal</Text>
            <Text style={styles.sebiSubtitle}>
              Securities and Exchange Board of India Complaints Redress System
            </Text>
          </View>

          <View style={styles.sebiBody}>
            <Text style={styles.sebiDesc}>
              SCORES is SEBI's centralized web-based portal facilitating retail investors in lodging grievances against listed companies and market intermediaries.
            </Text>

            {/* Direct Official Link Buttons */}
            <View style={styles.portalButtons}>
              <TouchableOpacity
                style={[styles.portalBtn, styles.primaryPortalBtn]}
                activeOpacity={0.8}
                onPress={() => handleOpenUrl(SEBI_SCORES_INFO.portalUrl, 'SEBI SCORES 2.0')}
              >
                <Text style={styles.primaryPortalBtnText}>🌐 Open SEBI SCORES Portal ↗</Text>
                <Text style={styles.portalUrlSub}>scores.sebi.gov.in</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.portalBtn, styles.secondaryPortalBtn]}
                activeOpacity={0.8}
                onPress={() => handleOpenUrl(SEBI_SCORES_INFO.smartOdrUrl, 'SMART ODR Portal')}
              >
                <Text style={styles.secondaryPortalBtnText}>⚖️ SEBI SMART ODR Platform ↗</Text>
                <Text style={styles.portalUrlSubMuted}>smartodr.in (Dispute Resolution)</Text>
              </TouchableOpacity>
            </View>

            {/* Toll-Free Helpline Box */}
            <View style={styles.helplineBox}>
              <View style={styles.helplineHeader}>
                <Text style={styles.helplineIcon}>📞</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.helplineTitle}>SEBI Toll-Free Investor Helpline</Text>
                  <Text style={styles.helplineSub}>{SEBI_SCORES_INFO.hours}</Text>
                </View>
              </View>

              <View style={styles.helplineNumbers}>
                <TouchableOpacity
                  style={styles.callPill}
                  activeOpacity={0.7}
                  onPress={() => handleCallHelpline(SEBI_SCORES_INFO.tollFreeHelpline1)}
                >
                  <Text style={styles.callPillText}>Call {SEBI_SCORES_INFO.tollFreeHelpline1}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.callPill}
                  activeOpacity={0.7}
                  onPress={() => handleCallHelpline(SEBI_SCORES_INFO.tollFreeHelpline2)}
                >
                  <Text style={styles.callPillText}>Call {SEBI_SCORES_INFO.tollFreeHelpline2}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 3-Step Grievance Escalation Process */}
            <View style={styles.stepperContainer}>
              <Text style={styles.stepperHeading}>Grievance Escalation Process:</Text>
              {SEBI_SCORES_INFO.escalationSteps.map((step) => (
                <View key={step.step} style={styles.stepRow}>
                  <View style={styles.stepNumBox}>
                    <Text style={styles.stepNumText}>{step.step}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <View style={styles.stepTitleRow}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <View style={styles.stepBadge}>
                        <Text style={styles.stepBadgeText}>{step.badge}</Text>
                      </View>
                    </View>
                    <Text style={styles.stepDesc}>{step.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Grievance Redressal Officer Contact */}
            <View style={styles.officerCard}>
              <Text style={styles.officerTitle}>🏛️ PaiseWise Grievance Redressal Officer</Text>
              <Text style={styles.officerDetails}>
                Designation: {SEBI_SCORES_INFO.grievanceOfficer.designation}
              </Text>
              <Text style={styles.officerDetails}>
                Company: {SEBI_SCORES_INFO.grievanceOfficer.company}
              </Text>
              <Text style={styles.officerDetails}>
                Turnaround Time: {SEBI_SCORES_INFO.grievanceOfficer.tat}
              </Text>

              <View style={styles.officerActionRow}>
                <TouchableOpacity
                  style={styles.officerBtn}
                  activeOpacity={0.8}
                  onPress={() =>
                    handleEmailSupport(
                      SEBI_SCORES_INFO.grievanceOfficer.email,
                      'Investor Grievance Redressal Request'
                    )
                  }
                >
                  <Text style={styles.officerBtnText}>✉️ Email Grievance Officer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.officerBtn, styles.supportBtn]}
                  activeOpacity={0.8}
                  onPress={() =>
                    handleEmailSupport(
                      SEBI_SCORES_INFO.grievanceOfficer.supportEmail,
                      'PaiseWise App Inquiry'
                    )
                  }
                >
                  <Text style={styles.supportBtnText}>💬 General Support</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Footer info */}
        <View style={styles.footerWrap}>
          <Text style={styles.footerText}>
            PaiseWise FinTech • Education & Simulated Virtual Trading
          </Text>
          <Text style={styles.footerLegal}>
            In compliance with SEBI Investor Charter & DPDP Act 2023 regulations.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  backArrow: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 20,
    color: colors.text,
    fontWeight: '800',
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
    gap: spacing.lg,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    fontSize: 14,
    color: colors.text,
  },
  clearSearch: {
    fontSize: 16,
    color: colors.textMuted,
    paddingHorizontal: spacing.xs,
  },
  categoryPills: {
    gap: spacing.sm,
    paddingVertical: 2,
  },
  catPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catPillActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  catPillText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textMuted,
  },
  catPillTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  faqSection: {
    gap: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  countBadge: {
    backgroundColor: colors.indigoChip,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.purple,
  },
  faqsList: {
    gap: 2,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.text,
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  resetSearchBtn: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetSearchText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.purple,
  },
  sebiCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sebiBanner: {
    backgroundColor: '#1E3A8A',
    padding: spacing.lg,
  },
  sebiBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  sebiBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  sebiTitle: {
    ...typography.h2,
    fontSize: 20,
    color: colors.white,
    fontWeight: '800',
  },
  sebiSubtitle: {
    ...typography.caption,
    color: '#93C5FD',
    marginTop: 2,
  },
  sebiBody: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  sebiDesc: {
    ...typography.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  portalButtons: {
    gap: spacing.sm,
  },
  portalBtn: {
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryPortalBtn: {
    backgroundColor: '#2563EB',
  },
  primaryPortalBtnText: {
    ...typography.bodyBold,
    color: colors.white,
    fontSize: 15,
  },
  portalUrlSub: {
    fontSize: 11,
    color: '#BFDBFE',
    marginTop: 2,
  },
  secondaryPortalBtn: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  secondaryPortalBtnText: {
    ...typography.bodyBold,
    color: '#1E40AF',
    fontSize: 14,
  },
  portalUrlSubMuted: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  helplineBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  helplineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  helplineIcon: {
    fontSize: 22,
  },
  helplineTitle: {
    ...typography.caption,
    fontWeight: '800',
    color: '#0369A1',
  },
  helplineSub: {
    fontSize: 10,
    color: '#0284C7',
    marginTop: 1,
  },
  helplineNumbers: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  callPill: {
    flex: 1,
    backgroundColor: '#0284C7',
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  callPillText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.white,
    fontSize: 12,
  },
  stepperContainer: {
    gap: spacing.sm,
  },
  stepperHeading: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stepNumBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  stepContent: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  stepTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text,
  },
  stepBadge: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  stepBadgeText: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '700',
  },
  stepDesc: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },
  officerCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  officerTitle: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  officerDetails: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
  },
  officerActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  officerBtn: {
    flex: 1,
    backgroundColor: colors.navy,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  officerBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  supportBtn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  supportBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  footerWrap: {
    alignItems: 'center',
    gap: 4,
    paddingTop: spacing.sm,
  },
  footerText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text,
  },
  footerLegal: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
