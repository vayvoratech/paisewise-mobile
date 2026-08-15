/** Screen 09 — Community. Beginner-safe Hindi Q&A with verified helpers. */
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pill } from '../../../shared/ui/Pill';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { COMMUNITY_POSTS, ONLINE_COUNT, CommunityPost } from '../community.data';

export default function CommunityScreen() {
  const [draft, setDraft] = useState('');

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>👥 Community</Text>
            <Pill label={`● ${ONLINE_COUNT} online`} color={colors.green} bg={colors.greenSoft} mono />
          </View>
          <Text style={styles.subtitle}>No question is stupid. Ask anything about investing!</Text>

          <View style={styles.safeBanner}>
            <Text style={styles.safeText}>🔒 Safe space · Moderated daily · All beginners welcome</Text>
          </View>

          {COMMUNITY_POSTS.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ScrollView>

        {/* Composer */}
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Apna sawaal poochho... Ask anything"
            placeholderTextColor={colors.textMuted}
            value={draft}
            onChangeText={setDraft}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => setDraft('')}>
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PostCard({ post }: { post: CommunityPost }) {
  return (
    <View style={styles.post}>
      <View style={styles.postHead}>
        <View style={[styles.avatar, { backgroundColor: post.avatarColor }]}>
          <Text style={styles.avatarText}>{post.initial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.author}>{post.author}</Text>
          <Text style={styles.location}>{post.location}</Text>
        </View>
        <Text style={styles.ago}>{post.ago}</Text>
      </View>

      <Pill label={post.tag} color={colors.purple} bg={colors.indigoChip} style={{ marginTop: spacing.md }} />
      <Text style={styles.postText}>{post.text}</Text>

      {post.replies.map((r, i) => (
        <View key={i} style={styles.reply}>
          <View style={styles.replyHead}>
            <View style={styles.helperBadge}><Text style={styles.helperStar}>⭐</Text></View>
            <Text style={styles.replyAuthor}>{r.author}</Text>
            {r.verifiedHelper && <Text style={styles.verified}>VERIFIED HELPER</Text>}
          </View>
          <Text style={styles.replyText}>{r.text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  content: { padding: spacing.xl, paddingBottom: spacing.lg, gap: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.hero, fontSize: 30, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: -spacing.sm },
  safeBanner: { backgroundColor: colors.greenSoft, borderRadius: radius.md, padding: spacing.lg },
  safeText: { ...typography.bodyBold, color: '#0F7A52' },
  post: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  postHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '800', fontSize: 18 },
  author: { ...typography.bodyBold, color: colors.text },
  location: { ...typography.caption, color: colors.textMuted },
  ago: { ...typography.caption, color: colors.textMuted },
  postText: { ...typography.body, color: colors.text, marginTop: spacing.md, lineHeight: 24, fontSize: 17 },
  reply: { backgroundColor: colors.indigoChip, borderRadius: radius.md, padding: spacing.lg, marginTop: spacing.md },
  replyHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  helperBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.star, alignItems: 'center', justifyContent: 'center' },
  helperStar: { fontSize: 14 },
  replyAuthor: { ...typography.bodyBold, color: colors.text },
  verified: { ...typography.overline, color: '#B8860B', fontSize: 10 },
  replyText: { ...typography.body, color: colors.textFaint, marginTop: spacing.sm, lineHeight: 24, fontSize: 16 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  input: { flex: 1, backgroundColor: colors.surfaceMuted, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: 16, color: colors.text },
  sendBtn: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' },
  sendIcon: { color: colors.white, fontSize: 20 },
});
