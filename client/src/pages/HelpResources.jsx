import React, { useState } from 'react';
import { 
  Phone, Shield, Lock, Heart, MapPin, 
  Search, ExternalLink, Download, AlertCircle, 
  ChevronRight, BookOpen, Scale, LifeBuoy, FileText
} from 'lucide-react';

export default function HelpResources() {
  const [activeTab, setActiveTab] = useState('urgent');
  const [searchQuery, setSearchQuery] = useState('');

  const emergencyNumbers = [
    { label: "Police", num: "100", icon: <Shield size={16}/> },
    { label: "Women", num: "1091", icon: <Heart size={16}/> },
    { label: "Child", num: "1098", icon: <Lock size={16}/> },
    { label: "Cyber", num: "1930", icon: <AlertCircle size={16}/> },
    { label: "Fire", num: "101", icon: <LifeBuoy size={16}/> },
  ];

  return (
    <div className="min-h-screen bg-[#F5F1E8] font-sans text-[#785F3F] pb-24 relative overflow-hidden">
      
      <style>{`
        .watermark-bg::before {
          content: ''; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background-image: url('/india-map-watermark.png');
          background-repeat: no-repeat; background-position: center; background-size: cover; opacity: 0.05;
          pointer-events: none; z-index: 0;
        }

        /* Directory Cards Tone Alignment */
        .directory-card {
          transition: transform 300ms ease-out, box-shadow 300ms ease-out, border-color 300ms ease-out;
        }
        .directory-card:hover {
          transform: translateY(-4px);
          border-color: #B89A6A;
          box-shadow: 0 15px 35px rgba(184,154,106,0.15); /* Warm shadow */
        }

        /* Interaction Alignment: Pill Buttons */
        .pill-btn {
          transition: all 300ms ease-out;
        }
        .pill-btn:hover {
          box-shadow: 0 0 15px rgba(184,154,106,0.6); /* Gold hover glow */
          transform: translateY(-2px);
        }
      `}</style>

      {/* --- STICKY EMERGENCY HEADER --- */}
      <div className="bg-[#8C2F2F] text-[#FBF8F2] sticky z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between flex-wrap gap-4">
           <div className="flex items-center gap-2.5">
              <span className="animate-pulse flex h-2 w-2 rounded-full bg-white"></span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">🚨 Emergency - Call Now</span>
           </div>
           <div className="flex gap-4 md:gap-8 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
              {emergencyNumbers.map((e) => (
                <a key={e.label} href={`tel:${e.num}`} className="flex items-center gap-2.5 hover:bg-[#785F3F] px-3 py-1.5 rounded-md transition-colors whitespace-nowrap">
                   <span className="opacity-90">{e.icon}</span>
                   <span className="text-sm font-bold">{e.label}: {e.num}</span>
                </a>
              ))}
           </div>
        </div>
      </div>

      {/* --- HERO SECTION (Charcoal Banner + Gold Line) --- */}
      <div className=" text-[#F5F1E8] border-b-[3px] border-[#B89A6A] py-10 px-4 relative watermark-bg">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-[#B89A6A]">Help & Resources</h1>
          <p className="text-[#D2C4AE] text-lg md:text-xl mb-12 font-medium tracking-wide">"Immediate support when you need it most."</p>
      
        </div>
      </div>

      {/* --- TAB NAVIGATION (Semantic Legal Colors) --- */}
      <div className="max-w-7xl mx-auto px-4 mt-16 relative z-10 watermark-bg">
        <div className="flex flex-col md:flex-row gap-5 mb-14">
           <TabButton 
             active={activeTab === 'urgent'} 
             onClick={() => setActiveTab('urgent')}
             color="bg-[#8C2F2F]/10 text-[#8C2F2F] border-[#8C2F2F]/20"
             activeColor="bg-[#8C2F2F] text-[#FBF8F2] shadow-[0_8px_20px_rgba(140,47,47,0.3)] border-[#8C2F2F]"
             icon={<AlertCircle />}
             label="Urgent"
             subtext="Immediate danger or crisis"
           />
           <TabButton 
             active={activeTab === 'needed'} 
             onClick={() => setActiveTab('needed')}
             color="bg-[#C6A76A]/10 text-[#C6A76A] border-[#C6A76A]/20"
             activeColor="bg-[#C6A76A] text-[#FBF8F2] shadow-[0_8px_20px_rgba(198,167,106,0.3)] border-[#C6A76A]"
             icon={<LifeBuoy />}
             label="Needed Soon"
             subtext="Within days (FIR, Complaints)"
           />
           <TabButton 
             active={activeTab === 'learning'} 
             onClick={() => setActiveTab('learning')}
             color="bg-[#8FA79A]/10 text-[#8FA79A] border-[#8FA79A]/20"
             activeColor="bg-[#8FA79A] text-[#FBF8F2] shadow-[0_8px_20px_rgba(143,167,154,0.3)] border-[#8FA79A]"
             icon={<BookOpen />}
             label="Learning"
             subtext="General info & awareness"
           />
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           {activeTab === 'urgent' && <UrgentContent />}
           {activeTab === 'needed' && <ActionContent />}
           {activeTab === 'learning' && <LearningContent />}
        </div>
      </div>

      {/* --- PATH 2: BY CATEGORY --- */}
      <div className="bg-[#E9E3D9] mt-24 py-20 border-t border-[#D2C4AE] relative z-10 watermark-bg">
         <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-serif font-bold mb-10 flex items-center gap-3 text-[#B89A6A]">
               <Scale className="text-[#B89A6A]" size={28}/> Detailed Resource Directory
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <CategoryCard 
                title="Women & Children " 
                 links={[
                   { name: "Domestic Violence Support", url: "https://ncw.nic.in" },
                   { name: "NCW Portal", url: "https://ncw.nic.in" },
                   { name: "POCSO Guide", url: "/law-library" },
                   { name: "Childline 1098", url: "tel:1098" }
                 ]}
               />
               <CategoryCard 
                 title="Cyber & Tech " 
                 links={[
                   { name: "Report Online Fraud", url: "https://www.cybercrime.gov.in" },
                   { name: "Identity Theft Steps", url: "/blogs" },
                   { name: "Cyber Safety Toolkit", url: "/resources" },
                   { name: "1930 Helpline", url: "tel:1930" }
                 ]}
               />
               <CategoryCard 
                title="Workplace Rights"  
                 links={[
                   { name: "Labour Dept Contacts", url: "https://labour.gov.in" },
                   { name: "She Box (POSH)", url: "https://shebox.wcd.gov.in" },
                   { name: "Wage Dispute Help", url: "/resources" },
                   { name: "PF/ESIC Support", url: "https://www.epfindia.gov.in" }
                 ]}
               />
            </div>
         </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function TabButton({ active, onClick, color, activeColor, icon, label, subtext }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 p-6 rounded-[20px] border-2 transition-all duration-300 text-left group hover:-translate-y-1 ${active ? activeColor : `${color} hover:bg-white`}`}
    >
       <div className="flex items-center gap-3 mb-2">
          {icon}
          <span className="font-serif text-2xl font-bold">{label}</span>
       </div>
       <p className={`text-sm font-medium ${active ? 'text-white/80' : 'text-[#785F3F]/70'}`}>{subtext}</p>
    </button>
  );
}

function ResourceCard({ title, subtitle, items, mainCta, type = "urgent" }) {
  // Correct Color Direction based on type
  const themeColors = {
    urgent: { text: "text-[#8C2F2F]", bg: "bg-[#8C2F2F]", lightBg: "bg-[#8C2F2F]/10" },
    needed: { text: "text-[#C6A76A]", bg: "bg-[#C6A76A]", lightBg: "bg-[#C6A76A]/10" },
    learning: { text: "text-[#8FA79A]", bg: "bg-[#8FA79A]", lightBg: "bg-[#8FA79A]/10" }
  };

  const theme = themeColors[type];
  
  return (
    // Card Background Alignment: Warm Ivory Cards (#FBF8F2)
    <div className={`directory-card bg-[#FBF8F2] border border-[#D2C4AE] rounded-[24px] p-8 flex flex-col`}>
      <h3 className="text-2xl font-serif font-bold text-[#785F3F] mb-1">{title}</h3>
      <p className="text-[11px] font-bold text-[#D2C4AE] uppercase tracking-widest mb-6">{subtitle}</p>
      
      <div className="space-y-4 mb-8">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between border-b border-[#D2C4AE]/40 pb-4 last:border-0">
             <div className="flex items-center gap-4">
                <span className={`p-2 rounded-[10px] ${theme.lightBg} ${theme.text}`}>{item.icon}</span>
                <div>
                   <p className="text-base font-bold text-[#785F3F]">{item.label}</p>
                   <p className="text-xs text-[#B89AAA] font-medium mt-0.5">{item.desc}</p>
                </div>
             </div>
             
             {/* Interaction Alignment: Muted red fill (or category match), gold hover glow, rounded pill */}
             <a 
               href={item.tel ? `tel:${item.tel}` : item.url} 
               target={item.url?.startsWith('http') ? "_blank" : "_self"}
               rel="noreferrer"
               className={`pill-btn px-5 py-2.5 ${theme.bg} text-[#FBF8F2] rounded-full text-[10px] font-bold tracking-widest uppercase`}
             >
                {item.tel ? "CALL" : "OPEN"}
             </a>
          </div>
        ))}
      </div>

      <a 
        href={mainCta.url} 
        target="_blank" 
        rel="noreferrer"
        className={`pill-btn mt-auto w-full py-4 text-center ${theme.bg} text-[#FBF8F2] rounded-full text-sm font-bold tracking-widest uppercase shadow-md`}
      >
        {mainCta.label}
      </a>
    </div>
  );
}

function CategoryCard({ title, links }) {
  return (
    // Card Background Alignment: Warm Ivory Cards (#FBF8F2)
    <div className="directory-card bg-[#FBF8F2] p-8 rounded-[24px] border border-[#D2C4AE]">
       <h3 className="font-serif font-bold text-xl mb-6 text-[#785F3F]">{title}</h3>
       <ul className="space-y-4">
          {links.map((l, i) => (
             <li key={i}>
                <a 
                  href={l.url} 
                  target={l.url.startsWith('http') ? "_blank" : "_self"}
                  rel="noreferrer"
                  className="flex items-center gap-3 text-[15px] font-medium text-[#785F3F] hover:text-[#B89A6A] transition-colors w-full group"
                >
                   <ChevronRight size={16} className="text-[#D2C4AE] group-hover:text-[#B89A6A] group-hover:translate-x-1 transition-all" />
                   {l.name}
                </a>
             </li>
          ))}
       </ul>
    </div>
  );
}

// --- CONTENT RENDERING ---

function UrgentContent() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <ResourceCard 
        type="urgent"
        title="Immediate Danger"
        subtitle="Police & Crisis"
        mainCta={{ label: "LOCATE NEAREST POLICE", url: "https://www.google.com/maps/search/police+station+near+me" }}
        items={[
          { label: "Police (National)", desc: "100", tel: "100", icon: <Shield size={18}/> },
          { label: "Women Helpline", desc: "NCW Support", tel: "1091", icon: <Heart size={18}/> },
          { label: "NCW (24/7)", desc: "7827-170-170", tel: "7827170170", icon: <Phone size={18}/> },
        ]}
      />
      <ResourceCard 
        type="urgent"
        title="Cyber Crime"
        subtitle="Frauds & Harassment"
        mainCta={{ label: "FILE ONLINE COMPLAINT", url: "https://www.cybercrime.gov.in" }}
        items={[
          { label: "Cyber Helpline", desc: "Financial Fraud", tel: "1930", icon: <Lock size={18}/> },
          { label: "Cybercrime Portal", desc: "Report Online", url: "https://www.cybercrime.gov.in", icon: <ExternalLink size={18}/> },
          { label: "Child Helpline", desc: "1098", tel: "1098", icon: <AlertCircle size={18}/> },
        ]}
      />
      <ResourceCard 
        type="urgent"
        title="Medical/Emergency"
        subtitle="Health & Crisis"
        mainCta={{ label: "LOCATE NEAREST HOSPITAL", url: "https://www.google.com/maps/search/hospitals+near+me" }}
        items={[
          { label: "Ambulance", desc: "Medical Emergency", tel: "102", icon: <Phone size={18}/> },
          { label: "Mental Health", desc: "Kiran Helpline", tel: "08046110007", icon: <Heart size={18}/> },
          { label: "Poison Control", desc: "1800-11-6117", tel: "1800116117", icon: <AlertCircle size={18}/> },
        ]}
      />
    </div>
  );
}

