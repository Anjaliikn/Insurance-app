import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get('window');

const TYPE_COLORS: Record<string, {accent: string; bg: string}> = {
  Health: {accent: '#EF5350', bg: '#FFEBEE'},
  Vehicle: {accent: '#42A5F5', bg: '#E3F2FD'},
  Life: {accent: '#AB47BC', bg: '#F3E5F5'},
  Property: {accent: '#66BB6A', bg: '#E8F5E9'},
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return {text: 'Good Morning', emoji: '🌅'};
  if (h < 17) return {text: 'Good Afternoon', emoji: '☀️'};
  return {text: 'Good Evening', emoji: '🌙'};
}

function InfoRow({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function HomeScreen({navigation}: any) {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [policies, setPolicies] = useState<any[]>([]);
  const [activeModal, setActiveModal] = useState<
    null | 'pay' | 'claim' | 'support'
  >(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const cardScale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(fadeAnim, {toValue: 1, duration: 500, useNativeDriver: true}),
        Animated.timing(slideAnim, {toValue: 0, duration: 500, useNativeDriver: true}),
      ]),
      Animated.spring(cardScale, {toValue: 1, friction: 8, useNativeDriver: true}),
    ]).start();
  }, []);

  useEffect(() => {
    (async () => {
      const email = await AsyncStorage.getItem('userEmail');
      const name = await AsyncStorage.getItem('userName');
      if (email) setUserEmail(email);
      if (name) setUserName(name);
    })();
  }, []);

  useEffect(() => {
    loadPolicies();
    const unsub = navigation.addListener('focus', loadPolicies);
    return unsub;
  }, [navigation]);

  async function loadPolicies() {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      if (!email) return;
      const data = await AsyncStorage.getItem(`policies_${email}`);
      setPolicies(data ? JSON.parse(data) : []);
    } catch (e) {
      console.log('Error loading policies:', e);
    }
  }

  async function handleLogout() {
    await AsyncStorage.removeItem('userEmail');
    await AsyncStorage.removeItem('userName');
    navigation.reset({index: 0, routes: [{name: 'Login'}]});
  }

  const activePolicies = policies.filter(p => p.status === 'Active');
  const totalCoverage = activePolicies.reduce((sum, p) => {
    const num = parseInt(p.coverage.replace(/[^0-9]/g, ''), 10) || 0;
    return sum + num;
  }, 0);

  function fmt(amount: number) {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)} K`;
    return `₹${amount}`;
  }

  const recentPolicies = [...policies].reverse().slice(0, 5);
  const greeting = getGreeting();
  const firstName = userName ? userName.split(' ')[0] : 'User';
  const avatarLetter = firstName.charAt(0).toUpperCase();

  const actions = [
    {icon: '📋', label: 'Policies', color: '#3F51B5', bg: '#E8EAF6', onPress: () => navigation.navigate('AddPolicyDatabase')},
    {icon: '🏥', label: 'Claims', color: '#E91E63', bg: '#FCE4EC', onPress: () => setActiveModal('claim')},
    {icon: '💳', label: 'Pay', color: '#FF9800', bg: '#FFF3E0', onPress: () => setActiveModal('pay')},
    {icon: '📞', label: 'Support', color: '#009688', bg: '#E0F2F1', onPress: () => setActiveModal('support')},
  ];

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor="#0D1442" barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        removeClippedSubviews={true}>
        {/* ── Header ── */}
        <View style={styles.headerBg}>
          <View style={styles.headerDecor} />
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.greetWrap}>
                <Text style={styles.greetEmoji}>{greeting.emoji}</Text>
                <View>
                  <Text style={styles.greetText}>{greeting.text},</Text>
                  <Text style={styles.greetName}>{firstName}</Text>
                </View>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                  <Text style={styles.logoutIcon}>🚪</Text>
                </TouchableOpacity>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{avatarLetter}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── Coverage Card ── */}
        <Animated.View style={[styles.coverageCard, {transform: [{scale: cardScale}]}]}>
          <View style={styles.coverageTop}>
            <View>
              <Text style={styles.coverageLabel}>Total Coverage</Text>
              <Text style={styles.coverageAmount}>
                {totalCoverage === 0 ? '₹0' : fmt(totalCoverage)}
              </Text>
            </View>
            <View style={styles.coverageBadge}>
              <Text style={styles.coverageBadgeNum}>{activePolicies.length}</Text>
              <Text style={styles.coverageBadgeText}>Active</Text>
            </View>
          </View>
          <View style={styles.coverageDivider} />
          <View style={styles.coverageBottom}>
            <View style={styles.coverageStat}>
              <Text style={styles.coverageStatNum}>{policies.length}</Text>
              <Text style={styles.coverageStatLabel}>Total</Text>
            </View>
            <View style={styles.coverageStatDivider} />
            <View style={styles.coverageStat}>
              <Text style={styles.coverageStatNum}>
                {policies.filter(p => p.type === 'Health').length}
              </Text>
              <Text style={styles.coverageStatLabel}>Health</Text>
            </View>
            <View style={styles.coverageStatDivider} />
            <View style={styles.coverageStat}>
              <Text style={styles.coverageStatNum}>
                {policies.filter(p => p.type === 'Vehicle').length}
              </Text>
              <Text style={styles.coverageStatLabel}>Vehicle</Text>
            </View>
            <View style={styles.coverageStatDivider} />
            <View style={styles.coverageStat}>
              <Text style={styles.coverageStatNum}>
                {policies.filter(p => p.type === 'Life').length}
              </Text>
              <Text style={styles.coverageStatLabel}>Life</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Quick Actions ── */}
        <Animated.View style={{opacity: fadeAnim, transform: [{translateY: slideAnim}]}}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {actions.map((a, i) => (
              <TouchableOpacity key={i} style={styles.actionCard} onPress={a.onPress} activeOpacity={0.7}>
                <View style={[styles.actionIconWrap, {backgroundColor: a.bg}]}>
                  <Text style={styles.actionIconText}>{a.icon}</Text>
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Manage Policies CTA ── */}
          <TouchableOpacity
            style={styles.manageCta}
            onPress={() => navigation.navigate('AddPolicyDatabase')}
            activeOpacity={0.8}>
            <Text style={styles.manageCtaIcon}>📋</Text>
            <View style={{flex: 1}}>
              <Text style={styles.manageCtaTitle}>Manage Your Policies</Text>
              <Text style={styles.manageCtaSub}>Add, edit, or view all your insurance policies</Text>
            </View>
            <Text style={styles.manageCtaArrow}>›</Text>
          </TouchableOpacity>

          {/* ── Recent Policies ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Policies</Text>
            {policies.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('AddPolicyDatabase')}>
                <Text style={styles.viewAll}>View All →</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentPolicies.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🗂️</Text>
              <Text style={styles.emptyTitle}>No policies yet</Text>
              <Text style={styles.emptySub}>
                Start by adding your first insurance policy
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('AddPolicyDatabase')}>
                <Text style={styles.emptyBtnText}>+ Add Policy</Text>
              </TouchableOpacity>
            </View>
          ) : (
            recentPolicies.map((policy, index) => {
              const tc = TYPE_COLORS[policy.type] || {accent: '#9E9E9E', bg: '#F5F5F5'};
              return (
                <TouchableOpacity
                  key={policy.id ?? index}
                  style={styles.policyCard}
                  onPress={() => navigation.navigate('AddPolicyDatabase')}
                  activeOpacity={0.7}>
                  <View style={[styles.policyAccent, {backgroundColor: tc.accent}]} />
                  <View style={[styles.policyIconWrap, {backgroundColor: tc.bg}]}>
                    <Text style={styles.policyIconText}>{policy.icon}</Text>
                  </View>
                  <View style={styles.policyInfo}>
                    <Text style={styles.policyName} numberOfLines={1}>{policy.name}</Text>
                    <Text style={styles.policyType}>{policy.type} Insurance</Text>
                    <View style={styles.policyMeta}>
                      <Text style={styles.policyMetaText}>💰 {policy.amount}</Text>
                      <Text style={styles.policyMetaDot}>•</Text>
                      <Text style={styles.policyMetaText}>📅 {policy.expiry || 'N/A'}</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    {backgroundColor: policy.status === 'Active' ? '#E8F5E9' : '#FFEBEE'},
                  ]}>
                    <View style={[
                      styles.statusDot,
                      {backgroundColor: policy.status === 'Active' ? '#4CAF50' : '#EF5350'},
                    ]} />
                    <Text style={[
                      styles.statusText,
                      {color: policy.status === 'Active' ? '#2E7D32' : '#C62828'},
                    ]}>
                      {policy.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </Animated.View>

        <View style={{height: 30}} />
      </ScrollView>

      {/* ── Pay Modal ── */}
      <Modal visible={activeModal === 'pay'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIconWrap, {backgroundColor: '#FFF3E0'}]}>
              <Text style={styles.modalIcon}>💳</Text>
            </View>
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
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Claim Modal ── */}
      <Modal visible={activeModal === 'claim'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIconWrap, {backgroundColor: '#FCE4EC'}]}>
              <Text style={styles.modalIcon}>🏥</Text>
            </View>
            <Text style={styles.modalTitle}>File a Claim</Text>
            <Text style={styles.modalDesc}>
              Need to make a claim? Here's what you'll need to get started.
            </Text>
            <View style={styles.infoBox}>
              <InfoRow label="Step 1" value="Notify insurer within 24 hrs" />
              <InfoRow label="Step 2" value="Submit bills & documents" />
              <InfoRow label="Step 3" value="Insurer reviews your claim" />
              <InfoRow label="Step 4" value="Amount credited in 7–10 days" />
            </View>
            <Text style={styles.modalNote}>
              📌 Keep all hospital bills, FIR copies, and photos ready before filing.
            </Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Support Modal ── */}
      <Modal visible={activeModal === 'support'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIconWrap, {backgroundColor: '#E0F2F1'}]}>
              <Text style={styles.modalIcon}>📞</Text>
            </View>
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
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#F0F2F5'},

  // ── Header ──
  headerBg: {
    backgroundColor: '#0D1442',
    paddingBottom: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  headerContent: {paddingHorizontal: 22, paddingTop: 50},
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetWrap: {flexDirection: 'row', alignItems: 'center', gap: 12},
  greetEmoji: {fontSize: 32},
  greetText: {fontSize: 14, color: 'rgba(255,255,255,0.7)'},
  greetName: {fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginTop: 2},
  headerRight: {flexDirection: 'row', alignItems: 'center', gap: 10},
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {fontSize: 18},
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#536DFE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {fontSize: 18, fontWeight: 'bold', color: '#FFFFFF'},

  // ── Coverage Card ──
  coverageCard: {
    marginHorizontal: 18,
    marginTop: -40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    elevation: 8,
    shadowColor: '#1a237e',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  coverageTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverageLabel: {fontSize: 13, color: '#888', fontWeight: '500'},
  coverageAmount: {fontSize: 34, fontWeight: 'bold', color: '#0D1442', marginTop: 4},
  coverageBadge: {
    backgroundColor: '#E8EAF6',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  coverageBadgeNum: {fontSize: 22, fontWeight: 'bold', color: '#3F51B5'},
  coverageBadgeText: {fontSize: 11, color: '#5C6BC0', marginTop: 2},
  coverageDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 16,
  },
  coverageBottom: {flexDirection: 'row', justifyContent: 'space-around'},
  coverageStat: {alignItems: 'center'},
  coverageStatNum: {fontSize: 18, fontWeight: 'bold', color: '#333'},
  coverageStatLabel: {fontSize: 11, color: '#999', marginTop: 3},
  coverageStatDivider: {width: 1, backgroundColor: '#F0F0F0', height: '100%'},

  // ── Section ──
  sectionTitle: {fontSize: 18, fontWeight: 'bold', color: '#222', paddingHorizontal: 22, marginBottom: 14},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 22,
  },
  viewAll: {fontSize: 13, color: '#3F51B5', fontWeight: '600'},

  // ── Quick Actions ──
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginBottom: 20,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    width: (width - 70) / 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIconText: {fontSize: 22},
  actionLabel: {fontSize: 12, color: '#555', fontWeight: '600'},

  // ── Manage CTA ──
  manageCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1442',
    marginHorizontal: 22,
    marginBottom: 24,
    borderRadius: 16,
    padding: 18,
    gap: 14,
  },
  manageCtaIcon: {fontSize: 28},
  manageCtaTitle: {fontSize: 15, fontWeight: 'bold', color: '#FFFFFF'},
  manageCtaSub: {fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3},
  manageCtaArrow: {fontSize: 28, color: 'rgba(255,255,255,0.4)'},

  // ── Policy Cards ──
  policyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 22,
    marginBottom: 12,
    borderRadius: 16,
    padding: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  policyAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  policyIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  policyIconText: {fontSize: 22},
  policyInfo: {flex: 1, marginLeft: 12},
  policyName: {fontSize: 15, fontWeight: 'bold', color: '#222'},
  policyType: {fontSize: 12, color: '#888', marginTop: 2},
  policyMeta: {flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6},
  policyMetaText: {fontSize: 11, color: '#AAA'},
  policyMetaDot: {fontSize: 8, color: '#CCC'},
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  statusDot: {width: 7, height: 7, borderRadius: 4},
  statusText: {fontSize: 11, fontWeight: 'bold'},

  // ── Empty State ──
  emptyCard: {
    marginHorizontal: 22,
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
  },
  emptyIcon: {fontSize: 48, marginBottom: 12},
  emptyTitle: {fontSize: 18, fontWeight: 'bold', color: '#333'},
  emptySub: {fontSize: 13, color: '#999', textAlign: 'center', marginTop: 6},
  emptyBtn: {
    marginTop: 18,
    backgroundColor: '#0D1442',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: {color: '#FFF', fontWeight: 'bold', fontSize: 14},

  // ── Modals ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    elevation: 20,
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalIcon: {fontSize: 32},
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0D1442',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#F8F9FE',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEDF5',
  },
  infoLabel: {fontSize: 13, color: '#666', fontWeight: '600', flex: 1},
  infoValue: {fontSize: 13, color: '#0D1442', fontWeight: '700', flex: 1, textAlign: 'right'},
  modalNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  modalCloseBtn: {
    backgroundColor: '#0D1442',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalCloseBtnText: {color: '#FFFFFF', fontSize: 16, fontWeight: 'bold'},
});

export default HomeScreen;