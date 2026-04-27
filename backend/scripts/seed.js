/**
 * Demo data seeder for SkillHunt.
 *
 * What it does:
 *   - Creates 3 recruiters + 8 students (all sharing the same demo password).
 *   - Gives each student a rich profile (headline, skills, experience,
 *     education, socials).
 *   - Creates ~10 student projects.
 *   - Creates ~8 job postings from the recruiters with future deadlines.
 *   - Creates ~12 applications across students/jobs.
 *
 * Usage (from /backend):
 *   npm run seed            # additive — skips already-seeded rows
 *   npm run seed:reset      # wipes previously-seeded rows first, then seeds
 *
 * Safety:
 *   All seeded users share the @seed.elevatr.dev email domain. The --reset
 *   flag only deletes users with that suffix (and their projects / jobs /
 *   applications), so your real data is never touched.
 *
 * Demo login credentials:
 *   Email:    <any seeded email>  (e.g. priya@seed.elevatr.dev)
 *   Password: Password123!
 */

require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const connectDB = require('../config/connectDB');
const User = require('../models/user.model');
const Project = require('../models/project.model');
const Job = require('../models/job.model');
const Application = require('../models/application.model');

const SEED_DOMAIN = '@seed.skillhunt.dev';
const SEED_PASSWORD = 'Password123!';
const DAY_MS = 24 * 60 * 60 * 1000;

const plus = (days) => new Date(Date.now() + days * DAY_MS);

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

const recruiterSeeds = [
  {
    name: 'Priya Sharma',
    email: `priya${SEED_DOMAIN}`,
    headline: 'Lead Recruiter @ TechNova Solutions',
    location: 'Bangalore, India',
    bio: 'Helping early-career engineers break into product companies. Always hiring for frontend, backend & full-stack roles.',
    company: 'TechNova Solutions Pvt. Ltd.',
    socialLinks: { linkedin: 'https://linkedin.com/in/priyasharma-demo' },
  },
  {
    name: 'Rohit Mehra',
    email: `rohit${SEED_DOMAIN}`,
    headline: 'Engineering Manager @ FinEdge',
    location: 'Mumbai, India',
    bio: 'Building the next-gen fintech platform. Love working with hungry, curious engineers.',
    company: 'FinEdge Analytics',
    socialLinks: { linkedin: 'https://linkedin.com/in/rohitmehra-demo' },
  },
  {
    name: 'Ananya Iyer',
    email: `ananya${SEED_DOMAIN}`,
    headline: 'Talent Partner @ GreenLoop Labs',
    location: 'Remote (IST)',
    bio: 'Hiring for climate-tech. If you care about sustainability and shipping great software, let’s chat.',
    company: 'GreenLoop Labs',
    socialLinks: { linkedin: 'https://linkedin.com/in/ananyaiyer-demo' },
  },
];

