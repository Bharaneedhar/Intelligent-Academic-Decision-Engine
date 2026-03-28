import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, ChevronRight, BarChart, Map as MapIcon, ShieldCheck, Star, ArrowUpRight, PlayCircle } from 'lucide-react';

const LandingPage = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background-light text-text-primary">
            {/* Navbar */}
            <nav className="sticky top-0 z-50">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-5">
                    <div className="bg-white/70 backdrop-blur-xl border border-border-light rounded-[24px] shadow-sm px-5 sm:px-6 py-4 flex items-center justify-between relative">
                        {/* Left: Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-secondary border border-border-light flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
                                <Brain className="w-5 h-5 text-slate-900" />
                            </div>
                            <span className="text-lg font-extrabold tracking-tight">LearnBuddyyy</span>
                        </div>

                        {/* Center: Links */}
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
                            <a href="#home" className="hover:text-text-primary transition-colors">Home</a>
                            <a href="#about" className="hover:text-text-primary transition-colors">About</a>
                            <a href="#services" className="hover:text-text-primary transition-colors">Services</a>
                            <a href="#testimonials" className="hover:text-text-primary transition-colors">Testimonials</a>
                        </div>

                        {/* Right: Login */}
                        <div className="hidden md:flex items-center gap-3">
                            <Link to="/login" className="soft-button-ghost !px-5 !py-2.5 text-sm font-medium min-h-[44px] flex items-center">
                                Login
                            </Link>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button 
                            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>

                        {/* Mobile Dropdown */}
                        {mobileMenuOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-border-light rounded-[24px] shadow-xl md:hidden flex flex-col gap-4 z-50">
                                <a href="#home" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold text-slate-700 hover:text-slate-900 p-2">Home</a>
                                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold text-slate-700 hover:text-slate-900 p-2">About</a>
                                <a href="#services" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold text-slate-700 hover:text-slate-900 p-2">Services</a>
                                <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold text-slate-700 hover:text-slate-900 p-2">Testimonials</a>
                                <div className="h-px bg-slate-100 w-full" />
                                <Link to="/login" className="soft-button-ghost !w-full justify-center !py-3 text-sm font-semibold min-h-[44px]">
                                    Login
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section id="home" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 pb-16">
                <div className="relative overflow-hidden rounded-[24px] bg-secondary border border-border-light p-8 sm:p-12 lg:p-[60px]">
                    <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/35 blur-3xl rounded-full" />
                    <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-primary/25 blur-3xl rounded-full" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative">
                        {/* Left */}
                        <div className="space-y-6">
                            <motion.h1
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]"
                            >
                                Growing Bright Minds
                                <br />
                                <span className="text-text-primary">with Guidance &amp; Fun</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 }}
                                className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl"
                            >
                                A modern mentoring experience: clear roadmaps, supportive feedback, and bite-sized learning that stays motivating.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center"
                            >
                                <Link to="/register" className="soft-button-primary !px-7 !py-3.5 text-sm">
                                    Start Now <ArrowUpRight className="w-4 h-4" />
                                </Link>
                                <button className="soft-button-ghost !px-7 !py-3.5 text-sm">
                                    <PlayCircle className="w-4 h-4" /> View Demo
                                </button>
                            </motion.div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                {[
                                    { k: '1200+', v: 'Kids' },
                                    { k: '98%', v: 'Completion Rate' },
                                ].map((s) => (
                                    <div key={s.v} className="bg-white/60 border border-border-light rounded-2xl p-4 shadow-sm">
                                        <div className="text-2xl font-extrabold tracking-tight">{s.k}</div>
                                        <div className="text-sm text-text-secondary font-medium">{s.v}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Mentor image block */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-[85%] aspect-square bg-primary rounded-[48px] rotate-6 shadow-[0_30px_70px_rgba(246,197,71,0.35)]" />
                            </div>
                            <div className="relative rounded-[20px] bg-white border border-border-light shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 sm:p-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-secondary border border-border-light flex items-center justify-center">
                                        <Brain className="w-8 h-8 text-slate-900" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-lg font-bold">Your Mentor</div>
                                        <div className="text-sm text-text-secondary">Personal guidance, weekly check-ins</div>
                                    </div>
                                </div>
                                <div className="mt-6 grid grid-cols-3 gap-3">
                                    {['Plan', 'Practice', 'Progress'].map((t) => (
                                        <div key={t} className="rounded-2xl border border-border-light bg-white/70 p-4 text-center">
                                            <div className="text-sm font-bold">{t}</div>
                                            <div className="text-xs text-text-secondary mt-1">Simple steps</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mentoring Programs */}
            <section id="services" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14">
                <div className="flex items-end justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Mentoring Programs</h2>
                        <p className="text-text-secondary mt-2 max-w-2xl">Course-style cards with progress, clear outcomes, and gentle nudges to keep going.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Focus Builder', desc: 'Short daily lessons to form consistent learning habits.', level: 'Beginner', progress: 72 },
                        { title: 'Skill Sprint', desc: 'Two-week guided sprint for fast, visible progress.', level: 'Intermediate', progress: 46 },
                        { title: 'Project Mentor', desc: 'Build a portfolio project with weekly reviews.', level: 'Advanced', progress: 18 },
                    ].map((p) => (
                        <div key={p.title} className="glass-card !p-0 overflow-hidden">
                            <div className="h-36 bg-gradient-to-br from-primary/35 to-white flex items-end p-6">
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-border-light text-[11px] font-semibold text-text-secondary">
                                    {p.level}
                                </span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold">{p.title}</h3>
                                <p className="text-sm text-text-secondary mt-2 leading-relaxed">{p.desc}</p>

                                <div className="mt-5">
                                    <div className="flex justify-between text-xs font-semibold text-text-secondary mb-2">
                                        <span>Progress</span>
                                        <span>{p.progress}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-[#EFEFEF] overflow-hidden">
                                        <div className="h-full rounded-full bg-primary" style={{ width: `${p.progress}%` }} />
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <button className="w-full soft-button-ghost !rounded-xl !py-3 text-sm font-semibold">
                                        Explore Program <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Mentor section */}
            <section id="testimonials" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14">
                <div className="flex items-end justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Meet Our Mentors</h2>
                        <p className="text-text-secondary mt-2 max-w-2xl">Supportive experts who keep learning fun, structured, and confidence-building.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { name: 'Ava Patel', role: 'Learning Mentor', rating: 4.9, bio: 'Gentle structure + playful challenges to keep momentum strong.' },
                        { name: 'Noah Kim', role: 'STEM Coach', rating: 4.8, bio: 'Breaks down complex topics into simple weekly milestones.' },
                        { name: 'Mia Rivera', role: 'Project Guide', rating: 4.9, bio: 'Helps learners build real projects and celebrate small wins.' },
                    ].map((m) => (
                        <div key={m.name} className="bg-white border border-border-light rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-14 h-14 rounded-2xl bg-secondary border border-border-light flex items-center justify-center">
                                        <Brain className="w-7 h-7 text-slate-900" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-base truncate">{m.name}</div>
                                        <div className="text-sm text-text-secondary">{m.role}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-sm font-semibold text-text-primary">
                                    <Star className="w-4 h-4 text-primary" /> {m.rating}
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-text-secondary leading-relaxed">{m.bio}</p>
                            <div className="mt-6">
                                <button className="w-full soft-button-primary !rounded-xl !py-3 text-sm">
                                    Book a session <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features / About */}
            <section id="about" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Gap Analysis', desc: 'See what matters most and where to start confidently.', icon: BarChart },
                        { title: 'AI Roadmaps', desc: 'A clear, week-by-week path that feels manageable.', icon: MapIcon },
                        { title: 'Smart Testing', desc: 'Practice that adapts to your pace and boosts confidence.', icon: ShieldCheck },
                    ].map((f) => (
                        <div key={f.title} className="glass-card group">
                            <div className="w-12 h-12 rounded-2xl bg-secondary border border-border-light flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110">
                                <f.icon className="w-6 h-6 text-slate-900" />
                            </div>
                            <h3 className="text-lg font-bold">{f.title}</h3>
                            <p className="text-sm text-text-secondary mt-2 leading-relaxed">{f.desc}</p>
                            <div className="mt-6">
                                <Link to="/register" className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary hover:underline">
                                    Get started <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 text-center">
                <div className="inline-flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-2xl bg-secondary border border-border-light flex items-center justify-center">
                        <Brain className="w-5 h-5 text-slate-900" />
                    </div>
                    <span className="text-base font-extrabold tracking-tight">LearnBuddyyy</span>
                </div>
                <p className="text-text-secondary text-xs">© 2026 LearnBuddyyy. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
