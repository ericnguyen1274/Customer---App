import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    setDoc,
    updateDoc,
    where
} from "firebase/firestore";
import { db } from "./config";

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  COURSES: 'courses',
  ENROLLMENTS: 'enrollments',
  PROGRESS: 'progress',
  CUSTOMERS: 'customers',
  COURSE_CUSTOMER_REFS: 'course_customer_refs',
  PAYMENTS: 'payments',
  TEACHERS: 'teachers',
  CATEGORIES: 'categories'
};

// User operations
export const createUser = async (userData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.USERS), {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating user: ", error);
    throw error;
  }
};

export const getUser = async (userId) => {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user: ", error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(docRef, {
      ...userData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error updating user: ", error);
    throw error;
  }
};

// Course operations
export const getAllCourses = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.COURSES));
    const courses = [];
    querySnapshot.forEach((doc) => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    return courses;
  } catch (error) {
    console.error("Error getting courses: ", error);
    throw error;
  }
};

export const getCourse = async (courseId) => {
  try {
    const docRef = doc(db, COLLECTIONS.COURSES, courseId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting course: ", error);
    throw error;
  }
};

export const createCourse = async (courseData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.COURSES), {
      ...courseData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating course: ", error);
    throw error;
  }
};

// Enrollment operations
export const enrollUserInCourse = async (userId, courseId) => {
  try {
    const enrollmentData = {
      userId,
      courseId,
      enrolledAt: new Date(),
      status: 'active',
      progress: 0
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.ENROLLMENTS), enrollmentData);
    return docRef.id;
  } catch (error) {
    console.error("Error enrolling user: ", error);
    throw error;
  }
};

export const getUserEnrollments = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.ENROLLMENTS),
      where("userId", "==", userId),
      where("status", "==", "active")
    );
    
    const querySnapshot = await getDocs(q);
    const enrollments = [];
    querySnapshot.forEach((doc) => {
      enrollments.push({ id: doc.id, ...doc.data() });
    });
    return enrollments;
  } catch (error) {
    console.error("Error getting user enrollments: ", error);
    throw error;
  }
};

export const updateEnrollmentProgress = async (enrollmentId, progress) => {
  try {
    const docRef = doc(db, COLLECTIONS.ENROLLMENTS, enrollmentId);
    await updateDoc(docRef, {
      progress,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error updating enrollment progress: ", error);
    throw error;
  }
};

// Progress tracking
export const saveProgress = async (userId, courseId, progressData) => {
  try {
    const progressDoc = {
      userId,
      courseId,
      ...progressData,
      timestamp: new Date()
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.PROGRESS), progressDoc);
    return docRef.id;
  } catch (error) {
    console.error("Error saving progress: ", error);
    throw error;
  }
};

export const getUserProgress = async (userId, courseId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.PROGRESS),
      where("userId", "==", userId),
      where("courseId", "==", courseId),
      orderBy("timestamp", "desc"),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting user progress: ", error);
    throw error;
  }
};

// Search and filter operations
export const searchCourses = async (searchTerm) => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.COURSES));
    const courses = [];
    querySnapshot.forEach((doc) => {
      const courseData = doc.data();
      if (courseData.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          courseData.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        courses.push({ id: doc.id, ...courseData });
      }
    });
    return courses;
  } catch (error) {
    console.error("Error searching courses: ", error);
    throw error;
  }
};

export const getCoursesByLevel = async (level) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.COURSES),
      where("level", "==", level)
    );
    
    const querySnapshot = await getDocs(q);
    const courses = [];
    querySnapshot.forEach((doc) => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    return courses;
  } catch (error) {
    console.error("Error getting courses by level: ", error);
    throw error;
  }
};

// Customer operations
export const getCustomerByEmail = async (email) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.CUSTOMERS),
      where("email", "==", email)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting customer by email: ", error);
    throw error;
  }
};

export const createCustomer = async (customerData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.CUSTOMERS), {
      ...customerData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating customer: ", error);
    throw error;
  }
};

