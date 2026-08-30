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
import { useDispatch } from 'react-redux';
import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Button } from '../../../shared/ui/Button';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';
import { GOALS } from '../goals.data';
import { setGoal, setLanguage } from '../slices/authSlice';
import mixpanel from '@core/mixpanel'; // Import mixpanel instance

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'as', name: 'অસમীয়া (Assamese)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'brx', name: 'बड़ो (Bodo)' },
  { code: 'doi', name: 'डोगरी (Dogri)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ks', name: 'कश्मीरी (Kashmiri)' },
  { code: 'kok', name: 'कोंकणी (Konkani)' },
  { code: 'mai', name: 'मैथिली (Maithili)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'mni', name: 'മணிപ്പൂരി (Manipuri)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'ne', name: 'नेपाली (Nepali)' },
  { code: 'or', name: 'ଓଡ଼ିआ (Odia)' },
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedLang, setSelectedLang] = useState('English');
  const [selectedGoal, setSelectedGoal] = useState('learn');
  const [langModalVisible, setLangModalVisible] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const stepStartTimeRef = useRef<number>(Date.now());

  const slides = [
    {
      id: 'welcome',
      title: 'Welcome to PaiseWise',
      titleHi: 'पैसेवाइज़ में आपका स्वागत है',
      desc: 'Your companion to learn smart financial and investing decisions. Start your journey today!',
      descHi: 'वित्तीय and निवेश के स्मार्ट निर्णय सीखने के लिए आपका साथी। आज ही अपनी यात्रा शुरू करें!',
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
        { emoji: '💰', text: 'Start with ₹1,00,000 virtual balance to trade', textHi: 'ट्रेडिंग के लिए ₹1,00,000 आभासी शेष राशि से शुरू करें' },
        { emoji: '⚡', text: 'Real-time NSE market stock quotes feed', textHi: 'वास्तविक समय एनएसई बाजार स्टॉक कोट्स फ़ीड' },
        { emoji: '📊', text: 'Analyze charts and track your virtual portfolio PnL', textHi: 'चार्ट का विश्लेषण करें और अपने आभासी पोर्टफोलियो पीएनएल को ट्रैक करें' }
      ]
    },
    {
      id: 'community',
      title: 'Active Community',
      titleHi: 'सक्रिय समुदाय',
      desc: 'Discuss strategies with fellow learners, ask doubts, and share progress updates on the social board.',
      descHi: 'साथी शिक्षार्थियों के साथ रणनीतियों पर चर्चा करें, संदेह पूछें, और सोशल बोर्ड पर प्रगति साझा करें।',
      emoji: '👥',
      bullets: [
        { emoji: '💬', text: 'Post queries and get answers from experts', textHi: 'प्रश्न पोस्ट करें और विशेषज्ञों से उत्तर प्राप्त करें' },
        { emoji: '🤝', text: 'Share your paper trading success badges', textHi: 'अपने पेपर ट्रेडिंग सफलता बैज साझा करें' },
        { emoji: '🔥', text: 'Maintain learning streaks and compete on leaderboards', textHi: 'सीखने के सिलसिले को बनाए रखें और लीडरबोर्ड पर प्रतिस्पर्धा करें' }
      ]
    },
    {
      id: 'preferences',
      title: 'Choose Preferences',
      titleHi: 'अपनी प्राथमिकताएं चुनें',
      desc: 'Customize your language and learning goal to begin your personalized financial school journey.',
      descHi: 'अपनी व्यक्तिगत वित्तीय स्कूल यात्रा शुरू करने के लिए अपनी भाषा और सीखने के लक्ष्य को अनुकूलित करें।',
      emoji: '⚙️',
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
    const isPrefSlide = item.id === 'preferences';

    return (
      <View style={styles.slide}>
        <View style={styles.slideHeader}>
          <Text style={styles.slideEmoji}>{item.emoji}</Text>
          <Text style={styles.slideTitle}>{titleText}</Text>
          <Text style={styles.slideDesc}>{descText}</Text>
        </View>

        {isPrefSlide ? (
          <ScrollView style={styles.prefScroll} contentContainerStyle={styles.prefContent} showsVerticalScrollIndicator={false}>
            {/* Language Selection Trigger */}
            <View style={styles.prefSection}>
              <Text style={styles.sectionTitle}>Preferred Language / भाषा</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setLangModalVisible(true)}
                style={styles.langSelector}
              >
                <Text style={styles.langSelectorText}>{selectedLang}</Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Learning Goal Selector */}
            <View style={styles.prefSection}>
              <Text style={styles.sectionTitle}>Select Your Learning Goal</Text>
              <View style={styles.optionsList}>
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
                      <View style={styles.optionBody}>
                        <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>
                          {g.title}
                        </Text>
                        <Text style={[styles.optionDesc, active && styles.optionDescActive]}>
                          {g.description}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.bulletsList}>
            {item.bullets.map((b, bIdx) => (
              <View key={bIdx} style={styles.bulletRow}>
                <Text style={styles.bulletEmoji}>{b.emoji}</Text>
                <Text style={styles.bulletText}>{isHindi ? b.textHi : b.text}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const handleSkip = () => {
    // Track onboarding skip
    mixpanel.track('onboarding_skipped', {
      current_step: activeIndex + 1,
    });
    onSubmit();
  };

  return (
    <HeroBackground tone="navy">
      <SafeAreaView style={styles.safe}>
        {/* Header Bar */}
        <View style={styles.header}>
          <Text style={styles.stepIndicator}>
            Step {activeIndex + 1} of {slides.length}
          </Text>
          {activeIndex < slides.length - 1 && (
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipBtn}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Carousel FlatList */}
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          scrollEnabled={activeIndex < slides.length - 1} // Lock scrolling on last slide to force preference selections
        />

        {/* Footer Navigation Area */}
        <View style={styles.footer}>
          {/* Dot Indicators */}
          <View style={styles.indicatorContainer}>
            {slides.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  activeIndex === idx && styles.dotActive
                ]}
              />
            ))}
          </View>

          {/* Navigation Action Buttons */}
          <Button
            label={activeIndex === slides.length - 1 ? "शुरू करें — Let's Go 🚀" : "Next →"}
            variant="gradientAmber"
            onPress={handleNext}
          />
        </View>

        {/* Language Selection Bottom Sheet Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={langModalVisible}
          onRequestClose={() => setLangModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose Language / भाषा चुनें</Text>
                <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                  <Text style={styles.closeModalText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.langList} showsVerticalScrollIndicator={false}>
                {LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    activeOpacity={0.7}
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
                    {selectedLang === lang.name && (
                      <Text style={styles.checkIcon}>✓</Text>
                    )}
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
  header: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  stepIndicator: { ...typography.overline, color: colors.textMutedDark },
  skipBtn: { ...typography.bodyBold, color: colors.amber },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
    flex: 1,
  },
  slideHeader: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  slideEmoji: {
    fontSize: 72,
    marginBottom: spacing.md,
  },
  slideTitle: {
    ...typography.h1,
    color: colors.textOnDark,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  slideDesc: {
    ...typography.body,
    color: colors.textMutedDark,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  bulletsList: {
    marginVertical: spacing.xxl,
    paddingHorizontal: spacing.sm,
    gap: spacing.lg,
    flex: 1,
    justifyContent: 'center',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  bulletEmoji: {
    fontSize: 22,
  },
  bulletText: {
    ...typography.body,
    color: colors.textOnDark,
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dotActive: {
    backgroundColor: colors.amber,
    width: 20,
  },
  prefScroll: {
    flex: 1,
    marginTop: spacing.md,
  },
  prefContent: {
    paddingBottom: spacing.xl,
  },
  prefSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.overline,
    color: colors.textMutedDark,
    marginBottom: spacing.sm,
  },
  langSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: colors.borderDark,
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  langSelectorText: {
    ...typography.bodyBold,
    color: colors.textOnDark,
  },
  dropdownIcon: {
    color: colors.textMutedDark,
    fontSize: 12,
  },
  optionsList: {
    gap: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  optionActive: {
    borderColor: colors.amber,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  optionEmoji: {
    fontSize: 28,
  },
  optionBody: {
    flex: 1,
  },
  optionTitle: {
    ...typography.bodyBold,
    color: colors.textOnDark,
    marginBottom: 2,
  },
  optionTitleActive: {
    color: colors.amber,
  },
  optionDesc: {
    ...typography.caption,
    color: colors.textMutedDark,
  },
  optionDescActive: {
    color: colors.textOnDark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0F121F', // Match theme navy surface
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '75%',
    paddingBottom: spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTitle: {
    ...typography.h2,
    color: colors.textOnDark,
  },
  closeModalText: {
    color: colors.textMutedDark,
    fontSize: 18,
    fontWeight: 'bold',
  },
  langList: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  langItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  langItemActive: {
    borderBottomColor: colors.amber,
  },
  langText: {
    ...typography.body,
    color: colors.textOnDark,
  },
  langTextActive: {
    color: colors.amber,
    fontWeight: 'bold',
  },
  checkIcon: {
    color: colors.amber,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
