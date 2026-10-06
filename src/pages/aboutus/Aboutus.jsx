import React from 'react';
import { Target, Lightbulb, TrendingUp, CheckCircle } from 'lucide-react';
import './aboutus.css';

const ABOUT_SECTIONS = [
  {
    title: 'Aim',
    icon: Target,
    content: 'NEXT Conferences strives to build subject expert networks and peers in the field of Medical Sciences and Engineering Technology thereby creating an ideal platform for “Connecting Minds, Creating Futures.”'
  },
  {
    title: 'Objective',
    icon: Lightbulb,
    content: 'Our vision is to accelerate research and knowledge-sharing platforms by gathering like-minded scientists, researchers, scholars, post-doc researchers, and members in collaboration with societies, associations, and industry experts to deliver their research ideas.'
  },
  {
    title: 'Results',
    icon: TrendingUp,
    content: 'We organize a wide range of international conferences by covering current challenging and future burning topics in medical, Health Sciences, Life Sciences, Physical science, Engineering, Social Sciences, and Business. This enables us to serve millions of scientists and scholars’ collaboration and exchange of innovative ideas mainly fulfilling the gap between the academic, industry, and public.'
  },
  {
    title: 'Conclusion',
    icon: CheckCircle,
    content: 'Our conferences will act as a great network barrier for scientists, researchers, students, and the public to work together on various key global challenges effective to the present era and for the better future of mankind.'
  }
];

const AboutUs = () => {
    return (
        <div className="aboutus-container">
            <div className="about-wrapper">
                <div className="about-header">
                    <span className="about-eyebrow">Our Vision</span>
                    <h1 className="about-title">About NEXT</h1>
                    <p className="about-desc">Pioneering the future of global collaboration and innovation.</p>
                </div>

                <div className="about-grid">
                    {ABOUT_SECTIONS.map((section, idx) => {
                        const Icon = section.icon;
                        return (
                            <div key={idx} className="about-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                                <div className="about-icon-wrapper">
                                    <Icon size={28} />
                                </div>
                                <h3 className="about-card-title">{section.title}</h3>
                                <p className="about-card-content">{section.content}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
