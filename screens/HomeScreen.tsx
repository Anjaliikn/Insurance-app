import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Small helper row used inside each modal info box
function InfoRow({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function HomeScreen({navigation}: any) {
  const [userEmail, setUserEmail] = useState('');
  const [policies, setPolicies] = useState<any[]>([]);
  const [activeModal, setActiveModal] = useState<
    null | 'pay' | 'claim' | 'support'
  >(null);

  // Load user email
  useEffect(() => {
    async function getEmail() {
      const email = await AsyncStorage.getItem('userEmail');
      if (email) setUserEmail(email);
    }
    getEmail();
  }, []);

  // Load policies whenever screen comes into focus
  useEffect(() => {
    loadPolicies();
    const unsubscribe = navigation.addListener('focus', loadPolicies);
    return unsubscribe;
  }, [navigation]);

  async function loadPolicies() {
    try {
      const data = await AsyncStorage.getItem('policies');
      setPolicies(data ? JSON.parse(data) : []);
    } catch (e) {
      console.log('Error loading policies:', e);
    }
  }

  // Derived stats
  const activePolicies = policies.filter(p => p.status === 'Active');
  const totalCoverage = activePolicies.reduce((sum, p) => {
    // coverage stored as "₹500000" — strip ₹ and parse
    const num = parseInt(p.coverage.replace(/[^0-9]/g, ''), 10) || 0;
    return sum + num;
  }, 0);

  function formatCoverage(amount: number): string {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)} K`;
    return `₹${amount}`;
  }

  const recentPolicies = [...policies].reverse().slice(0, 3);

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello! 👋</Text>
            <Text style={styles.subGreeting}>{userEmail}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>U</Text>
          </View>
        </View>

        {/* Coverage Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Coverage</Text>
          <Text style={styles.balanceAmount}>
            {totalCoverage === 0 ? '₹0' : formatCoverage(totalCoverage)}
          </Text>
          <Text style={styles.balanceSubtext}>
            {activePolicies.length} Active{' '}
            {activePolicies.length === 1 ? 'Policy' : 'Policies'}
          </Text>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('PolicyList')}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>Policies</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setActiveModal('claim')}>
            <Text style={styles.actionIcon}>🏥</Text>
            <Text style={styles.actionText}>Claim</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setActiveModal('pay')}>
            <Text style={styles.actionIcon}>💳</Text>
            <Text style={styles.actionText}>Pay</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setActiveModal('support')}>
            <Text style={styles.actionIcon}>📞</Text>
            <Text style={styles.actionText}>Support</Text>
          </TouchableOpacity>
        </View>

        {/* Add New Policy Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddPolicy')}>
          <Text style={styles.addButtonText}>+ Add New Policy</Text>
        </TouchableOpacity>

        {/* Recent Policies */}
        <Text style={styles.sectionTitle}>Recent Policies</Text>
        {recentPolicies.length === 0 ? (
          <View style={styles.emptyRecent}>
            <Text style={styles.emptyRecentText}>
              No policies yet — tap "+ Add New Policy" to get started!
            </Text>
          </View>
        ) : (
          recentPolicies.map((policy, index) => (
            <TouchableOpacity
              key={policy.id ?? index}
              style={styles.policyCard}
              onPress={() => navigation.navigate('PolicyList')}>
              <Text style={styles.policyIcon}>{policy.icon}</Text>
              <View style={styles.policyInfo}>
                <Text style={styles.policyName}>{policy.name}</Text>
                <Text style={styles.policyAmount}>{policy.amount}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{policy.status}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* bottom padding */}
        <View style={{height: 30}} />
      </ScrollView>

      {/* ── Pay Modal ── */}
      <Modal
        visible={activeModal === 'pay'}
        transparent
        animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>💳</Text>
            <Text style={styles.modalTitle}>Pay Premium</Text>
            <Text style={styles.modalDesc}>
              Keep your policies active by paying your premiums on time.
            </Text>
            <View style={styles.infoBox}>
              <InfoRow label="Next Due" value="15 May 2026" />
              <InfoRow label="Amount Due" value="₹5,000" />
              <InfoRow label="Payment Mode" value="UPI / Card / Net Banking" />
              <InfoRow label="Auto-pay" value="Not set up" />
            </View>
            <Text style={styles.modalNote}>
              📌 Contact your insurer or visit their portal to complete payment.
            </Text>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Claim Modal ── */}
      <Modal
        visible={activeModal === 'claim'}
        transparent
        animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>🏥</Text>
            <Text style={styles.modalTitle}>File a Claim</Text>
            <Text style={styles.modalDesc}>
              Need to make a claim? Here's what you'll need to get started.
            </Text>
            <View style={styles.infoBox}>
              <InfoRow label="Step 1" value="Notify your insurer within 24 hrs" />
              <InfoRow label="Step 2" value="Submit bills & documents" />
              <InfoRow label="Step 3" value="Insurer reviews your claim" />
              <InfoRow label="Step 4" value="Amount credited in 7–10 days" />
            </View>
            <Text style={styles.modalNote}>
              📌 Keep all hospital bills, FIR copies, and photos ready before filing.
            </Text>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Support Modal ── */}
      <Modal
        visible={activeModal === 'support'}
        transparent
        animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>📞</Text>
            <Text style={styles.modalTitle}>Customer Support</Text>
            <Text style={styles.modalDesc}>
              We're here to help you 24/7. Reach us through any channel below.
            </Text>
            <View style={styles.infoBox}>
              <InfoRow label="📱 Helpline" value="1800-123-4567 (Toll Free)" />
              <InfoRow label="✉️ Email" value="support@insureease.com" />
              <InfoRow label="🕐 Hours" value="Mon–Sat, 9 AM – 6 PM" />
              <InfoRow label="💬 Chat" value="Available in app (coming soon)" />
            </View>
            <Text style={styles.modalNote}>
              📌 Keep your policy number handy when you call for faster service.
            </Text>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
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
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subGreeting: {
    fontSize: 13,
    color: '#9fa8da',
    marginTop: 2,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  balanceCard: {
    margin: 20,
    backgroundColor: '#3949ab',
    borderRadius: 15,
    padding: 25,
    elevation: 5,
  },
  balanceLabel: {
    color: '#9fa8da',
    fontSize: 14,
  },
  balanceAmount: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 5,
  },
  balanceSubtext: {
    color: '#9fa8da',
    fontSize: 13,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '22%',
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  actionText: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a237e',
    elevation: 2,
  },
  addButtonText: {
    color: '#1a237e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  policyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    padding: 15,
    elevation: 3,
  },
  policyIcon: {
    fontSize: 30,
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
  policyAmount: {
    fontSize: 13,
    color: '#999',
    marginTop: 3,
  },
  statusBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: 'bold',
  },

  emptyRecent: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  emptyRecentText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Modal styles ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    elevation: 20,
  },
  modalIcon: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a237e',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#f0f4ff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#dce3f5',
  },
  infoLabel: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    color: '#1a237e',
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  modalNote: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  modalClose: {
    backgroundColor: '#1a237e',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;