import api from './api';

export const groupService = {
  // Get groups by class code
  getGroupsByClass: async (classCode) => {
    const response = await api.get(`/groups/class/${classCode}`);
    return response.data;
  },

  // Get public groups by class code
  getPublicGroupsByClass: async (classCode) => {
    const response = await api.get(`/groups/class/${classCode}/public`);
    return response.data;
  },

  // Create a new group
  createGroup: async (groupData) => {
    const response = await api.post('/groups', groupData);
    return response.data;
  },

  // Get group details
  getGroupDetails: async (groupId) => {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  },

  // Invite student to group
  inviteStudent: async (groupId, studentId) => {
    const response = await api.post(`/groups/${groupId}/invite`, { studentId });
    return response.data;
  },

  // Request to join group
  requestToJoin: async (groupId) => {
    const response = await api.post(`/groups/${groupId}/request`);
    return response.data;
  },

  // Accept invite
  acceptInvite: async (groupId, inviteId) => {
    const response = await api.post(`/groups/${groupId}/accept-invite`, { inviteId });
    return response.data;
  },

  // Reject invite
  rejectInvite: async (groupId, inviteId) => {
    const response = await api.post(`/groups/${groupId}/reject-invite`, { inviteId });
    return response.data;
  },

  // Accept join request (leader only)
  acceptRequest: async (groupId, requestId) => {
    const response = await api.post(`/groups/${groupId}/accept-request`, { requestId });
    return response.data;
  },

  // Reject join request (leader only)
  rejectRequest: async (groupId, requestId) => {
    const response = await api.post(`/groups/${groupId}/reject-request`, { requestId });
    return response.data;
  },

  // Leave group
  leaveGroup: async (groupId) => {
    const response = await api.post(`/groups/${groupId}/leave`);
    return response.data;
  },

  // Remove member (leader only)
  removeMember: async (groupId, userId) => {
    const response = await api.delete(`/groups/${groupId}/members/${userId}`);
    return response.data;
  },

  // Close group (leader only)
  closeGroup: async (groupId) => {
    const response = await api.patch(`/groups/${groupId}/close`);
    return response.data;
  }
};
