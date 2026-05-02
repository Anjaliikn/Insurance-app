import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Animated,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PASSWORD_REQUIREMENTS = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  {
    label: 'One uppercase letter (A-Z)',
    test: (p: string) => /[A-Z]/.test(p),
  },
  { label: 'One number (0-9)', test: (p: string) => /[0-9]/.test(p) },
  {
    label: 'One special character (!@#$%^&*)',
    test: (p: string) => /[!@#$%^&*]/.test(p),
  },
];

function getPasswordStrength(password: string): {
  level: number;
  label: string;
  color: string;
} {
  const met = PASSWORD_REQUIREMENTS.filter(r => r.test(password)).length;
  if (met === 0) return { level: 0, label: '', color: '#e0e0e0' };
  if (met === 1) return { level: 1, label: 'Weak', color: '#c62828' };
  if (met === 2) return { level: 2, label: 'Fair', color: '#f57c00' };
  if (met === 3) return { level: 3, label: 'Good', color: '#1565c0' };
  return { level: 4, label: 'Strong', color: '#2e7d32' };
}

function SignUpScreen({ navigation }: any) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const strength = getPasswordStrength(password);
  const requirements = PASSWORD_REQUIREMENTS.map(r => ({
    ...r,
    met: r.test(password),
  }));

  function validateFullName(text: string) {
    setFullName(text);
    if (text.trim() === '') {
      setFullNameError('Full name is required');
    } else if (text.trim().length < 2) {
      setFullNameError('Name must be at least 2 characters');
    } else {
      setFullNameError('');
    }
  }

  function validateEmail(text: string) {
    const lower = text.toLowerCase();
    setEmail(lower);
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (text === '') {
      setEmailError('Email is required');
    } else if (!emailRegex.test(lower)) {
      setEmailError('Enter a valid email like abc@gmail.com');
    } else {
      setEmailError('');
    }
  }

  function validatePassword(text: string) {
    setPassword(text);
    if (text === '') {
      setPasswordError('Password is required');
    } else if (text.length < 8) {
      setPasswordError('Password must be at least 8 characters');
    } else if (!/[A-Z]/.test(text)) {
      setPasswordError('Must contain an uppercase letter');
    } else if (!/[0-9]/.test(text)) {
      setPasswordError('Must contain a number');
    } else if (!/[!@#$%^&*]/.test(text)) {
      setPasswordError('Must contain a special character');
    } else {
      setPasswordError('');
    }
    // Re-validate confirm password if already filled
    if (confirmPassword !== '') {
      if (text !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError('');
      }
    }
  }

  function validateConfirmPassword(text: string) {
    setConfirmPassword(text);
    if (text === '') {
      setConfirmPasswordError('Please confirm your password');
    } else if (text !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  }

  function isFormValid() {
    return (
      fullName.trim() !== '' &&
      email !== '' &&
      password !== '' &&
      confirmPassword !== '' &&
      fullNameError === '' &&
      emailError === '' &&
      passwordError === '' &&
      confirmPasswordError === ''
    );
  }

  async function handleSignUp() {
    validateFullName(fullName);
    validateEmail(email);
    validatePassword(password);
    validateConfirmPassword(confirmPassword);
    if (!isFormValid()) return;

    try {
      const existing = await AsyncStorage.getItem(`user_${email}`);
      if (existing) {
        Alert.alert('Account Exists', 'An account with this email already exists. Please log in.');
        return;
      }
      await AsyncStorage.setItem(`user_${email}`, JSON.stringify({
        name: fullName.trim(),
        password: password,
      }));
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userName', fullName.trim());
      setSuccessVisible(true);
    } catch (error) {
      console.log('SignUp Error:', error);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        overScrollMode="never"
        showsVerticalScrollIndicator={false}>
        {/* Header Banner */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🛡️</Text>
          <Text style={styles.headerTitle}>InsureEase</Text>
          <Text style={styles.headerTagline}>Your trusted insurance companion</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to manage your policies</Text>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View
              style={[
                styles.inputRow,
                fullNameError ? styles.inputRowError : null,
                fullName && !fullNameError ? styles.inputRowSuccess : null,
              ]}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#bbb"
                value={fullName}
                onChangeText={validateFullName}
                autoCapitalize="words"
              />
              {fullName !== '' && !fullNameError && (
                <Text style={styles.checkIcon}>✅</Text>
              )}
            </View>
            {fullNameError ? (
              <Text style={styles.errorText}>⚠️ {fullNameError}</Text>
            ) : null}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View
              style={[
                styles.inputRow,
                emailError ? styles.inputRowError : null,
                email && !emailError ? styles.inputRowSuccess : null,
              ]}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#bbb"
                value={email}
                onChangeText={validateEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {email !== '' && !emailError && (
                <Text style={styles.checkIcon}>✅</Text>
              )}
            </View>
            {emailError ? (
              <Text style={styles.errorText}>⚠️ {emailError}</Text>
            ) : null}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordHint(true)}>
                <Text style={styles.hintLink}>Requirements ℹ️</Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.inputRow,
                passwordError ? styles.inputRowError : null,
                password && !passwordError ? styles.inputRowSuccess : null,
              ]}>
              <Text style={styles.inputIcon}>🔑</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a strong password"
                placeholderTextColor="#bbb"
                value={password}
                onChangeText={validatePassword}
                secureTextEntry={!showPassword}
                onFocus={() => setShowPasswordHint(true)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.eyeIcon}>{showPassword ? '🔒' : '🔓'}</Text>
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>⚠️ {passwordError}</Text>
            ) : null}

            {/* Strength Bar */}
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBarBg}>
                  <View
                    style={[
                      styles.strengthBarFill,
                      {
                        width: `${(strength.level / 4) * 100}%` as any,
                        backgroundColor: strength.color,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                  {strength.label}
                </Text>
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View
              style={[
                styles.inputRow,
                confirmPasswordError ? styles.inputRowError : null,
                confirmPassword && !confirmPasswordError
                  ? styles.inputRowSuccess
                  : null,
              ]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Re-enter your password"
                placeholderTextColor="#bbb"
                value={confirmPassword}
                onChangeText={validateConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Text style={styles.eyeIcon}>
                  {showConfirmPassword ? '🔒' : '🔓'}
                </Text>
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? (
              <Text style={styles.errorText}>⚠️ {confirmPasswordError}</Text>
            ) : confirmPassword !== '' && !confirmPasswordError ? (
              <Text style={styles.successText}>✅ Passwords match</Text>
            ) : null}
          </View>

          {/* Terms notice */}
          <Text style={styles.terms}>
            By signing up, you agree to our{' '}
            <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.button, !isFormValid() ? styles.buttonDisabled : null]}
            onPress={handleSignUp}
            activeOpacity={0.85}>
            <Text style={styles.buttonText}>Create Account 🚀</Text>
          </TouchableOpacity>

          {/* Login link */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLinkText}>
              Already have an account?{' '}
              <Text style={styles.loginLinkBold}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Password Requirements Modal */}
      <Modal visible={showPasswordHint} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPasswordHint(false)}>
          <View style={styles.hintCard}>
            <View style={styles.hintHeader}>
              <Text style={styles.hintTitle}>🔐 Password Requirements</Text>
              <TouchableOpacity onPress={() => setShowPasswordHint(false)}>
                <Text style={styles.hintClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {requirements.map((req, i) => (
              <View key={i} style={styles.requirementRow}>
                <Text
                  style={[
                    styles.requirementIcon,
                    req.met ? styles.metIcon : styles.unmetIcon,
                  ]}>
                  {req.met ? '✅' : '○'}
                </Text>
                <Text
                  style={[
                    styles.requirementText,
                    req.met ? styles.requirementMet : styles.requirementUnmet,
                  ]}>
                  {req.label}
                </Text>
              </View>
            ))}

            {requirements.every(r => r.met) && (
              <View style={styles.allMetContainer}>
                <Text style={styles.allMetText}>🎉 Password is strong!</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.hintButton}
              onPress={() => setShowPasswordHint(false)}>
              <Text style={styles.hintButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Success Modal */}
      <Modal visible={successVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>Account Created!</Text>
            <Text style={styles.successMessage}>
              Welcome, {fullName.trim().split(' ')[0]}! Your account has been
              set up successfully.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setSuccessVisible(false);
                navigation.navigate('Home');
              }}>
              <Text style={styles.buttonText}>Go to Home →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const PRIMARY = '#1a237e';
const PRIMARY_LIGHT = '#3949ab';
const SUCCESS = '#2e7d32';
const ERROR = '#c62828';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 10,
  },
  headerIcon: {
    fontSize: 44,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  headerTagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },

  // Card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 28,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: PRIMARY,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
  },

  // Input group
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  hintLink: {
    fontSize: 12,
    color: PRIMARY_LIGHT,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa',
  },
  inputRowError: {
    borderColor: ERROR,
    backgroundColor: '#fff5f5',
  },
  inputRowSuccess: {
    borderColor: SUCCESS,
    backgroundColor: '#f5fff6',
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  checkIcon: {
    fontSize: 16,
    marginLeft: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: '#222',
  },
  eyeIcon: {
    fontSize: 18,
    paddingLeft: 8,
  },
  errorText: {
    color: ERROR,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
  },
  successText: {
    color: SUCCESS,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
  },

  // Strength bar
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  strengthBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: 6,
    borderRadius: 4,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '700',
    width: 48,
  },

  // Terms
  terms: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  termsLink: {
    color: PRIMARY_LIGHT,
    fontWeight: '600',
  },

  // Button
  button: {
    backgroundColor: PRIMARY,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#9fa8da',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Login link
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#888',
    fontSize: 14,
  },
  loginLinkBold: {
    color: PRIMARY,
    fontWeight: 'bold',
  },

  // Modal overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },

  // Password hint card
  hintCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    elevation: 10,
  },
  hintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  hintTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: PRIMARY,
  },
  hintClose: {
    fontSize: 18,
    color: '#999',
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requirementIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  metIcon: { color: SUCCESS },
  unmetIcon: { color: '#bbb' },
  requirementText: { fontSize: 14 },
  requirementMet: { color: SUCCESS, fontWeight: '600' },
  requirementUnmet: { color: '#aaa' },
  allMetContainer: {
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  allMetText: {
    color: SUCCESS,
    fontSize: 15,
    fontWeight: 'bold',
  },
  hintButton: {
    backgroundColor: PRIMARY,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  hintButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  // Success modal
  successCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    elevation: 12,
  },
  successEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PRIMARY,
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
});

export default SignUpScreen;
