import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  SectionList
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { groupService } from '../services/groupService';
import Card from '../components/Card';
import Button from '../components/Button';
import { COLORS } from '../utils/constants';

const ManageGroupScreen = ({ route, navigation }) => {
  const { groupId } = route.params;
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingRequestId, setProcessingRequestId] = useState(null);

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      const response = await groupService.getGroupDetails(groupId);
      if (response.success) {
        setGroup(response.data);
      } else {
        Alert.alert('Error', 'Failed to load group details');
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestUserId) => {
    try {
      setProcessingRequestId(requestUserId);
      const response = await groupService.acceptRequest(groupId, requestUserId);
      if (response.success) {
        Alert.alert('Success', 'Request accepted');
        fetchGroupDetails();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to accept request');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectRequest = async (requestUserId) => {
    try {
      setProcessingRequestId(requestUserId);
      const response = await groupService.rejectRequest(groupId, requestUserId);
      if (response.success) {
        Alert.alert('Success', 'Request rejected');
        fetchGroupDetails();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to reject request');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRemoveMember = async (userId) => {
    Alert.alert('Remove Member', 'Are you sure you want to remove this member?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            setProcessingRequestId(userId);
            const response = await groupService.removeMember(groupId, userId);
            if (response.success) {
              Alert.alert('Success', 'Member removed');
              fetchGroupDetails();
            }
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to remove member');
          } finally {
            setProcessingRequestId(null);
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading group management...</Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Group not found</Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          style={styles.actionButton}
        />
      </View>
    );
  }

  const pendingRequests = group.pendingRequests || [];
  const currentMembers = (group.members || []).filter(m => m.user?._id !== group.leader?._id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Group Header */}
      <Card style={styles.headerCard}>
        <Text style={styles.groupName}>{group.groupName}</Text>
        <Text style={styles.subtitle}>Manage Group</Text>
      </Card>

      {/* Pending Requests Section */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>
          Join Requests ({pendingRequests.length})
        </Text>
        
        {pendingRequests.length === 0 ? (
          <Text style={styles.emptyText}>No pending requests</Text>
        ) : (
          pendingRequests.map((request, index) => (
            <View key={`${request.user?._id}-${index}`} style={styles.requestCard}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{request.user?.fullName}</Text>
                <Text style={styles.userId}>ID: {request.user?.studentId}</Text>
                <Text style={styles.userEmail}>{request.user?.email}</Text>
              </View>
              <View style={styles.actionButtons}>
                <Button
                  title="Accept"
                  size="small"
                  onPress={() => handleAcceptRequest(request.user?._id)}
                  disabled={processingRequestId === request.user?._id}
                  style={styles.acceptButton}
                />
                <Button
                  title="Reject"
                  size="small"
                  variant="secondary"
                  onPress={() => handleRejectRequest(request.user?._id)}
                  disabled={processingRequestId === request.user?._id}
                  style={styles.rejectButton}
                />
              </View>
            </View>
          ))
        )}
      </Card>

      {/* Current Members Section */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>
          Members ({currentMembers.length + 1})
        </Text>

        {/* Leader */}
        <View style={styles.memberCard}>
          <View style={styles.userInfo}>
            <View style={styles.leaderRow}>
              <Text style={styles.userName}>{group.leader?.fullName}</Text>
              <View style={styles.leaderBadge}>
                <Text style={styles.leaderBadgeText}>Leader</Text>
              </View>
            </View>
            <Text style={styles.userId}>ID: {group.leader?.studentId}</Text>
            <Text style={styles.userEmail}>{group.leader?.email}</Text>
          </View>
        </View>

        {/* Other Members */}
        {currentMembers.length === 0 ? (
          <Text style={styles.emptyText}>No other members</Text>
        ) : (
          currentMembers.map((member, index) => (
            <View key={`${member.user?._id}-${index}`} style={styles.memberCard}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{member.user?.fullName}</Text>
                <Text style={styles.userId}>ID: {member.user?.studentId}</Text>
                <Text style={styles.userEmail}>{member.user?.email}</Text>
                <Text style={styles.joinedDate}>
                  Joined: {new Date(member.joinedAt).toLocaleDateString()}
                </Text>
              </View>
              <Button
                title="Remove"
                size="small"
                variant="secondary"
                onPress={() => handleRemoveMember(member.user?._id)}
                disabled={processingRequestId === member.user?._id}
              />
            </View>
          ))
        )}
      </Card>

      {/* Back Button */}
      <Button
        title="Go Back"
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      />
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
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: 12,
  },
  headerCard: {
    marginBottom: 24,
    backgroundColor: COLORS.primary,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.white + 'cc',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  requestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  userId: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.primary,
    marginBottom: 4,
  },
  joinedDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  leaderBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  leaderBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  acceptButton: {
    minWidth: 70,
  },
  rejectButton: {
    minWidth: 70,
  },
  backButton: {
    marginTop: 16,
  },
});

export default ManageGroupScreen;