const studentSeeds = [
  {
    name: 'Aarav Patel',
    email: `aarav${SEED_DOMAIN}`,
    headline: 'Full-Stack Developer · React · Node.js',
    location: 'Pune, India',
    bio: 'CS senior who loves building end-to-end web apps. Currently obsessed with real-time systems and great UX.',
    skills: [
      { name: 'React', level: 'Advanced' },
      { name: 'Node.js', level: 'Advanced' },
      { name: 'MongoDB', level: 'Intermediate' },
      { name: 'TypeScript', level: 'Intermediate' },
      { name: 'GraphQL', level: 'Beginner' },
    ],
    experience: [
      {
        title: 'Software Engineering Intern',
        company: 'TechNova Solutions',
        duration: 'May 2025 - Aug 2025',
        description: 'Shipped a real-time notification service used across 3 internal products. Reduced alert latency by 40%.',
        current: false,
      },
    ],
    education: [
      {
        degree: 'B.Tech, Computer Science',
        institution: 'Pune Institute of Computer Technology',
        year: '2022 - 2026',
        grade: '8.7 CGPA',
      },
    ],
    socialLinks: {
      github: 'https://github.com/aarav-demo',
      linkedin: 'https://linkedin.com/in/aarav-demo',
      portfolio: 'https://aarav.dev',
    },
  },
  {
    name: 'Diya Krishnan',
    email: `diya${SEED_DOMAIN}`,
    headline: 'Aspiring ML Engineer · NLP & CV',
    location: 'Chennai, India',
    bio: 'I build models that solve real problems — computer vision, recommendation systems, and LLM-powered tools.',
    skills: [
      { name: 'Python', level: 'Expert' },
      { name: 'PyTorch', level: 'Advanced' },
      { name: 'TensorFlow', level: 'Intermediate' },
      { name: 'FastAPI', level: 'Intermediate' },
      { name: 'Docker', level: 'Intermediate' },
    ],
    experience: [
      {
        title: 'ML Research Intern',
        company: 'IIT Madras AI Lab',
        duration: 'Jan 2025 - Jun 2025',
        description: 'Published a short paper on few-shot learning for low-resource Indian languages.',
        current: false,
      },
    ],
    education: [
      {
        degree: 'B.E., Computer Science (AI specialization)',
        institution: 'SSN College of Engineering',
        year: '2022 - 2026',
        grade: '9.1 CGPA',
      },
    ],
    socialLinks: {
      github: 'https://github.com/diya-demo',
      linkedin: 'https://linkedin.com/in/diya-demo',
    },
  },
  {
    name: 'Kabir Singh',
    email: `kabir${SEED_DOMAIN}`,
    headline: 'Mobile Engineer · React Native & Flutter',
    location: 'Delhi, India',
    bio: 'Shipped 4 apps with 10k+ combined installs. Strong believer in animations that feel just right.',
    skills: [
      { name: 'React Native', level: 'Advanced' },
      { name: 'Flutter', level: 'Advanced' },
      { name: 'Kotlin', level: 'Intermediate' },
      { name: 'Firebase', level: 'Intermediate' },
    ],
    experience: [
      {
        title: 'Mobile Dev Intern',
        company: 'Cred',
        duration: 'Jun 2025 - Aug 2025',
        description: 'Rewrote the rewards module using Reanimated 3 — bumped FPS from 45 to 60 on low-end devices.',
        current: false,
      },
    ],
    education: [
      {
        degree: 'B.Tech, Information Technology',
        institution: 'Delhi Technological University',
        year: '2022 - 2026',
        grade: '8.4 CGPA',
      },
    ],
    socialLinks: {
      github: 'https://github.com/kabir-demo',
      linkedin: 'https://linkedin.com/in/kabir-demo',
    },
  },
  {
    name: 'Isha Reddy',
    email: `isha${SEED_DOMAIN}`,
    headline: 'DevOps & Cloud Engineer · AWS · K8s',
    location: 'Hyderabad, India',
    bio: 'Automate all the things. Terraform modules, CI/CD pipelines, and cost dashboards.',
    skills: [
      { name: 'AWS', level: 'Advanced' },
      { name: 'Kubernetes', level: 'Advanced' },
      { name: 'Terraform', level: 'Intermediate' },
      { name: 'GitHub Actions', level: 'Advanced' },
      { name: 'Linux', level: 'Advanced' },
    ],
    experience: [
      {
        title: 'SRE Intern',
        company: 'Razorpay',
        duration: 'Jul 2025 - Oct 2025',
        description: 'Built auto-scaling rules that cut nightly compute cost by 28% without impacting p99 latency.',
        current: true,
      },
    ],
    education: [
      {
        degree: 'B.Tech, Electronics & Computer Science',
        institution: 'IIIT Hyderabad',
        year: '2022 - 2026',
        grade: '8.9 CGPA',
      },
    ],
    socialLinks: {
      github: 'https://github.com/isha-demo',
      linkedin: 'https://linkedin.com/in/isha-demo',
    },
  },
  {
    name: 'Arjun Rao',
    email: `arjun${SEED_DOMAIN}`,
    headline: 'Backend Engineer · Go · PostgreSQL',
    location: 'Bangalore, India',
    bio: 'I enjoy slicing complex problems into tiny, composable services. Currently exploring event-driven architectures.',
    skills: [
      { name: 'Go', level: 'Advanced' },
      { name: 'PostgreSQL', level: 'Advanced' },
      { name: 'Redis', level: 'Intermediate' },
      { name: 'Kafka', level: 'Intermediate' },
      { name: 'gRPC', level: 'Intermediate' },
    ],
    experience: [
      {
        title: 'Backend Intern',
        company: 'Swiggy',
        duration: 'May 2025 - Jul 2025',
        description: 'Rewrote a Python cron into a Go worker pool — 6x throughput improvement.',
        current: false,
      },
    ],
    education: [
      {
        degree: 'B.Tech, Computer Science',
        institution: 'NIT Surathkal',
        year: '2022 - 2026',
        grade: '8.6 CGPA',
      },
    ],
    socialLinks: {
      github: 'https://github.com/arjun-demo',
      linkedin: 'https://linkedin.com/in/arjun-demo',
    },
  },
  {
    name: 'Meera Gupta',
    email: `meera${SEED_DOMAIN}`,
    headline: 'Frontend Engineer · Design-minded',
    location: 'Bangalore, India',
    bio: 'Obsessed with micro-interactions, perf budgets, and accessibility. Figma → shipped React in my sleep.',
    skills: [
      { name: 'React', level: 'Expert' },
      { name: 'TypeScript', level: 'Advanced' },
      { name: 'Tailwind CSS', level: 'Expert' },
      { name: 'Figma', level: 'Intermediate' },
      { name: 'Next.js', level: 'Advanced' },
    ],
    experience: [
      {
        title: 'Frontend Intern',
        company: 'Zomato',
        duration: 'Jun 2025 - Aug 2025',
        description: 'Led a redesign of the restaurant discovery page. +12% CTR on recommended section.',
        current: false,
      },
    ],
    education: [
      {
        degree: 'B.Tech, Computer Science',
        institution: 'BITS Pilani',
        year: '2022 - 2026',
        grade: '9.2 CGPA',
      },
    ],
    socialLinks: {
      github: 'https://github.com/meera-demo',
      linkedin: 'https://linkedin.com/in/meera-demo',
      portfolio: 'https://meera.design',
    },
  },
  {
    name: 'Vivek Joshi',
    email: `vivek${SEED_DOMAIN}`,
    headline: 'Smart Contracts & Web3 · Solidity · Rust',
    location: 'Remote (IST)',
    bio: 'Security-first. Building audited smart contracts and the DX layer around them.',
    skills: [
      { name: 'Solidity', level: 'Advanced' },
      { name: 'Rust', level: 'Intermediate' },
      { name: 'TypeScript', level: 'Advanced' },
      { name: 'Hardhat', level: 'Advanced' },
    ],
    education: [
      {
        degree: 'B.Tech, Computer Science',
        institution: 'IIIT Delhi',
        year: '2022 - 2026',
        grade: '8.1 CGPA',
      },
    ],
    socialLinks: {
      github: 'https://github.com/vivek-demo',
      linkedin: 'https://linkedin.com/in/vivek-demo',
    },
  },
  {
    name: 'Riya Malhotra',
    email: `riya${SEED_DOMAIN}`,
    headline: 'Data Scientist · SQL · Python · dbt',
    location: 'Gurgaon, India',
    bio: 'I turn messy data into dashboards PMs actually open. Also write a monthly analytics newsletter.',
    skills: [
      { name: 'Python', level: 'Advanced' },
      { name: 'SQL', level: 'Expert' },
      { name: 'dbt', level: 'Intermediate' },
      { name: 'Looker', level: 'Intermediate' },
      { name: 'Airflow', level: 'Intermediate' },
    ],
    experience: [
      {
        title: 'Analytics Intern',
        company: 'Paytm',
        duration: 'May 2025 - Jul 2025',
        description: 'Built the merchant-health scorecard used by 200+ sales reps daily.',
        current: false,
      },
    ],
    education: [
      {
        degree: 'B.Sc, Statistics',
        institution: 'Lady Shri Ram College',
        year: '2022 - 2025',
        grade: '8.8 CGPA',
      },
    ],
    socialLinks: {
      github: 'https://github.com/riya-demo',
      linkedin: 'https://linkedin.com/in/riya-demo',
    },
  },
];

