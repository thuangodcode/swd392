import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { courseService } from '../services/courseService';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { COLORS } from '../utils/constants';

const CoursesScreen = ({ navigation }) => {
  const { user, refreshProfile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const [availableRes, enrolledRes] = await Promise.all([
        courseService.getAvailableCourses(),
        courseService.getEnrolledCourses()
      ]);

      if (availableRes.success) {
        setCourses(availableRes.data || []);
      }
      if (enrolledRes.success) {
        setEnrolledCourses(enrolledRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      Alert.alert('Error', 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCourses();
    setRefreshing(false);
  };

  const handleEnroll = async (courseId) => {
    try {
      Alert.alert(
        'Enroll in Course',
        'Are you sure you want to enroll in this course?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enroll',
            onPress: async () => {
              const response = await courseService.enrollInCourse(courseId);
              if (response.success) {
                Alert.alert('Success', 'Enrolled successfully');
                await fetchCourses();
                await refreshProfile();
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to enroll');
    }
  };

  const handleLeaveCourse = async (courseId) => {
    try {
      Alert.alert(
        'Leave Course',
        'Are you sure you want to leave this course?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: async () => {
              const response = await courseService.leaveCourse(courseId);
              if (response.success) {
                Alert.alert('Success', 'Left course successfully');
                await fetchCourses();
                await refreshProfile();
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to leave course');
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Enrolled Courses */}
      {enrolledCourses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Courses</Text>
          {enrolledCourses.map((course) => (
            <Card key={course._id} style={styles.courseCard}>
              <View style={styles.courseHeader}>
                <View style={styles.courseIcon}>
                  <Text style={styles.courseIconText}>📚</Text>
                </View>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseName}>{course.courseName}</Text>
                  <Text style={styles.courseCode}>{course.courseCode}</Text>
                  <Text style={styles.courseClass}>Class: {course.classCode}</Text>
                </View>
              </View>
              
              <View style={styles.courseDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>👤 Lecturer:</Text>
                  <Text style={styles.detailValue}>
                    {course.lecturer?.fullName || 'Not assigned'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>👥 Students:</Text>
                  <Text style={styles.detailValue}>
                    {course.enrolledStudents?.length || 0}
                  </Text>
                </View>
              </View>

              {user?.currentClass === course.classCode && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentText}>✓ Current Class</Text>
                </View>
              )}

              <Button
                title="Leave Course"
                variant="danger"
                size="small"
                onPress={() => handleLeaveCourse(course._id)}
                style={styles.actionButton}
              />
              <Button
                title="Details"
                variant="outline"
                size="small"
                onPress={() => navigation.navigate('CourseDetails', { 
                  courseId: course._id,
                  classCode: course.classCode 
                })}
                style={styles.actionButton}
              />
            </Card>
          ))}
        </View>
      )}

      {/* Available Courses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Courses</Text>
        {courses.length > 0 ? (
          courses.map((course) => {
            const isEnrolled = enrolledCourses.some(c => c._id === course._id);
            if (isEnrolled) return null;

            return (
              <Card key={course._id} style={styles.courseCard}>
                <View style={styles.courseHeader}>
                  <View style={styles.courseIcon}>
                    <Text style={styles.courseIconText}>📖</Text>
                  </View>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseName}>{course.courseName}</Text>
                    <Text style={styles.courseCode}>{course.courseCode}</Text>
                    <Text style={styles.courseClass}>Class: {course.classCode}</Text>
                  </View>
                </View>

                {course.description && (
                  <Text style={styles.courseDescription}>
                    {course.description}
                  </Text>
                )}

                <View style={styles.courseDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>👤 Lecturer:</Text>
                    <Text style={styles.detailValue}>
                      {course.lecturer?.fullName || 'Not assigned'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>👥 Enrolled:</Text>
                    <Text style={styles.detailValue}>
                      {course.enrolledStudents?.length || 0} students
                    </Text>
                  </View>
                </View>

                <Button
                  title="Enroll Now"
                  onPress={() => handleEnroll(course._id)}
                  size="small"
                  style={styles.actionButton}
                />
                <Button
                  title="Details"
                  variant="outline"
                  size="small"
                  onPress={() => navigation.navigate('CourseDetails', { 
                    courseId: course._id,
                    classCode: course.classCode 
                  })}
                  style={styles.actionButton}
                />
              </Card>
            );
          })
        ) : (
          <Card>
            <Text style={styles.emptyText}>No courses available</Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  courseCard: {
    marginBottom: 12,
  },
  courseHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  courseIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courseIconText: {
    fontSize: 28,
  },
  courseInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  courseCode: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  courseClass: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  courseDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  courseDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 8,
    minWidth: 100,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
  },
  currentBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  currentText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
  },
  actionButton: {
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default CoursesScreen;
