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
import { groupService } from '../services/groupService';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { COLORS } from '../utils/constants';

const GroupsScreen = ({ navigation }) => {
  const { user, refreshProfile } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh user data when screen is focused
      refreshProfile().then(() => {
        fetchGroups();
      });
    });

    return unsubscribe;
  }, [navigation]);

  const fetchGroups = async () => {
    if (!user?.currentClass) {
      setLoading(false);
      return;
    }

    try {
      const response = await groupService.getPublicGroupsByClass(user.currentClass);
      if (response.success) {
        setGroups(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      Alert.alert('Error', 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const response = await groupService.requestToJoin(groupId);
      if (response.success) {
        Alert.alert('Success', 'Join request sent successfully');
        fetchGroups();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send request');
    }
  };

  const handleGroupPress = (group) => {
    navigation.navigate('GroupDetails', { groupId: group._id });
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!user?.currentClass) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>📚</Text>
        <Text style={styles.emptyTitle}>Not Enrolled</Text>
        <Text style={styles.emptySubtitle}>
          Please enroll in a course first
        </Text>
        <Button
          title="Browse Courses"
          onPress={() => navigation.navigate('Courses')}
          style={styles.actionButton}
        />
      </View>
    );
  }

  const myGroup = groups.find(g => 
    g.leader?._id === user?._id || 
    g.members.some(m => m.user?._id === user?._id)
  );

  const otherGroups = groups.filter(g => 
    g.leader?._id !== user?._id && 
    !g.members.some(m => m.user?._id === user?._id) &&
    g.status === 'open'
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* My Group Section */}
      {myGroup ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Group</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleGroupPress(myGroup)}
          >
            <Card style={styles.groupCard}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupName}>{myGroup.groupName}</Text>
                <View style={[styles.statusBadge, styles.myGroupBadge]}>
                  <Text style={styles.statusText}>My Group</Text>
                </View>
              </View>
              <View style={styles.groupInfo}>
                <Text style={styles.infoText}>
                  👥 Members: {myGroup.members.length}/5
                </Text>
                <Text style={styles.infoText}>
                  👤 Leader: {myGroup.leader.fullName}
                </Text>
                <Text style={styles.infoText}>
                  📚 Class: {myGroup.classCode}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create Your Group</Text>
          <Card>
            <Text style={styles.emptySubtitle}>
              You're not in any group yet. Create one or join an existing group.
            </Text>
            <Button
              title="Create New Group"
              onPress={() => navigation.navigate('CreateGroup')}
              style={styles.actionButton}
            />
          </Card>
        </View>
      )}

      {/* Available Groups */}
      {otherGroups.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Groups</Text>
          {otherGroups.map((group) => (
            <TouchableOpacity
              key={group._id}
              activeOpacity={0.7}
              onPress={() => handleGroupPress(group)}
            >
              <Card style={styles.groupCard}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupName}>{group.groupName}</Text>
                  <View style={[
                    styles.statusBadge,
                    group.status === 'open' ? styles.openBadge : styles.closedBadge
                  ]}>
                    <Text style={styles.statusText}>
                      {group.status === 'open' ? 'Open' : 'Closed'}
                    </Text>
                  </View>
                </View>
                <View style={styles.groupInfo}>
                  <Text style={styles.infoText}>
                    👥 Members: {group.members.length}/5
                  </Text>
                  <Text style={styles.infoText}>
                    👤 Leader: {group.leader.fullName}
                  </Text>
                </View>
                {!myGroup && group.status === 'open' && (
                  <Button
                    title="Request to Join"
                    size="small"
                    onPress={() => handleJoinGroup(group._id)}
                    style={styles.joinButton}
                  />
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!myGroup && otherGroups.length === 0 && (
        <Card>
          <Text style={styles.emptySubtitle}>
            No groups available. Be the first to create one!
          </Text>
        </Card>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  groupCard: {
    marginBottom: 12,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  myGroupBadge: {
    backgroundColor: COLORS.primary + '20',
  },
  openBadge: {
    backgroundColor: COLORS.success + '20',
  },
  closedBadge: {
    backgroundColor: COLORS.gray + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  groupInfo: {
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  joinButton: {
    marginTop: 8,
  },
  actionButton: {
    marginTop: 16,
  },
});

export default GroupsScreen;
