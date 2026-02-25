import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Shield, FileText, AlertTriangle, ScrollText, Accessibility, ArrowRight, HelpCircle } from 'lucide-react';

const policiesData = {
  privacy: {
    id: "privacy",
    icon: <Shield size={20} />,
    title: "Privacy Policy",
    lastUpdated: "February 25, 2026",
    intro: "Rightverse is a legal awareness platform designed to simplify laws and provide accessible legal information to the public. We respect user privacy and are committed to maintaining transparency.",
    sections: [
      {
        title: "1. Information We Do Not Collect",
        content: (
          <>
            <p className="mb-3">Rightverse does not require user registration and does not collect:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4 text-[#785F3F]/90">
              <li>Names</li>
              <li>Email addresses</li>
              <li>Phone numbers</li>
              <li>Location data</li>
              <li>Government identification details</li>
            </ul>
            <p>Users may access and browse the platform anonymously.</p>
          </>
        )
      },
      {
        title: "2. User Queries",
        content: (
          <>
            <p className="mb-3">If a user submits a legal query through the chatbot or input field:</p>
            <ul className="list-disc pl-5 space-y-2 text-[#785F3F]/90">
              <li>The content of the query is processed solely for generating an AI-based summary.</li>
              <li>Queries are not linked to any identifiable personal information.</li>
              <li>Queries are not used for profiling or tracking.</li>
            </ul>
          </>
        )
      },
      {
        title: "3. Anonymous Story Submissions",
        content: (
          <>
            <p className="mb-3">Users may voluntarily submit stories or experiences for awareness purposes.</p>
            <ul className="list-disc pl-5 space-y-2 text-[#785F3F]/90">
              <li>Submissions are published anonymously.</li>
              <li>Users are advised not to include sensitive personal details.</li>
              <li>Rightverse is not responsible for voluntarily disclosed information within submissions.</li>
            </ul>
          </>
        )
      },
      {
        title: "4. AI Processing",
        content: (
          <>
            <p className="mb-3">Legal summaries are generated using AI models via secure backend integration.</p>
            <ul className="list-disc pl-5 space-y-2 text-[#785F3F]/90">
              <li>No personal data is intentionally stored.</li>
              <li>AI responses are automated and may not always be fully accurate.</li>
            </ul>
          </>
        )
      },
      {
        title: "5. Data Storage",
        content: (
          <>
            <p className="mb-3">Rightverse stores only:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4 text-[#785F3F]/90">
              <li>Legal content</li>
              <li>AI-generated summaries</li>
              <li>Blog/news content</li>
              <li>Anonymous user submissions (if approved)</li>
            </ul>
            <p>No personally identifiable data is stored in the database.</p>
          </>
        )
      },
      {
        title: "6. Cookies",
        content: <p>Rightverse may use basic cookies for performance and functionality. These cookies do not track personal identity.</p>
      },
      {
        title: "7. Changes to Policy",
        content: <p>We reserve the right to update this policy at any time. Continued use of the platform indicates acceptance of the updated policy.</p>
      }
    ]
  },
  safety: {
    id: "safety",
    icon: <AlertTriangle size={20} />,
    title: "Safety Policy",
    lastUpdated: "February 25, 2026",
    intro: "Rightverse aims to create a safe and responsible legal awareness environment.",
    sections: [
      {
        title: "1. No Legal Advice",
        content: <p>Content provided on this platform is for informational and educational purposes only.</p>
      },
      {
        title: "2. Responsible Use",
        content: (
          <>
            <p className="mb-3">Users must not:</p>
            <ul className="list-disc pl-5 space-y-2 text-[#785F3F]/90">
              <li>Post defamatory content</li>
              <li>Share false accusations</li>
              <li>Upload harmful or illegal material</li>
              <li>Impersonate individuals or institutions</li>
            </ul>
          </>
        )
      },
      {
        title: "3. Anonymous Story Guidelines",
        content: (
          <>
            <p className="mb-3">Submitted stories must:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4 text-[#785F3F]/90">
              <li>Be factual to the best of the user's knowledge</li>
              <li>Avoid naming individuals without consent</li>
              <li>Avoid revealing sensitive personal data</li>
            </ul>
            <p className="font-bold">Rightverse reserves the right to remove any inappropriate submissions.</p>
          </>
        )
      }
    ]
  },
  terms: {
    id: "terms",
    icon: <ScrollText size={20} />,
    title: "Terms & Conditions",
    lastUpdated: "February 25, 2026",
    intro: "By accessing Rightverse, you agree to the following conditions:",
    sections: [
      {
        title: "1. Informational Purpose",
        content: <p>Rightverse provides simplified explanations of laws for awareness only.</p>
      },
      {
        title: "2. No Attorney-Client Relationship",
        content: <p>Use of this platform does not create any legal relationship between users and Rightverse.</p>
      },
      {
        title: "3. Intellectual Property",
        content: <p>All content including summaries, design, and branding are property of Rightverse unless otherwise stated.</p>
      },
      {
        title: "4. User Submissions",
        content: (
          <>
            <p className="mb-3">By submitting content:</p>
            <ul className="list-disc pl-5 space-y-2 text-[#785F3F]/90">
              <li>You grant Rightverse the right to publish the content anonymously.</li>
              <li>You confirm that the submission does not violate any law.</li>
            </ul>
          </>
        )
      },
      {
        title: "5. Limitation of Liability",
        content: (
          <>
            <p className="mb-3">Rightverse shall not be held liable for:</p>
            <ul className="list-disc pl-5 space-y-2 text-[#785F3F]/90">
              <li>Decisions made based on AI summaries</li>
              <li>Errors or omissions in content</li>
              <li>Losses resulting from reliance on information provided</li>
            </ul>
          </>
        )
      }
    ]
  },
  disclaimer: {
    id: "disclaimer",
    icon: <FileText size={20} />,
    title: "Disclaimer",
    lastUpdated: "February 25, 2026",
    body: (
      <div className="bg-white border border-[#D2C4AE] rounded-2xl p-8 shadow-sm">
        <p className="mb-4 text-lg">Rightverse is a legal awareness platform. The information provided on this website:</p>
        <ul className="list-disc pl-6 space-y-3 mb-8 text-[#785F3F]/90 text-lg">
          <li>Does not constitute legal advice</li>
          <li>Is not a substitute for professional consultation</li>
          <li>May not reflect the most recent legal developments</li>
        </ul>
        <div className="bg-[#E9E3D9] p-6 rounded-xl border border-[#D2C4AE]">
          <p className="mb-3 font-bold text-[#8C2F2F]">Users are strongly advised to consult a qualified advocate or legal professional for case-specific guidance.</p>
          <p className="mb-3 text-[#785F3F]/90">AI-generated summaries are simplified interpretations and may contain inaccuracies.</p>
          <p className="text-[#785F3F]/90">Rightverse is not responsible for any actions taken based on the information provided.</p>
        </div>
      </div>
    )
  },
  accessibility: {
    id: "accessibility",
    icon: <Accessibility size={20} />,
    title: "Accessibility Statement",
    lastUpdated: "February 25, 2026",
    body: (
      <div className="bg-white border border-[#D2C4AE] rounded-2xl p-8 shadow-sm">
        <p className="mb-6 text-lg">Rightverse is committed to making legal information accessible to all individuals.</p>
        <p className="font-bold text-xl font-serif text-[#B89A6A] mb-4">We aim to:</p>
        <ul className="list-disc pl-6 space-y-3 mb-8 text-[#785F3F]/90 text-lg">
          <li>Provide simplified language explanations</li>
          <li>Offer bilingual content where possible</li>
          <li>Maintain a clean and readable interface</li>
        </ul>
        <div className="bg-[#F5F1E8] p-5 rounded-xl border border-[#D2C4AE] flex items-start gap-4">
          <HelpCircle className="text-[#B89A6A] shrink-0 mt-1" size={24} />
          <p className="text-[#785F3F] leading-relaxed">
            If you experience accessibility issues, please contact us through the platform’s contact section so we can improve your experience.
          </p>
        </div>
      </div>
    )
  }
};

export default function Policies() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('privacy');
  const [openAccordion, setOpenAccordion] = useState(0);

  // Switch tab based on URL query (?tab=safety)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && policiesData[tab]) {
      setActiveTab(tab);
      setOpenAccordion(0); // Reset accordion on tab switch
    }
  }, [location]);

  const activeData = policiesData[activeTab];

  return (
    <div className="min-h-screen bg-[#FBF8F2] font-sans text-[#785F3F] relative overflow-x-hidden pt-24 pb-20">
      <style>{`
        .watermark-bg::before {
          content: ''; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background-image: url('/india-map-watermark.png');
          background-repeat: no-repeat; background-position: center; background-size: cover; opacity: 0.03;
          pointer-events: none; z-index: 0;
        }
        .policy-accordion { transition: grid-template-rows 300ms ease-out; display: grid; }
        .policy-accordion[data-open="true"] { grid-template-rows: 1fr; }
        .policy-accordion[data-open="false"] { grid-template-rows: 0fr; }
        .policy-accordion-content { overflow: hidden; }
      `}</style>

      <div className="container mx-auto max-w-6xl px-4 relative z-10 watermark-bg">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-serif text-[#B89A6A] font-bold mb-4">Legal & Privacy</h1>
          <p className="text-lg text-[#785F3F]/80">Transparency, security, and trust in every interaction.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* Side Navigation */}
          <aside className="md:w-1/3 lg:w-1/4 shrink-0">
            <div className="bg-white border border-[#D2C4AE] rounded-2xl p-4 sticky top-32 shadow-sm">
              <nav className="flex flex-col gap-2">
                {Object.values(policiesData).map((policy) => (
                  <Link
                    key={policy.id}
                    to={`/policies?tab=${policy.id}`}
                    className={`flex items-center gap-3 w-full text-left px-5 py-4 rounded-xl font-bold transition-all ${
                      activeTab === policy.id 
                        ? 'bg-[#B89A6A] text-white shadow-md' 
                        : 'text-[#785F3F] hover:bg-[#F5F1E8] hover:text-[#B89A6A]'
                    }`}
                  >
                    {policy.icon}
                    <span className="tracking-wide">{policy.title}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="md:w-2/3 lg:w-3/4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#785F3F] mb-3">{activeData.title}</h2>
              <p className="text-sm font-bold text-[#D2C4AE] uppercase tracking-widest mb-6">Last Updated: {activeData.lastUpdated}</p>
              {activeData.intro && (
                <p className="text-lg text-[#785F3F]/90 leading-relaxed mb-8">{activeData.intro}</p>
              )}
            </div>

            {/* Render Accordions (For Privacy, Safety, Terms) */}
            {activeData.sections && (
              <div className="flex flex-col gap-4">
                {activeData.sections.map((section, idx) => (
                  <div key={idx} className="bg-white border border-[#D2C4AE] rounded-2xl overflow-hidden shadow-sm hover:border-[#B89A6A] transition-colors">
                    <button 
                      onClick={() => setOpenAccordion(openAccordion === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                    >
                      <h3 className="text-xl font-serif font-bold text-[#785F3F]">{section.title}</h3>
                      <ChevronDown className={`text-[#B89A6A] transition-transform duration-300 ${openAccordion === idx ? 'rotate-180' : ''}`} size={24} />
                    </button>
                    <div className="policy-accordion" data-open={openAccordion === idx}>
                      <div className="policy-accordion-content">
                        <div className="px-6 pb-6 pt-2 text-[#785F3F]/90 text-lg leading-relaxed border-t border-[#F5F1E8]">
                          {section.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Render Static Body (For Disclaimer, Accessibility) */}
            {activeData.body && activeData.body}

            {/* Global Contact Footer for Policies */}
            <div className="mt-12 bg-[#E9E3D9] border border-[#D2C4AE] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <p className="text-lg font-medium text-[#785F3F]">
                If you have concerns regarding this policy, please reach out to us.
              </p>
              <Link to="/contact" className="shrink-0 bg-[#333333] text-white px-8 py-3.5 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-[#B89A6A] transition-colors flex items-center gap-2 shadow-md">
                Contact Us <ArrowRight size={18} />
              </Link>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}