// ---------------------------------------------------------------------------
// Projects — each indexed by student email for deterministic ownership.
// ---------------------------------------------------------------------------

const projectSeeds = [
  {
    ownerEmail: `aarav${SEED_DOMAIN}`,
    title: 'RealTime Collab Whiteboard',
    description:
      'A multi-user whiteboard with CRDT-based sync, cursor presence, and infinite pan/zoom. Built to explore real-time collaboration at scale.',
    techStack: ['React', 'Node.js', 'WebSockets', 'Yjs', 'TypeScript'],
    githubUrl: 'https://github.com/aarav-demo/collab-whiteboard',
    liveUrl: 'https://whiteboard.aarav.dev',
    isPublic: true,
  },
  {
    ownerEmail: `aarav${SEED_DOMAIN}`,
    title: 'Tasky — Minimal Task Manager',
    description:
      'Offline-first task manager with keyboard-first UX, sync across devices, and slick command palette.',
    techStack: ['React', 'IndexedDB', 'Express', 'MongoDB'],
    githubUrl: 'https://github.com/aarav-demo/tasky',
    isPublic: true,
  },
  {
    ownerEmail: `diya${SEED_DOMAIN}`,
    title: 'Resume Screener with LLMs',
    description:
      'Pipeline that parses resumes and scores them against job descriptions using fine-tuned small LLMs. Includes a tiny Streamlit UI.',
    techStack: ['Python', 'PyTorch', 'Streamlit', 'FastAPI'],
    githubUrl: 'https://github.com/diya-demo/resume-screener',
    isPublic: true,
  },
  {
    ownerEmail: `diya${SEED_DOMAIN}`,
    title: 'Plant Disease Detector',
    description:
      'CV model that detects 38 crop diseases from a leaf photo. Optimized for on-device inference on entry-level Android phones.',
    techStack: ['Python', 'TensorFlow Lite', 'React Native'],
    githubUrl: 'https://github.com/diya-demo/plant-disease',
    isPublic: true,
  },
  {
    ownerEmail: `kabir${SEED_DOMAIN}`,
    title: 'Pocket Expense — Flutter App',
    description:
      'Clean, privacy-first expense tracker with budget goals, recurring transactions, and beautiful charts. Everything stays local.',
    techStack: ['Flutter', 'Dart', 'SQLite'],
    githubUrl: 'https://github.com/kabir-demo/pocket-expense',
    liveUrl: 'https://pocketexpense.app',
    isPublic: true,
  },
  {
    ownerEmail: `isha${SEED_DOMAIN}`,
    title: 'K8s Cost Radar',
    description:
      'CLI + dashboard that surfaces over-provisioned pods and idle PVCs across a Kubernetes fleet. Cut our cluster spend by 22% in a month.',
    techStack: ['Go', 'Kubernetes', 'Prometheus', 'Grafana'],
    githubUrl: 'https://github.com/isha-demo/k8s-cost-radar',
    isPublic: true,
  },
  {
    ownerEmail: `arjun${SEED_DOMAIN}`,
    title: 'LinkLite — URL Shortener on Edge',
    description:
      'Low-latency URL shortener with custom slugs, analytics, and rate limiting. Deployed to Cloudflare Workers + D1.',
    techStack: ['TypeScript', 'Cloudflare Workers', 'D1', 'Hono'],
    githubUrl: 'https://github.com/arjun-demo/linklite',
    liveUrl: 'https://lnk.lite',
    isPublic: true,
  },
  {
    ownerEmail: `meera${SEED_DOMAIN}`,
    title: 'Palette — Color Tooling for Designers',
    description:
      'Web app that generates accessible color scales with contrast guarantees, OKLCH-native. Used by 300+ designers monthly.',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    githubUrl: 'https://github.com/meera-demo/palette',
    liveUrl: 'https://palette.meera.design',
    isPublic: true,
  },
  {
    ownerEmail: `vivek${SEED_DOMAIN}`,
    title: 'SafeVault — Multisig Wallet',
    description:
      'Minimal multisig wallet smart contract with threshold signatures, spending limits, and a clean React UI. Audited by 3 community reviewers.',
    techStack: ['Solidity', 'Hardhat', 'React', 'Wagmi'],
    githubUrl: 'https://github.com/vivek-demo/safevault',
    isPublic: true,
  },
  {
    ownerEmail: `riya${SEED_DOMAIN}`,
    title: 'MetricSpark — Lightweight Experiment Platform',
    description:
      'SQL-first A/B testing framework. Point it at your warehouse and it generates auto-refreshing experiment reports with stat-sig bands.',
    techStack: ['Python', 'SQL', 'dbt', 'Streamlit'],
    githubUrl: 'https://github.com/riya-demo/metricspark',
    isPublic: true,
  },
];

