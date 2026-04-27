import React from 'react';
import { Link } from 'react-router-dom';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-yellow-600 to-orange-700 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Cookie <span className="bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-xl md:text-2xl text-amber-100 max-w-4xl mx-auto mb-4 leading-relaxed">
              How we use cookies to improve your experience
            </p>
            <p className="text-sm text-amber-200">Last updated: November 2024</p>
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
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
                <p className="text-gray-700 leading-relaxed">
                  Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
                </p>
              </div>

              <div className="bg-white border-2 border-gray-100 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Use Cookies</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Elevatr uses cookies for various purposes:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>To keep you signed in to your account</li>
                  <li>To remember your preferences and settings</li>
                  <li>To understand how you use our platform</li>
                  <li>To improve our services and user experience</li>
                  <li>To provide personalized content and features</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Essential Cookies</h3>
                    <p className="text-gray-700">
                      These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Performance Cookies</h3>
                    <p className="text-gray-700">
                      These cookies collect information about how visitors use our website, such as which pages are visited most often. This helps us improve our website's performance.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Functionality Cookies</h3>
                    <p className="text-gray-700">
                      These cookies allow the website to remember choices you make and provide enhanced, personalized features.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Analytics Cookies</h3>
                    <p className="text-gray-700">
                      We use analytics cookies to understand how users interact with our platform, helping us make data-driven improvements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-100 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You can control and manage cookies in various ways:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Most browsers allow you to refuse or accept cookies</li>
                  <li>You can delete cookies that have already been set</li>
                  <li>You can set your browser to notify you when cookies are being sent</li>
                  <li>Note that disabling cookies may affect website functionality</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may use third-party services that set cookies on our behalf to provide analytics and improve our services. These third parties have their own privacy policies governing their use of information.
                </p>
              </div>

              <div className="bg-white border-2 border-gray-100 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated revision date.
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have questions about our use of cookies, please contact us at{' '}
                  <a href="mailto:privacy@elevatr.com" className="text-amber-600 hover:text-amber-700 font-semibold">
                    privacy@elevatr.com
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
              className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-amber-500 transition-colors"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy Policy</h3>
              <p className="text-gray-600">Learn about our privacy practices</p>
            </Link>
            <Link
              to="/terms"
              className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-amber-500 transition-colors"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Terms of Service</h3>
              <p className="text-gray-600">Read our terms and conditions</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CookiePolicy;
