/** Screen 09 — Community. Beginner-safe Hindi Q&A with verified helpers. */
import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pill } from '../../../shared/ui/Pill';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { COMMUNITY_POSTS, ONLINE_COUNT, CommunityPost } from '../community.data';
import Analytics from '../../../core/analyticsService';

export default function CommunityScreen({ navigation }: any) {
  const [draft, setDraft] = useState('');
  const sessionId = 'sess_abc123'; // Replace with your global session context identifier if available

  // 1. Track community_viewed on mount (matching Week 3 Specification exact property names)
  useEffect(() => {
    if (typeof (Analytics as any).trackCommunityViewed === 'function') {
      (Analytics as any).trackCommunityViewed(sessionId, 'bottom_nav', COMMUNITY_POSTS.length);
    } else if (typeof (Analytics as any).logEvent === 'function') {
      (Analytics as any).logEvent('community_viewed', {
        session_id: sessionId,
        entry_source: 'bottom_nav',
        items_shown_count: COMMUNITY_POSTS.length,
      });
    }
  }, []);

  // 7. Track ask_question_tapped intent when interacting with the composer CTA
  const handleAskQuestionFocus = () => {
    if (typeof (Analytics as any).trackAskQuestionTapped === 'function') {
      (Analytics as any).trackAskQuestionTapped(sessionId, 'community_home');
    } else if (typeof (Analytics as any).logEvent === 'function') {
      (Analytics as any).logEvent('ask_question_tapped', {
        session_id: sessionId,
        source: 'community_home',
      });
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity 
                style={styles.backBtn} 
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
              <Text style={styles.title}>👥 Community</Text>
            </View>
            <Pill label={`● ${ONLINE_COUNT} online`} color={colors.green} bg={colors.greenSoft} mono />
          </View>
          <Text style={styles.subtitle}>No question is stupid. Ask anything about investing!</Text>

          <View style={styles.safeBanner}>
            <Text style={styles.safeText}>🔒 Safe space · Moderated daily · All beginners welcome</Text>
          </View>

          {COMMUNITY_POSTS.map((post, index) => (
            <PostCard 
              key={post.id} 
              post={post} 
              index={index} 
              sessionId={sessionId} 
            />
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
            onFocus={handleAskQuestionFocus}
          />
          <TouchableOpacity 
            style={styles.sendBtn} 
            onPress={() => {
              handleAskQuestionFocus();
              setDraft('');
            }}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PostCard({ post, index, sessionId }: { post: CommunityPost; index: number; sessionId: string }) {
  // 3. Track post_tapped (matches Week 3 Specification property keys)
  const handlePostPress = () => {
    if (typeof (Analytics as any).trackPostTapped === 'function') {
      (Analytics as any).trackPostTapped(sessionId, post.id, index);
    } else if (typeof (Analytics as any).logEvent === 'function') {
      (Analytics as any).logEvent('post_tapped', {
        session_id: sessionId,
        post_id: post.id,
        source_position: index,
      });
    }
  };

  // 5. Track post_upvoted toggle action (matches Week 3 Specification property keys)
  const handleUpvote = () => {
    if (typeof (Analytics as any).trackPostUpvoted === 'function') {
      (Analytics as any).trackPostUpvoted(sessionId, post.id, 'upvoted');
    } else if (typeof (Analytics as any).logEvent === 'function') {
      (Analytics as any).logEvent('post_upvoted', {
        session_id: sessionId,
        post_id: post.id,
        upvote_action: 'upvoted',
      });
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePostPress} style={styles.post}>
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

      <TouchableOpacity onPress={handleUpvote} style={{ marginTop: spacing.sm }}>
        <Text style={{ color: colors.purple, fontWeight: '700' }}>👍 Upvote Post</Text>
      </TouchableOpacity>

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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  content: { padding: spacing.xl, paddingBottom: spacing.lg, gap: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 24, fontWeight: '700', color: colors.text },
  title: { ...typography.hero, fontSize: 26, color: colors.text },
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