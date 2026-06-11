import React from 'react';
import { Text, TextStyle } from 'react-native';
import { colors } from '../../../core/theme/theme';

type Props = {
  text: string;
  jargonWords: string[];
  baseStyle?: TextStyle;
  onPressTerm: (term: string) => void;
};

/**
 * Renders a paragraph, turning any occurrence of a jargon word into a tappable,
 * underlined span that opens the Jargon Buster.
 */
export function JargonText({ text, jargonWords, baseStyle, onPressTerm }: Props) {
  if (jargonWords.length === 0) return <Text style={baseStyle}>{text}</Text>;

  // Build a regex that matches any jargon word (longest first to avoid partial overlaps).
  const sorted = [...jargonWords].sort((a, b) => b.length - a.length);
  const escaped = sorted.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(re);

  return (
    <Text style={baseStyle}>
      {parts.map((part, i) => {
        const match = jargonWords.find((w) => w.toLowerCase() === part.toLowerCase());
        if (match) {
          return (
            <Text key={i} style={styles_link} onPress={() => onPressTerm(match)}>
              {part}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

const styles_link: TextStyle = {
  color: colors.text,
  fontWeight: '700',
  textDecorationLine: 'underline',
  textDecorationColor: colors.amber,
  backgroundColor: colors.yellowCard,
};
