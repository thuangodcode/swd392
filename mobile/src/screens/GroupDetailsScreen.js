import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { groupService } from '../services/groupService';
import Card from '../components/Card';
import Button from '../components/Button';
import { COLORS } from '../utils/constants';

const GroupDetailsScreen = ({ route, navigation }) => {
  const { groupId } = route.params;
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

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
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  const isLeader = group?.leader?._id === user?.id || group?.leader?.id === user?.id;
  const isMember = group?.members && Array.isArray(group.members) 
    ? group.members.some(m => m.user?._id === user?.id || m.user?.id === user?.id)
    : false;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading group details...</Text>
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Group Header */}
      <Card style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.groupName}>{group.groupName}</Text>
            <Text style={styles.classCode}>Class: {group.classCode}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            group.status === 'open' ? styles.openBadge : styles.closedBadge
          ]}>
            <Text style={styles.statusText}>
              {group.status === 'open' ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Group Info */}
      <Card>
        <Text style={styles.sectionTitle}>Group Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Members:</Text>
          <Text style={styles.infoValue}>{(group.members || []).length}/5</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>
            {group.status}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Created:</Text>
          <Text style={styles.infoValue}>
            {new Date(group.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </Card>

      {/* Leader Section */}
      <Card>
        <Text style={styles.sectionTitle}>Leader</Text>
        <View style={styles.memberCard}>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{group.leader?.fullName || 'Unknown'}</Text>
            <Text style={styles.memberId}>ID: {group.leader?.studentId || 'N/A'}</Text>
            {group.leader?.email && (
              <Text style={styles.memberEmail}>{group.leader.email}</Text>
            )}
          </View>
          <View style={styles.leaderBadge}>
            <Text style={styles.badgeText}>Leader</Text>
          </View>
        </View>
      </Card>

      {/* Members Section */}
      {(group.members || []).length > 0 && (
        <Card>
          <Text style={styles.sectionTitle}>Members ({(group.members || []).length})</Text>
          {(group.members || []).map((member, index) => (
            <View key={index} style={styles.memberCard}>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.user?.fullName || 'Unknown'}</Text>
                <Text style={styles.memberId}>ID: {member.user?.studentId || 'N/A'}</Text>
                {member.user?.email && (
                  <Text style={styles.memberEmail}>{member.user.email}</Text>
                )}
              </View>
              {member.role && (
                <View style={styles.roleBadge}>
                  <Text style={styles.badgeText}>{member.role}</Text>
                </View>
              )}
            </View>
          ))}
        </Card>
      )}

      {/* Empty Members */}
      {group.members.length === 0 && (
        <Card>
          <Text style={styles.sectionTitle}>Members</Text>
          <Text style={styles.emptyText}>No members yet (besides leader)</Text>
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {isLeader && (
          <Button
            title="Manage Group"
            onPress={() => navigation.navigate('EditGroup', { groupId })}
            style={styles.primaryButton}
          />
        )}
        {!isLeader && !isMember && group.status === 'open' && (
          <Button
            title="Request to Join"
            onPress={() => {
              Alert.alert('Join Request', 'Send a request to join this group?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Send',
                  onPress: async () => {
                    try {
                      const response = await groupService.requestToJoin(groupId);
                      if (response.success) {
                        Alert.alert('Success', 'Join request sent');
                        navigation.goBack();
                      }
                    } catch (error) {
                      Alert.alert('Error', error.response?.data?.message || 'Failed to send request');
                    }
                  }
                }
              ]);
            }}
            style={styles.primaryButton}
          />
        )}
        <Button
          title="Back"
          onPress={() => navigation.goBack()}
          variant="secondary"
          style={styles.secondaryButton}
        />
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
  },
  headerCard: {
    marginBottom: 16,
    backgroundColor: COLORS.primary,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  classCode: {
    fontSize: 14,
    color: COLORS.white + 'cc',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  openBadge: {
    backgroundColor: COLORS.success + '40',
  },
  closedBadge: {
    backgroundColor: COLORS.gray + '40',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  memberId: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 12,
    color: COLORS.primary,
  },
  leaderBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  roleBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionSection: {
    marginTop: 16,
  },
  primaryButton: {
    marginBottom: 12,
  },
  secondaryButton: {
    marginBottom: 12,
  },
  actionButton: {
    marginTop: 16,
  },
});

export default GroupDetailsScreen;
