import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { profileAPI, projectAPI } from '../services/api';

// Backend base URL for assets like profile pictures
const ASSET_BASE_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

const Profile = () => {
  const { user } = useAuth();
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [showPrivateToolkit, setShowPrivateToolkit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [atsAnalysis, setAtsAnalysis] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Edit states
  const [editMode, setEditMode] = useState({
    about: false,
    skills: false,
    experience: false,
    education: false
  });
  const [editData, setEditData] = useState({
    bio: '',
    skills: [],
    experience: [],
    education: []
  });

  // Fetch profile data from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        console.log('Fetching profile for userId:', userId);
        const response = await profileAPI.getProfile(userId);
        console.log('Profile API response:', response.data);

        if (response.data.success) {
          const profile = response.data.profile;

          // Transform API data to match component expectations
          const transformedData = {
            id: profile.id,
            name: profile.name,
            headline: profile.profile?.headline || 'Professional',
            location: profile.profile?.location || 'Location not specified',
            role: profile.role,
            profilePicture: profile.profile?.profilePicture,
            followersCount: profile.profile?.followersCount || 0,
            followingCount: profile.profile?.followingCount || 0,
            isFollowing: profile.profile?.isFollowing || false,
            bio: profile.profile?.bio || 'No bio available',
            skills: profile.profile?.skills || [],
            projects: [], // Will be fetched separately if needed
            experience: profile.profile?.experience || [],
            education: profile.profile?.education || [],
            resumes: profile.privateData?.resumes || [],
            socialLinks: profile.profile?.socialLinks || {},
            isPublic: profile.profile?.isPublic !== false
          };

          setProfileData(transformedData);
          setIsOwnProfile(response.data.isOwnProfile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        console.error('Error details:', error.response?.data || error.message);
        // Set fallback data on error
        setProfileData({
          id: user?.id || '1',
          name: user?.name || 'User',
          headline: 'Professional',
          location: 'Location not specified',
          role: user?.role || 'Student',
          profilePicture: null,
          followersCount: 0,
          followingCount: 0,
          isFollowing: false,
          bio: 'No bio available',
          skills: [],
          projects: [],
          experience: [],
          education: [],
          resumes: [],
          socialLinks: {},
          isPublic: true
        });
        setIsOwnProfile(!userId || userId === user?.id);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, userId]);

  // Fetch the projects belonging to the profile being viewed. If it's the
  // viewer's own profile we can use /projects/my (includes private). For
  // other users we list public projects and filter client-side by owner.
  useEffect(() => {
    const fetchProjects = async () => {
      if (!profileData?.id) return;
      try {
        setProjectsLoading(true);
        if (isOwnProfile) {
          const res = await projectAPI.getMyProjects();
          setProjects(res.data?.projects || []);
        } else {
          const res = await projectAPI.getAllProjects();
          const list = res.data?.projects || [];
          setProjects(
            list.filter((p) => {
              const ownerId = p.user?._id || p.user?.id || p.owner?._id || p.owner;
              return ownerId?.toString() === profileData.id?.toString();
            })
          );
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, [profileData?.id, isOwnProfile]);

  const handleFollow = async () => {
    try {
      const response = await profileAPI.toggleFollow(profileData.id);
      if (response.data.success) {
        setProfileData(prev => ({
          ...prev,
          isFollowing: response.data.isFollowing,
          followersCount: response.data.followersCount,
          followingCount: response.data.followingCount
        }));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleDownloadResume = async (resumeId, resumeName) => {
    try {
      setUploading(true);
      const response = await profileAPI.downloadResume(resumeId);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', resumeName || 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Error downloading resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await profileAPI.uploadProfilePicture(formData);
      if (response.data.success) {
        setProfileData(prev => ({
          ...prev,
          profilePicture: response.data.profilePicture
        }));
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Error uploading profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('name', file.name);
      formData.append('isDefault', profileData.resumes.length === 0 ? 'true' : 'false');

      const response = await profileAPI.uploadResume(formData);
      if (response.data.success) {
        const profileResponse = await profileAPI.getProfile(userId);
        if (profileResponse.data.success) {
          const profile = profileResponse.data.profile;
          setProfileData(prev => ({
            ...prev,
            resumes: profile.privateData?.resumes || []
          }));
        }
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Error uploading resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSetDefaultResume = async (resumeId) => {
    try {
      const response = await profileAPI.setDefaultResume(resumeId);
      if (response.data.success) {
        setProfileData(prev => ({
          ...prev,
          resumes: prev.resumes.map(resume => ({
            ...resume,
            isDefault: resume._id === resumeId
          }))
        }));
      }
    } catch (error) {
      console.error('Error setting default resume:', error);
    }
  };

  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;

    try {
      const response = await profileAPI.deleteResume(resumeId);
      if (response.data.success) {
        setProfileData(prev => ({
          ...prev,
          resumes: prev.resumes.filter(resume => resume._id !== resumeId)
        }));
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Error deleting resume. Please try again.');
    }
  };

  const handleAnalyzeResume = async () => {
    if (!jobDescription.trim()) {
      alert('Please enter a job description');
      return;
    }

    const defaultResume = profileData.resumes.find(r => r.isDefault);
    if (!defaultResume) {
      alert('Please set a default resume first');
      return;
    }

    try {
      setAnalyzing(true);
      const response = await profileAPI.analyzeResume({
        jobDescription: jobDescription.trim(),
        resumeId: defaultResume._id
      });

      if (response.data.success) {
        setAtsAnalysis(response.data.analysis);
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Error analyzing resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Edit handlers
  const toggleEditMode = (section) => {
    setEditMode(prev => ({
      ...prev,
      [section]: !prev[section]
    }));

    if (!editMode[section]) {
      switch (section) {
        case 'about':
          setEditData(prev => ({ ...prev, bio: profileData.bio || '' }));
          break;
        case 'skills':
          setEditData(prev => ({ ...prev, skills: [...(profileData.skills || [])] }));
          break;
        case 'experience':
          setEditData(prev => ({ ...prev, experience: [...(profileData.experience || [])] }));
          break;
        case 'education':
          setEditData(prev => ({ ...prev, education: [...(profileData.education || [])] }));
          break;
      }
    }
  };

  const saveSection = async (section) => {
    try {
      const updateData = {};
      switch (section) {
        case 'about': updateData.bio = editData.bio; break;
        case 'skills': updateData.skills = editData.skills; break;
        case 'experience': updateData.experience = editData.experience; break;
        case 'education': updateData.education = editData.education; break;
      }

      const response = await profileAPI.updateProfile(updateData);
      if (response.data.success) {
        setProfileData(prev => ({ ...prev, ...updateData }));
        setEditMode(prev => ({ ...prev, [section]: false }));
      }
    } catch (error) {
      console.error(`Error updating ${section}:`, error);
      alert(`Error updating ${section}. Please try again.`);
    }
  };

  const addSkill = () => setEditData(p => ({ ...p, skills: [...p.skills, { name: '', level: 'Beginner' }] }));
  const removeSkill = (index) => setEditData(p => ({ ...p, skills: p.skills.filter((_, i) => i !== index) }));
  const updateSkill = (index, field, value) => setEditData(p => ({ ...p, skills: p.skills.map((s, i) => i === index ? { ...s, [field]: value } : s) }));

  const addExperience = () => setEditData(p => ({ ...p, experience: [...p.experience, { title: '', company: '', duration: '', description: '', current: false }] }));
  const removeExperience = (index) => setEditData(p => ({ ...p, experience: p.experience.filter((_, i) => i !== index) }));
  const updateExperience = (index, field, value) => setEditData(p => ({ ...p, experience: p.experience.map((e, i) => i === index ? { ...e, [field]: value } : e) }));

  const addEducation = () => setEditData(p => ({ ...p, education: [...p.education, { degree: '', institution: '', year: '', grade: '' }] }));
  const removeEducation = (index) => setEditData(p => ({ ...p, education: p.education.filter((_, i) => i !== index) }));
  const updateEducation = (index, field, value) => setEditData(p => ({ ...p, education: p.education.map((e, i) => i === index ? { ...e, [field]: value } : e) }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 dark:border-white/10 border-t-blue-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400 text-lg">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Public Header & Identity */}
        <div className="bg-white dark:bg-gray-900/60 rounded-2xl p-8 mb-8 shadow-sm dark:shadow-black/30 border border-gray-200 dark:border-white/10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

            {/* Profile Picture */}
            <div className="relative group flex-shrink-0">
              {profileData.profilePicture ? (
                <img
                  src={`${ASSET_BASE_URL}${profileData.profilePicture}`}
                  alt={profileData.name}
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg ring-4 ring-white">
                  {profileData.name.charAt(0).toUpperCase()}
                </div>
              )}
              {isOwnProfile && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    id="profile-picture-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="profile-picture-upload"
                    className="absolute bottom-1 right-1 bg-white text-gray-700 rounded-full p-2.5 shadow-md border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer group-hover:scale-105"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                </>
              )}
            </div>

            {/* Identity Block */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{profileData.name}</h1>
              <p className="text-lg text-gray-600 mb-4">{profileData.headline}</p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {profileData.location}
                </div>
                <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-sm font-medium capitalize">
                  {profileData.role === 'student' ? 'Student' : 'Recruiter'}
                </span>
              </div>

              {/* Engagement Stats */}
              <div className="flex items-center justify-center md:justify-start gap-6 text-sm">
                <div className="flex gap-2 items-baseline">
                  <span className="font-bold text-gray-900 text-lg">{(profileData.followersCount || 0).toLocaleString()}</span>
                  <span className="text-gray-500 font-medium">Followers</span>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="flex gap-2 items-baseline">
                  <span className="font-bold text-gray-900 text-lg">{(profileData.followingCount || 0).toLocaleString()}</span>
                  <span className="text-gray-500 font-medium">Following</span>
                </div>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex flex-col gap-3 md:ml-auto w-full md:w-auto">
              {!isOwnProfile && (
                <div className="flex gap-2 w-full">
                  <button
                    onClick={handleFollow}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm ${profileData.isFollowing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    {profileData.isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                    Message
                  </button>
                </div>
              )}

              {/* Social Links */}
              <div className="flex gap-2 justify-center md:justify-end mt-2 md:mt-0">
                {profileData.socialLinks.linkedin && (
                  <a href={profileData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                    className="p-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors shadow-sm">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                  </a>
                )}
                {profileData.socialLinks.github && (
                  <a href={profileData.socialLinks.github} target="_blank" rel="noopener noreferrer"
                    className="p-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl hover:text-gray-900 hover:border-gray-300 hover:bg-gray-100 transition-colors shadow-sm">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                  </a>
                )}
                {profileData.socialLinks.portfolio && (
                  <a href={profileData.socialLinks.portfolio} target="_blank" rel="noopener noreferrer"
                    className="p-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors shadow-sm">
                    <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Private Career Toolkit Toggle (Only for Own Profile) */}
        {isOwnProfile && (
          <div className="mb-8">
            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 shadow-sm transition-all hover:bg-indigo-50/80">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-indigo-900 mb-1 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Private Career Toolkit
                  </h3>
                  <p className="text-indigo-700/80 text-sm">Manage your resumes and use AI to optimize for ATS.</p>
                </div>
                <button
                  onClick={() => setShowPrivateToolkit(!showPrivateToolkit)}
                  className="px-5 py-2.5 bg-white text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 hover:border-indigo-600 rounded-xl font-medium transition-all shadow-sm w-full sm:w-auto text-center"
                >
                  {showPrivateToolkit ? 'Hide Toolkit' : 'Open Toolkit'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Private Career Toolkit Content */}
        {isOwnProfile && showPrivateToolkit && (
          <div className="mb-8 space-y-6">

            <div className="bg-white dark:bg-gray-900/60 rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-black/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-2">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <svg className="w-5 h-5 text-blue-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Resume Manager
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Upload and manage your CVs</p>
                </div>
              </div>

              {/* My Resumes */}
              <div className="mb-8">
                <div className="space-y-3">
                  {profileData.resumes.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <p className="text-gray-500 text-sm">No resumes uploaded yet.</p>
                    </div>
                  ) : profileData.resumes.map((resume) => (
                    <div key={resume.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 rounded-xl transition-all gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
                          <svg className="w-6 h-6 outline-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{resume.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">Uploaded: {resume.uploadDate}</div>
                        </div>
                        {resume.isDefault && (
                          <span className="ml-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold uppercase tracking-wider">Default</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleDownloadResume(resume._id, resume.name)}
                          disabled={uploading}
                          className="flex-1 sm:flex-none justify-center px-4 py-2 text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 font-medium shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Download
                        </button>
                        {!resume.isDefault && (
                          <button
                            onClick={() => handleSetDefaultResume(resume._id)}
                            className="px-4 py-2 text-sm bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 rounded-lg transition-colors font-medium shadow-sm"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteResume(resume._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          title="Delete Resume"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    className="hidden"
                    id="resume-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="resume-upload"
                    className={`w-full p-6 border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-colors flex flex-col items-center justify-center gap-2 text-blue-600 cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    <div className="p-3 bg-white rounded-full shadow-sm">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                    <span className="font-medium">{uploading ? 'Uploading...' : 'Upload a new resume (PDF)'}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* ATS Optimizer */}
            <div className="bg-white dark:bg-gray-900/60 rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-black/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 dark:bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-50"></div>

              <div className="relative">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-500/15 rounded-lg text-emerald-600 dark:text-emerald-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">AI ATS Optimizer</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Job Description</label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="w-full h-32 p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/30 focus:border-emerald-500 resize-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 font-medium"
                      placeholder="Paste the job description here to get AI-powered ATS optimization suggestions against your default resume..."
                    />
                  </div>
                  <button
                    onClick={handleAnalyzeResume}
                    disabled={analyzing || !jobDescription.trim()}
                    className="px-6 py-3 bg-gray-900 hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all w-full md:w-auto flex items-center justify-center gap-2 shadow-sm"
                  >
                    {analyzing ? (
                      <>
                        <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Analyze & Optimize
                      </>
                    )}
                  </button>

                  {atsAnalysis && (
                    <div className="mt-6 pt-6 border-t border-gray-100 space-y-6">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">AI Analysis Results</h4>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">Powered by AI</span>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-gray-700">ATS Compatibility Score</span>
                          <span className={`text-3xl font-extrabold tracking-tight ${atsAnalysis.score >= 80 ? 'text-emerald-600' : atsAnalysis.score >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                            {atsAnalysis.score}%
                          </span>
                        </div>
                        <div className="w-full bg-white rounded-full h-2.5 border border-gray-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${atsAnalysis.score >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : atsAnalysis.score >= 60 ? 'bg-gradient-to-r from-amber-300 to-amber-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}
                            style={{ width: `${atsAnalysis.score}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                          <span>Poor Match</span>
                          <span>Perfect Match</span>
                        </div>
                      </div>

                      {atsAnalysis.overallFeedback && (
                        <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <h5 className="text-sm font-semibold text-blue-900">AI Assessment</h5>
                          </div>
                          <p className="text-sm text-blue-900/80 leading-relaxed">{atsAnalysis.overallFeedback}</p>
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-4">
                        {atsAnalysis.strengths && atsAnalysis.strengths.length > 0 && (
                          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              <h5 className="text-sm font-semibold text-emerald-900">Your Strengths</h5>
                            </div>
                            <ul className="space-y-2 text-sm text-emerald-900/90">
                              {atsAnalysis.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {atsAnalysis.weaknesses && atsAnalysis.weaknesses.length > 0 && (
                          <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                              <h5 className="text-sm font-semibold text-amber-900">Areas to Improve</h5>
                            </div>
                            <ul className="space-y-2 text-sm text-amber-900/90">
                              {atsAnalysis.weaknesses.map((weakness, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-amber-500 font-bold mt-0.5">!</span>
                                  <span>{weakness}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {atsAnalysis.suggestions && atsAnalysis.suggestions.length > 0 && (
                        <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            <h5 className="text-sm font-semibold text-purple-900">AI Recommendations</h5>
                          </div>
                          <ul className="space-y-2 text-sm text-purple-900/90">
                            {atsAnalysis.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-purple-500 font-bold mt-0.5">→</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {((atsAnalysis.matchedKeywords && atsAnalysis.matchedKeywords.length > 0) || (atsAnalysis.missingKeywords && atsAnalysis.missingKeywords.length > 0)) && (
                        <div className="grid md:grid-cols-2 gap-4">
                          {atsAnalysis.matchedKeywords && atsAnalysis.matchedKeywords.length > 0 && (
                            <div>
                              <h5 className="text-sm font-semibold text-gray-900 mb-3">Matched Keywords</h5>
                              <div className="flex flex-wrap gap-2">
                                {atsAnalysis.matchedKeywords.map((keyword, index) => (
                                  <span key={index} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-medium">
                                    ✓ {keyword}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {atsAnalysis.missingKeywords && atsAnalysis.missingKeywords.length > 0 && (
                            <div>
                              <h5 className="text-sm font-semibold text-gray-900 mb-3">Missing Keywords</h5>
                              <div className="flex flex-wrap gap-2">
                                {atsAnalysis.missingKeywords.map((keyword, index) => (
                                  <span key={index} className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-100 rounded-full text-xs font-medium">
                                    + {keyword}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {(atsAnalysis.totalKeywords || atsAnalysis.matchedCount) && (
                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex flex-wrap justify-between gap-x-6 gap-y-2 text-sm text-gray-600">
                            <span>Keywords Matched: <strong className="text-gray-900">{atsAnalysis.matchedCount || 0}</strong></span>
                            <span>Total Keywords: <strong className="text-gray-900">{atsAnalysis.totalKeywords || 0}</strong></span>
                            <span>Match Rate: <strong className="text-gray-900">{atsAnalysis.totalKeywords ? Math.round((atsAnalysis.matchedCount / atsAnalysis.totalKeywords) * 100) : 0}%</strong></span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Profile Content Tabs */}
        <div className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-black/30 rounded-2xl overflow-hidden mt-8">

          {/* Tab Navigation */}
          <div className="border-b border-gray-100 dark:border-white/5 flex overflow-x-auto hide-scrollbar">
            {['projects', 'experience', 'education'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-sm font-semibold capitalize whitespace-nowrap border-b-2 transition-colors ${activeTab === tab
                    ? 'text-blue-600 dark:text-indigo-300 border-blue-600 dark:border-indigo-400 bg-blue-50/50 dark:bg-indigo-500/10'
                    : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* About Me Section - always visible or maybe moved? (Keeping standard structure) */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">About Me</h3>
                {isOwnProfile && (
                  <button
                    onClick={() => editMode.about ? saveSection('about') : toggleEditMode('about')}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    {editMode.about ? 'Save' : 'Edit'}
                  </button>
                )}
              </div>

              {editMode.about ? (
                <div className="space-y-3">
                  <textarea
                    value={editData.bio}
                    onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => saveSection('about')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700">Save</button>
                    <button onClick={() => toggleEditMode('about')} className="px-4 py-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-medium shadow-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 leading-relaxed max-w-4xl text-sm">
                  {profileData.bio || 'No bio available'}
                </p>
              )}
            </div>

            {/* Skills */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Skills</h3>
                {isOwnProfile && (
                  <button
                    onClick={() => editMode.skills ? saveSection('skills') : toggleEditMode('skills')}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    {editMode.skills ? 'Save' : 'Edit Skills'}
                  </button>
                )}
              </div>

              {editMode.skills ? (
                <div className="space-y-4">
                  {/* Edit interface omitted for brevity but keeping basic inputs styling */}
                  {editData.skills.map((skill, index) => (
                    <div key={index} className="flex gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => updateSkill(index, 'name', e.target.value)}
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      <select
                        value={skill.level}
                        onChange={(e) => updateSkill(index, 'level', e.target.value)}
                        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                      <button onClick={() => removeSkill(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button onClick={addSkill} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-gray-800">Add Skill</button>
                    <button onClick={() => saveSection('skills')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700">Save</button>
                    <button onClick={() => toggleEditMode('skills')} className="px-4 py-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-medium shadow-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.length > 0 ? profileData.skills.map((skill, index) => (
                    <div key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium">
                      {skill.name}
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 bg-white border border-gray-100 px-1.5 py-0.5 rounded">{skill.level}</span>
                    </div>
                  )) : (
                    <div className="text-gray-500 text-sm italic py-2">No skills added yet</div>
                  )}
                </div>
              )}
            </div>

            {/* TAB CONTENT AREAS */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              {activeTab === 'projects' && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {isOwnProfile ? 'My Projects' : `${profileData.name.split(' ')[0]}'s Projects`}
                      <span className="ml-2 text-sm font-medium text-gray-400 dark:text-gray-500">
                        {projects.length > 0 && `· ${projects.length}`}
                      </span>
                    </h3>
                    {isOwnProfile && (
                      <Link
                        to="/projects/new"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-gray-900 hover:bg-black rounded-lg shadow-sm transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        New Project
                      </Link>
                    )}
                  </div>

                  {projectsLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                  ) : projects.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p className="mb-3">
                        {isOwnProfile ? "You haven't added any projects yet." : 'No public projects to show.'}
                      </p>
                      {isOwnProfile && (
                        <Link
                          to="/projects/new"
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
                        >
                          Add Your First Project
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projects.map((project) => (
                        <Link
                          key={project._id}
                          to={`/projects/${project._id}`}
                          className="group block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                              {project.title}
                            </h4>
                            {project.isPublic === false ? (
                              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Private
                              </span>
                            ) : (
                              <span className="shrink-0 inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 rounded">
                                Public
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                            {project.description || 'No description provided.'}
                          </p>

                          {Array.isArray(project.techStack) && project.techStack.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {project.techStack.slice(0, 4).map((tech, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 rounded"
                                >
                                  {tech}
                                </span>
                              ))}
                              {project.techStack.length > 4 && (
                                <span className="px-2 py-0.5 text-xs font-medium text-gray-400 dark:text-gray-500">
                                  +{project.techStack.length - 4}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-3">
                              {typeof project.views === 'number' && (
                                <span className="inline-flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  {project.views}
                                </span>
                              )}
                              {project.createdAt && (
                                <span>
                                  {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              )}
                            </div>
                            <div
                              className="flex items-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {project.githubUrl && (
                                <a
                                  href={project.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                  aria-label="GitHub"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                  </svg>
                                </a>
                              )}
                              {project.liveUrl && (
                                <a
                                  href={project.liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                  aria-label="Live"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'experience' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Experience</h3>
                    {isOwnProfile && (
                      <button
                        onClick={() => (editMode.experience ? saveSection('experience') : toggleEditMode('experience'))}
                        className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                      >
                        {editMode.experience ? 'Save' : 'Edit'}
                      </button>
                    )}
                  </div>

                  {editMode.experience ? (
                    <div className="space-y-4">
                      {editData.experience.length === 0 && (
                        <div className="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 text-center">
                          No experience yet — click &ldquo;Add Experience&rdquo; to create your first entry.
                        </div>
                      )}
                      {editData.experience.map((exp, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={exp.title || ''}
                              placeholder="Title (e.g. Software Engineer)"
                              onChange={(e) => updateExperience(index, 'title', e.target.value)}
                              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <input
                              type="text"
                              value={exp.company || ''}
                              placeholder="Company"
                              onChange={(e) => updateExperience(index, 'company', e.target.value)}
                              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                          </div>
                          <input
                            type="text"
                            value={exp.duration || ''}
                            placeholder="Duration (e.g. Jan 2023 - Present)"
                            onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                          <textarea
                            value={exp.description || ''}
                            placeholder="Describe your role, impact, and achievements"
                            onChange={(e) => updateExperience(index, 'description', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none min-h-[90px]"
                          />
                          <div className="flex items-center justify-between">
                            <label className="inline-flex items-center gap-2 text-xs text-gray-600">
                              <input
                                type="checkbox"
                                checked={!!exp.current}
                                onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              I currently work here
                            </label>
                            <button
                              onClick={() => removeExperience(index)}
                              className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={addExperience}
                          className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-gray-800"
                        >
                          Add Experience
                        </button>
                        <button
                          onClick={() => saveSection('experience')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => toggleEditMode('experience')}
                          className="px-4 py-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-medium shadow-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : profileData.experience.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-2xl">
                      No experience listed yet.
                    </div>
                  ) : (
                    profileData.experience.map((exp, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-200">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8zM9 12l2 2 4-4" /></svg>
                        </div>
                        <div className="flex-1 pb-6 border-b border-gray-100">
                          <h4 className="font-bold text-gray-900">{exp.title}</h4>
                          <div className="text-gray-900 font-medium text-sm mt-0.5">{exp.company}</div>
                          <div className="text-gray-500 text-xs mt-1 mb-3">{exp.duration}</div>
                          <p className="text-gray-600 text-sm leading-relaxed">{exp.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'education' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Education</h3>
                    {isOwnProfile && (
                      <button
                        onClick={() => (editMode.education ? saveSection('education') : toggleEditMode('education'))}
                        className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                      >
                        {editMode.education ? 'Save' : 'Edit'}
                      </button>
                    )}
                  </div>

                  {editMode.education ? (
                    <div className="space-y-4">
                      {editData.education.length === 0 && (
                        <div className="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 text-center">
                          No education yet — click &ldquo;Add Education&rdquo; to create your first entry.
                        </div>
                      )}
                      {editData.education.map((edu, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={edu.institution || ''}
                              placeholder="Institution (e.g. Stanford University)"
                              onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <input
                              type="text"
                              value={edu.degree || ''}
                              placeholder="Degree (e.g. B.Tech in Computer Science)"
                              onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={edu.year || ''}
                              placeholder="Year (e.g. 2021 - 2025)"
                              onChange={(e) => updateEducation(index, 'year', e.target.value)}
                              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <input
                              type="text"
                              value={edu.grade || ''}
                              placeholder="Grade / GPA (optional)"
                              onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => removeEducation(index)}
                              className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={addEducation}
                          className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-gray-800"
                        >
                          Add Education
                        </button>
                        <button
                          onClick={() => saveSection('education')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => toggleEditMode('education')}
                          className="px-4 py-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-medium shadow-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : profileData.education.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-2xl">
                      No education listed yet.
                    </div>
                  ) : (
                    profileData.education.map((edu, index) => (
                      <div key={index} className="flex gap-4 border-b border-gray-100 pb-6 last:border-0">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{edu.institution}</h4>
                          <div className="text-gray-700 font-medium text-sm mt-0.5">{edu.degree}</div>
                          <div className="text-gray-500 text-xs mt-1">
                            {edu.year}
                            {edu.grade ? ` • Grade: ${edu.grade}` : ''}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
