// API Configuration
// NOTE: Use your computer's IP address (from ipconfig), NOT localhost!
// Backend still runs on localhost:5000, but mobile needs your local IP
export const API_BASE_URL = 'http://192.168.88.175:5000/api'; // ⚠️ CHANGE 192.168.1.100 to YOUR IP

// Student roles
export const USER_ROLES = {
  STUDENT: 'student',
  LEADER: 'leader',
  LECTURER: 'lecturer',
  MODERATOR: 'moderator'
};

// Group status
export const GROUP_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  FULL: 'full'
};

// Project approval status
export const PROJECT_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
};

// Colors
export const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  light: '#f3f4f6',
  dark: '#1f2937',
  white: '#ffffff',
  gray: '#6b7280',
  background: '#f9fafb',
  card: '#ffffff',
  border: '#e5e7eb',
  text: '#111827',
  textSecondary: '#6b7280',
  placeholder: '#9ca3af'
};

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: '@auth_token',
  USER: '@user_data'
};
