import api from './api';

export const courseService = {
  // Get all courses
  getAllCourses: async () => {
    const response = await api.get('/courses');
    return response.data;
  },

  // Get available courses for student
  getAvailableCourses: async () => {
    const response = await api.get('/courses/available');
    return response.data;
  },

  // Get course details
  getCourseDetails: async (courseId) => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  },

  // Enroll in course
  enrollInCourse: async (courseId) => {
    const response = await api.post(`/courses/${courseId}/enroll`);
    return response.data;
  },

  // Get enrolled courses
  getEnrolledCourses: async () => {
    const response = await api.get('/courses/enrolled');
    return response.data;
  },

  // Leave course
  leaveCourse: async (courseId) => {
    const response = await api.post(`/courses/${courseId}/leave`);
    return response.data;
  }
};
