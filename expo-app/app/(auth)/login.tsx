import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Leaf, Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuthContext } from '../../context/AuthContext';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Gradients } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AuthMode = 'login' | 'signup';

export default function LoginScreen() {
  const { signIn, signUp, resetPassword, isLoading, error, clearError } = useAuthContext();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      Alert.alert('Atenção', 'Informe seu nome completo.');
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password, fullName.trim());
        Alert.alert(
          'Conta criada',
          'Verifique seu email para confirmar o cadastro.',
        );
      }
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Atenção', 'Informe seu email para redefinir a senha.');
      return;
    }
    try {
      await resetPassword(email.trim());
      Alert.alert('Email enviado', 'Verifique sua caixa de entrada para redefinir a senha.');
    } catch {
      // error is handled by the hook
    }
  };

  const switchMode = (newMode: AuthMode) => {
    clearError();
    setMode(newMode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Hero gradient header */}
        <LinearGradient
          colors={Gradients.hero as [string, string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroContent}>
            <View style={styles.iconCircle}>
              <Leaf size={40} color={Colors.white} strokeWidth={2} />
            </View>
            <Text style={styles.heroTitle}>Rumo Pragas</Text>
            <Text style={styles.heroSubtitle}>
              Diagnostico inteligente de pragas agricolas
            </Text>
          </View>
        </LinearGradient>

        {/* Form card */}
        <View style={styles.formCard}>
          {/* Segmented control */}
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[styles.segment, mode === 'login' && styles.segmentActive]}
              onPress={() => switchMode('login')}
            >
              <Text
                style={[
                  styles.segmentText,
                  mode === 'login' && styles.segmentTextActive,
                ]}
              >
                Entrar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segment, mode === 'signup' && styles.segmentActive]}
              onPress={() => switchMode('signup')}
            >
              <Text
                style={[
                  styles.segmentText,
                  mode === 'signup' && styles.segmentTextActive,
                ]}
              >
                Criar Conta
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Name field (signup only) */}
          {mode === 'signup' ? (
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <User size={20} color={Colors.systemGray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nome completo"
                  placeholderTextColor={Colors.systemGray2}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </View>
            </View>
          ) : null}

          {/* Email field */}
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Mail size={20} color={Colors.systemGray} style={styles.inputIcon} />
              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Colors.systemGray2}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>
          </View>

          {/* Password field */}
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.systemGray} style={styles.inputIcon} />
              <TextInput
                ref={passwordRef}
                style={[styles.input, styles.passwordInput]}
                placeholder="Senha"
                placeholderTextColor={Colors.systemGray2}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff size={20} color={Colors.systemGray} />
                ) : (
                  <Eye size={20} color={Colors.systemGray} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot password */}
          {mode === 'login' ? (
            <TouchableOpacity onPress={handleResetPassword} style={styles.forgotButton}>
              <Text style={styles.forgotText}>Esqueceu sua senha?</Text>
            </TouchableOpacity>
          ) : null}

          {/* Submit button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.accent, Colors.accentDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.submitText}>
                  {mode === 'login' ? 'Entrar' : 'Criar Conta'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Terms */}
          <Text style={styles.termsText}>
            Ao continuar, voce concorda com os{' '}
            <Text style={styles.termsLink}>Termos de Uso</Text> e{' '}
            <Text style={styles.termsLink}>Politica de Privacidade</Text>.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 48,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  heroContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    fontSize: FontSize.largeTitle,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: FontSize.subheadline,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  formCard: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xxxl,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.systemGray6,
    borderRadius: BorderRadius.sm,
    padding: 3,
    marginBottom: Spacing.xxl,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm - 2,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: FontSize.subheadline,
    fontWeight: FontWeight.medium,
    color: Colors.systemGray,
  },
  segmentTextActive: {
    color: Colors.accent,
    fontWeight: FontWeight.semibold,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  errorText: {
    color: Colors.coral,
    fontSize: FontSize.footnote,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.systemGray6,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    height: 52,
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: FontSize.body,
    color: Colors.text,
    height: '100%',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeButton: {
    position: 'absolute',
    right: Spacing.lg,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.xxl,
    marginTop: -Spacing.sm,
  },
  forgotText: {
    fontSize: FontSize.footnote,
    color: Colors.accent,
    fontWeight: FontWeight.medium,
  },
  submitButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.xxl,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  submitText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },
  termsText: {
    fontSize: FontSize.caption,
    color: Colors.systemGray,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.accent,
    fontWeight: FontWeight.medium,
  },
});
