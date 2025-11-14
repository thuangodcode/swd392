import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  TouchableOpacity
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    objectives: '',
    techStack: '',
    githubRepository: ''
  });

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
      // 404 means no project exists yet, which is fine
      if (error.response?.status === 404) {
        setProject(null);
      } else {
        console.error('Error fetching project:', error);
        Alert.alert('Error', error.response?.data?.message || 'Failed to load project');
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

  const handleCreateProject = async () => {
    // Validate required fields
    if (!formData.projectName.trim()) {
      Alert.alert('Validation', 'Project name is required');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Validation', 'Description is required');
      return;
    }

    setCreating(true);
    try {
      // Parse tech stack (comma-separated)
      const techStack = formData.techStack
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech);

      const projectPayload = {
        groupId: user.currentGroup,
        projectName: formData.projectName.trim(),
        description: formData.description.trim(),
        objectives: formData.objectives.trim() || undefined,
        techStack,
        githubRepository: formData.githubRepository.trim() || undefined
      };

      const response = await projectService.createProject(projectPayload);

      if (response.success) {
        setProject(response.data);
        setShowCreateModal(false);
        setFormData({
          projectName: '',
          description: '',
          objectives: '',
          techStack: '',
          githubRepository: ''
        });
        Alert.alert('Success', 'Project created successfully');
      } else {
        Alert.alert('Error', response.message || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      if (error.response?.status === 400) {
        Alert.alert('Error', 'Project already exists for this group');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to create project');
      }
    } finally {
      setCreating(false);
    }
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
      <>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>📋</Text>
          <Text style={styles.emptyTitle}>No Project</Text>
          <Text style={styles.emptySubtitle}>
            Your group hasn't created a project yet
          </Text>
          {user.role === 'student' && user.currentGroup && (
            <Button
              title="Create Project"
              onPress={() => setShowCreateModal(true)}
              style={styles.actionButton}
            />
          )}
        </View>

        {/* Create Project Modal */}
        <Modal
          visible={showCreateModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Project</Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalForm}>
                {/* Project Name */}
                <Text style={styles.formLabel}>Project Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter project name"
                  value={formData.projectName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, projectName: text })
                  }
                  editable={!creating}
                />

                {/* Description */}
                <Text style={styles.formLabel}>Description *</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Enter project description"
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  multiline={true}
                  numberOfLines={4}
                  editable={!creating}
                />

                {/* Objectives */}
                <Text style={styles.formLabel}>Objectives</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Enter project objectives"
                  value={formData.objectives}
                  onChangeText={(text) =>
                    setFormData({ ...formData, objectives: text })
                  }
                  multiline={true}
                  numberOfLines={3}
                  editable={!creating}
                />

                {/* Tech Stack */}
                <Text style={styles.formLabel}>Tech Stack</Text>
                <Text style={styles.formHint}>
                  Separate technologies with commas (e.g., React, Node.js, MongoDB)
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="React, Node.js, MongoDB"
                  value={formData.techStack}
                  onChangeText={(text) =>
                    setFormData({ ...formData, techStack: text })
                  }
                  editable={!creating}
                />

                {/* GitHub Repository */}
                <Text style={styles.formLabel}>GitHub Repository</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="https://github.com/user/repo"
                  value={formData.githubRepository}
                  onChangeText={(text) =>
                    setFormData({ ...formData, githubRepository: text })
                  }
                  editable={!creating}
                />

                {/* Buttons */}
                <View style={styles.modalButtons}>
                  <Button
                    title={creating ? 'Creating...' : 'Create Project'}
                    onPress={handleCreateProject}
                    disabled={creating}
                    style={styles.createButton}
                  />
                  <Button
                    title="Cancel"
                    onPress={() => setShowCreateModal(false)}
                    disabled={creating}
                    style={[styles.cancelButton, { backgroundColor: COLORS.gray }]}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </>
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
      {user.role === 'student' && project.approvalStatus === 'draft' && (
        <Button
          title="Submit for Approval"
          onPress={() => {
            Alert.alert(
              'Submit for Approval',
              'Are you sure you want to submit this project for approval?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Submit',
                  onPress: async () => {
                    try {
                      const response = await projectService.submitForApproval(project._id);
                      if (response.success) {
                        setProject(response.data);
                        Alert.alert('Success', 'Project submitted for approval');
                      }
                    } catch (error) {
                      Alert.alert('Error', error.response?.data?.message || 'Failed to submit project');
                    }
                  }
                }
              ]
            );
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  modalForm: {
    padding: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 6,
  },
  formHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  formInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 16,
  },
  createButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginTop: 0,
  },
});

export default ProjectsScreen;
