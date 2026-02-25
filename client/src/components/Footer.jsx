import React from 'react';
import { Mail, Phone, Youtube, Linkedin, Instagram, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1A1A1A] text-[#D2C4AE] pt-20 pb-8 border-t-[3px] border-[#B89A6A] mt-auto font-sans relative z-20 overflow-hidden">
      
      {/* Subtle background texture for the footer */}
      <div className="absolute inset-0 bg-[url('/india-map-watermark.png')] opacity-[0.02] pointer-events-none bg-center bg-cover"></div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Increased spacing between columns (gap-12 -> gap-16) for better visual hierarchy */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
          
          {/* 1. Strong Legal Identity Section */}
          <div className="lg:col-span-4">
            <h2 className="text-white font-serif text-4xl md:text-5xl mb-6 font-bold tracking-wider drop-shadow-sm">RightVerse</h2>
            <p className="text-[16px] leading-relaxed mb-6 text-[#E9E3D9] font-medium">
              Empowering citizens through legal awareness and digital access to justice.
            </p>
            <p className="text-[14px] leading-relaxed text-[#D2C4AE] italic">
              RightVerse is a student-driven legal awareness platform designed to simplify laws and promote informed decision-making.
            </p>
          </div>

          {/* 2 & 3. Navigation with "Law of the Day" & "Legal Awareness" */}
          <div className="lg:col-span-3 lg:pl-8">
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-4 text-[15px] font-medium text-[#D2C4AE]">
              <li><Link to="/" className="hover:text-[#B89A6A] transition-all duration-300 hover:translate-x-2 inline-block">Home</Link></li>
              <li><Link to="/law-library" className="hover:text-[#B89A6A] transition-all duration-300 hover:translate-x-2 inline-block">Law Library</Link></li>
              <li><Link to="/news" className="hover:text-[#B89A6A] transition-all duration-300 hover:translate-x-2 inline-flex items-center gap-2">Law of the Day <span className="text-[#B89A6A] text-lg"></span></Link></li>
              <li><Link to="/blogs" className="hover:text-[#B89A6A] transition-all duration-300 hover:translate-x-2 inline-block">Legal Awareness</Link></li>
              <li><Link to="/your-voice" className="hover:text-[#B89A6A] transition-all duration-300 hover:translate-x-2 inline-block">Your Voice</Link></li>
              <li><Link to="/resources" className="hover:text-[#B89A6A] transition-all duration-300 hover:translate-x-2 inline-block">Help & Resources</Link></li>
            </ul>
          </div>

          {/* 4. Improved Policies Section */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Policies</h4>
            <ul className="space-y-4 text-[15px] font-medium text-[#D2C4AE]">
              <li><Link to="#" className="hover:text-white transition-all duration-300 hover:translate-x-2 inline-block">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-white transition-all duration-300 hover:translate-x-2 inline-block">Safety Policy</Link></li>
              <li><Link to="#" className="hover:text-white transition-all duration-300 hover:translate-x-2 inline-block">Terms & Conditions</Link></li>
              <li><Link to="#" className="hover:text-white transition-all duration-300 hover:translate-x-2 inline-block">Disclaimer</Link></li>
              <li><Link to="#" className="hover:text-white transition-all duration-300 hover:translate-x-2 inline-block">Accessibility Statement</Link></li>
            </ul>
          </div>

          {/* 5. Improved Connect Section (Professional icons & hovers) */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Connect</h4>
            <ul className="space-y-5 text-[15px] mb-8 font-medium text-[#D2C4AE]">
              <li>
                <a href="mailto:support@rightverse.in" className="flex items-center gap-4 hover:text-[#B89A6A] transition-colors group">
                  <span className="p-2.5 bg-[#333333] rounded-full group-hover:bg-[#B89A6A] group-hover:text-white transition-all duration-300 border border-[#333333] group-hover:border-[#B89A6A] shadow-sm"><Mail size={16}/></span>
                  <span>support@rightverse.in</span>
                </a>
              </li>
              <li>
                <a href="tel:+91XXXXXXXX" className="flex items-center gap-4 hover:text-[#B89A6A] transition-colors group">
                   <span className="p-2.5 bg-[#333333] rounded-full group-hover:bg-[#B89A6A] group-hover:text-white transition-all duration-300 border border-[#333333] group-hover:border-[#B89A6A] shadow-sm"><Phone size={16}/></span>
                  <span>+91 XXXXXXXX</span>
                </a>
              </li>
            </ul>
            <div className="flex gap-4">
              <a href="#" className="p-3 bg-[#333333] border border-transparent rounded-full text-[#D2C4AE] hover:bg-transparent hover:border-[#E1306C] hover:text-[#E1306C] transition-all duration-300 hover:-translate-y-1 shadow-sm"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="p-3 bg-[#333333] border border-transparent rounded-full text-[#D2C4AE] hover:bg-transparent hover:border-[#0077B5] hover:text-[#0077B5] transition-all duration-300 hover:-translate-y-1 shadow-sm"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="p-3 bg-[#333333] border border-transparent rounded-full text-[#D2C4AE] hover:bg-transparent hover:border-[#FF0000] hover:text-[#FF0000] transition-all duration-300 hover:-translate-y-1 shadow-sm"><Youtube className="w-5 h-5" /></a>
            </div>
          </div>
        </div>

        {/* 6. Bottom Legal Strip */}
        <div className="border-t border-[#333333] pt-8 flex flex-col lg:flex-row justify-between items-center text-[13px] text-[#D2C4AE]/70 font-medium gap-6">
           <p className="text-center lg:text-left">© 2026 RightVerse | Developed as a Capstone Project | All Rights Reserved</p>
           <p className="text-center lg:text-left">This platform provides informational content only and does not constitute legal advice.</p>
           <button 
             onClick={scrollToTop} 
             className="flex items-center gap-2 px-6 py-3 bg-[#333333] text-[#D2C4AE] hover:bg-[#B89A6A] hover:text-white rounded-full transition-all duration-300 text-xs font-bold uppercase tracking-widest shadow-sm hover:shadow-lg hover:-translate-y-1 shrink-0"
           >
             Back to Top <ArrowUp size={16} />
           </button>
        </div>
      </div>
    </footer>
  );
}