function ActionContent() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <ResourceCard 
        type="needed"
        title="File a Complaint"
        subtitle="Government Portals"
        mainCta={{ label: "NATIONAL GRIEVANCE PORTAL", url: "https://pgportal.gov.in" }}
        items={[
          { label: "e-FIR (Women)", desc: "Report Online", url: "https://www.google.com/search?q=online+fir+india", icon: <FileText size={18}/> },
          { label: "Consumer Forum", desc: "NCDRC Portal", url: "https://ncdrc.nic.in", icon: <Scale size={18}/> },
          { label: "RTI Online", desc: "File RTI Online", url: "https://rtionline.gov.in", icon: <ExternalLink size={18}/> },
        ]}
      />
      <ResourceCard 
        type="needed"
        title="Legal Aid & Courts"
        subtitle="Public Legal Services"
        mainCta={{ label: "NALSA LEGAL AID", url: "https://nalsa.gov.in" }}
        items={[
          { label: "Case Status", desc: "e-Courts India", url: "https://ecourts.gov.in", icon: <MapPin size={18}/> },
          { label: "High Court List", desc: "Find High Courts", url: "https://districts.ecourts.gov.in", icon: <Scale size={18}/> },
          { label: "Pro Bono Aid", desc: "Nyaya Bandhu", url: "https://www.probono-doj.in", icon: <Heart size={18}/> },
        ]}
      />
      <ResourceCard 
        type="needed"
        title="Work & Education"
        subtitle="Rights Protection"
        mainCta={{ label: "SHE BOX PORTAL", url: "https://shebox.wcd.gov.in" }}
        items={[
          { label: "POSH Complaints", desc: "Workplace Safety", url: "https://shebox.wcd.gov.in", icon: <Shield size={18}/> },
          { label: "Anti-Ragging", desc: "UGC Helpline", tel: "18001805522", icon: <Lock size={18}/> },
          { label: "Labour Grievance", desc: "PEMS Portal", url: "https://labour.gov.in", icon: <AlertCircle size={18}/> },
        ]}
      />
    </div>
  );
}

