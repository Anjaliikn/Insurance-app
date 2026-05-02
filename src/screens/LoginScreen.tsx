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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');

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



  function isFormValid() {
    return (
      email !== '' &&
      password !== '' &&
      emailError === '' &&
      passwordError === ''
    );
  }

  async function handleSubmit() {
    setLoginError('');
    validateEmail(email);
    validatePassword(password);
    if (!isFormValid()) return;
    try {
      const stored = await AsyncStorage.getItem(`user_${email}`);
      if (!stored) {
        setLoginError('No account found. Please sign up first.');
        return;
      }
      const userData = JSON.parse(stored);
      if (userData.password !== password) {
        setLoginError('Incorrect password. Please try again.');
        return;
      }
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userName', userData.name || '');
      navigation.navigate('Home');
    } catch (error) {
      console.log('Error:', error);
      setLoginError('Something went wrong. Please try again.');
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

          {/* Login Error */}
          {loginError !== '' && (
            <View style={styles.loginErrorBox}>
              <Text style={styles.loginErrorText}>❌ {loginError}</Text>
            </View>
          )}

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
  loginErrorBox: {
    backgroundColor: '#ffebee',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ef9a9a',
  },
  loginErrorText: {
    color: '#c62828',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },

});

export default LoginScreen;


