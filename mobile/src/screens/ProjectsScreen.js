import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { COLORS, PROJECT_STATUS } from '../utils/constants';

const ProjectsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.currentGroup) {
      fetchProject();
    } else {
      setLoading(false);
    }
  }, [user?.currentGroup]);

  const fetchProject = async () => {
    if (!user?.currentGroup) return;

    try {
      const response = await projectService.getProjectByGroup(user.currentGroup);
      if (response.success) {
        setProject(response.data);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      if (error.response?.status !== 404) {
        Alert.alert('Error', 'Failed to load project');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProject();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: COLORS.gray,
      pending: COLORS.warning,
      approved: COLORS.success,
      rejected: COLORS.danger,
      completed: COLORS.info
    };
    return colors[status] || COLORS.gray;
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Draft',
      pending: 'Pending Approval',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed'
    };
    return labels[status] || status;
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!user?.currentGroup) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>👥</Text>
        <Text style={styles.emptyTitle}>No Group</Text>
        <Text style={styles.emptySubtitle}>
          You need to join a group first to access projects
        </Text>
        <Button
          title="View Groups"
          onPress={() => navigation.navigate('Groups')}
          style={styles.actionButton}
        />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>📋</Text>
        <Text style={styles.emptyTitle}>No Project</Text>
        <Text style={styles.emptySubtitle}>
          Your group hasn't created a project yet
        </Text>
        {user.role === 'leader' && (
          <Button
            title="Create Project"
            onPress={() => navigation.navigate('CreateProject')}
            style={styles.actionButton}
          />
        )}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Project Header */}
      <Card>
        <View style={styles.header}>
          <Text style={styles.projectName}>{project.projectName}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(project.approvalStatus) + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(project.approvalStatus) }
            ]}>
              {getStatusLabel(project.approvalStatus)}
            </Text>
          </View>
        </View>
      </Card>

      {/* Project Details */}
      <Text style={styles.sectionTitle}>Description</Text>
      <Card>
        <Text style={styles.description}>
          {project.description || 'No description provided'}
        </Text>
      </Card>

      {project.objectives && (
        <>
          <Text style={styles.sectionTitle}>Objectives</Text>
          <Card>
            <Text style={styles.description}>{project.objectives}</Text>
          </Card>
        </>
      )}

      {project.techStack && project.techStack.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Tech Stack</Text>
          <Card>
            <View style={styles.techStack}>
              {project.techStack.map((tech, index) => (
                <View key={index} style={styles.techBadge}>
                  <Text style={styles.techText}>{tech}</Text>
                </View>
              ))}
            </View>
          </Card>
        </>
      )}

      {project.githubRepository && (
        <>
          <Text style={styles.sectionTitle}>Repository</Text>
          <Card>
            <Text style={styles.repoLink}>{project.githubRepository}</Text>
          </Card>
        </>
      )}

      {/* Project Info */}
      <Text style={styles.sectionTitle}>Information</Text>
      <Card>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Class Code</Text>
          <Text style={styles.infoValue}>{project.classCode}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Created By</Text>
          <Text style={styles.infoValue}>
            {project.createdBy?.fullName || 'Unknown'}
          </Text>
        </View>
        {project.lecturer && (
          <>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Lecturer</Text>
              <Text style={styles.infoValue}>
                {project.lecturer.fullName || 'Not assigned'}
              </Text>
            </View>
          </>
        )}
      </Card>

      {/* Actions for Leader */}
      {user.role === 'leader' && project.approvalStatus === 'draft' && (
        <Button
          title="Submit for Approval"
          onPress={() => {
            // TODO: Implement submit logic
            Alert.alert('Coming Soon', 'Submit for approval feature');
          }}
          style={styles.actionButton}
        />
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.background,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  techStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  techText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  repoLink: {
    fontSize: 14,
    color: COLORS.info,
    textDecorationLine: 'underline',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  actionButton: {
    marginTop: 16,
  },
});

export default ProjectsScreen;