// ---------------------------------------------------------------------------
// Jobs — indexed by recruiter email.
// ---------------------------------------------------------------------------

const jobSeeds = [
  {
    posterEmail: `priya${SEED_DOMAIN}`,
    title: 'Frontend Developer (React)',
    company: 'TechNova Solutions Pvt. Ltd.',
    location: 'Bangalore, India',
    type: 'full-time',
    description:
      'We are looking for a React developer to help us build the next-generation dashboard for our enterprise customers. You will work with designers and backend engineers to ship features end-to-end.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs'],
    requirements: [
      'Strong fundamentals in JavaScript and React',
      '1+ years of experience (internships count) with React',
      'Comfortable with Git workflows and code reviews',
      'Bonus: design sensibility',
    ],
    salary: { min: 800000, max: 1400000, currency: 'INR' },
    experience: { min: 0, max: 2 },
    deadlineInDays: 30,
  },
  {
    posterEmail: `priya${SEED_DOMAIN}`,
    title: 'Backend Engineer (Node.js)',
    company: 'TechNova Solutions Pvt. Ltd.',
    location: 'Bangalore, India (Hybrid)',
    type: 'full-time',
    description:
      'Join our platform team to design APIs that serve 2M+ requests a day. You will own entire services, from schema design to deployment.',
    skills: ['Node.js', 'PostgreSQL', 'Redis', 'AWS'],
    requirements: [
      '2+ years building production Node.js services (internships count)',
      'Strong grasp of relational databases and query optimization',
      'Familiarity with at least one message broker',
    ],
    salary: { min: 1200000, max: 2000000, currency: 'INR' },
    experience: { min: 1, max: 3 },
    deadlineInDays: 45,
  },
  {
    posterEmail: `priya${SEED_DOMAIN}`,
    title: 'Software Engineering Intern (Summer 2026)',
    company: 'TechNova Solutions Pvt. Ltd.',
    location: 'Remote',
    type: 'internship',
    description:
      'A 12-week, paid internship where you will ship real features alongside senior engineers. Top performers receive full-time offers.',
    skills: ['JavaScript', 'React', 'Node.js'],
    requirements: [
      'Pre-final / final year CS student',
      'At least one solid side project we can walk through',
      'Strong problem-solving skills',
    ],
    salary: { min: 60000, max: 90000, currency: 'INR' },
    experience: { min: 0, max: 1 },
    deadlineInDays: 60,
  },
  {
    posterEmail: `rohit${SEED_DOMAIN}`,
    title: 'Full-Stack Engineer (Fintech)',
    company: 'FinEdge Analytics',
    location: 'Mumbai, India',
    type: 'full-time',
    description:
      'Help us ship analytics tooling trusted by 10+ NBFCs. You will straddle the stack — from React dashboards to Go microservices.',
    skills: ['React', 'TypeScript', 'Go', 'PostgreSQL', 'Docker'],
    requirements: [
      '1+ years of full-stack experience',
      'Comfort debugging across the stack',
      'Curiosity about finance is a plus',
    ],
    salary: { min: 1500000, max: 2500000, currency: 'INR' },
    experience: { min: 1, max: 4 },
    deadlineInDays: 28,
  },
  {
    posterEmail: `rohit${SEED_DOMAIN}`,
    title: 'Data Analyst',
    company: 'FinEdge Analytics',
    location: 'Mumbai, India (Hybrid)',
    type: 'full-time',
    description:
      'Partner with product and ops leaders to answer the questions behind the KPIs. You will own our analytics stack end-to-end.',
    skills: ['SQL', 'Python', 'dbt', 'Looker'],
    requirements: [
      'Fluent SQL; comfortable with window functions and CTEs',
      'Experience with a modern BI tool',
      'Strong written communication',
    ],
    salary: { min: 900000, max: 1500000, currency: 'INR' },
    experience: { min: 0, max: 3 },
    deadlineInDays: 40,
  },
  {
    posterEmail: `rohit${SEED_DOMAIN}`,
    title: 'ML Engineer — Risk Models',
    company: 'FinEdge Analytics',
    location: 'Remote (IST)',
    type: 'remote',
    description:
      'Own the lifecycle of our credit-risk models — training, evaluation, monitoring, and retraining. Your work goes into production weekly.',
    skills: ['Python', 'PyTorch', 'MLflow', 'AWS SageMaker'],
    requirements: [
      'Solid ML fundamentals — feature engineering, bias/variance, metrics',
      'Experience deploying models to production',
      'Comfort reading and discussing academic papers',
    ],
    salary: { min: 1800000, max: 3200000, currency: 'INR' },
    experience: { min: 1, max: 4 },
    deadlineInDays: 50,
  },
  {
    posterEmail: `ananya${SEED_DOMAIN}`,
    title: 'Site Reliability Engineer',
    company: 'GreenLoop Labs',
    location: 'Remote (IST)',
    type: 'remote',
    description:
      'Keep the lights on for a globally distributed climate-monitoring platform. If you can turn incident post-mortems into lasting fixes, we want you.',
    skills: ['Kubernetes', 'Terraform', 'AWS', 'Prometheus', 'Go'],
    requirements: [
      'Experience running production Kubernetes clusters',
      'Comfort on-call; strong incident-management instincts',
      'Infrastructure-as-code discipline',
    ],
    salary: { min: 1600000, max: 2800000, currency: 'INR' },
    experience: { min: 1, max: 4 },
    deadlineInDays: 35,
  },
  {
    posterEmail: `ananya${SEED_DOMAIN}`,
    title: 'Mobile Engineer (React Native)',
    company: 'GreenLoop Labs',
    location: 'Remote (IST)',
    type: 'contract',
    description:
      'Ship a best-in-class mobile app for field researchers logging biodiversity data. 6-month contract with high likelihood of conversion.',
    skills: ['React Native', 'TypeScript', 'Realm', 'Reanimated'],
    requirements: [
      'Shipped at least one React Native app to production',
      'Strong eye for UI details',
      'Comfortable working async across timezones',
    ],
    salary: { min: 1200000, max: 1800000, currency: 'INR' },
    experience: { min: 1, max: 3 },
    deadlineInDays: 25,
  },
];

