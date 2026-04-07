import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function AddPolicyScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [coverage, setCoverage] = useState('');
  const [expiry, setExpiry] = useState('');

  const policyTypes = [
    { label: '🏥 Health', value: 'Health' },
    { label: '🚗 Vehicle', value: 'Vehicle' },
    { label: '❤️ Life', value: 'Life' },
    { label: '🏠 Property', value: 'Property' },
  ];

  function getIcon(type: string) {
    switch (type) {
      case 'Health': return '🏥';
      case 'Vehicle': return '🚗';
      case 'Life': return '❤️';
      case 'Property': return '🏠';
      default: return '📋';
    }
  }

  async function savePolicy() {
    if (!name || !type || !amount || !coverage || !expiry) {
      Alert.alert('Error', 'Please fill all fields!');
      return;
    }

    try {
      const existingData = await AsyncStorage.getItem('policies');
      const existingPolicies = existingData ? JSON.parse(existingData) : [];

      const newPolicy = {
        id: Date.now().toString(),
        name,
        type,
        amount: `₹${amount}/yr`,
        coverage: `₹${coverage}`,
        status: 'Active',
        icon: getIcon(type),
        expiry,
      };

      const updatedPolicies = [...existingPolicies, newPolicy];
      await AsyncStorage.setItem('policies', JSON.stringify(updatedPolicies));

      Alert.alert('Success! 🎉', 'Policy added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);

    } catch (error) {
      Alert.alert('Error', 'Something went wrong!');
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Policy</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.form}>

        {/* Policy Name */}
        <Text style={styles.label}>Policy Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Health Insurance"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />

        {/* Policy Type */}
        <Text style={styles.label}>Policy Type</Text>
        <View style={styles.typeContainer}>
          {policyTypes.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.typeButton,
                type === item.value ? styles.typeButtonActive : null,
              ]}
              onPress={() => setType(item.value)}>
              <Text style={[
                styles.typeButtonText,
                type === item.value ? styles.typeButtonTextActive : null,
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Premium Amount */}
        <Text style={styles.label}>Premium Amount (₹/year)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 5000"
          placeholderTextColor="#999"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        {/* Coverage Amount */}
        <Text style={styles.label}>Coverage Amount (₹)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 500000"
          placeholderTextColor="#999"
          value={coverage}
          onChangeText={setCoverage}
          keyboardType="numeric"
        />

        {/* Expiry Date */}
        <Text style={styles.label}>Expiry Date</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 31 Dec 2025"
          placeholderTextColor="#999"
          value={expiry}
          onChangeText={setExpiry}
        />

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={savePolicy}>
          <Text style={styles.saveButtonText}>Save Policy ✅</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1a237e',
  },
  backButton: {
    color: '#ffffff',
    fontSize: 16,
    width: 50,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeButton: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  typeButtonActive: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
  },
  typeButtonText: {
    color: '#333',
    fontSize: 14,
  },
  typeButtonTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#1a237e',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddPolicyScreen;