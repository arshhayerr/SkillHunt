// src/services/api.js
import axios from 'axios';

// Use env var in production, fallback to local dev URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Create axios instance with credentials enabled
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ✅ Send cookies with every request
});

// No need for interceptor - cookies are sent automatically!

// Job API
export const jobAPI = {
  getAllJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  getJob: (id) => api.get(`/jobs/${id}`),
  getMyJobs: () => api.get('/jobs/my'),
  createJob: (jobData) => api.post('/jobs', jobData),
  deleteJob: (jobId) => api.delete(`/jobs/${jobId}`),
  updateJob: (jobId, jobData) => api.put(`/jobs/${jobId}`, jobData),
  getJobApplicants: (jobId) => api.get(`/jobs/${jobId}/applicants`)
};

// Application API
export const applicationAPI = {
  applyForJob: (jobId, data) => api.post(`/jobs/${jobId}/apply`, data),
  getMyApplications: (params) => api.get('/applications/me', { params }),
  getApplicationDetails: (id) => api.get(`/applications/${id}`),
  // ✅ NEW: Try job-based status update since apps are nested under jobs
  updateStatus: (applicationId, status) => api.patch(`/jobs/applications/${applicationId}/status`, { status }),
  // ✅ ALTERNATIVE: Direct application update
  updateApplication: (applicationId, data) => api.patch(`/applications/${applicationId}`, data),
};

export const projectAPI = {
  getAllProjects: (params) => api.get('/projects', { params }),
  getMyProjects: () => api.get('/projects/my'),
  
  getProject: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`)
};

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const aiAPI = {
  generateInterviewQuestions: (jobId) => 
    api.post('/ai/interview-questions', { jobId })
};

// Profile API
export const profileAPI = {
  getProfile: (userId) => userId ? api.get(`/profile/user/${userId}`) : api.get('/profile/me'),
  updateProfile: (data) => api.put('/profile/update', data),
  uploadProfilePicture: (formData) => api.post('/profile/upload-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadResume: (formData) => api.post('/profile/upload-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  setDefaultResume: (resumeId) => api.put(`/profile/resume/${resumeId}/default`),
  deleteResume: (resumeId) => api.delete(`/profile/resume/${resumeId}`),
  downloadResume: (resumeId) => api.get(`/profile/resume/${resumeId}/download`, {
    responseType: 'blob' // Important for file downloads
  }),
  toggleFollow: (targetUserId) => api.post(`/profile/follow/${targetUserId}`),
  analyzeResume: (data) => api.post('/profile/analyze-resume', data)
};

// Members / Users API
export const userAPI = {
  getMembers: (params) => api.get('/users/members', { params }),
};

// Messages / Chat API
export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  startConversation: (userId) =>
    api.post('/messages/conversations', { userId }),
  getMessages: (conversationId, params) =>
    api.get(`/messages/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, content) =>
    api.post(`/messages/conversations/${conversationId}/messages`, { content }),
  markRead: (conversationId) =>
    api.put(`/messages/conversations/${conversationId}/read`),
};

// Notifications API
export const notificationAPI = {
  getNotifications: (page = 1, limit = 20, unreadOnly = false) => 
    api.get(`/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`),
  markAsRead: (notificationId) => 
    api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => 
    api.put('/notifications/read-all'),
  deleteNotification: (notificationId) => 
    api.delete(`/notifications/${notificationId}`)
};

export default api;