// ---------------------------------------------------------------------------
// Applications — each entry is (student email, job title, cover letter, status)
// Resolved against jobs/users loaded from DB.
// ---------------------------------------------------------------------------

const applicationSeeds = [
  {
    studentEmail: `aarav${SEED_DOMAIN}`,
    jobTitle: 'Frontend Developer (React)',
    status: 'shortlisted',
    coverLetter:
      'Hi Priya! I loved what TechNova shipped at their last product showcase. I have spent the past two years leveling up in React and TypeScript — most recently building a real-time collaborative whiteboard (link in my profile). I would be thrilled to bring that same energy to your dashboard team.',
  },
  {
    studentEmail: `aarav${SEED_DOMAIN}`,
    jobTitle: 'Software Engineering Intern (Summer 2026)',
    status: 'applied',
    coverLetter:
      'Hi Priya, I am applying for TechNova’s Summer 2026 internship. In my last internship I shipped a real-time notifications service (Slack-style) end-to-end. I would love to contribute at TechNova and keep raising the bar.',
  },
  {
    studentEmail: `meera${SEED_DOMAIN}`,
    jobTitle: 'Frontend Developer (React)',
    status: 'viewed',
    coverLetter:
      'Hi Priya, I am Meera, a BITS Pilani senior who lives and breathes React + Tailwind. I recently led a redesign of Zomato’s restaurant discovery page (+12% CTR). I would love to chat about the Frontend Developer role and bring that same detail-obsession to TechNova.',
  },
  {
    studentEmail: `arjun${SEED_DOMAIN}`,
    jobTitle: 'Backend Engineer (Node.js)',
    status: 'applied',
    coverLetter:
      'Hi Priya, I have been building APIs in Go and Node for the past couple of years — most recently a Cloudflare-Workers-based URL shortener that does sub-5ms p99. Would love to apply that low-latency mindset to TechNova’s platform.',
  },
  {
    studentEmail: `arjun${SEED_DOMAIN}`,
    jobTitle: 'Full-Stack Engineer (Fintech)',
    status: 'applied',
    coverLetter:
      'Hi Rohit, FinEdge’s analytics tooling is exactly the kind of product I want to build. I’ve worked across Go microservices and React dashboards at Swiggy this summer — eager to ramp up on the fintech domain with your team.',
  },
  {
    studentEmail: `riya${SEED_DOMAIN}`,
    jobTitle: 'Data Analyst',
    status: 'shortlisted',
    coverLetter:
      'Hi Rohit, I’m Riya — I turn warehouse data into dashboards that execs actually use. Fluent in dbt, SQL, Looker and Airflow. At Paytm I built a merchant-health scorecard used by 200+ sales reps daily. Would love to bring that to FinEdge.',
  },
  {
    studentEmail: `diya${SEED_DOMAIN}`,
    jobTitle: 'ML Engineer — Risk Models',
    status: 'applied',
    coverLetter:
      'Hi Rohit, my research at IIT Madras was on few-shot learning, and I’ve been productionising LLM-powered pipelines for the past year (resume screener project in my profile). Eager to apply that rigor to credit-risk modeling at FinEdge.',
  },
  {
    studentEmail: `isha${SEED_DOMAIN}`,
    jobTitle: 'Site Reliability Engineer',
    status: 'shortlisted',
    coverLetter:
      'Hi Ananya, I run K8s for a living and currently interning as an SRE at Razorpay. I love climate-tech — my K8s Cost Radar project (in my profile) would fit right in with GreenLoop’s sustainability mission. Would love to chat.',
  },
  {
    studentEmail: `kabir${SEED_DOMAIN}`,
    jobTitle: 'Mobile Engineer (React Native)',
    status: 'viewed',
    coverLetter:
      'Hi Ananya, I’ve shipped 4 React Native + Flutter apps — most recently rewriting the Cred rewards module with Reanimated 3 (45→60 FPS on low-end devices). GreenLoop’s mission is the kind of thing I’d love to build for.',
  },
  {
    studentEmail: `aarav${SEED_DOMAIN}`,
    jobTitle: 'Full-Stack Engineer (Fintech)',
    status: 'applied',
    coverLetter:
      'Hi Rohit, I saw the FinEdge full-stack role and it checks every box on my wish-list — React on top, Go underneath, real user impact. I’d love the chance to interview.',
  },
  {
    studentEmail: `vivek${SEED_DOMAIN}`,
    jobTitle: 'Backend Engineer (Node.js)',
    status: 'applied',
    coverLetter:
      'Hi Priya, while most of my recent work has been in Solidity, I have solid Node.js / TypeScript chops (see SafeVault). I’m keen to broaden back into backend infra at TechNova.',
  },
  {
    studentEmail: `riya${SEED_DOMAIN}`,
    jobTitle: 'ML Engineer — Risk Models',
    status: 'applied',
    coverLetter:
      'Hi Rohit, I’m primarily an analyst but I’ve been moving toward ML via projects like MetricSpark (A/B framework). Would love a chance to grow into the ML Engineer role at FinEdge — I learn fast and I care a lot about measurement.',
  },
];

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

