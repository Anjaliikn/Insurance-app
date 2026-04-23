import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

type Policy = {
  id: string;
  name: string;
  type: string;
  amount: string;
  coverage: string;
  status: string;
  icon: string;
  expiry: string;
};

const POLICY_TYPES = [
  { label: '🏥 Health', value: 'Health', icon: '🏥' },
  { label: '🚗 Vehicle', value: 'Vehicle', icon: '🚗' },
  { label: '❤️ Life', value: 'Life', icon: '❤️' },
  { label: '🏠 Property', value: 'Property', icon: '🏠' },
];

function getIcon(type: string) {
  const match = POLICY_TYPES.find(t => t.value === type);
  return match ? match.icon : '📋';
}

function AddPolicyDatabaseScreen({ navigation }: any) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [search, setSearch] = useState('');

  // ── Add/Edit modal state ──
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCoverage, setFormCoverage] = useState('');
  const [formExpiry, setFormExpiry] = useState('');

  // ── Detail view modal state ──
  const [detailModal, setDetailModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  // Reload every time the screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadPolicies();
    }, [])
  );

  async function loadPolicies() {
    try {
      const data = await AsyncStorage.getItem('policies');
      setPolicies(data ? JSON.parse(data) : []);
    } catch {
      Alert.alert('Error', 'Could not load policies.');
    }
  }

  // ── Open Add form ──
  function openAddModal() {
    setEditingPolicy(null);
    setFormName('');
    setFormType('');
    setFormAmount('');
    setFormCoverage('');
    setFormExpiry('');
    setModalVisible(true);
  }

  // ── Open Edit form ──
  function openEditModal(policy: Policy) {
    setEditingPolicy(policy);
    setFormName(policy.name);
    setFormType(policy.type);
    // strip formatting for editing
    setFormAmount(policy.amount.replace(/[^0-9]/g, ''));
    setFormCoverage(policy.coverage.replace(/[^0-9]/g, ''));
    setFormExpiry(policy.expiry);
    setDetailModal(false);
    setModalVisible(true);
  }

  // ── Save (Create or Update) ──
  async function savePolicy() {
    if (!formName.trim() || !formType || !formAmount.trim() || !formCoverage.trim() || !formExpiry.trim()) {
      Alert.alert('Incomplete', 'Please fill in all fields.');
      return;
    }

    try {
      let updated: Policy[];

      if (editingPolicy) {
        // UPDATE
        updated = policies.map(p =>
          p.id === editingPolicy.id
            ? {
              ...p,
              name: formName.trim(),
              type: formType,
              icon: getIcon(formType),
              amount: `₹${formAmount}/yr`,
              coverage: `₹${formCoverage}`,
              expiry: formExpiry.trim(),
            }
            : p
        );
        Alert.alert('Updated! ✏️', 'Policy updated successfully.');
      } else {
        // CREATE
        const newPolicy: Policy = {
          id: Date.now().toString(),
          name: formName.trim(),
          type: formType,
          icon: getIcon(formType),
          amount: `₹${formAmount}/yr`,
          coverage: `₹${formCoverage}`,
          status: 'Active',
          expiry: formExpiry.trim(),
        };
        updated = [...policies, newPolicy];
        Alert.alert('Saved! 🎉', 'Policy added to  database.');
      }

      await AsyncStorage.setItem('policies', JSON.stringify(updated));
      setPolicies(updated);
      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'Could not save policy.');
    }
  }

  // ── Delete ──
  function confirmDelete(policy: Policy) {
    Alert.alert(
      'Delete Policy',
      `Are you sure you want to delete "${policy.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = policies.filter(p => p.id !== policy.id);
              await AsyncStorage.setItem('policies', JSON.stringify(updated));
              setPolicies(updated);
              setDetailModal(false);
            } catch {
              Alert.alert('Error', 'Could not delete policy.');
            }
          },
        },
      ]
    );
  }

  // ── Open Detail ──
  function openDetail(policy: Policy) {
    setSelectedPolicy(policy);
    setDetailModal(true);
  }

  const filtered = policies.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Policy Database</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Text style={styles.addButton}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* ── Stats Bar ── */}
      <View style={styles.statsBar}>
        {[
          { label: 'Total', count: policies.length },
          { label: 'Health', count: policies.filter(p => p.type === 'Health').length },
          { label: 'Vehicle', count: policies.filter(p => p.type === 'Vehicle').length },
          { label: 'Life', count: policies.filter(p => p.type === 'Life').length },
          { label: 'Property', count: policies.filter(p => p.type === 'Property').length },
        ].map((s, i, arr) => (
          <React.Fragment key={s.label}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{s.count}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
            {i < arr.length - 1 && <View style={styles.statDivider} />}
          </React.Fragment>
        ))}
      </View>

      {/* ── Search ── */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or type..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
        {search !== '' && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Table Header ── */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, { flex: 0.4 }]}>#</Text>
        <Text style={[styles.tableHeaderText, { flex: 2 }]}>Policy</Text>
        <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Premium</Text>
        <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Coverage</Text>
        <Text style={[styles.tableHeaderText, { flex: 0.8, textAlign: 'center' }]}>Actions</Text>
      </View>

      {/* ── Policy Rows ── */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🗂️</Text>
            <Text style={styles.emptyText}>No policies found</Text>
            <Text style={styles.emptySubText}>
              {policies.length === 0
                ? 'Tap "+ Add" to create your first policy'
                : 'Try a different search term'}
            </Text>
            {policies.length === 0 && (
              <TouchableOpacity style={styles.emptyAddBtn} onPress={openAddModal}>
                <Text style={styles.emptyAddBtnText}>+ Add Policy</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filtered.map((policy, index) => (
            <TouchableOpacity
              key={policy.id}
              style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}
              onPress={() => openDetail(policy)}
              activeOpacity={0.7}>
              <Text style={[styles.cell, { flex: 0.4, color: '#999' }]}>{index + 1}</Text>
              <View style={{ flex: 2 }}>
                <Text style={styles.policyName} numberOfLines={1}>
                  {policy.icon} {policy.name}
                </Text>
                <Text style={styles.policyType}>{policy.type}</Text>
                <Text style={styles.policyExpiry}>Exp: {policy.expiry}</Text>
              </View>
              <Text style={[styles.cell, { flex: 1.2, color: '#1a237e', fontWeight: '600' }]}>
                {policy.amount}
              </Text>
              <Text style={[styles.cell, { flex: 1.2, color: '#2e7d32', fontWeight: '600' }]}>
                {policy.coverage}
              </Text>
              <View style={{ flex: 0.8, flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                <TouchableOpacity onPress={() => openEditModal(policy)}>
                  <Text style={styles.actionIcon}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(policy)}>
                  <Text style={styles.actionIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ══════════════════════════════════════════
           ADD / EDIT MODAL
         ══════════════════════════════════════════ */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingPolicy ? '✏️ Edit Policy' : '➕ Add New Policy'}
            </Text>

            {/* Policy Name */}
            <Text style={styles.formLabel}>Policy Name</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. Health Insurance"
              placeholderTextColor="#bbb"
              value={formName}
              onChangeText={setFormName}
            />

            {/* Policy Type */}
            <Text style={styles.formLabel}>Policy Type</Text>
            <View style={styles.typeRow}>
              {POLICY_TYPES.map(t => (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.typeChip, formType === t.value && styles.typeChipActive]}
                  onPress={() => setFormType(t.value)}>
                  <Text style={[styles.typeChipText, formType === t.value && styles.typeChipTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Premium */}
            <Text style={styles.formLabel}>Premium (₹/year)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. 5000"
              placeholderTextColor="#bbb"
              value={formAmount}
              onChangeText={setFormAmount}
              keyboardType="numeric"
            />

            {/* Coverage */}
            <Text style={styles.formLabel}>Coverage Amount (₹)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. 500000"
              placeholderTextColor="#bbb"
              value={formCoverage}
              onChangeText={setFormCoverage}
              keyboardType="numeric"
            />

            {/* Expiry */}
            <Text style={styles.formLabel}>Expiry Date</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. 31 Dec 2025"
              placeholderTextColor="#bbb"
              value={formExpiry}
              onChangeText={setFormExpiry}
            />

            {/* Buttons */}
            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={savePolicy}>
                <Text style={styles.saveBtnText}>
                  {editingPolicy ? 'Update' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══════════════════════════════════════════
           DETAIL MODAL
         ══════════════════════════════════════════ */}
      <Modal visible={detailModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.detailCard}>
            {selectedPolicy && (
              <>
                <Text style={styles.detailIcon}>{selectedPolicy.icon}</Text>
                <Text style={styles.detailTitle}>{selectedPolicy.name}</Text>
                <Text style={styles.detailType}>{selectedPolicy.type} Insurance</Text>

                <View style={styles.detailGrid}>
                  <View style={styles.detailGridItem}>
                    <Text style={styles.detailGridLabel}>Premium</Text>
                    <Text style={styles.detailGridValue}>{selectedPolicy.amount}</Text>
                  </View>
                  <View style={styles.detailGridItem}>
                    <Text style={styles.detailGridLabel}>Coverage</Text>
                    <Text style={styles.detailGridValue}>{selectedPolicy.coverage}</Text>
                  </View>
                  <View style={styles.detailGridItem}>
                    <Text style={styles.detailGridLabel}>Expiry</Text>
                    <Text style={styles.detailGridValue}>{selectedPolicy.expiry}</Text>
                  </View>
                  <View style={styles.detailGridItem}>
                    <Text style={styles.detailGridLabel}>Status</Text>
                    <Text style={[
                      styles.detailGridValue,
                      { color: selectedPolicy.status === 'Active' ? '#2e7d32' : '#c62828' }
                    ]}>
                      {selectedPolicy.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailActions}>
                  <TouchableOpacity
                    style={styles.editDetailBtn}
                    onPress={() => openEditModal(selectedPolicy)}>
                    <Text style={styles.editDetailBtnText}>✏️ Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteDetailBtn}
                    onPress={() => confirmDelete(selectedPolicy)}>
                    <Text style={styles.deleteDetailBtnText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.closeDetailBtn}
                  onPress={() => setDetailModal(false)}>
                  <Text style={styles.closeDetailBtnText}>Close</Text>
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1a237e',
  },
  backButton: { color: '#fff', fontSize: 16, width: 50 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  addButton: { color: '#fff', fontSize: 16, fontWeight: 'bold', width: 50, textAlign: 'right' },

  // ── Stats ──
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#283593',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: '#9fa8da', fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#3949ab' },

  // ── Search ──
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 9, fontSize: 14, color: '#333' },
  clearSearch: { color: '#999', fontSize: 16, padding: 4 },

  // ── Table ──
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e8eaf6',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#c5cae9',
    alignItems: 'center',
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1a237e',
    textTransform: 'uppercase',
  },
  list: { flex: 1 },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 11,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rowEven: { backgroundColor: '#fff' },
  rowOdd: { backgroundColor: '#f9f9fb' },
  cell: { fontSize: 13, color: '#333' },
  policyName: { fontSize: 13, fontWeight: 'bold', color: '#222' },
  policyType: { fontSize: 11, color: '#777', marginTop: 1 },
  policyExpiry: { fontSize: 11, color: '#aaa', marginTop: 1 },
  actionIcon: { fontSize: 16 },

  // ── Empty State ──
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 50, marginBottom: 14 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  emptySubText: { fontSize: 13, color: '#999', textAlign: 'center', paddingHorizontal: 30 },
  emptyAddBtn: {
    marginTop: 20,
    backgroundColor: '#1a237e',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyAddBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  // ── Modal overlay ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  // ── Add/Edit Form Card ──
  formCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 34,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 16,
    textAlign: 'center',
  },
  formLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  formInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#f5f5f5',
  },
  typeChipActive: { backgroundColor: '#1a237e', borderColor: '#1a237e' },
  typeChipText: { fontSize: 13, color: '#555' },
  typeChipTextActive: { color: '#fff', fontWeight: 'bold' },
  formActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelBtnText: { color: '#666', fontSize: 15, fontWeight: '600' },
  saveBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#1a237e',
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  // ── Detail Card ──
  detailCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  detailIcon: { fontSize: 52, marginBottom: 8 },
  detailTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a237e', marginBottom: 4 },
  detailType: { fontSize: 13, color: '#888', marginBottom: 20 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', marginBottom: 16 },
  detailGridItem: {
    width: '50%',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailGridLabel: { fontSize: 12, color: '#999', marginBottom: 3 },
  detailGridValue: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  detailActions: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 12 },
  editDetailBtn: {
    flex: 1,
    backgroundColor: '#e8eaf6',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  editDetailBtnText: { color: '#1a237e', fontWeight: 'bold', fontSize: 15 },
  deleteDetailBtn: {
    flex: 1,
    backgroundColor: '#ffebee',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteDetailBtnText: { color: '#c62828', fontWeight: 'bold', fontSize: 15 },
  closeDetailBtn: {
    backgroundColor: '#1a237e',
    padding: 14,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  closeDetailBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});

export default AddPolicyDatabaseScreen;
