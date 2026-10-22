import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Target, 
    Compass, 
    TrendingUp, 
    Globe, 
    Users, 
    Award, 
    Sparkles, 
    ArrowRight, 
    CheckCircle2, 
    HeartHandshake, 
    Layers,
    BookOpen
} from 'lucide-react';
import './aboutus.css';

const CORE_PILLARS = [
    {
        tag: 'OUR CORE AIM',
        title: 'Connecting Minds, Creating Futures',
        icon: Target,
        gradient: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
        accentColor: '#38bdf8',
        content: 'NEXT Conferences strives to build subject expert networks and peers in the fields of Medical Sciences and Engineering Technology, creating an ideal global platform for "Connecting Minds, Creating Futures."',
        highlight: 'Global Subject-Matter Networks'
    },
    {
        tag: 'STRATEGIC OBJECTIVE',
        title: 'Accelerating Knowledge Exchange',
        icon: Compass,
        gradient: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
        accentColor: '#60a5fa',
        content: 'Our vision is to accelerate research and knowledge-sharing platforms by gathering like-minded scientists, researchers, scholars, post-docs, and members in collaboration with societies, associations, and industry leaders.',
        highlight: 'Cross-Disciplinary Synergies'
    },
    {
        tag: 'TANGIBLE RESULTS',
        title: 'Fulfilling the Innovation Gap',
        icon: TrendingUp,
        gradient: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)',
        accentColor: '#a5b4fc',
        content: 'We organize international summits addressing challenging burning topics in Medical, Health Sciences, Life Sciences, Engineering, Social Sciences, and Business — fulfilling the vital gap between academia, industry, and the public.',
        highlight: 'Bridging Academia & Industry'
    },
    {
        tag: 'OUR CONCLUSION & HORIZON',
        title: 'Catalyst for Mankind’s Future',
        icon: Globe,
        gradient: 'linear-gradient(135deg, #2dd4bf 0%, #0284c7 100%)',
        accentColor: '#2dd4bf',
        content: 'Our conferences act as a decisive catalyst for scientists, researchers, students, and the public to collaborate on pressing global challenges effective to the present era and for the better future of mankind.',
        highlight: 'Sustainable Global Impact'
    }
];



const DISCIPLINES = [
    {
        name: 'Mental Health & Psychiatry',
        desc: 'Behavioral medicine, clinical neuropsychiatry, and emotional resilience.',
        icon: '🧠',
        color: '#38bdf8'
    },
    {
        name: 'Spirituality & Well-Being',
        desc: 'Mind-body integration, holistic health, and human potential.',
        icon: '🌿',
        color: '#34d399'
    },
    {
        name: "Women's Leadership & Governance",
        desc: 'C-Suite executive diversity, ethical leadership, and transformative governance.',
        icon: '👑',
        color: '#f472b6'
    },
    {
        name: 'Engineering & Future Tech',
        desc: 'Biomedical engineering, intelligent healthcare systems, and sustainable tech.',
        icon: '⚡',
        color: '#fbbf24'
    },
    {
        name: 'Life & Physical Sciences',
        desc: 'Molecular biology, pharmacological research, and clinical diagnostics.',
        icon: '🔬',
        color: '#818cf8'
    },
    {
        name: 'Global Public Health & Policy',
        desc: 'Epidemiological solutions, healthcare accessibility, and international ethics.',
        icon: '🌍',
        color: '#2dd4bf'
    }
];

const GUIDING_VALUES = [
    {
        title: 'Academic Integrity',
        desc: 'Rigorous peer-reviewed standards and uncompromised intellectual honesty across all congresses.',
        icon: BookOpen
    },
    {
        title: 'Boundaryless Collaboration',
        desc: 'Dismantling geographical, institutional, and disciplinary barriers to empower breakthroughs.',
        icon: HeartHandshake
    },
    {
        title: 'Actionable Innovation',
        desc: 'Translating theoretical discoveries into practical clinical and industrial applications.',
        icon: Layers
    },
    {
        title: 'Inclusive Leadership',
        desc: 'Elevating diverse voices, junior scholars, and emerging innovators to the global stage.',
        icon: Users
    }
];

