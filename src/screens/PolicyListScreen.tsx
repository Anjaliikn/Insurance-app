import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function PolicyListScreen({ navigation }: any) {
  const [policies, setPolicies] = useState<any[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Load policies from AsyncStorage when screen opens
  useEffect(() => {
    loadPolicies();
  }, []);

  // Also reload when screen comes back into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPolicies();
    });
    return unsubscribe;
  }, [navigation]);

  async function loadPolicies() {
    try {
      const data = await AsyncStorage.getItem('policies');
      if (data) {
        setPolicies(JSON.parse(data));
      }
    } catch (error) {
      console.log('Error loading policies:', error);
    }
  }

  async function deletePolicy(id: string) {
    try {
      const updatedPolicies = policies.filter(p => p.id !== id);
      await AsyncStorage.setItem('policies', JSON.stringify(updatedPolicies));
      setPolicies(updatedPolicies);
      setModalVisible(false);
    } catch (error) {
      console.log('Error deleting policy:', error);
    }
  }

  const filteredPolicies = useMemo(() => {
    if (searchText === '') return policies;
    return policies.filter(policy =>
      policy.name.toLowerCase().includes(searchText.toLowerCase()) ||
      policy.type.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, policies]);

  const openPolicy = useCallback((policy: any) => {
    setSelectedPolicy(policy);
    setModalVisible(true);
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Policies</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddPolicy')}>
          <Text style={styles.addButton}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search policies..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Text style={styles.clearButton}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results count */}
      <Text style={styles.resultsText}>
        {filteredPolicies.length} policies found
      </Text>

      {/* Policy List */}
      <FlatList
        data={filteredPolicies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No policies yet!</Text>
            <Text style={styles.emptySubtext}>Tap "+ Add" to add your first policy</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.policyCard}
            onPress={() => openPolicy(item)}>
            <Text style={styles.policyIcon}>{item.icon}</Text>
            <View style={styles.policyInfo}>
              <Text style={styles.policyName}>{item.name}</Text>
              <Text style={styles.policyType}>{item.type}</Text>
              <Text style={styles.policyAmount}>{item.amount}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.status === 'Active' ? '#e8f5e9' : '#ffebee' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: item.status === 'Active' ? '#2e7d32' : '#c62828' }
              ]}>
                {item.status}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Policy Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedPolicy && (
              <>
                <Text style={styles.modalIcon}>{selectedPolicy.icon}</Text>
                <Text style={styles.modalTitle}>{selectedPolicy.name}</Text>
                <Text style={styles.modalType}>{selectedPolicy.type}</Text>

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Premium</Text>
                  <Text style={styles.modalValue}>{selectedPolicy.amount}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Coverage</Text>
                  <Text style={styles.modalValue}>{selectedPolicy.coverage}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Expiry</Text>
                  <Text style={styles.modalValue}>{selectedPolicy.expiry}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Status</Text>
                  <Text style={[
                    styles.modalValue,
                    { color: selectedPolicy.status === 'Active' ? '#2e7d32' : '#c62828' }
                  ]}>
                    {selectedPolicy.status}
                  </Text>
                </View>

                {/* Delete Button */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deletePolicy(selectedPolicy.id)}>
                  <Text style={styles.deleteButtonText}>🗑️ Delete Policy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
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
  addButton: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 15,
    borderRadius: 10,
    paddingHorizontal: 15,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    fontSize: 18,
    color: '#999',
    padding: 5,
  },
  resultsText: {
    paddingHorizontal: 20,
    color: '#999',
    fontSize: 13,
    marginBottom: 5,
  },
  listContainer: {
    padding: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  policyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
  },
  policyIcon: {
    fontSize: 35,
    marginRight: 15,
  },
  policyInfo: {
    flex: 1,
  },
  policyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  policyType: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  policyAmount: {
    fontSize: 14,
    color: '#1a237e',
    fontWeight: 'bold',
    marginTop: 3,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 30,
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  modalType: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalLabel: {
    fontSize: 15,
    color: '#999',
  },
  modalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButtonText: {
    color: '#c62828',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#1a237e',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PolicyListScreen;