import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Jobs from './pages/Jobs';
import PostJobPage from './pages/PostJob';
import ManageJobsPage from './pages/ManageJobs';
import Applications from './pages/Applications';
import JobApplicants from './components/jobs/JobApplications';
import EditJob from './components/jobs/EditJob';
import RegisterPage from './(Auth)/register/RegisterPage';
import LoginPage from './(Auth)/login/LoginPage';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import HelpCenter from './pages/HelpCenter';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import ProtectedRoute from './components/ProtectedRoute';
import AddProject from './components/projects/AddProjects';
import MyProjects from './components/projects/MyProjects';
import EditProject from './components/projects/EditProject';
import ProjectsBrowse from './components/projects/ProjectsBrowse';
import ProjectDetail from './components/projects/ProjectDetail';
import Profile from './pages/Profile';
import Members from './pages/Members';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import { NotificationProvider } from './context/NotificationContext';
import { MessagesProvider } from './context/MessagesContext';
import './App.css';
import './index.css';


function App() {
  return (
    <Router>
      <NotificationProvider>
        <MessagesProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />

            {/* 🔧 AUTH ROUTES - PUBLIC */}
            <Route path="register" element={<RegisterPage />} />
            <Route path="login" element={<LoginPage />} />

            {/* 🔧 PUBLIC PAGES */}
            <Route path="about" element={<AboutPage />} />
            <Route path="help" element={<HelpCenter />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<TermsOfService />} />
            <Route path="cookies" element={<CookiePolicy />} />

            {/* 🔧 PROTECTED ROUTES - REQUIRE AUTHENTICATION */}
            <Route path="dashboard" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />

            <Route path="projects/new" element={
              <ProtectedRoute>
                <AddProject />
              </ProtectedRoute>
            } />

            <Route path="projects/my" element={
              <ProtectedRoute>
                <MyProjects />
              </ProtectedRoute>
            } />

            <Route path="projects/:id/edit" element={
              <ProtectedRoute>
                <EditProject />
              </ProtectedRoute>
            } />

            {/* 🔧 BROWSE PROJECTS - PROTECTED (Only for authenticated users) */}
            <Route path="projects/browse" element={
              <ProtectedRoute>
                <ProjectsBrowse />
              </ProtectedRoute>
            } />

            {/* 🔧 PROJECT DETAILS - PROTECTED */}
            <Route path="projects/:id" element={
              <ProtectedRoute>
                <ProjectDetail />
              </ProtectedRoute>
            } />

            <Route path='jobs' element={
              <ProtectedRoute>
                <Jobs />
              </ProtectedRoute>
            } />

            <Route path="applications" element={
              <ProtectedRoute>
                <Applications />
              </ProtectedRoute>
            } />

            <Route path="jobs/post" element={
              <ProtectedRoute>
                <PostJobPage />
              </ProtectedRoute>
            } />

            <Route path="jobs/manage" element={
              <ProtectedRoute>
                <ManageJobsPage />
              </ProtectedRoute>
            } />

            <Route path="jobs/:jobId/applicants" element={
              <ProtectedRoute>
                <JobApplicants />
              </ProtectedRoute>
            } />

            <Route path="jobs/:jobId/edit" element={
              <ProtectedRoute>
                <EditJob />
              </ProtectedRoute>
            } />

            <Route path="members" element={
              <ProtectedRoute>
                <Members />
              </ProtectedRoute>
            } />

            <Route path="notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />

            <Route path="messages" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />

            <Route path="profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="profile/:userId" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
          </Route>
          {/* You can add routes without layout here if needed */}
          {/* <Route path="/admin" element={<AdminPage />} /> */}
        </Routes>
        </MessagesProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;