async function wipeSeeded() {
  const seeded = await User.find({ email: { $regex: `${SEED_DOMAIN}$`, $options: 'i' } }, '_id');
  const seededIds = seeded.map((u) => u._id);
  if (!seededIds.length) {
    console.log('• Nothing to wipe — no seeded users found.');
    return;
  }
  const [appRes, jobRes, projRes, userRes] = await Promise.all([
    Application.deleteMany({ student: { $in: seededIds } }),
    Job.deleteMany({ postedBy: { $in: seededIds } }),
    Project.deleteMany({ owner: { $in: seededIds } }),
    User.deleteMany({ _id: { $in: seededIds } }),
  ]);
  console.log(
    `• Wiped ${userRes.deletedCount} users, ${projRes.deletedCount} projects, ${jobRes.deletedCount} jobs, ${appRes.deletedCount} applications.`
  );
}

async function upsertUser({ role, company, ...seed }) {
  const existing = await User.findOne({ email: seed.email });
  if (existing) return existing;

  const hash = await bcrypt.hash(SEED_PASSWORD, 10);
  const doc = {
    name: seed.name,
    email: seed.email,
    password: hash,
    role,
    profile: {
      headline: seed.headline || '',
      location: seed.location || '',
      bio: seed.bio || '',
      skills: seed.skills || [],
      experience: seed.experience || [],
      education: seed.education || [],
      socialLinks: seed.socialLinks || {},
      isPublic: true,
    },
  };
  const user = await User.create(doc);
  return user;
}

