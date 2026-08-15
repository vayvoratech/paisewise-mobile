import React, { useState, useRef, useEffect } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Button } from '../../../shared/ui/Button';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';
import { GOALS } from '../goals.data';
import { setGoal, setLanguage } from '../slices/authSlice';
import { RootState } from '../../../app/store';
import mixpanel from '@core/mixpanel'; // Import mixpanel instance

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'as', name: 'অসমীয়া (Assamese)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'brx', name: 'बड़ो (Bodo)' },
  { code: 'doi', name: 'डोगरी (Dogri)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ks', name: 'कश्मीरी (Kashmiri)' },
  { code: 'kok', name: 'कोंकणी (Konkani)' },
  { code: 'mai', name: 'मैथिली (Maithili)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'mni', name: 'മണിപ്പൂരി (Manipuri)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'ne', name: 'नेपाली (Nepali)' },
  { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'sa', name: 'संस्कृतम् (Sanskrit)' },
  { code: 'sat', name: 'संथाली (Santali)' },
  { code: 'sd', name: 'सिंधी (Sindhi)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'ur', name: 'उर्दू (Urdu)' }
];

export default function OnboardingScreen({ navigation }: Props) {
  const dispatch = useDispatch();
  
  // Sourced from Redux with local overrides before final save
  const reduxLang = useSelector((state: RootState) => state.auth.language) || 'English';
  const reduxGoal = useSelector((state: RootState) => state.auth.goal) || 'learn';
  
  const [selectedLang, setSelectedLang] = useState(reduxLang);
  const [selectedGoal, setSelectedGoal] = useState(reduxGoal);
  const [activeIndex, setActiveIndex] = useState(0);
  const [langModalVisible, setLangModalVisible] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const stepStartTimeRef = useRef<number>(Date.now());

  const slides = [
    {
      id: 'welcome',
      title: 'Welcome to PaiseWise',
      titleHi: 'पैसेवाइज़ में आपका स्वागत है',
      desc: 'Your companion to learn smart financial and investing decisions. Start your journey today!',
      descHi: 'वित्तीय और निवेश के स्मार्ट निर्णय सीखने के लिए आपका साथी। आज ही अपनी यात्रा शुरू करें!',
      emoji: '🏛️',
      bullets: [
        { emoji: '💡', text: 'Learn mutual funds, stock market, and SIPs', textHi: 'म्यूचुअल फंड, शेयर बाजार और एसआईपी सीखें' },
        { emoji: '🎮', text: 'Play interactive quizzes and test concepts', textHi: 'क्विज़ खेलें और कॉन्सेप्ट्स का परीक्षण करें' },
        { emoji: '🇮🇳', text: 'Hindi first interface customized for you', textHi: 'आपके लिए अनुकूलित हिंदी प्रथम इंटरफ़ेस' }
      ]
    },
    {
      id: 'learn',
      title: 'Bite-Sized Lessons',
      titleHi: 'लघु पाठ और सीख',
      desc: 'Understand complex financial topics, play daily quizzes, and get rewards as you level up your knowledge.',
      descHi: 'जटिल वित्तीय विषयों को समझें, दैनिक क्विज़ खेलें, और अपने ज्ञान को बढ़ाते हुए पुरस्कार प्राप्त करें।',
      emoji: '📚',
      bullets: [
        { emoji: '📝', text: 'Simple bite-sized lessons with Hinglish translation support', textHi: 'हिंग्लिश अनुवाद सहायता के साथ सरल लघु पाठ' },
        { emoji: '🏅', text: 'Earn XP and collect premium badges as you study', textHi: 'पढ़ते समय एक्सपी कमाएं और प्रीमियम बैज एकत्र करें' },
        { emoji: '📖', text: 'Jargon Buster tool to explain hard terms instantly', textHi: 'कठिन शब्दों को तुरंत समझाने के लिए जारगन बस्टर टूल' }
      ]
    },
    {
      id: 'practice',
      title: 'Practice Paper Trading',
      titleHi: 'पेपर ट्रेडिंग का अभ्यास',
      desc: 'Test your stock trading strategies in real time with virtual money without any real-world risk.',
      descHi: 'बिना किसी वास्तविक जोखिम के आभासी धन के साथ वास्तविक समय में अपनी स्टॉक ट्रेडिंग रणनीतियों का परीक्षण करें।',
      emoji: '📈',
      bullets: [
        { emoji: '💰', text: 'Start with virtual cash balance of ₹1,00,000', textHi: '₹1,00,000 के आभासी नकद बैलेंस के साथ शुरुआत करें' },
        { emoji: '⚡', text: 'Real-time order simulation matching active market', textHi: 'सक्रिय बाजार से मेल खाने वाला रीयल-टाइम ऑर्डर सिमुलेशन' },
        { emoji: '🛡️', text: 'Learn and fail safely before committing actual money', textHi: 'वास्तविक धन लगाने से पहले सुरक्षित रूप से सीखें और असफल हों' }
      ]
    },
    {
      id: 'track',
      title: 'Track Portfolio & Insights',
      titleHi: 'पोर्टफोलियो और समुदाय',
      desc: 'Review clear, plain-English P&L summaries of your virtual holdings and connect with a helpful community.',
      descHi: 'अपनी आभासी होल्डिंग्स के स्पष्ट पीएंडएल सारांश की समीक्षा करें और मददगार समुदाय से जुड़ें।',
      emoji: '💼',
      bullets: [
        { emoji: '📊', text: 'Track net holdings valuation and daily P&L return metrics', textHi: 'नेट होल्डिंग्स वैल्यूएशन और दैनिक पीएंडएल रिटर्न मेट्रिक्स को ट्रैक करें' },
        { emoji: '🤝', text: 'Discuss questions and trade ideas on community boards', textHi: 'कम्युनिटी बोर्ड पर प्रश्नों और ट्रेड विचारों पर चर्चा करें' },
        { emoji: '🔒', text: 'Secure transaction logs ledger database tracking entries', textHi: 'सुरक्षित लेनदेन लॉग लेजर डेटाबेस प्रविष्टियों को ट्रैक करता है' }
      ]
    },
    {
      id: 'goal',
      title: 'Select Your Goal',
      titleHi: 'अपना निवेश लक्ष्य चुनें',
      desc: 'We will personalize your customized learning path and dictionary terms based on your selection.',
      descHi: 'हम आपके चयन के आधार पर आपके कस्टमाइज़्ड लर्निंग पाथ और डिक्शनरी टर्म्स को कस्टमाइज़ करेंगे।',
      emoji: '🎯',
      bullets: []
    }
  ];

  // Track onboarding_started on initial mount
  useEffect(() => {
    mixpanel.track('onboarding_started', {
      total_steps: slides.length,
    });
    stepStartTimeRef.current = Date.now();
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(xOffset / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < slides.length) {
      trackStepCompletion(activeIndex);
      setActiveIndex(index);
      stepStartTimeRef.current = Date.now(); // Reset timer for new step
    }
  };

  const trackStepCompletion = (completedIndex: number) => {
    const currentSlide = slides[completedIndex];
    const timeSpentSeconds = Math.round((Date.now() - stepStartTimeRef.current) / 1000);

    mixpanel.track('onboarding_step_completed', {
      step_number: completedIndex + 1,
      step_name: currentSlide.id,
      time_spent_seconds: timeSpentSeconds,
    });
  };

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      trackStepCompletion(activeIndex);
      const nextIndex = activeIndex + 1;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true
      });
      setActiveIndex(nextIndex);
      stepStartTimeRef.current = Date.now();
    } else {
      // Last slide step completion + final submit
      trackStepCompletion(activeIndex);
      onSubmit();
    }
  };

  const onSubmit = () => {
    dispatch(setLanguage(selectedLang));
    dispatch(setGoal(selectedGoal));
    navigation.replace('MainTabs', { screen: 'Home' });
  };

  const handleLanguageChange = (langName: string) => {
    setSelectedLang(langName);
    setLangModalVisible(false);

    // Track language selection
    mixpanel.track('language_selected', {
      language_code: langName,
    });
  };

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);

    // Track goal selection
    mixpanel.track('goal_selected', {
      goal_id: goalId,
    });
  };

  const renderSlide = ({ item, index }: { item: typeof slides[0]; index: number }) => {
    const isHindi = selectedLang === 'हिन्दी (Hindi)';
    const titleText = isHindi ? item.titleHi : item.title;
    const descText = isHindi ? item.descHi : item.desc;
    
    return (
      <View style={styles.slideContainer}>
        <View style={styles.slideHeader}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>
        
        <View style={styles.slideBody}>
          <Text style={styles.title}>{titleText}</Text>
          <Text style={styles.desc}>{descText}</Text>

          {/* Detailed Bullet Highlights */}
          {item.bullets && item.bullets.length > 0 && (
            <View style={styles.bulletsContainer}>
              {item.bullets.map((b, i) => {
                const bulletText = isHindi ? b.textHi : b.text;
                return (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bulletEmoji}>{b.emoji}</Text>
                    <Text style={styles.bulletText}>{bulletText}</Text>
                  </View>
                );
              })}
            </View>
          )}
          
          {/* Welcome Screen Interactive Language Dropdown */}
          {item.id === 'welcome' && (
            <View style={styles.languageContainer}>
              <Text style={styles.pickerLabel}>
                {isHindi ? 'अपनी भाषा चुनें / Select Language:' : 'Select Language / अपनी भाषा चुनें:'}
              </Text>
              <TouchableOpacity
                style={styles.dropdown}
                activeOpacity={0.8}
                onPress={() => setLangModalVisible(true)}
              >
                <Text style={styles.dropdownText}>{selectedLang}</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Goal Setup interactive cards on the last slide */}
          {item.id === 'goal' && (
            <ScrollView 
              style={styles.goalsList} 
              contentContainerStyle={styles.goalsContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {GOALS.map((g) => {
                const active = selectedGoal === g.id;
                return (
                  <TouchableOpacity
                    key={g.id}
                    activeOpacity={0.85}
                    onPress={() => handleGoalSelect(g.id)}
                    style={[styles.option, active && styles.optionActive]}
                  >
                    <Text style={styles.optionEmoji}>{g.emoji}</Text>
                    <View style={styles.optionText}>
                      <Text style={styles.optionTitle}>{g.title}</Text>
                      <Text style={styles.optionSub}>{g.subtitle}</Text>
                    </View>
                    <View style={[styles.radio, active && styles.radioActive]}>
                      {active && <Text style={styles.radioCheck}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    );
  };

  const isHindi = selectedLang === 'हिन्दी (Hindi)';

  return (
    <HeroBackground tone="navy">
      <SafeAreaView style={styles.safe}>
        
        {/* Top Header Row with Skip Button */}
        <View style={styles.topRow}>
          <Text style={styles.logoName}>PaiseWise</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={onSubmit} style={styles.skipButton}>
            <Text style={styles.skipText}>{isHindi ? 'छोड़ें (Skip)' : 'Skip'}</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          getItemLayout={(data, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          keyExtractor={(item) => item.id}
          style={styles.flatList}
        />

        {/* Footer Navigation Bar */}
        <View style={styles.footer}>
          {/* Dot Indicators */}
          <View style={styles.dotsContainer}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === activeIndex ? styles.dotActive : styles.dotInactive
                ]}
              />
            ))}
          </View>

          {/* Action Button */}
          <View style={styles.btnWrapper}>
            <Button
              label={
                activeIndex === slides.length - 1
                  ? isHindi ? 'शुरू करें (Get Started)' : 'Get Started'
                  : isHindi ? 'अगला (Next)  →' : 'Next  →'
              }
              variant="gradientAmber"
              onPress={handleNext}
            />
          </View>
        </View>

        {/* Custom Custom Language Selection Modal Dropdown */}
        <Modal
          visible={langModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setLangModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose Language</Text>
                <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScroll}>
                {LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.langItem,
                      selectedLang === lang.name && styles.langItemActive
                    ]}
                    onPress={() => handleLanguageChange(lang.name)}
                  >
                    <Text style={[
                      styles.langText,
                      selectedLang === lang.name && styles.langTextActive
                    ]}>
                      {lang.name}
                    </Text>
                    {selectedLang === lang.name && <Text style={styles.langCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </HeroBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  logoName: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  skipText: {
    ...typography.caption,
    color: colors.textMutedDark,
    fontWeight: '600',
  },
  flatList: { flex: 1 },
  slideContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  slideHeader: {
    height: '25%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: { fontSize: 80 },
  slideBody: {
    width: SCREEN_WIDTH - (spacing.xl * 2),
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  desc: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  // Language styling
  languageContainer: {
    width: '100%',
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  pickerLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  dropdownText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  dropdownArrow: {
    color: colors.textMuted,
    fontSize: 12,
  },
  // Goals list styling
  goalsList: {
    width: '100%',
    flex: 1,
  },
  goalsContent: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionActive: {
    backgroundColor: colors.yellowCard,
    borderColor: colors.amber,
  },
  optionEmoji: { fontSize: 24, marginRight: spacing.md },
  optionText: { flex: 1 },
  optionTitle: { ...typography.bodyBold, color: colors.text, fontSize: 14 },
  optionSub: { ...typography.caption, color: colors.textMuted, marginTop: 2, fontSize: 11 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    backgroundColor: colors.amber,
    borderColor: colors.amber,
  },
  radioCheck: { color: colors.white, fontWeight: '800', fontSize: 10 },
  continue: { marginTop: spacing.md },
  // Footer pagination & button styling
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.amber,
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  btnWrapper: {
    width: '100%',
  },
  // Modal languages selection styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    height: '60%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  modalClose: {
    fontSize: 20,
    color: colors.textMuted,
    padding: spacing.xs,
  },
  modalScroll: { flex: 1 },
  langItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  langItemActive: {
    backgroundColor: 'rgba(255, 191, 0, 0.08)',
  },
  langText: {
    ...typography.body,
    color: colors.text,
  },
  langTextActive: {
    fontWeight: '700',
    color: colors.amber,
  },
  langCheck: {
    color: colors.amber,
    fontWeight: '800',
    fontSize: 16,
  },
  bulletsContainer: {
    width: '100%',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    width: '100%',
  },
  bulletEmoji: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  bulletText: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  }
});