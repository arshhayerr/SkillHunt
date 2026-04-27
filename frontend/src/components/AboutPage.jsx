import React from 'react';
import { Link } from 'react-router-dom';

/*
 * About page.
 *
 * Previously this component used inline `style={{ ... }}` objects with
 * hardcoded hex codes (#111827, #ffffff, #fafbfc, etc.), which meant it had
 * no way to respond to the app's `html.dark` theme — dark text was being
 * rendered on the app's dark body background. It has been migrated to
 * Tailwind utility classes with `dark:` variants so it consumes the same
 * theme system as the rest of the app, including the global transitions and
 * design tokens defined in `src/index.css`.
 */

const FEATURES = [
  {
    title: 'Showcase Projects',
    desc: 'Display your best work with beautiful project portfolios. Add GitHub links, live demos, and detailed descriptions to impress recruiters.',
  },
  {
    title: 'Find Opportunities',
    desc: 'Discover internships, full-time positions, and freelance projects that match your skills, interests, and career goals.',
  },
  {
    title: 'Network & Connect',
    desc: 'Build meaningful connections with peers, mentors, and industry professionals to accelerate your career growth.',
  },
  {
    title: 'Get Discovered',
    desc: 'Let recruiters and companies find you based on your skills, projects, and experience. Your next opportunity might be just a message away.',
  },
  {
    title: 'Fast & Easy',
    desc: 'Set up your profile in minutes. Our intuitive interface makes it easy to upload projects, apply for jobs, and manage your career journey.',
  },
  {
    title: 'Community First',
    desc: 'Join a supportive community of students, graduates, and professionals who are passionate about growth, learning, and success.',
  },
];

const STATS = [
  ['5,000+', 'Active Students'],
  ['500+', 'Companies'],
  ['10,000+', 'Projects Showcased'],
];

const AboutPage = () => {
  return (
    <div className="font-sans text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden text-center px-6 pt-24 pb-20
                   bg-[linear-gradient(180deg,#ffffff_0%,#e8eeff_50%,#c7d5ff_100%)]
                   dark:bg-[linear-gradient(180deg,#0b0d12_0%,#12151d_55%,#1b2030_100%)]"
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none
                     bg-[linear-gradient(rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.08)_1px,transparent_1px)]
                     dark:bg-[linear-gradient(rgba(148,163,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,255,0.06)_1px,transparent_1px)]
                     [background-size:48px_48px]"
        />

        <div className="relative max-w-[720px] mx-auto">
          <h1
            className="m-0 mb-6 font-black leading-[1.05] tracking-[-0.03em]"
            style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}
          >
            <span className="block text-gray-900 dark:text-white">About</span>
            <span className="block text-gray-400 dark:text-gray-500">SkillHunt</span>
          </h1>
          <p className="text-[17px] leading-[1.7] text-gray-600 dark:text-gray-300 max-w-[520px] mx-auto mb-10">
            The premier platform connecting talented students with exceptional career opportunities.
            Showcase your projects, discover amazing work, and elevate your future.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-3.5 text-[15px] font-semibold
                         rounded-xl border
                         text-gray-900 bg-white border-gray-300 shadow-sm
                         hover:bg-gray-50 hover:shadow-md hover:-translate-y-px
                         dark:text-white dark:bg-white/10 dark:border-white/15 dark:shadow-none
                         dark:hover:bg-white/15
                         transition-all duration-200"
            >
              Start your journey
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-3.5 text-[15px] font-semibold
                         rounded-xl
                         text-gray-600 hover:text-gray-900
                         dark:text-gray-300 dark:hover:text-white
                         transition-colors duration-200"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────────────────── */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-[700px] mx-auto">
          <h2
            className="font-extrabold tracking-[-0.02em] mb-4 text-gray-900 dark:text-white"
            style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
          >
            Our Mission
          </h2>
          <p className="text-base leading-[1.7] text-gray-600 dark:text-gray-300 m-0">
            Bridging the gap between talented students and innovative companies by creating
            a platform where creativity meets opportunity.
          </p>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-[#fafbfc] dark:bg-gray-900/40 transition-colors duration-300">
        <div className="max-w-[1120px] mx-auto">
          <div className="text-center mb-14">
            <h2
              className="font-extrabold tracking-[-0.02em] mb-3 text-gray-900 dark:text-white"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
            >
              Why Choose SkillHunt?
            </h2>
            <p className="text-base leading-[1.7] text-gray-600 dark:text-gray-300 m-0">
              Everything you need to showcase your talent and find opportunities
            </p>
          </div>

          <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-7 border transition-all duration-300
                           bg-white border-gray-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:-translate-y-1
                           dark:bg-gray-900/60 dark:border-gray-800 dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] dark:hover:border-gray-700"
              >
                <h3 className="text-[17px] font-bold mb-2 text-gray-900 dark:text-white">{f.title}</h3>
                <p className="text-sm leading-[1.65] text-gray-600 dark:text-gray-300 m-0">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 border-y border-gray-100 dark:border-gray-900 transition-colors duration-300">
        <div className="max-w-[900px] mx-auto text-center">
          <h2
            className="font-extrabold tracking-[-0.02em] mb-3 text-gray-900 dark:text-white"
            style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
          >
            Join Our Growing Community
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-300 mb-12 m-0">
            Thousands of students and recruiters trust SkillHunt
          </p>

          <div className="grid grid-cols-3 gap-8">
            {STATS.map(([num, label]) => (
              <div key={label}>
                <div
                  className="font-extrabold tracking-[-0.02em] text-gray-900 dark:text-white"
                  style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}
                >
                  {num}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-[560px] mx-auto">
          <h2
            className="font-extrabold tracking-[-0.02em] mb-4 text-gray-900 dark:text-white"
            style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
          >
            Ready to elevate your career?
          </h2>
          <p className="text-base leading-[1.7] text-gray-600 dark:text-gray-300 mb-9 m-0">
            Join thousands of successful students who have found their dream opportunities.
            Your future starts here.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-6">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-3.5 text-[15px] font-semibold
                         rounded-xl border
                         text-gray-900 bg-white border-gray-300 shadow-sm
                         hover:bg-gray-50 hover:shadow-md hover:-translate-y-px
                         dark:text-white dark:bg-white/10 dark:border-white/15 dark:shadow-none
                         dark:hover:bg-white/15
                         transition-all duration-200"
            >
              Get started free
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-3.5 text-[15px] font-semibold
                         rounded-xl
                         text-gray-600 hover:text-gray-900
                         dark:text-gray-300 dark:hover:text-white
                         transition-colors duration-200"
            >
              Already have an account? Sign in
            </Link>
          </div>

          <div className="flex justify-center gap-6 text-[13px] text-gray-500 dark:text-gray-400">
            <span>100% Free</span>
            <span>No Credit Card</span>
            <span>Setup in 2 Minutes</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
