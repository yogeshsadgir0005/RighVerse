import React, { useState } from 'react';
import { Menu, X, Scale } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import rightverseLogo from '../assets/rightverse.jpeg';
import stambhlogo from '../assets/image.png';
export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { name: "Home", link: "/" },
    { name: "Law Library", link: "/law-library" },
    { name: "Your Voice", link: "/your-voice" },
    { name: "Blogs", link: "/blogs" },
    { name: "News", link: "/news" },
    { name: "Help & Resources", link: "/resources" }, 
    { name: "Contact", link: "/contact" }, 
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400&display=swap');
        
        @keyframes slideFadeLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideFadeRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fadeRise {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-logo {
          opacity: 0;
          animation: slideFadeLeft 0.8s ease-out forwards;
        }
        
        .animate-right-pic {
          opacity: 0;
          animation: slideFadeRight 0.8s ease-out 0.1s forwards;
        }
        
        .animate-tagline {
          opacity: 0;
          animation: fadeRise 1s ease-out 0.6s forwards;
        }

        .premium-nav-link {
          position: relative;
          transition: all 180ms ease-out;
          color: #785F3F;
        }
        
        .premium-nav-link:hover, .premium-nav-link.active {
          color: #B89A6A;
          transform: translateY(-2px);
        }
        
        .premium-nav-link::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 2px;
          bottom: -4px;
          left: 0;
          background-color: #B89A6A;
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 180ms ease-out;
        }
        
        .premium-nav-link:hover::after, .premium-nav-link.active::after {
          transform: scaleX(1);
        }

        .watermark-drawer::before {
          content: ''; 
          position: absolute; 
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: url('/india-map-watermark.png');
          background-repeat: no-repeat; 
          background-position: center; 
          background-size: cover; 
          opacity: 0.05;
          pointer-events: none; 
          z-index: 0;
        }
      `}</style>

      <header className="fixed top-0 left-0 w-full z-50 bg-[#F5F1E8] shadow-[0_2px_10px_rgba(120,95,63,0.05)] font-sans transition-all duration-300 border-b-[3px] border-[#B89A6A]">
        




        <div className="flex justify-between items-center w-full px-4 md:px-8 h-[115px]">
          
          <Link to="/" className="animate-logo flex items-center gap-3 shrink-0">
                 
    <img src={rightverseLogo} className='h-24 w-24' alt="RightVerse Logo" />

            <h1 className="text-3xl font-serif font-bold text-[#785F3F] tracking-wide leading-none mt-1">
              RIGHTVERSE
            </h1>
          </Link
          >

          <nav className=" flex flex-col hidden md:flex items-center gap-4 ">

            <div className='md:flex gap-8 pt-8 items-center justify-center'>
     {navItems.map((item) => (
              <Link 
                key={item.name} 
                to={item.link} 
                className={`premium-nav-link text-sm font-bold uppercase  tracking-wider ${isActive(item.link) ? 'active' : ''}`}
              >
                {item.name}
              </Link>

            ))}
            </div>
       


                 <div className="hidden md:block w-full border-t border-[#D2C4AE]/30 py-2.5 text-center bg-[#F5F1E8]">
          <p 
            className="animate-tagline uppercase font-bold text-[#9e855c]"
            style={{ 
              fontFamily: "'EB Garamond', serif", 
              letterSpacing: "3px", 
              fontSize: "18px" 
            }}
          >
            Justice, Liberty, Equality and Fraternity for all citizens.
          </p>
        </div>
        

          </nav>





          <div className="flex items-center gap-4 shrink-0">
            
            <div className="hidden md:flex animate-right-pic w-20 h-20 rounded-full bg-[#E9E3D9] border-2 border-[#B89A6A] shadow-sm items-center justify-center overflow-hidden">
               <img 
                  src={stambhlogo} 
                  alt="Ashoka Emblem" 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/E9E3D9/B89A6A?text=Emblem" }} 
               />
            </div>

            <button 
              className="md:hidden text-[#785F3F] hover:text-[#B89A6A] transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

        </div>




       






        {isMobileMenuOpen && (
          <nav className="md:hidden absolute top-full left-0 w-full h-screen bg-[#F5F1E8] border-t border-[#D2C4AE]/30 shadow-xl animate-in slide-in-from-right-10 z-40 watermark-drawer relative overflow-hidden">
            <div className="p-4 bg-[#E9E3D9]/50 border-b border-[#D2C4AE]/30 text-center relative z-10">
              <p className="uppercase text-[#B89A6A] font-bold text-xs" style={{ fontFamily: "'EB Garamond', serif", letterSpacing: "2px" }}>
                Justice, Liberty, Equality and Fraternity for all citizens.
              </p>
            </div>
            <ul className="flex flex-col p-6 gap-2 text-sm font-bold text-[#785F3F] uppercase tracking-wide relative z-10">
               {navItems.map((item) => (
                  <li key={item.name}>
                    <Link 
                      to={item.link} 
                      className={`block py-3 border-b border-[#D2C4AE]/20 hover:pl-2 hover:text-[#B89A6A] transition-all ${
                        isActive(item.link) ? 'text-[#B89A6A] border-[#B89A6A]/30 pl-2' : ''
                      }`} 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </li>
               ))}
            </ul>
          </nav>
        )}
      </header>

      <div className="h-[72px] md:h-[114px]"></div>
    </>
  );
}