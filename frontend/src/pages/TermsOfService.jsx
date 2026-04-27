import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-pink-700 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Terms of <span className="bg-gradient-to-r from-orange-200 to-pink-200 bg-clip-text text-transparent">Service</span>
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 max-w-4xl mx-auto mb-4 leading-relaxed">
              Please read these terms carefully before using SkillHunt
            </p>
            <p className="text-sm text-orange-200">Last updated: November 2024</p>
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
              <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing or using SkillHunt, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this platform.
                </p>
              </div>

              <div className="bg-white border-2 border-gray-100 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Use License</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Permission is granted to temporarily access SkillHunt for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose</li>
                  <li>Attempt to decompile or reverse engineer any software</li>
                  <li>Remove any copyright or proprietary notations</li>
                  <li>Transfer the materials to another person</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">User Accounts</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Maintaining the confidentiality of your account and password</li>
                  <li>Restricting access to your computer and account</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                </ul>
              </div>

              <div className="bg-white border-2 border-gray-100 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Content Guidelines</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Users are responsible for the content they post. You agree not to post content that:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Is illegal, harmful, or offensive</li>
                  <li>Infringes on intellectual property rights</li>
                  <li>Contains viruses or malicious code</li>
                  <li>Violates privacy or publicity rights</li>
                  <li>Is spam or unsolicited advertising</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed">
                  SkillHunt shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
                </p>
              </div>

              <div className="bg-white border-2 border-gray-100 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Termination</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may terminate or suspend your account and access to the service immediately, without prior notice, for any reason, including breach of these Terms.
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify users of any changes by posting the new Terms of Service on this page.
                </p>
              </div>

              <div className="bg-white border-2 border-gray-100 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Information</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about these Terms, please contact us at{' '}
                  <a href="mailto:legal@skillhunt.com" className="text-orange-600 hover:text-orange-700 font-semibold">
                    legal@skillhunt.com
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
              to="/privacy"
              className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-orange-500 transition-colors"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy Policy</h3>
              <p className="text-gray-600">Learn how we protect your data</p>
            </Link>
            <Link
              to="/cookies"
              className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-orange-500 transition-colors"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Cookie Policy</h3>
              <p className="text-gray-600">Understand our cookie usage</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;