function LearningContent() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-[#FBF8F2] border border-[#D2C4AE] rounded-[24px] p-10 flex flex-col md:flex-row gap-10 shadow-sm directory-card">
         <div className="flex-1">
            <h3 className="text-3xl font-serif font-bold text-[#785F3F] mb-4">Know Your Rights Guides</h3>
            <p className="text-[#B89AAA] font-medium text-lg mb-8 leading-relaxed">Download simplified PDF handbooks for various legal situations. Stay empowered with knowledge.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <a href="/guides/student-rights.pdf" download className="flex items-center gap-3 p-4 bg-[#8FA79A]/10 border border-[#8FA79A]/30 rounded-xl text-[#8FA79A] text-sm font-bold hover:bg-[#8FA79A] hover:text-[#FBF8F2] transition-colors group">
                  <Download size={18} className="group-hover:-translate-y-0.5 transition-transform"/> Student Rights 101
               </a>
               <a href="/guides/women-rights.pdf" download className="flex items-center gap-3 p-4 bg-[#8FA79A]/10 border border-[#8FA79A]/30 rounded-xl text-[#8FA79A] text-sm font-bold hover:bg-[#8FA79A] hover:text-[#FBF8F2] transition-colors group">
                  <Download size={18} className="group-hover:-translate-y-0.5 transition-transform"/> Women's Handbook
               </a>
               <a href="/guides/cyber-safety.pdf" download className="flex items-center gap-3 p-4 bg-[#8FA79A]/10 border border-[#8FA79A]/30 rounded-xl text-[#8FA79A] text-sm font-bold hover:bg-[#8FA79A] hover:text-[#FBF8F2] transition-colors group">
                  <Download size={18} className="group-hover:-translate-y-0.5 transition-transform"/> Cyber Safety 101
               </a>
               <a href="/guides/consumer-guide.pdf" download className="flex items-center gap-3 p-4 bg-[#8FA79A]/10 border border-[#8FA79A]/30 rounded-xl text-[#8FA79A] text-sm font-bold hover:bg-[#8FA79A] hover:text-[#FBF8F2] transition-colors group">
                  <Download size={18} className="group-hover:-translate-y-0.5 transition-transform"/> Consumer Protection
               </a>
            </div>
         </div>
         <a href="/guides/all-resources.zip" download className="w-full md:w-56 flex flex-col items-center justify-center bg-[#8FA79A] rounded-[24px] p-8 text-[#FBF8F2] hover:bg-[#785F3F] transition-all shadow-md pill-btn group">
            <BookOpen size={56} className="text-[#FBF8F2] mb-5 group-hover:scale-110 transition-transform" />
            <span className="text-center font-bold text-sm tracking-widest uppercase">Download All Guides</span>
         </a>
      </div>
      <div className="bg-[#8FA79A] text-[#FBF8F2] rounded-[24px] p-10 shadow-lg relative overflow-hidden directory-card border-none">
         <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-10 translate-x-10 blur-xl"></div>
         <h3 className="text-2xl font-serif font-bold mb-4 relative z-10">Video Explainers</h3>
         <p className="text-[#FBF8F2]/90 text-base mb-8 leading-relaxed font-medium relative z-10">Watch 2-minute guides on how to file an FIR, what to do if arrested, and more.</p>
         <a 
           href="https://www.youtube.com/@RightVerseLegal" 
           target="_blank" 
           rel="noreferrer" 
           className="block text-center w-full py-4 bg-[#FBF8F2] text-[#8FA79A] rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white transition-all relative z-10 pill-btn"
         >
            WATCH PLAYLIST
         </a>
      </div>
    </div>
  );
}