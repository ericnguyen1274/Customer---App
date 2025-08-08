import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { collection, getDocs, query } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../firebase/config';
import { createCustomerWithId, getCustomerByEmail } from '../firebase/firestore';
import { AuthStackParamList } from '../navigation/AuthStack';

const { width } = Dimensions.get('window');

type SignupScreenProps = NativeStackScreenProps<AuthStackParamList, 'Signup'> & {
  setIsLoggedIn: (value: boolean) => void;
};

export default function SignupScreen({ navigation }: SignupScreenProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async () => {
    if (!fullName.trim() || !email.trim() || !phoneNumber.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);

      // Check if email already exists
      const existingCustomer = await getCustomerByEmail(email.trim());
      if (existingCustomer) {
        Alert.alert('Error', 'An account with this email already exists');
        return;
      }

      // Get the next customer ID by counting existing customers
      const customersQuery = query(collection(db, 'customers'));
      const customersSnapshot = await getDocs(customersQuery);
      const nextCustomerId = customersSnapshot.size + 1;

      // Create customer data
      const customerData = {
        customerId: nextCustomerId,
        email: email.trim(),
        name: fullName.trim(),
        phone: phoneNumber.trim(),
      };

      // Create customer in Firestore
      await createCustomerWithId(nextCustomerId.toString(), customerData);

      Alert.alert(
        'Success', 
        'Account created successfully! You can now log in with your email and phone number.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );

    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="account-plus" size={48} color="#FFD600" />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join our community today</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#757575"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#757575"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#757575"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  editable={!loading}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.createButton, loading && styles.disabledButton]} 
              onPress={handleCreateAccount}
              disabled={loading}
            >
              <Text style={styles.createButtonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
              <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  input: {
    fontSize: 16,
    color: '#111111',
  },
  createButton: {
    backgroundColor: '#FFD600',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  backButtonText: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: '500',
  },
}); 