const AboutUs = () => {
    return (
        <div className="aboutus-page">
            {/* ─── Hero Header ─── */}
            <section className="about-hero-section">
                <div className="about-hero-badge">
                    <span className="badge-pulse" />
                    <span>WHO WE ARE & WHY WE EXIST</span>
                </div>
                
                <h1 className="about-hero-title">
                    Pioneering the Future of <br />
                    <span className="text-gradient">Global Innovation & Discovery</span>
                </h1>

                <p className="about-hero-lead">
                    NEXT Conferences is an international premier league consortium bringing together the world's 
                    brightest researchers, medical visionaries, engineers, and executive leaders to collaborate 
                    on breakthroughs that define tomorrow.
                </p>


            </section>

            {/* ─── 4 Strategic Pillars (Aim, Objective, Results, Horizon) ─── */}
            <section className="about-pillars-section">
                <div className="section-header-centered">
                    <span className="section-eyebrow">OUR STRATEGIC DNA</span>
                    <h2 className="section-title">The Foundation of NEXT</h2>
                    <p className="section-subtitle">
                        Every summit we host is guided by four immutable principles designed to maximize 
                        real-world scientific impact and scholarly exchange.
                    </p>
                </div>

                <div className="about-pillars-grid">
                    {CORE_PILLARS.map((pillar, idx) => {
                        const Icon = pillar.icon;
                        return (
                            <div 
                                key={idx} 
                                className="about-pillar-card" 
                                style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                                <div className="pillar-card-top">
                                    <div 
                                        className="pillar-icon-box"
                                        style={{ background: pillar.gradient }}
                                    >
                                        <Icon size={24} color="#ffffff" />
                                    </div>
                                    <span className="pillar-tag">{pillar.tag}</span>
                                </div>

                                <h3 className="pillar-title">{pillar.title}</h3>
                                <p className="pillar-content">{pillar.content}</p>

                                <div className="pillar-footer">
                                    <span className="pillar-highlight-bullet">✦</span>
                                    <span className="pillar-highlight-text">{pillar.highlight}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ─── Split Visual Showcase: Why NEXT Matters ─── */}
            <section className="about-showcase-section">
                <div className="showcase-content">
                    <span className="section-eyebrow">THE NEXT DIFFERENCE</span>
                    <h2 className="showcase-title">
                        Bridging the Gap Between <span className="text-gradient">Academia & Industry</span>
                    </h2>
                    <p className="showcase-lead">
                        Traditional conferences often operate in isolation. NEXT creates an integrated ecosystem 
                        where academic theory meets commercial viability and executive strategy.
                    </p>

                    <div className="showcase-points-list">
                        <div className="showcase-point-item">
                            <div className="point-icon"><CheckCircle2 size={20} color="#38bdf8" /></div>
                            <div className="point-text">
                                <h4>Global Subject-Matter Masterclasses</h4>
                                <p>Interactive plenaries and hands-on workshops led by renowned keynote speakers and researchers.</p>
                            </div>
                        </div>

                        <div className="showcase-point-item">
                            <div className="point-icon"><CheckCircle2 size={20} color="#38bdf8" /></div>
                            <div className="point-text">
                                <h4>Interdisciplinary Convergence</h4>
                                <p>Uniting medicine, engineering, psychology, and management to solve multidimensional problems.</p>
                            </div>
                        </div>

                        <div className="showcase-point-item">
                            <div className="point-icon"><CheckCircle2 size={20} color="#38bdf8" /></div>
                            <div className="point-text">
                                <h4>Actionable Publication & Partnerships</h4>
                                <p>Peer-reviewed proceedings, indexed scientific publications, and international collaboration grants.</p>
                            </div>
                        </div>
                    </div>

                    <div className="showcase-cta-row">
                        <Link to="/conferences" className="btn-showcase-primary">
                            Explore 2026-2027 Calendar <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>

                <div className="showcase-visuals">
                    <div className="visual-image-card card-primary">
                        <img 
                            src="/gallery_imgs/next_gallery_2.jpg" 
                            alt="NEXT Conference Gathering" 
                            className="visual-img" 
                        />
                        <div className="visual-overlay" />
                        <div className="floating-badge badge-top">
                            <Sparkles size={16} color="#00d2ff" />
                            <span>Premier League Standard</span>
                        </div>
                    </div>

                    <div className="visual-image-card card-secondary">
                        <img 
                            src="/gallery_imgs/next_gallery_5.jpg" 
                            alt="Conference Delegates In Discussion" 
                            className="visual-img" 
                        />
                        <div className="visual-overlay" />
                        <div className="floating-badge badge-bottom">
                            <Globe size={16} color="#34d399" />
                            <span>International Delegations</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Disciplines Grid ─── */}
            <section className="about-disciplines-section">
                <div className="section-header-centered">
                    <span className="section-eyebrow">DOMAINS OF EXCELLENCE</span>
                    <h2 className="section-title">Disciplines We Champion</h2>
                    <p className="section-subtitle">
                        From mental health and clinical innovation to women's leadership and sustainable engineering.
                    </p>
                </div>

                <div className="disciplines-grid">
                    {DISCIPLINES.map((d, idx) => (
                        <div key={idx} className="discipline-card">
                            <div className="discipline-icon">{d.icon}</div>
                            <h3 className="discipline-title">{d.name}</h3>
                            <p className="discipline-desc">{d.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Guiding Values (DNA) ─── */}
            <section className="about-values-section">
                <div className="section-header-centered">
                    <span className="section-eyebrow">OUR CODE OF ETHICS</span>
                    <h2 className="section-title">Values That Guide Us</h2>
                    <p className="section-subtitle">
                        Built upon a legacy of trust, academic rigor, and visionary transformation.
                    </p>
                </div>

                <div className="values-grid">
                    {GUIDING_VALUES.map((val, idx) => {
                        const Icon = val.icon;
                        return (
                            <div key={idx} className="value-card">
                                <div className="value-icon-wrapper">
                                    <Icon size={24} color="#38bdf8" />
                                </div>
                                <h3 className="value-title">{val.title}</h3>
                                <p className="value-desc">{val.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ─── Call to Action Banner ─── */}
            <section className="about-cta-section">
                <div className="about-cta-card">
                    <span className="cta-eyebrow">JOIN THE FUTURE OF RESEARCH</span>
                    <h2 className="cta-title">Ready to Make an Impact?</h2>
                    <p className="cta-desc">
                        Whether you are a researcher aiming to present pioneering discoveries or an enterprise 
                        seeking strategic global partnerships, NEXT Conferences is your international launchpad.
                    </p>
                    <div className="cta-actions">
                        <Link to="/conferences" className="btn-cta-primary">
                            Explore Conferences <ArrowRight size={16} />
                        </Link>
                        <Link to="/contactus" className="btn-cta-secondary">
                            Contact Organizing Committee
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
