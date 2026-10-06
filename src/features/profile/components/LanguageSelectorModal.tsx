import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../help.data';

interface LanguageSelectorModalProps {
  visible: boolean;
  selectedCode: string;
  onSelectLanguage: (language: SupportedLanguage) => void;
  onClose: () => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  visible,
  selectedCode,
  onSelectLanguage,
  onClose,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.handle} />
                <View style={styles.titleRow}>
                  <Text style={styles.title}>Select Language / भाषा चुनें</Text>
                  <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.closeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.subtitle}>
                  Choose your preferred language for learning lessons, practice quotes, and UI.
                </Text>
              </View>

              {/* Language List */}
              <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent}>
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected =
                    lang.code.toLowerCase() === selectedCode.toLowerCase() ||
                    lang.name.toLowerCase() === selectedCode.toLowerCase();

                  return (
                    <TouchableOpacity
                      key={lang.code}
                      style={[styles.langRow, isSelected && styles.langRowActive]}
                      activeOpacity={0.7}
                      onPress={() => {
                        onSelectLanguage(lang);
                      }}
                    >
                      <View style={styles.flagBox}>
                        <Text style={styles.flagEmoji}>{lang.flag}</Text>
                      </View>

                      <View style={styles.langInfo}>
                        <View style={styles.nameRow}>
                          <Text style={[styles.nativeName, isSelected && styles.textActive]}>
                            {lang.nativeName}
                          </Text>
                          <Text style={styles.englishName}>({lang.name})</Text>
                          {lang.tag && (
                            <View style={styles.badgeTag}>
                              <Text style={styles.badgeTagText}>{lang.tag}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.langDesc} numberOfLines={1}>
                          {lang.description}
                        </Text>
                      </View>

                      <View style={[styles.radioCircle, isSelected && styles.radioActive]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Footer */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.doneBtn} activeOpacity={0.8} onPress={onClose}>
                  <Text style={styles.doneBtnText}>Confirm Selection</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 15, 26, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '800',
  },
  closeBtn: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  scrollList: {
    maxHeight: 380,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  langRowActive: {
    backgroundColor: '#F5F3FF',
    borderColor: colors.purple,
  },
  flagBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  flagEmoji: {
    fontSize: 20,
  },
  langInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  nativeName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  textActive: {
    color: colors.purple,
    fontWeight: '800',
  },
  englishName: {
    ...typography.caption,
    color: colors.textMuted,
  },
  badgeTag: {
    backgroundColor: colors.indigoChip,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTagText: {
    fontSize: 10,
    color: colors.purple,
    fontWeight: '700',
  },
  langDesc: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  radioActive: {
    borderColor: colors.purple,
    backgroundColor: colors.white,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.purple,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  doneBtn: {
    backgroundColor: colors.purple,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    ...typography.bodyBold,
    color: colors.white,
  },
});
