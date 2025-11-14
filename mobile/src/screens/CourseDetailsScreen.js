import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { courseService } from '../services/courseService';
import { groupService } from '../services/groupService';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { COLORS } from '../utils/constants';

const CourseDetailsScreen = ({ route, navigation }) => {
  const { courseId, classCode } = route.params;
  const [course, setCourse] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, []);

  const fetchCourseDetails = async () => {
    try {
      const [courseRes, groupRes] = await Promise.all([
        courseService.getCourseDetails(courseId),
        groupService.getPublicGroupsByClass(classCode)
      ]);

      if (courseRes.success) {
        setCourse(courseRes.data);
      }
      if (groupRes.success) {
        setGroups(groupRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      Alert.alert('Error', 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCourseDetails();
    setRefreshing(false);
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!course) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Course Not Found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const renderMember = ({ item }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberAvatar}>
        <Text style={styles.avatarText}>
          {item.fullName?.charAt(0).toUpperCase() || '?'}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.fullName}</Text>
        <Text style={styles.memberId}>{item.studentId}</Text>
      </View>
    </View>
  );

  const renderGroup = ({ item }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => navigation.navigate('GroupDetails', { groupId: item._id })}
    >
      <View style={styles.groupHeader}>
        <Text style={styles.groupName}>{item.groupName}</Text>
        <View style={styles.memberCountBadge}>
          <Text style={styles.memberCountText}>
            {item.members?.length || 0}/5
          </Text>
        </View>
      </View>
      <Text style={styles.groupDetail}>
        👤 Leader: {item.leader?.fullName}
      </Text>
      <Text style={styles.groupDetail}>
        👥 Members: {item.members?.map(m => m.user?.fullName).join(', ') || 'No members'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Course Header */}
      <Card style={styles.courseHeader}>
        <View style={styles.headerTop}>
          <View style={styles.courseIcon}>
            <Text style={styles.iconText}>📚</Text>
          </View>
          <View style={styles.courseHeaderInfo}>
            <Text style={styles.courseName}>{course.courseName}</Text>
            <Text style={styles.courseCode}>{course.courseCode}</Text>
            <Text style={styles.classCode}>Class: {course.classCode}</Text>
          </View>
        </View>

        <View style={styles.courseDetailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📅 Semester:</Text>
            <Text style={styles.detailValue}>{course.semester} {course.year}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>👤 Lecturer:</Text>
            <Text style={styles.detailValue}>
              {course.lecturer?.fullName || 'Not assigned'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📍 Room:</Text>
            <Text style={styles.detailValue}>{course.room}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>⏰ Schedule:</Text>
            <Text style={styles.detailValue}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][course.schedule?.dayOfWeek - 1]} {course.schedule?.startTime} - {course.schedule?.endTime}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>👥 Enrolled:</Text>
            <Text style={styles.detailValue}>
              {course.enrolledStudents?.length || 0} / {course.maxStudents}
            </Text>
          </View>
        </View>
      </Card>

      {/* Enrolled Students Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Enrolled Students ({course.enrolledStudents?.length || 0})
        </Text>
        {course.enrolledStudents && course.enrolledStudents.length > 0 ? (
          <Card>
            <FlatList
              data={course.enrolledStudents}
              keyExtractor={(item) => item._id}
              renderItem={renderMember}
              scrollEnabled={false}
            />
          </Card>
        ) : (
          <Card>
            <Text style={styles.emptyText}>No students enrolled yet</Text>
          </Card>
        )}
      </View>

      {/* Class Groups Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Groups in {course.classCode} ({groups.length})
        </Text>
        {groups && groups.length > 0 ? (
          <Card>
            <FlatList
              data={groups}
              keyExtractor={(item) => item._id}
              renderItem={renderGroup}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </Card>
        ) : (
          <Card>
            <Text style={styles.emptyText}>No groups in this class yet</Text>
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
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  courseHeader: {
    marginBottom: 24,
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    marginBottom: 16,
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
  iconText: {
    fontSize: 28,
  },
  courseHeaderInfo: {
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
  classCode: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  courseDetailsSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  memberId: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  groupItem: {
    paddingVertical: 12,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  memberCountBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  memberCountText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  groupDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
  },
});

export default CourseDetailsScreen;
