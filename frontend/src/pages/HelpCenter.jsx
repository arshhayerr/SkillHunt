import React from 'react';
import { Link } from 'react-router-dom';

const HelpCenter = () => {
  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click on 'Get Started' or 'Register' and fill out the registration form. Choose whether you're a student or recruiter, and you'll be ready to go!"
        },
        {
          q: "What's the difference between student and recruiter accounts?",
          a: "Students can showcase projects, apply for jobs, and connect with recruiters. Recruiters can post jobs, browse student portfolios, and find talented candidates."
        }
      ]
    },
    {
      category: "For Students",
      questions: [
        {
          q: "How do I add a project to my portfolio?",
          a: "Navigate to 'My Projects' and click 'Add New Project'. Fill in the details, add links to your GitHub repo or live demo, and showcase your work!"
        },
        {
          q: "How can recruiters find my profile?",
          a: "Recruiters can browse all student projects and profiles. Make sure your projects have detailed descriptions and tags to increase visibility."
        }
      ]
    },
    {
      category: "For Recruiters",
      questions: [
        {
          q: "How do I post a job?",
          a: "Go to 'Post Jobs' from your dashboard, fill in the job details including requirements and description, and publish it for students to see."
        },
        {
          q: "How do I view applications?",
          a: "Navigate to 'Manage Jobs' to see all your job postings and the applications received for each position."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Help <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">Center</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto mb-8 leading-relaxed">
              Find answers to common questions and get the help you need
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {faqs.map((section, idx) => (
              <div key={idx}>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">{section.category}</h2>
                <div className="space-y-6">
                  {section.questions.map((faq, qIdx) => (
                    <div key={qIdx} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{faq.q}</h3>
                      <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Still have questions?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            We're here to help! Reach out to our support team.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-10 py-5 bg-white text-blue-600 font-bold text-xl rounded-2xl hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;
