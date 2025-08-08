import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signOut,
    updateProfile
} from "firebase/auth";
import { auth } from "./config";
import { createUser, getCustomerByEmail, getUser } from "./firestore";

// Sign up with email and password
export const signUp = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile
    await updateProfile(user, {
      displayName: userData.fullName
    });
    
    // Create user document in Firestore
    const userDocData = {
      uid: user.uid,
      email: user.email,
      fullName: userData.fullName,
      phoneNumber: userData.phoneNumber,
      createdAt: new Date()
    };
    
    await createUser(userDocData);
    
    return user;
  } catch (error) {
    console.error("Error signing up: ", error);
    throw error;
  }
};

// Sign in with email and phone number (custom authentication)
export const signInWithEmailAndPhone = async (email, phoneNumber) => {
  try {
    // Check if customer exists in Firestore
    const customer = await getCustomerByEmail(email);
    
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    // Check if phone number matches
    if (customer.phone !== phoneNumber) {
      throw new Error('Invalid phone number');
    }
    
    // For now, we'll create a simple authentication state
    // In a real app, you might want to use Firebase Auth or a custom token system
    return {
      uid: customer.customerId?.toString() || customer.id,
      email: customer.email,
      displayName: customer.name,
      phoneNumber: customer.phone,
      customerId: customer.customerId || customer.id // Include customerId for course filtering
    };
  } catch (error) {
    console.error("Error signing in: ", error);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error resetting password: ", error);
    throw error;
  }
};

// Get user profile from Firestore
export const getUserProfile = async (uid) => {
  try {
    const user = await getUser(uid);
    return user;
  } catch (error) {
    console.error("Error getting user profile: ", error);
    throw error;
  }
};
