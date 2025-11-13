import api from './api';

export const projectService = {
  // Create project (leader only)
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  // Get project by group ID
  getProjectByGroup: async (groupId) => {
    const response = await api.get(`/projects/group/${groupId}`);
    return response.data;
  },

  // Update project (leader only)
  updateProject: async (projectId, projectData) => {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  },

  // Submit project for approval (leader only)
  submitForApproval: async (projectId) => {
    const response = await api.post(`/projects/${projectId}/submit-for-approval`);
    return response.data;
  },

  // Get project details
  getProjectDetails: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  // Get all projects for current class
  getMyClassProjects: async () => {
    const response = await api.get('/projects/my-class');
    return response.data;
  }
};
