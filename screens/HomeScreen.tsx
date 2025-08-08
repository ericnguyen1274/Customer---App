import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../contexts/UserContext';
import {
    createPayment,
    getAllCategories,
    getAllCourses,
    getAllTeachers,
    getAvailableCourses,
    getPurchasedCourses,
    purchaseCourse
} from '../firebase/firestore';

const { width } = Dimensions.get('window');

interface YogaCourse {
  id: string;
  courseId: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  capacity: number;
  dayOfWeek: string;
  time: string;
  categoryId: number;
  teacherId: number;
  categoryName?: string;
}

interface Teacher {
  id: string;
  teacherId: number;
  name: string;
  bio: string;
}

interface Category {
  id: string;
  categoryId: number;
  name: string;
  categoryName: string;
}

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'market' | 'my' | 'teacher'>('market');
  const [availableCourses, setAvailableCourses] = useState<YogaCourse[]>([]);
  const [purchasedCourses, setPurchasedCourses] = useState<YogaCourse[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  // Fetch categories from Firestore
  const fetchCategories = async () => {
    try {
      const firestoreCategories = await getAllCategories();
      
      const transformedCategories = firestoreCategories.map(category => ({
        id: category.id,
        categoryId: parseInt(category.categoryId) || 0,
        name: category.name || 'Unknown Category',
        categoryName: category.categoryName || category.name || 'Unknown Category',
      }));
      
      setCategories(transformedCategories);
    } catch (error) {
      const fallbackCategories = [
        {
          id: '1',
          categoryId: 1,
          name: 'Beginner Yoga',
          categoryName: 'Beginner Yoga',
        },
        {
          id: '2',
          categoryId: 2,
          name: 'Advanced Yoga',
          categoryName: 'Advanced Yoga',
        },
        {
          id: '3',
          categoryId: 6,
          name: 'JBL Yoga',
          categoryName: 'JBL Yoga',
        },
        {
          id: '4',
          categoryId: 11,
          name: 'Hyper Yoga',
          categoryName: 'Hyper Yoga',
        },
      ];
      setCategories(fallbackCategories);
    }
  };

  // Get category name by categoryId
  const getCategoryName = (categoryId: number): string => {
    // Ensure categoryId is a number
    const numericCategoryId = typeof categoryId === 'string' ? parseInt(categoryId) : categoryId;
    
    const category = categories.find(cat => {
      const catId = typeof cat.categoryId === 'string' ? parseInt(cat.categoryId) : cat.categoryId;
      return catId === numericCategoryId;
    });
    
    const result = category ? category.categoryName : 'Unknown Category';
    return result;
  };

  // Process courses with categories
  const processCoursesWithCategories = (courses: any[]) => {
    return courses.map(course => {
      // Ensure categoryId is properly converted to number
      const courseCategoryId = typeof course.categoryId === 'string' ? parseInt(course.categoryId) : (course.categoryId || 0);
      
      return {
        id: course.id,
        courseId: course.courseId || 0,
        name: course.name || 'Yoga Course',
        description: course.description || 'Learn yoga techniques and improve your wellness.',
        price: course.price || 0,
        duration: course.duration || 0,
        capacity: course.capacity || 0,
        dayOfWeek: course.dayOfWeek || 'Monday',
        time: course.time || '09:00 AM',
        categoryId: courseCategoryId,
        teacherId: course.teacherId || 0,
        categoryName: getCategoryName(courseCategoryId),
      };
    });
  };

  // Fetch available courses (not purchased by user)
  const fetchAvailableCourses = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        const allCourses = await getAllCourses();
        const transformedCourses = processCoursesWithCategories(allCourses);
        setAvailableCourses(transformedCourses);
        return;
      }

      const customerId = user.customerId || 1;
      const firestoreCourses = await getAvailableCourses(customerId);
      const transformedCourses = processCoursesWithCategories(firestoreCourses);
      setAvailableCourses(transformedCourses);
    } catch (error) {
      setAvailableCourses([
        {
          id: '1',
          courseId: 1,
          name: 'Mindful Meditation',
          description: 'Learn deep breathing techniques and mindfulness practices for inner peace and stress relief.',
          price: 2499,
          duration: 60,
          capacity: 20,
          dayOfWeek: 'Monday',
          time: '09:00 AM',
          categoryId: 1,
          teacherId: 1,
          categoryName: 'Beginner Yoga',
        },
        {
          id: '2',
          courseId: 2,
          name: 'Power Flow Yoga',
          description: 'High-energy vinyasa flow sequences to build strength, flexibility, and endurance.',
          price: 3499,
          duration: 90,
          capacity: 15,
          dayOfWeek: 'Wednesday',
          time: '10:00 AM',
          categoryId: 2,
          teacherId: 2,
          categoryName: 'Advanced Yoga',
        },
        {
          id: '3',
          courseId: 3,
          name: 'Restorative Yoga',
          description: 'Gentle poses and relaxation techniques to restore your body and calm your mind.',
          price: 1999,
          duration: 75,
          capacity: 25,
          dayOfWeek: 'Friday',
          time: '06:00 PM',
          categoryId: 1,
          teacherId: 3,
          categoryName: 'Beginner Yoga',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's purchased courses
  const fetchPurchasedCourses = async () => {
    try {
      if (!user) {
        setPurchasedCourses([]);
        return;
      }

      const customerId = user.customerId || 1;
      const firestoreCourses = await getPurchasedCourses(customerId);
      const transformedCourses = processCoursesWithCategories(firestoreCourses).map(course => ({
        ...course,
        price: 0,
      }));
      
      setPurchasedCourses(transformedCourses);
    } catch (error) {
      setPurchasedCourses([]);
    }
  };

  // Fetch teachers from Firestore
  const fetchTeachers = async () => {
    try {
      const firestoreTeachers = await getAllTeachers();
      
      const transformedTeachers = firestoreTeachers.map(teacher => ({
        id: teacher.id,
        teacherId: teacher.teacherId || 0,
        name: teacher.name || 'Unknown Teacher',
        bio: teacher.bio || 'No bio available',
      }));
      
      setTeachers(transformedTeachers);
    } catch (error) {
      setTeachers([
        {
          id: '1',
          teacherId: 1,
          name: 'Sarah Johnson',
          bio: 'Certified yoga instructor specializing in mindfulness and meditation techniques. Helps students find inner peace through gentle yoga practices.',
        },
        {
          id: '2',
          teacherId: 2,
          name: 'Michael Chen',
          bio: 'Advanced power yoga instructor focusing on strength and flexibility. Creates dynamic flows that challenge and energize students.',
        },
        {
          id: '3',
          teacherId: 3,
          name: 'Emma Rodriguez',
          bio: 'Gentle yoga instructor specializing in restorative and therapeutic practices. Helps students recover and relax through mindful movement.',
        },
      ]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      await fetchAvailableCourses();
      await fetchPurchasedCourses();
      await fetchTeachers();
    };
    loadData();
  }, [user]);

  // Reprocess courses when categories are loaded
  useEffect(() => {
    if (categories.length > 0) {
      if (availableCourses.length > 0) {
        const reprocessedCourses = processCoursesWithCategories(
          availableCourses.map(course => ({
            id: course.id,
            courseId: course.courseId,
            name: course.name,
            description: course.description,
            price: course.price,
            duration: course.duration,
            capacity: course.capacity,
            dayOfWeek: course.dayOfWeek,
            time: course.time,
            categoryId: course.categoryId,
            teacherId: course.teacherId,
          }))
        );
        setAvailableCourses(reprocessedCourses);
      }
      
      if (purchasedCourses.length > 0) {
        const reprocessedPurchasedCourses = processCoursesWithCategories(
          purchasedCourses.map(course => ({
            id: course.id,
            courseId: course.courseId,
            name: course.name,
            description: course.description,
            price: course.price,
            duration: course.duration,
            capacity: course.capacity,
            dayOfWeek: course.dayOfWeek,
            time: course.time,
            categoryId: course.categoryId,
            teacherId: course.teacherId,
          }))
        ).map(course => ({
          ...course,
          price: 0,
        }));
        setPurchasedCourses(reprocessedPurchasedCourses);
      }
    }
  }, [categories]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCategories();
      await fetchAvailableCourses();
      await fetchPurchasedCourses();
      await fetchTeachers();
    } catch (error) {
      // Handle refresh error silently
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    }
  }, [user]);

  const handlePurchaseCourse = async (courseId: string, courseData: YogaCourse) => {
    try {
      if (!user) {
        Alert.alert('Error', 'Please log in to purchase courses.');
        return;
      }

      const customerId = user.customerId || 1;
      
      await purchaseCourse(customerId, courseData.courseId);
      
      const paymentData = {
        customerId: customerId,
        amount: courseData.price,
        date: new Date().toISOString().split('T')[0],
        paymentId: Date.now()
      };
      
      await createPayment(paymentData);
      
      Alert.alert('Success', `Successfully purchased ${courseData.name}!`);
      
      fetchAvailableCourses();
      fetchPurchasedCourses();
    } catch (error) {
      Alert.alert('Error', 'Failed to purchase course. Please try again.');
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Purchased';
    return `$${price}`;
  };

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const currentCourses = activeTab === 'market' ? availableCourses : 
                        activeTab === 'my' ? purchasedCourses : [];

  const filteredCourses = currentCourses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="loading" size={48} color="#E53935" />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yoga Courses</Text>
        
        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'market' && styles.activeTabButton]}
            onPress={() => setActiveTab('market')}
          >
            <Text style={[styles.tabText, activeTab === 'market' && styles.activeTabText]}>
              Discover
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'my' && styles.activeTabButton]}
            onPress={() => setActiveTab('my')}
          >
            <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>
              My Courses
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'teacher' && styles.activeTabButton]}
            onPress={() => setActiveTab('teacher')}
          >
            <Text style={[styles.tabText, activeTab === 'teacher' && styles.activeTabText]}>
              Teachers
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color="#757575" />
          <TextInput
            style={styles.searchInput}
            placeholder={activeTab === 'teacher' ? "Search teachers..." : "Search courses..."}
            placeholderTextColor="#757575"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E53935']} />
        }
      >
        {activeTab === 'teacher' ? (
          <View style={styles.teacherSection}>
            {filteredTeachers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="account-tie" size={48} color="#757575" />
                <Text style={styles.emptyTitle}>No teachers found</Text>
                <Text style={styles.emptySubtitle}>Check back later for teacher updates</Text>
              </View>
            ) : (
              filteredTeachers.map((teacher) => (
                <View key={teacher.id} style={styles.teacherCard}>
                  <View style={styles.teacherHeader}>
                    <View style={styles.teacherAvatar}>
                      <MaterialCommunityIcons name="account-tie" size={32} color="#FFFFFF" />
                    </View>
                    <View style={styles.teacherInfo}>
                      <Text style={styles.teacherName}>{teacher.name}</Text>
                      <Text style={styles.teacherSpecialty}>Yoga Instructor</Text>
                    </View>
                  </View>
                  <Text style={styles.teacherDescription}>
                    {teacher.bio}
                  </Text>
                </View>
              ))
            )}
          </View>
        ) : filteredCourses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name={activeTab === 'market' ? "compass" : "bookmark"} 
              size={48} 
              color="#757575" 
            />
            <Text style={styles.emptyTitle}>
              {activeTab === 'market' 
                ? 'No available courses found' 
                : 'No purchased courses found'
              }
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'market' 
                ? 'Check back later for new courses' 
                : 'Purchase courses to see them here'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.courseList}>
            {filteredCourses.map((course) => (
              <View key={course.id} style={styles.courseCard}>
                <View style={styles.courseHeader}>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseTitle}>{course.name}</Text>
                    <Text style={styles.courseDescription}>{course.description}</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{course.categoryName}</Text>
                    </View>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={[
                      styles.coursePrice,
                      course.price === 0 && styles.purchasedPrice
                    ]}>
                      {formatPrice(course.price)}
                    </Text>
                  </View>
                </View>

                <View style={styles.courseMeta}>
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color="#757575" />
                    <Text style={styles.metaText}>{formatDuration(course.duration)}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="calendar" size={16} color="#757575" />
                    <Text style={styles.metaText}>{course.dayOfWeek}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="account-group" size={16} color="#757575" />
                    <Text style={styles.metaText}>{course.capacity} spots</Text>
                  </View>
                </View>

                <View style={styles.scheduleInfo}>
                  <MaterialCommunityIcons name="clock" size={16} color="#757575" />
                  <Text style={styles.scheduleText}>{course.time}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    course.price === 0 && styles.continueButton
                  ]}
                  onPress={() => handlePurchaseCourse(course.id, course)}
                >
                  <Text style={styles.actionButtonText}>
                    {course.price === 0 ? 'Continue' : 'Purchase Course'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#E53935',
    marginTop: 16,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#E53935',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111111',
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
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
  courseList: {
    paddingBottom: 20,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  courseInfo: {
    flex: 1,
    marginRight: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#FFD600',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#111111',
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  coursePrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E53935',
  },
  purchasedPrice: {
    color: '#FFD600',
  },
  courseMeta: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 6,
    fontWeight: '500',
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  scheduleText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 6,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#E53935',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#FFD600',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  teacherSection: {
    paddingBottom: 20,
  },
  teacherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  teacherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  teacherAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 4,
  },
  teacherSpecialty: {
    fontSize: 14,
    color: '#757575',
  },
  teacherDescription: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
}); 