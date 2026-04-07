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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordHint, setShowPasswordHint] = useState(false);

  // Email validation
  function validateEmail(text: string) {
    const lowercaseEmail = text.toLowerCase();
    setEmail(lowercaseEmail);
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (text === '') {
      setEmailError('Email is required');
    } else if (!emailRegex.test(lowercaseEmail)) {
      setEmailError('Enter a valid email like abc@gmail.com');
    } else {
      setEmailError('');
    }
  }

  // Password validation
  function validatePassword(text: string) {
    setPassword(text);
    if (text === '') {
      setPasswordError('Password is required');
    } else if (text.length < 8) {
      setPasswordError('Password must be at least 8 characters');
    } else if (!/[A-Z]/.test(text)) {
      setPasswordError('Password must have at least one uppercase letter');
    } else if (!/[0-9]/.test(text)) {
      setPasswordError('Password must have at least one number');
    } else if (!/[!@#$%^&*]/.test(text)) {
      setPasswordError('Password must have at least one special character');
    } else {
      setPasswordError('');
    }
  }

  // Check all password requirements
  const requirements = [
    {
      label: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      label: 'One uppercase letter (A-Z)',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'One number (0-9)',
      met: /[0-9]/.test(password),
    },
    {
      label: 'One special character (!@#$%^&*)',
      met: /[!@#$%^&*]/.test(password),
    },
  ];

  // Check if all requirements are met
  const allRequirementsMet = requirements.every(r => r.met);

  function isFormValid() {
    return (
      email !== '' &&
      password !== '' &&
      emailError === '' &&
      passwordError === ''
    );
  }

  async function handleSubmit() {
    validateEmail(email);
    validatePassword(password);
    if (!isFormValid()) return;
    try {
      await AsyncStorage.setItem('userEmail', email);
      navigation.navigate('Home');
    } catch (error) {
      console.log('Error:', error);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>

          {/* Title */}
          <Text style={styles.title}>Welcome Back! 👋</Text>
          <Text style={styles.subtitle}>Login to continue</Text>


          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                emailError ? styles.inputError : null,
              ]}
              placeholder="Email Address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={validateEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {emailError ? (
              <Text style={styles.errorText}>⚠️ {emailError}</Text>
            ) : email !== '' ? (
              <Text style={styles.successText}>✅ Valid email</Text>
            ) : null}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={[
              styles.passwordContainer,
              passwordError ? styles.inputError : null,
            ]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={validatePassword}
                secureTextEntry={!showPassword}
                // Show popup when user focuses on password field
                onFocus={() => setShowPasswordHint(true)}
              />
              {/* Show/Hide toggle */}
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.eyeIcon}>
                    {showPassword ? '🔒' : '🔓'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Password error or success */}
            {passwordError ? (
              <Text style={styles.errorText}>⚠️ {passwordError}</Text>
            ) : password !== '' ? (
              <Text style={styles.successText}>✅ Strong password</Text>
            ) : null}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.button,
              !isFormValid() ? styles.buttonDisabled : null,
            ]}
            onPress={handleSubmit}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          {/* Switch to Sign Up */}
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.switchText}>
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* Password Requirements Popup */}
      <Modal
        visible={showPasswordHint}
        transparent={true}
        animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPasswordHint(false)}>
          <View style={styles.hintCard}>

            {/* Popup Header */}
            <View style={styles.hintHeader}>
              <Text style={styles.hintTitle}>🔐 Password Requirements</Text>
              <TouchableOpacity onPress={() => setShowPasswordHint(false)}>
                <Text style={styles.hintClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Requirements List */}
            {requirements.map((req, index) => (
              <View key={index} style={styles.requirementRow}>
                <Text style={[
                  styles.requirementIcon,
                  req.met ? styles.metIcon : styles.unmetIcon,
                ]}>
                  {req.met ? '✅' : '○'}
                </Text>
                <Text style={[
                  styles.requirementText,
                  req.met ? styles.requirementMet : styles.requirementUnmet,
                ]}>
                  {req.label}
                </Text>
              </View>
            ))}

            {/* All requirements met message */}
            {allRequirementsMet && (
              <View style={styles.allMetContainer}>
                <Text style={styles.allMetText}>
                  🎉 Password is strong!
                </Text>
              </View>
            )}

            {/* Close button */}
            <TouchableOpacity
              style={styles.hintButton}
              onPress={() => setShowPasswordHint(false)}>
              <Text style={styles.hintButtonText}>Got it!</Text>
            </TouchableOpacity>

          </View>
        </TouchableOpacity>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a237e',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 25,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#c62828',
    borderWidth: 1.5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 12,
  },
  eyeIcon: {
    fontSize: 20,
  },
  errorText: {
    color: '#c62828',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  successText: {
    color: '#2e7d32',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#1a237e',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#9fa8da',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchText: {
    color: '#1a237e',
    textAlign: 'center',
    fontSize: 14,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
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
  metIcon: {
    color: '#2e7d32',
  },
  unmetIcon: {
    color: '#999',
  },
  requirementText: {
    fontSize: 14,
  },
  requirementMet: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  requirementUnmet: {
    color: '#999',
  },
  allMetContainer: {
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  allMetText: {
    color: '#2e7d32',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hintButton: {
    backgroundColor: '#1a237e',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  hintButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;


