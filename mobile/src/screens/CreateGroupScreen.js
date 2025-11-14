import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { groupService } from '../services/groupService';
import { courseService } from '../services/courseService';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { COLORS } from '../utils/constants';

const CreateGroupScreen = ({ navigation }) => {
  const { user, refreshProfile } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [course, setCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseService.getEnrolledCourses();
      if (response.success) {
        // Filter to show only current class course
        const currentClassCourse = response.data.find(c => c.classCode === user?.currentClass);
        if (currentClassCourse) {
          setCourses([currentClassCourse]);
          setCourse(currentClassCourse);
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!groupName.trim()) {
      newErrors.groupName = 'Group name is required';
    }

    if (!course) {
      newErrors.course = 'Please select a course';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateGroup = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await groupService.createGroup({
        groupName: groupName.trim(),
        courseId: course._id
      });

      if (response.success) {
        Alert.alert('Success', 'Group created successfully');
        // Refresh user profile to update currentGroup
        await refreshProfile();
        navigation.goBack();
      } else {
        Alert.alert('Error', response.message || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create New Group</Text>
          <Text style={styles.subtitle}>
            Start a group for {user?.currentClass || 'your class'}
          </Text>
        </View>

        <Card style={styles.form}>
          <Input
            label="Group Name"
            placeholder="Enter group name (e.g., Team Alpha)"
            value={groupName}
            onChangeText={(text) => {
              setGroupName(text);
              if (errors.groupName) setErrors({ ...errors, groupName: null });
            }}
            error={errors.groupName}
            maxLength={50}
          />

          {course && (
            <View style={styles.courseInfo}>
              <Text style={styles.courseLabel}>Selected Course</Text>
              <Card style={styles.courseCard}>
                <Text style={styles.courseName}>{course.courseName}</Text>
                <Text style={styles.courseCode}>{course.classCode}</Text>
                <Text style={styles.courseDetail}>
                  👤 Lecturer: {course.lecturer?.fullName || 'Not assigned'}
                </Text>
              </Card>
              {errors.course && (
                <Text style={styles.errorText}>{errors.course}</Text>
              )}
            </View>
          )}

          <Button
            title="Create Group"
            onPress={handleCreateGroup}
            loading={loading}
            style={styles.button}
          />

          <Button
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.button}
          />
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>📌 Group Guidelines</Text>
          <Text style={styles.infoText}>
            • Group names should be clear and descriptive
          </Text>
          <Text style={styles.infoText}>
            • Each group can have 3-5 members
          </Text>
          <Text style={styles.infoText}>
            • You must be enrolled in a course to create a group
          </Text>
          <Text style={styles.infoText}>
            • As a leader, you can invite or accept join requests
          </Text>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  form: {
    marginBottom: 24,
    padding: 16,
  },
  courseInfo: {
    marginTop: 16,
  },
  courseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  courseCard: {
    marginBottom: 8,
    padding: 12,
    backgroundColor: COLORS.primary + '10',
  },
  courseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  courseCode: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  courseDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 4,
  },
  button: {
    marginTop: 12,
  },
  infoCard: {
    padding: 16,
    backgroundColor: COLORS.info + '10',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
});

export default CreateGroupScreen;