async function upsertProject(ownerId, seed) {
  const existing = await Project.findOne({ owner: ownerId, title: seed.title });
  if (existing) return existing;
  return Project.create({
    owner: ownerId,
    title: seed.title,
    description: seed.description,
    techStack: seed.techStack,
    githubUrl: seed.githubUrl,
    liveUrl: seed.liveUrl,
    isPublic: seed.isPublic !== false,
    views: Math.floor(Math.random() * 200) + 20,
  });
}

async function upsertJob(posterId, seed) {
  const existing = await Job.findOne({ postedBy: posterId, title: seed.title });
  if (existing) return existing;
  return Job.create({
    title: seed.title,
    company: seed.company,
    location: seed.location,
    type: seed.type,
    description: seed.description,
    skills: seed.skills,
    requirements: seed.requirements,
    salary: seed.salary,
    experience: seed.experience,
    deadline: plus(seed.deadlineInDays),
    postedBy: posterId,
    isActive: true,
  });
}

async function upsertApplication({ student, job, coverLetter, status }) {
  const existing = await Application.findOne({ student: student._id, job: job._id });
  if (existing) return existing;

  const app = await Application.create({
    student: student._id,
    job: job._id,
    coverLetter,
    status: 'applied',
    statusHistory: [{ status: 'applied', changedAt: new Date() }],
  });

  // If we want a non-'applied' status, walk it through updateStatus so the
  // history stays consistent with the model's pre-save hooks.
  if (status && status !== 'applied') {
    app.status = status;
    app.statusHistory.push({ status, changedAt: new Date() });
    await app.save();
  }

  await Job.updateOne({ _id: job._id }, { $inc: { applicationsCount: 1 } });
  return app;
}

