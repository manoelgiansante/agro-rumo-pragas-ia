import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, useColorScheme, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, Gradients } from '../../constants/theme';
import { ChatBubble } from '../../components/ChatBubble';
import { sendChatMessage } from '../../services/ai-chat';

interface Message { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date; }

const SUGGESTIONS = [
  'Como identificar ferrugem asiática na soja?',
  'Qual o melhor manejo para lagarta do cartucho?',
  'Quando aplicar fungicida preventivo no café?',
  'Como funciona o controle biológico de pragas?',
];

export default function AIChatScreen() {
  const isDark = useColorScheme() === 'dark';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const response = await sendChatMessage(history);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Não foi possível obter resposta. Tente novamente.', timestamp: new Date() };
      setMessages(prev => [...prev, errMsg]);
    }
    setSending(false);
  };

  const clearChat = () => setMessages([]);

  return (
    <KeyboardAvoidingView style={[styles.container, isDark && styles.containerDark]} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <LinearGradient colors={Gradients.tech as any} style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={34} color="#FFF" />
          </LinearGradient>
          <Text style={[styles.aiTitle, isDark && styles.textDark]}>Agro IA</Text>
          <Text style={styles.aiSubtitle}>Seu assistente especializado em pragas{'\n'}e manejo integrado de pragas (MIP)</Text>
          <Text style={styles.suggestLabel}>PERGUNTE SOBRE:</Text>
          {SUGGESTIONS.map((s, i) => (
            <TouchableOpacity key={i} style={[styles.suggestion, isDark && styles.suggestionDark]} onPress={() => send(s)}>
              <Ionicons name="leaf" size={14} color={Colors.accent} />
              <Text style={[styles.suggestionText, isDark && styles.textDark]} numberOfLines={2}>{s}</Text>
              <Ionicons name="arrow-up-outline" size={12} color={Colors.systemGray3} />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: Spacing.md, paddingBottom: 20 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => <ChatBubble message={item} />}
          ListFooterComponent={sending ? (
            <View style={styles.typingRow}>
              <LinearGradient colors={Gradients.tech as any} style={styles.typingAvatar}>
                <Ionicons name="sparkles" size={13} color="#FFF" />
              </LinearGradient>
              <View style={styles.typingBubble}>
                <Text style={styles.typingDots}>• • •</Text>
              </View>
            </View>
          ) : null}
        />
      )}

      <View style={[styles.inputBar, isDark && styles.inputBarDark]}>
        <TextInput
          style={[styles.textInput, isDark && styles.textInputDark]}
          placeholder="Pergunte sobre pragas..."
          placeholderTextColor={Colors.textSecondary}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          onPress={() => send()}
          disabled={!input.trim() || sending}
          style={[styles.sendBtn, input.trim() && !sending ? styles.sendBtnActive : null]}
        >
          <Ionicons name="arrow-up" size={18} color={input.trim() && !sending ? '#FFF' : Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  containerDark: { backgroundColor: Colors.backgroundDark },
  emptyState: { flex: 1, alignItems: 'center', paddingTop: 50, paddingHorizontal: 20 },
  aiAvatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  aiTitle: { fontSize: FontSize.title, fontWeight: '700', marginTop: 16 },
  aiSubtitle: { fontSize: FontSize.subheadline, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  suggestLabel: { fontSize: FontSize.caption2, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.5, marginTop: 28, marginBottom: 12 },
  suggestion: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', padding: 14, backgroundColor: Colors.systemGray6, borderRadius: BorderRadius.md, marginBottom: 8 },
  suggestionDark: { backgroundColor: '#1C1C1E' },
  suggestionText: { flex: 1, fontSize: FontSize.subheadline },
  typingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 4 },
  typingAvatar: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  typingBubble: { backgroundColor: Colors.systemGray6, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12 },
  typingDots: { fontSize: 16, color: Colors.accent },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: Spacing.sm, paddingHorizontal: Spacing.md, borderTopWidth: 0.5, borderTopColor: Colors.separator, backgroundColor: Colors.card },
  inputBarDark: { backgroundColor: '#1C1C1E', borderTopColor: Colors.separatorDark },
  textInput: { flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: Colors.systemGray6, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: FontSize.body, marginRight: 8 },
  textInputDark: { backgroundColor: '#2C2C2E', color: '#FFF' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.systemGray5 },
  sendBtnActive: { backgroundColor: Colors.accent },
  textDark: { color: Colors.textDark },
});