export const createCustomerWithId = async (customerId, customerData) => {
  try {
    // Create document with custom integer ID
    const docRef = doc(db, COLLECTIONS.CUSTOMERS, customerId.toString());
    
    // Use setDoc instead of addDoc to specify custom document ID
    await setDoc(docRef, {
      ...customerData,
      customerId: parseInt(customerId),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return customerId.toString();
  } catch (error) {
    console.error("Error creating customer with ID: ", error);
    throw error;
  }
};

export const updateCustomer = async (customerId, customerData) => {
  try {
    const docRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
    await updateDoc(docRef, {
      ...customerData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error updating customer: ", error);
    throw error;
  }
};

// Course-Customer Reference operations
export const getUserPurchasedCourses = async (customerId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.COURSE_CUSTOMER_REFS),
      where("customerId", "==", customerId)
    );
    
    const querySnapshot = await getDocs(q);
    const purchasedCourseIds = [];
    
    querySnapshot.forEach((doc) => {
      purchasedCourseIds.push(doc.data().courseId);
    });
    
    return purchasedCourseIds;
  } catch (error) {
    console.error("Error getting user purchased courses: ", error);
    throw error;
  }
};

export const getAvailableCourses = async (customerId) => {
  try {
    // Get all courses
    const allCourses = await getAllCourses();
    
    // Get user's purchased course IDs
    const purchasedCourseIds = await getUserPurchasedCourses(customerId);
    
    // Filter out courses that user has already purchased
    const availableCourses = allCourses.filter(course => 
      !purchasedCourseIds.includes(course.courseId)
    );
    
    return availableCourses;
  } catch (error) {
    console.error("Error getting available courses: ", error);
    throw error;
  }
};

export const getPurchasedCourses = async (customerId) => {
  try {
    // Get user's purchased course IDs
    const purchasedCourseIds = await getUserPurchasedCourses(customerId);
    
    // Get all courses
    const allCourses = await getAllCourses();
    
    // Filter to only purchased courses
    const purchasedCourses = allCourses.filter(course => 
      purchasedCourseIds.includes(course.courseId)
    );
    
    return purchasedCourses;
  } catch (error) {
    console.error("Error getting purchased courses: ", error);
    throw error;
  }
};

export const purchaseCourse = async (customerId, courseId) => {
  try {
    const purchaseData = {
      customerId: customerId,
      courseId: courseId
    };
    
    // Create document with custom ID: courseId_customerId
    const customDocId = `${courseId}_${customerId}`;
    const docRef = doc(db, COLLECTIONS.COURSE_CUSTOMER_REFS, customDocId);
    
    // Use setDoc instead of addDoc to specify custom document ID
    await setDoc(docRef, purchaseData);
    
    return customDocId;
  } catch (error) {
    console.error("Error purchasing course: ", error);
    throw error;
  }
};

// Payment operations
export const getUserPayments = async (customerId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.PAYMENTS),
      where("customerId", "==", customerId)
    );
    
    const querySnapshot = await getDocs(q);
    const payments = [];
    
    querySnapshot.forEach((doc) => {
      payments.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort payments by date in descending order (newest first) in JavaScript
    payments.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA; // Descending order
    });
    
    return payments;
  } catch (error) {
    console.error("Error getting user payments: ", error);
    throw error;
  }
};

export const createPayment = async (paymentData) => {
  try {
    // Get the next payment ID by counting existing payments
    const paymentsQuery = query(collection(db, COLLECTIONS.PAYMENTS));
    const paymentsSnapshot = await getDocs(paymentsQuery);
    const nextPaymentId = paymentsSnapshot.size + 1;
    
    // Create document with custom integer ID
    const customDocId = nextPaymentId.toString();
    const docRef = doc(db, COLLECTIONS.PAYMENTS, customDocId);
    
    // Use setDoc instead of addDoc to specify custom document ID
    await setDoc(docRef, {
      ...paymentData,
      paymentId: nextPaymentId // Ensure paymentId matches document ID
    });
    
    return customDocId;
  } catch (error) {
    console.error("Error creating payment: ", error);
    throw error;
  }
};

export const getPaymentById = async (paymentId) => {
  try {
    const docRef = doc(db, COLLECTIONS.PAYMENTS, paymentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting payment: ", error);
    throw error;
  }
};

// Teacher operations
export const getAllTeachers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.TEACHERS));
    const teachers = [];
    querySnapshot.forEach((doc) => {
      teachers.push({ id: doc.id, ...doc.data() });
    });
    return teachers;
  } catch (error) {
    console.error("Error getting teachers: ", error);
    throw error;
  }
};

export const getTeacher = async (teacherId) => {
  try {
    const docRef = doc(db, COLLECTIONS.TEACHERS, teacherId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting teacher: ", error);
    throw error;
  }
};

export const createTeacher = async (teacherData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.TEACHERS), {
      ...teacherData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating teacher: ", error);
    throw error;
  }
};

export const updateTeacher = async (teacherId, teacherData) => {
  try {
    const docRef = doc(db, COLLECTIONS.TEACHERS, teacherId);
    await updateDoc(docRef, {
      ...teacherData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error updating teacher: ", error);
    throw error;
  }
};

export const deleteTeacher = async (teacherId) => {
  try {
    const docRef = doc(db, COLLECTIONS.TEACHERS, teacherId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting teacher: ", error);
    throw error;
  }
};

// Category operations
export const getAllCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    const categories = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    return categories;
  } catch (error) {
    console.error("Error getting categories: ", error);
    throw error;
  }
};

export const getCategory = async (categoryId) => {
  try {
    const docRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting category: ", error);
    throw error;
  }
};

export const getCategoryById = async (categoryId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.CATEGORIES),
      where("categoryId", "==", categoryId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting category by ID: ", error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.CATEGORIES), {
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating category: ", error);
    throw error;
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const docRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
    await updateDoc(docRef, {
      ...categoryData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error updating category: ", error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const docRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting category: ", error);
    throw error;
  }
};
