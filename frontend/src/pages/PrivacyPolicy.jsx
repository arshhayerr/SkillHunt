import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Privacy <span className="bg-gradient-to-r from-green-200 to-teal-200 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-4xl mx-auto mb-4 leading-relaxed">
              Your privacy is important to us
            </p>
            <p className="text-sm text-green-200">Last updated: November 2024</p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Introduction</h2>
                <p className="text-gray-700 leading-relaxed">
                  At SkillHunt, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                </p>
              </div>

              <div className="bg-white border-2 border-gray-100 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Information We Collect</h2>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Name and contact information (email address)</li>
                  <li>Account credentials</li>
                  <li>Profile information (bio, skills, experience)</li>
                  <li>Project details and portfolio information</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Usage Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Device information and IP address</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent on platform</li>
                  <li>Interaction with features and content</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>To provide and maintain our services</li>
                  <li>To notify you about changes to our service</li>
                  <li>To provide customer support</li>
                  <li>To gather analysis or valuable information to improve our service</li>
                  <li>To monitor the usage of our service</li>
                  <li>To detect, prevent and address technical issues</li>
                </ul>
              </div>

              <div className="bg-white border-2 border-gray-100 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Security</h2>
                <p className="text-gray-700 leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Rights</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to processing of your data</li>
                  <li>Request transfer of your data</li>
                </ul>
              </div>

              <div className="bg-white border-2 border-gray-100 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at{' '}
                  <a href="mailto:privacy@skillhunt.com" className="text-green-600 hover:text-green-700 font-semibold">
                    privacy@skillhunt.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/terms"
              className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-green-500 transition-colors"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Terms of Service</h3>
              <p className="text-gray-600">Read our terms and conditions</p>
            </Link>
            <Link
              to="/cookies"
              className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-green-500 transition-colors"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Cookie Policy</h3>
              <p className="text-gray-600">Learn about our cookie usage</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
