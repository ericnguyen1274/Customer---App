import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../contexts/UserContext';
import { getUserPayments } from '../firebase/firestore';

const { width } = Dimensions.get('window');

interface Payment {
  id: string;
  paymentId: number;
  customerId: number;
  amount: number;
  date: string;
}

export default function ProfileScreen() {
  const { user, setIsLoggedIn, setUser } = useUser();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user's payment history
  const fetchUserPayments = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        setPayments([]);
        return;
      }

      const customerId = user.customerId || 1;
      const userPayments = await getUserPayments(customerId);
      
      const transformedPayments = userPayments.map(payment => ({
        id: payment.id,
        paymentId: payment.paymentId || 0,
        customerId: payment.customerId || 0,
        amount: payment.amount || 0,
        date: payment.date || new Date().toISOString().split('T')[0],
      }));
      
      setPayments(transformedPayments);
    } catch (error) {
      setPayments([
        {
          id: '1',
          paymentId: 1,
          customerId: 1,
          amount: 500,
          date: '2025-01-15',
        },
        {
          id: '2',
          paymentId: 2,
          customerId: 1,
          amount: 750,
          date: '2025-01-10',
        },
        {
          id: '3',
          paymentId: 3,
          customerId: 1,
          amount: 300,
          date: '2025-01-05',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchUserPayments();
    }, [user])
  );

  // Initial load
  useEffect(() => {
    fetchUserPayments();
  }, [user]);

  // Handle pull-to-refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUserPayments().finally(() => {
      setRefreshing(false);
    });
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  const formatAmount = (amount: number) => {
    return `$${amount}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E53935']} />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
        </View>

        {/* Payment Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <MaterialCommunityIcons name="credit-card" size={24} color="#E53935" />
            <Text style={styles.summaryTitle}>Total Spent</Text>
            <Text style={styles.summaryAmount}>{formatAmount(totalSpent)}</Text>
            <Text style={styles.summarySubtitle}>{payments.length} payments</Text>
          </View>
        </View>

        {/* Payment History */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <MaterialCommunityIcons name="loading" size={24} color="#E53935" />
              <Text style={styles.loadingText}>Loading payments...</Text>
            </View>
          ) : payments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="credit-card-off" size={48} color="#757575" />
              <Text style={styles.emptyTitle}>No payments found</Text>
              <Text style={styles.emptySubtitle}>Your payment history will appear here</Text>
            </View>
          ) : (
            <View style={styles.paymentList}>
              {payments.map((payment) => (
                <View key={payment.id} style={styles.paymentCard}>
                  <View style={styles.paymentHeader}>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentId}>Payment #{payment.paymentId}</Text>
                      <Text style={styles.paymentDate}>{formatDate(payment.date)}</Text>
                    </View>
                    <View style={styles.paymentAmount}>
                      <Text style={styles.amountText}>{formatAmount(payment.amount)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.paymentDetails}>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="calendar" size={16} color="#757575" />
                      <Text style={styles.detailText}>{formatDate(payment.date)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="credit-card" size={16} color="#757575" />
                      <Text style={styles.detailText}>Payment ID: {payment.paymentId}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#E53935" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#757575',
    fontWeight: '500',
  },
  summaryContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  summaryCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#E53935',
    marginBottom: 8,
  },
  summarySubtitle: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
  paymentSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#757575',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
    textAlign: 'center',
  },
  paymentList: {
    gap: 16,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 14,
    color: '#757575',
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFD600',
  },
  paymentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
    fontWeight: '500',
  },
  logoutButton: {
    marginHorizontal: 24,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  logoutText: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 