async function main() {
  const shouldReset = process.argv.includes('--reset');

  await connectDB();
  console.log(`\n🌱 Elevatr seed · domain=${SEED_DOMAIN} · password=${SEED_PASSWORD}\n`);

  if (shouldReset) {
    console.log('--reset flag detected, wiping previously-seeded data...');
    await wipeSeeded();
  }

  // 1. Users
  console.log('• Seeding recruiters...');
  const recruiters = {};
  for (const seed of recruiterSeeds) {
    const user = await upsertUser({ role: 'recruiter', ...seed });
    recruiters[seed.email] = user;
    console.log(`   ↳ ${user.email}`);
  }

  console.log('• Seeding students...');
  const students = {};
  for (const seed of studentSeeds) {
    const user = await upsertUser({ role: 'student', ...seed });
    students[seed.email] = user;
    console.log(`   ↳ ${user.email}`);
  }

  // 2. Projects
  console.log('• Seeding projects...');
  let projectCount = 0;
  for (const seed of projectSeeds) {
    const owner = students[seed.ownerEmail];
    if (!owner) continue;
    await upsertProject(owner._id, seed);
    projectCount += 1;
  }
  console.log(`   ↳ ${projectCount} projects ready.`);

  // 3. Jobs
  console.log('• Seeding jobs...');
  const jobsByTitle = {};
  for (const seed of jobSeeds) {
    const poster = recruiters[seed.posterEmail];
    if (!poster) continue;
    const job = await upsertJob(poster._id, seed);
    jobsByTitle[seed.title] = job;
  }
  console.log(`   ↳ ${Object.keys(jobsByTitle).length} jobs ready.`);

  // 4. Applications
  console.log('• Seeding applications...');
  let appCount = 0;
  for (const seed of applicationSeeds) {
    const student = students[seed.studentEmail];
    const job = jobsByTitle[seed.jobTitle];
    if (!student || !job) continue;
    try {
      await upsertApplication({
        student,
        job,
        coverLetter: seed.coverLetter,
        status: seed.status,
      });
      appCount += 1;
    } catch (err) {
      // Duplicate-key (unique job+student index) just means "already applied".
      if (err?.code !== 11000) throw err;
    }
  }
  console.log(`   ↳ ${appCount} applications ready.`);

  console.log('\n✅ Done. Log in with any seeded email and password: Password123!');
  console.log('   Try:  priya@seed.elevatr.dev  (recruiter)');
  console.log('         aarav@seed.elevatr.dev  (student)');
  console.log('\n');
}

main()
  .then(() => mongoose.connection.close())
  .catch(async (err) => {
    console.error('\n❌ Seed failed:', err);
    await mongoose.connection.close();
    process.exit(1);
  });
