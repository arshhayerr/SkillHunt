import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const observerRef = useRef(null);

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('landing-visible');
                    }
                });
            },
            { threshold: 0.1 }
        );
        document.querySelectorAll('.landing-animate').forEach((el) => {
            observerRef.current.observe(el);
        });
        return () => observerRef.current?.disconnect();
    }, []);

    return (
        <div className="landing-root">
            {/* ── Hero ── */}
            <section className="landing-hero">
                <div className="landing-hero-grid"></div>
                <div className="landing-hero-glow"></div>

                <div className="landing-hero-inner">
                    <span className="landing-badge">Trusted by 5 000+ students and 500+ companies</span>

                    <h1 className="landing-hero-title">
                        <span className="landing-hero-title-dark">Your Career</span>
                        <span className="landing-hero-title-light">in good hands</span>
                    </h1>

                    <p className="landing-hero-subtitle">
                        SkillHunt is a better way to showcase projects, find jobs, and connect talent with opportunity for students and recruiters.
                    </p>

                    <div className="landing-hero-cta">
                        <Link to="/register" className="landing-btn-primary" id="hero-cta">
                            Get early access
                        </Link>
                        <Link to="/about" className="landing-btn-secondary">
                            Learn more
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Social proof ── */}
            <section className="landing-logos landing-animate">
                <p className="landing-logos-label">Powering the next generation of careers</p>
                <div className="landing-logos-row">
                    {['GitHub', 'LinkedIn', 'Google', 'Microsoft', 'Amazon', 'Meta'].map((name) => (
                        <span key={name} className="landing-logo-item">{name}</span>
                    ))}
                </div>
            </section>

            {/* ── Feature: Showcase ── */}
            <section className="landing-section landing-animate">
                <div className="landing-feature-block">
                    <div className="landing-feature-text">
                        <h2 className="landing-section-title">Showcase.</h2>
                        <p className="landing-section-desc">
                            Build a stunning project portfolio. Add GitHub links, live demos, and detailed descriptions to stand out from the crowd.
                        </p>
                    </div>
                    <div className="landing-feature-card">
                        <div className="landing-mock-table">
                            <div className="landing-mock-header">
                                <span>Project</span><span>Tech Stack</span><span>Status</span><span>Views</span>
                            </div>
                            {[
                                ['E-Commerce App', 'React, Node.js', 'Live', '1,240'],
                                ['ML Pipeline', 'Python, TensorFlow', 'Live', '890'],
                                ['Chat Platform', 'Next.js, Socket.io', 'In Review', '654'],
                                ['Analytics Dashboard', 'Vue, D3.js', 'Draft', '320'],
                            ].map(([name, tech, status, views], i) => (
                                <div className="landing-mock-row" key={i}>
                                    <span className="landing-mock-name">{name}</span>
                                    <span className="landing-mock-tech">{tech}</span>
                                    <span className={`landing-mock-status landing-status-${status.toLowerCase().replace(' ', '')}`}>{status}</span>
                                    <span className="landing-mock-views">{views}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Feature: Discover ── */}
            <section className="landing-section landing-section-alt landing-animate">
                <div className="landing-feature-block landing-feature-reverse">
                    <div className="landing-feature-text">
                        <h2 className="landing-section-title">Discover.</h2>
                        <p className="landing-section-desc">
                            Work on all your potential leads from a single list. Leverage project data and filters to find the best talent or opportunity.
                        </p>
                    </div>
                    <div className="landing-feature-card">
                        <div className="landing-mock-kanban">
                            {[
                                { col: 'Open', color: '#22c55e', items: ['Frontend Intern', 'ML Engineer'] },
                                { col: 'Screening', color: '#f59e0b', items: ['UI/UX Designer', 'Backend Dev'] },
                                { col: 'Interview', color: '#6366f1', items: ['Data Analyst'] },
                                { col: 'Offered', color: '#06b6d4', items: ['DevOps Engineer'] },
                            ].map((c) => (
                                <div className="landing-kanban-col" key={c.col}>
                                    <div className="landing-kanban-header">
                                        <span className="landing-kanban-dot" style={{ background: c.color }}></span>
                                        <span>{c.col}</span>
                                        <span className="landing-kanban-count">{c.items.length}</span>
                                    </div>
                                    {c.items.map((item) => (
                                        <div className="landing-kanban-card" key={item}>{item}</div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Feature: Connect ── */}
            <section className="landing-section landing-animate">
                <div className="landing-feature-block">
                    <div className="landing-feature-text">
                        <h2 className="landing-section-title">Connect.</h2>
                        <p className="landing-section-desc">
                            Engage with opportunities as a team. Build and accelerate your career pipeline with real-time collaboration tools.
                        </p>
                    </div>
                    <div className="landing-feature-card">
                        <div className="landing-mock-table">
                            <div className="landing-mock-header">
                                <span>Name</span><span>Role</span><span>Status</span><span>Joined</span>
                            </div>
                            {[
                                ['Sarah Chen', 'Student', 'Active', '2 days ago'],
                                ['James Park', 'Recruiter', 'Active', '5 days ago'],
                                ['Priya Kumar', 'Student', 'Active', '1 week ago'],
                                ['Alex Rivera', 'Recruiter', 'Pending', '2 weeks ago'],
                            ].map(([name, role, status, joined], i) => (
                                <div className="landing-mock-row" key={i}>
                                    <span className="landing-mock-name">{name}</span>
                                    <span className="landing-mock-tech">{role}</span>
                                    <span className={`landing-mock-status ${status === 'Active' ? 'landing-status-live' : 'landing-status-draft'}`}>{status}</span>
                                    <span className="landing-mock-views">{joined}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Features grid ── */}
            <section className="landing-section landing-section-alt landing-animate">
                <div className="landing-features-header">
                    <h2 className="landing-section-title" style={{ marginBottom: 8 }}>Features</h2>
                    <p className="landing-section-desc" style={{ maxWidth: 560, margin: '0 auto' }}>
                        SkillHunt is a better way to find jobs, showcase projects, and connect talent — built for students and recruiters.
                    </p>
                </div>

                <div className="landing-features-grid">
                    {[
                        { title: 'Simple & Clean UI', desc: 'Start with a simple and clean interface designed for focus and productivity.' },
                        { title: 'Project Portfolios', desc: 'Showcase your best work with GitHub links, live demos, and rich descriptions.' },
                        { title: 'Smart Job Matching', desc: 'Get matched with opportunities that align with your skills and interests.' },
                        { title: 'Real-time Notifications', desc: 'Stay updated on applications, messages, and new opportunities instantly.' },
                        { title: 'Team Collaboration', desc: 'Work together on projects, share feedback, and build stronger portfolios.' },
                        { title: 'Analytics & Insights', desc: 'Track profile views, application status, and engagement metrics.' },
                    ].map((f) => (
                        <div className="landing-feature-grid-card" key={f.title}>
                            <h3 className="landing-feature-grid-title">{f.title}</h3>
                            <p className="landing-feature-grid-desc">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="landing-cta landing-animate">
                <h2 className="landing-cta-title">Ready to start your journey?</h2>
                <p className="landing-cta-desc">
                    Join thousands of students who have already found their dream opportunities. Your future starts here.
                </p>
                <div className="landing-hero-cta">
                    <Link to="/register" className="landing-btn-primary">Get started free</Link>
                    <Link to="/about" className="landing-btn-secondary">Learn more</Link>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
