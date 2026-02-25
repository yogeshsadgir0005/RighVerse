import React, { useState, useEffect } from 'react';
import axios, { BASE_URL } from '../utils/axios';
import { Link, useNavigate } from 'react-router-dom';
import HeroBG from "../assets/heroBG.png";
import stambhlogo from "../assets/image.png"
import { 
  X, Shield, Scale, FileText, User, Lock, 
  Phone, BookOpen, Globe, Briefcase as BriefcaseIcon, 
  Loader2, Sparkles, ShieldAlert, CheckCircle, Mic, PenTool 
} from 'lucide-react';

const BriefcasePlaceholder = () => <div className="w-6 h-6 border-2 border-current rounded flex items-center justify-center text-[10px] font-bold">C</div>;
const DollarSign = () => <span className="text-xl font-bold">$</span>;

const LAWYER_CARDS = [
  { 
    id: 1, 
    name: "Anjali Mehta", 
    title: "Advocate", 
    quote: "Justice delayed is justice denied.", 
    desc: "A platform dedicated to informing citizens about their legal rights and empowering them.", 
    image: "https://placehold.co/400x400/png?text=Anjali+Mehta"
  },
  { 
    id: 2, 
    name: "Rajesh Kumar", 
    title: "Senior Counsel", 
    quote: "The law is the true embodiment of everything that's excellent.", 
    desc: "Empowering the common man with the shield of knowledge is our primary duty.", 
    image: "https://placehold.co/400x400/png?text=Rajesh+Kumar" 
  },
];

const CITIZEN_CATS = [
  { name: "Criminal", icon: <Scale size={28} /> },
  { name: "Civil", icon: <FileText size={28} /> },
  { name: "Constitutional", icon: <BookOpen size={28} /> },
  { name: "Corporate", icon: <BriefcasePlaceholder /> },
  { name: "Contract", icon: <FileText size={28} /> },
  { name: "Family", icon: <User size={28} /> },
  { name: "Property", icon: <Shield size={28} /> }, 
  { name: "Labour", icon: <User size={28} /> },
  { name: "Cyber", icon: <Lock size={28} /> },
  { name: "Consumer", icon: <Shield size={28} /> },
];

const HELP_RESOURCES = [
  { title: "National Emergency", desc: "112 - Police, Fire, Ambulance", icon: <Phone size={24}/>, type: "urgent" },
  { title: "Women Helpline", desc: "1091 - Immediate assistance for women", icon: <ShieldAlert size={24}/>, type: "urgent" },
  { title: "Cyber Crime", desc: "1930 - Report online fraud immediately", icon: <Lock size={24}/>, type: "urgent" },
  { title: "Legal Aid Service", desc: "Free legal services by NALSA", icon: <Scale size={24}/>, type: "needed-soon" },
  { title: "Consumer Forum", desc: "File consumer complaints online", icon: <BriefcasePlaceholder/>, type: "needed-soon" },
  { title: "RTI Portal", desc: "File Right to Information requests", icon: <FileText size={24}/>, type: "needed-soon" },
  { title: "Know Your Rights", desc: "Simplified guides on basic laws", icon: <BookOpen size={24}/>, type: "learning" },
  { title: "Govt Schemes", desc: "Check eligibility for welfare", icon: <DollarSign/>, type: "learning" },
  { title: "Find a Lawyer", desc: "Directory of verified practitioners", icon: <User size={24}/>, type: "learning" },
];

export default function HomePage() {
  const [newsList, setNewsList] = useState([]);
  const [blogList, setBlogList] = useState([]);
  const [loading, setLoading] = useState(true);
const [actionGuides, setActionGuides] = useState([])



  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const newsRes = await axios.get('/news').catch(() => ({ data: [] }));
        const aiNewsRes = await axios.get('/ai/weekly-updates').catch(() => ({ data: [] }));
        const blogsRes = await axios.get('/blogs').catch(() => ({ data: [] }));
const guidesRes = await axios.get('/action-guides').catch(() => ({ data: [] })); // NEW FETCH

        const standardNews = Array.isArray(newsRes.data) ? newsRes.data : (newsRes.data?.items || []);
        const aiNews = Array.isArray(aiNewsRes.data) ? aiNewsRes.data : (aiNewsRes.data?.items || []);
        const blogs = Array.isArray(blogsRes.data) ? blogsRes.data : (blogsRes.data?.items || []);


        setNewsList([...aiNews, ...standardNews].slice(0, 6)); 
        setBlogList(blogs);
        setActionGuides(guidesRes.data);
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loading, newsList, blogList]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F5F1E8]"><Loader2 className="animate-spin text-[#B89A6A]" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#FBF8F2] font-sans text-[#785F3F] selection:bg-[#B89A6A]/30 relative overflow-x-hidden scrollbar-hide">
      <style>{`
        .watermark-bg { position: relative; overflow: hidden; }
        .watermark-bg::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background-image: url('/india-map-watermark.png');
          background-repeat: no-repeat; background-position: center; background-size: contain; opacity: 0.04;
          pointer-events: none; z-index: 0;
        }
        
        /* Entrance Animations */
        .reveal-on-scroll {
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        .reveal-on-scroll.revealed { opacity: 1; transform: translateY(0); }

        /* Story-Style Library Categories */
        .story-category .story-circle-container {
          transition: all 200ms ease-out;
        }
        .story-category:hover .story-circle-container {
          transform: scale(1.08) translateY(-4px);
          box-shadow: 0 15px 30px rgba(184, 154, 106, 0.2);
          background-color: #FFFFFF;
        }
        .story-circle-ring {
          position: absolute; inset: -4px; border-radius: 50%;
          border: 2px solid transparent; transition: all 200ms ease-out;
        }
        .story-category:hover .story-circle-ring {
          border-color: #B89A6A;
          box-shadow: 0 0 10px rgba(184, 154, 106, 0.3);
        }

        /* Stack of Newspapers */
        .newspaper-item {
          position: relative; z-index: 10;
          transition: transform 300ms ease, border-color 300ms ease;
          background: #FFFFFF;
        }
        .newspaper-item::before, .newspaper-item::after {
          content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: #FBF8F2; border: 1px solid #D2C4AE; border-radius: 14px;
          z-index: -1; transition: transform 300ms ease, border-color 300ms ease, background 300ms ease;
        }
        .newspaper-item::before { transform: translate(5px, 5px) rotate(1.5deg); }
        .newspaper-item::after { transform: translate(10px, 10px) rotate(3deg); z-index: -2; background: #E9E3D9; }
        
        .newspaper-item:hover { transform: translate(-4px, -4px); border-color: #B89A6A; }
        .newspaper-item:hover::before { transform: translate(8px, 8px) rotate(2.5deg); border-color: #B89A6A; }
        .newspaper-item:hover::after { transform: translate(16px, 16px) rotate(5deg); border-color: #B89A6A; }

        /* Overlapping Blogs Stack */
        .blog-stack-container {
          position: relative; width: 100%; max-width: 900px; margin: 0 auto; height: 500px;
          display: flex; justify-content: center; align-items: center;
        }
        .blog-stack-card {
          position: absolute;
          width: 340px; height: 460px;
          transition: all 500ms cubic-bezier(0.25, 1, 0.5, 1);
          background: #FFFFFF; border: 1px solid #D2C4AE; border-radius: 18px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05); cursor: pointer;
        }
        .blog-stack-card::before {
          content: ''; position: absolute; top: -1px; left: -1px; right: -1px; height: 4px;
          background: #B89A6A; border-top-left-radius: 18px; border-top-right-radius: 18px;
          transform: scaleX(0); transition: transform 300ms ease; transform-origin: center;
        }
        
        /* Initial Stacked State */
        .blog-stack-card:nth-child(1) { z-index: 30; transform: translateY(0) scale(1); }
        .blog-stack-card:nth-child(2) { z-index: 20; transform: translateY(15px) scale(0.95); opacity: 0.9; }
        .blog-stack-card:nth-child(3) { z-index: 10; transform: translateY(30px) scale(0.9); opacity: 0.8; }

        /* Fan Out on Hover */
        .blog-stack-container:hover .blog-stack-card:nth-child(1) { transform: translateX(-350px) rotate(-6deg) scale(1); }
        .blog-stack-container:hover .blog-stack-card:nth-child(2) { transform: translateX(0) translateY(-10px) scale(1.02); opacity: 1; z-index: 40; box-shadow: 0 20px 40px rgba(184,154,106,0.2); }
        .blog-stack-container:hover .blog-stack-card:nth-child(3) { transform: translateX(350px) rotate(6deg) scale(1); opacity: 1; }
        .blog-stack-container:hover .blog-stack-card::before { transform: scaleX(1); }

        /* Mobile Fallback for Blogs */
        @media (max-width: 1024px) {
          .blog-stack-container { display: flex; flex-direction: column; height: auto; gap: 24px; padding-bottom: 20px; }
          .blog-stack-card { position: static; width: 100%; height: auto; transform: none !important; opacity: 1 !important; }
        }

        /* Continuous Rotating Mirror Flip */
        .mirror-container { perspective: 1000px; }
        .mirror-inner {
          transition: transform 1s cubic-bezier(0.4, 0.0, 0.2, 1);
          transform-style: preserve-3d; position: relative; width: 100%; height: 100%;
        }
        .mirror-face {
          position: absolute; inset: 0; backface-visibility: hidden;
          display: flex; flex-direction: column;
        }
        .mirror-back { transform: rotateY(180deg); }
      `}</style>
     
      <LawyerExplained />
      <LawOfTheDay />
      <CitizenLibrary />

      <KnowWhatToDo guides={actionGuides} />

      <div className="bg-[#FBF8F2] border-t border-[#D2C4AE]/30">
        <SubmitStorySection />
        
        {/* News Section with Newspaper Stack */}
        <section className="py-20 container mx-auto px-4 border-t border-[#D2C4AE]/30 watermark-bg reveal-on-scroll">
          <div className="flex items-center gap-3 mb-3 relative z-10 justify-center md:justify-start">
            <h2 className="text-4xl md:text-5xl font-serif text-[#B89A6A] font-bold">News & Legal Updates</h2>
            <span className="bg-[#E9E3D9] text-[#785F3F] text-xs font-bold px-3 py-1.5 rounded-full border border-[#D2C4AE]">AI CURATED</span>
          </div>
          <p className="text-[#785F3F] mb-14 relative z-10 text-lg text-center md:text-left">
           Timely News and Insights to keep you aware and Updated  
          </p>
          
          {newsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-8 relative z-10">
                {newsList.map((item, index) => (
                    <div key={item._id || index} onClick={() => window.location.href = `/news/${item._id}`} className="newspaper-item border border-[#D2C4AE] p-7 rounded-[14px] flex flex-col cursor-pointer">
                        <div className="flex justify-between items-center mb-5 border-b border-[#E9E3D9] pb-3">
                            <h4 className="text-[11px] font-bold uppercase text-[#B89AAA] tracking-widest flex items-center gap-2">
                               <BookOpen size={14}/> Source
                            </h4>
                            {index === 0 && <span className="text-[10px] bg-[#8C2F2F]/10 text-[#8C2F2F] px-2 py-1 rounded-full font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#8C2F2F] rounded-full animate-pulse"></span> LATEST</span>}
                            {index !== 0 && <span className="text-[11px] text-[#D2C4AE] font-semibold">{new Date(item.date || item.createdAt || Date.now()).toLocaleDateString()}</span>}
                        </div>

                        <h3 className="text-xl font-serif font-bold leading-tight mb-3 text-[#785F3F] line-clamp-2">{item.title}</h3>
                        
                        <p className="text-base text-[#785F3F]/80 mb-6 line-clamp-3 leading-relaxed flex-1">
                          {item.summary || (item.content ? item.content.substring(0, 100) + '...' : '')}
                        </p>
                        
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-[#E9E3D9]">
                            <span className="text-[10px] font-bold bg-[#F5F1E8] text-[#B89A6A] px-2.5 py-1 rounded-md border border-[#D2C4AE]/50 uppercase tracking-widest">General Law</span>
                            <span className="text-xs font-bold text-[#B89A6A] flex items-center gap-1 uppercase tracking-widest group-hover:text-[#785F3F] transition-colors">
                                Read More →
                            </span>
                        </div>
                    </div>
                ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#E9E3D9] rounded-xl border border-[#D2C4AE] border-dashed relative z-10">
               <p className="text-[#785F3F] italic">The legal archive is updating...</p>
            </div>
          )}
        </section>
      </div>

      {/* Blogs Section with Overlapping Flashcards */}
      <section className="py-24 bg-[#E9E3D9]/30 border-t border-[#D2C4AE]/30 watermark-bg reveal-on-scroll overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-[#B89A6A] font-bold mb-4">Editorial Blogs</h2>
          <p className="text-[#785F3F] text-lg mb-16 max-w-2xl mx-auto">Hover to explore our latest long-form readings and deep legal dives.</p>
          
          {blogList.length > 0 ? (
            <div className="blog-stack-container">
              {blogList.slice(0, 3).map((blog, idx) => (
                <div key={blog._id} onClick={() => window.location.href = `/blogs/${blog._id}`} className="blog-stack-card flex flex-col overflow-hidden text-left">
                  
                  <div className="h-48 bg-[#E9E3D9] w-full relative shrink-0 border-b border-[#D2C4AE]/50">
                     <img src={blog.image || "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80"} alt="Blog" className="w-full h-full object-cover relative z-10" />
                  </div>
                  
                  <div className="p-8 flex flex-col flex-1 bg-[#FFFFFF]">
                    <div className="flex items-center gap-4 text-[10px] text-[#D2C4AE] mb-4 uppercase tracking-widest font-bold">
                       <span className="flex items-center gap-1"><User size={12}/> {blog.author || "Editorial"}</span>
                       <span>•</span>
                       <span>{new Date().toLocaleDateString()}</span>
                    </div>

                    <h3 className="text-2xl font-serif font-bold text-[#785F3F] mb-3 leading-snug line-clamp-2">{blog.title}</h3>
                    <p className="text-base text-[#785F3F]/80 mb-6 line-clamp-2 leading-relaxed flex-1">{blog.summary}</p>
                    
                    <div className="mt-auto flex items-center text-[#B89A6A] font-bold text-xs uppercase tracking-widest pt-4 border-t border-[#D2C4AE]/30">
                       Read Full Article →
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#785F3F] italic relative z-10">No blogs published yet.</p>
          )}
        </div>
      </section>

      <HelpResourcesSection />
    </div>
  );
}

const LawyerExplained = () => {
  const [current, setCurrent] = useState(0);
  const [heroData, setHeroData] = useState({ lawyers: LAWYER_CARDS });

  useEffect(() => {
    axios.get('/hero')
      .then(res => {
          if(res.data && res.data.lawyers && res.data.lawyers.length > 0) {
              setHeroData(res.data);
          }
      })
      .catch(err => console.error("Error fetching hero settings", err));
  }, []);

  const currentLawyer = heroData.lawyers[current];
  const getImgSrc = (img) => img?.startsWith('/uploads') ? `${BASE_URL}${img}` : img;

  return (
    <section className="relative w-full h-[650px] scrollbar-hide flex items-center justify-center bg-[#FBF8F2] border-b-[3px] border-[#B89A6A] overflow-hidden watermark-bg reveal-on-scroll">
      <div 
        className="absolute inset-0 h-[650px] scrollbar-hide bg-cover bg-center opacity-75 transition-all duration-700 z-0"
        style={{ backgroundImage: `url('${HeroBG}` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#504e4a] to-transparent z-0"></div>
      
      {/* 5. Flashcard size increased (max-w-6xl, p-12/p-16) */}
      <div className="relative z-10 w-full h-[550px] max-w-5xl px-4">
        <div className="bg-[#FFFFFF] border border-[#D2C4AE] shadow-[0_20px_50px_rgba(184,154,106,0.1)] rounded-[24px] p-6 md:p-16 relative h-[490px]">
          <div className={`flex flex-col md:flex-row items-center gap-2 md:gap-12 ${current % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
            <div className={`flex-1 text-center ${current % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
              <p className="text-sm md:text-2xl font-serif italic text-[#785F3F] mb-6 leading-tight">“{currentLawyer.quote}”</p>
              <h3 className="text-xl font-bold text-[#B89A6A]">{currentLawyer.name}</h3>
              <p className="text-sm text-[#D2C4AE] font-bold uppercase tracking-widest mb-5">{currentLawyer.title}</p>
              <p className="text-[#785F3F] leading-relaxed max-w-xl mx-auto md:mx-0 text-sm">{currentLawyer.desc}</p>
            </div>
            
            <div className="relative w-34 h-34 md:w-80 md:h-80 shrink-0 rounded-full border-[8px] border-[#E9E3D9] shadow-2xl overflow-hidden bg-[#E9E3D9]">
               <img src={getImgSrc(currentLawyer.image)} alt={currentLawyer.name} className="w-full h-full object-cover relative z-10" />
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-12">
          {heroData.lawyers.map((_, idx) => (
            <button 
              key={idx} onClick={() => setCurrent(idx)} 
              className={`h-3 rounded-full transition-all duration-300 ${current === idx ? 'w-12 bg-[#B89A6A]' : 'w-3 bg-[#D2C4AE] hover:bg-[#B89AAA]'}`} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const LawOfTheDay = () => {
  const [flipDegree, setFlipDegree] = useState(0);
  const [lawData, setLawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/ai/law-of-day')
      .then(res => { setLawData(res.data); setLoading(false); })
      .catch(err => { console.error("AI Error:", err); setLoading(false); });
  }, []);

  if (loading) return (
    <section className="py-24 bg-[#FBF8F2] flex justify-center px-4 watermark-bg reveal-on-scroll">
        <div className="w-full max-w-4xl h-[450px] flex flex-col items-center justify-center bg-[#E9E3D9] rounded-[24px] border border-[#D2C4AE] gap-4 shadow-sm relative z-10">
            <Loader2 className="animate-spin text-[#B89A6A]" size={40} />
            <p className="text-sm text-[#785F3F] font-serif tracking-widest">AI IS ANALYZING TODAY'S NEWS...</p>
        </div>
    </section>
  );

  const data = lawData || {
     title: "Legal Update Unavailable", summary: "Could not fetch updates.",
     whyItMatters: "System maintenance.", highlights: "N/A"
  };

  // 6. Continuous Rotating Mirror Flip
  const handleFlip = () => setFlipDegree(prev => prev + 180);

  return (
    <section className="py-24 bg-[#FBF8F2] flex justify-center px-4 watermark-bg reveal-on-scroll">
      <div className="w-full max-w-4xl h-[450px] cursor-pointer group relative z-10 mirror-container" onClick={handleFlip}>
        <div className="mirror-inner" style={{ transform: `rotateY(${flipDegree}deg)` }}>
          
          {/* Front Face (0deg offset) */}
          <div className="mirror-face bg-[#E9E3D9] border-[3px] border-[#B89A6A]/50 shadow-[0_20px_50px_rgba(184,154,106,0.15)] rounded-[24px] p-12 items-center justify-center text-center">
            <div className="flex items-center gap-2 mb-8">
                <Sparkles size={24} className="text-[#B89A6A] fill-[#B89A6A]" />
                <h4 className="text-base font-bold uppercase tracking-widest text-[#B89A6A]">Law of the Day</h4>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-[#785F3F] mb-8 leading-tight px-6">{data.title}</h2>
            <div className="px-8 py-3 bg-[#FBF8F2] rounded-full text-base font-bold text-[#785F3F] mb-10 border border-[#D2C4AE] shadow-sm">
               {data.highlights}
            </div>
            <p className="text-sm text-[#B89A6A] mt-auto transition-colors flex items-center gap-2 font-bold tracking-widest uppercase">
                CLICK TO REVEAL AI INSIGHT <Sparkles size={16}/>
            </p>
          </div>

          {/* Back Face (180deg offset) */}
          <div className="mirror-face mirror-back bg-[#FFFFFF] text-[#785F3F] border-[3px] border-[#B89A6A] shadow-[0_20px_50px_rgba(184,154,106,0.25)] rounded-[24px] p-10 items-center overflow-y-auto scrollbar-hide">
            <h3 className="text-2xl font-serif font-bold text-[#B89A6A] mb-4 flex items-center gap-2 shrink-0">
               <Sparkles className="w-6 h-6" /> AI Summary
            </h3>
            <p className="text-[#785F3F] text-center leading-relaxed text-lg mb-6 px-4">
              {data.summary}
            </p>
            <div className="w-full bg-[#E9E3D9]/50 py-5 px-6 rounded-xl border border-[#D2C4AE] text-center shrink-0 mb-8">
                <span className="text-xs font-bold uppercase text-[#B89A6A] block mb-3 tracking-widest">Why this matters to you</span>
                <span className="text-base text-[#785F3F] italic leading-relaxed font-serif">"{data.whyItMatters}"</span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); navigate('/news'); }} className="px-8 py-4 bg-[#B89A6A] text-[#F5F1E8] rounded-full text-sm font-bold tracking-wider hover:bg-[#785F3F] transition-all shadow-md shrink-0 uppercase">
                Read Full News in Portal →
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

const CitizenLibrary = () => (
  <section className="py-20 bg-[#FBF8F2] watermark-bg reveal-on-scroll">
    <div className="text-center mb-16 relative z-10">
      <h2 className="text-4xl md:text-5xl font-serif text-[#B89A6A] font-bold">Law Library</h2>
      <p className="text-[#785F3F] mt-4 text-lg">Your Digital Gateway to Legal Knowledge through Digital Law Library</p>
    </div>
    
    {/* 7. Story-Style Category Design */}
    <div className="relative z-10 w-full max-w-7xl mx-auto">
      <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-8 md:gap-10 px-4 md:px-8 lg:flex-wrap lg:justify-center lg:snap-none">
        {CITIZEN_CATS.map((cat, idx) => (
          <Link
            key={idx}
            to={`/law-library/citizens?category=${encodeURIComponent(cat.name)}+Law&sort=relevance&page=1`}
            className="flex flex-col items-center min-w-[100px] shrink-0 snap-center lg:snap-none group story-category"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className="relative w-24 h-24 md:w-28 md:h-28 mb-4">
              <div className="story-circle-ring"></div>
              <div className="story-circle-container w-full h-full rounded-full border border-[#D2C4AE] flex items-center justify-center text-[#B89A6A] bg-[#F5F1E8] relative z-10">
                {cat.icon}
              </div>
            </div>
            <span className="text-sm font-bold text-[#785F3F] text-center group-hover:text-[#B89A6A] transition-colors leading-snug">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

const KnowWhatToDo = ({ guides = [] }) => {
  const [selectedGuide, setSelectedGuide] = useState(null);

  // Global Chatbot Trigger (Does not navigate to /chatbot)
  const triggerChatbot = (e) => {
    e.preventDefault();
    setSelectedGuide(null); // Close modal if open
    window.dispatchEvent(new CustomEvent('open-global-chatbot'));
  };

  return (
    <>
      <section className="py-24 bg-[#E9E3D9]/50 border-y border-[#D2C4AE]/30 watermark-bg reveal-on-scroll">
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif text-[#B89A6A] font-bold mb-12 text-center md:text-left">Know What To Do</h2>
          
          <div className="flex overflow-x-auto gap-8 pb-8 scrollbar-hide snap-x">
            {guides.length > 0 ? guides.map((guide) => (
              <div key={guide._id} onClick={() => setSelectedGuide(guide)} className="snap-center min-w-[320px] bg-[#FFFFFF] border border-[#D2C4AE] rounded-[24px] p-10 hover:border-[#B89A6A] hover:shadow-[0_15px_35px_rgba(184,154,106,0.15)] hover:-translate-y-2 transition-all cursor-pointer group flex flex-col">
                <p className="text-[10px] font-bold text-[#B89A6A] uppercase mb-4 tracking-widest">Situation Guide</p>
                <h3 className="text-3xl font-serif font-bold text-[#785F3F] mb-4 group-hover:text-[#B89A6A] transition-colors">{guide.title}</h3>
                <p className="text-base text-[#785F3F]/80 leading-relaxed mb-8 flex-1">Tap to view step-by-step guidance on your immediate rights and required legal actions.</p>
                
                <span className="text-sm font-bold text-[#B89AAA] group-hover:text-[#B89A6A] flex items-center gap-2 transition-colors mt-auto uppercase tracking-widest">
                  FIND WHAT YOU NEED!<span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>
            )) : (
              <div className="text-[#785F3F] italic px-4">Loading situation guides...</div>
            )}
            
            {/* Direct Chatbot Card - No Link redirection */}
            <div onClick={triggerChatbot} className="snap-center min-w-[200px] flex items-center justify-center group cursor-pointer bg-[#F5F1E8] rounded-[24px] border-2 border-dashed border-[#B89A6A]/50 hover:bg-[#E9E3D9] hover:border-[#B89A6A] transition-colors p-8 text-center shadow-sm">
                <span className="text-[#785F3F] font-serif font-bold group-hover:text-[#B89A6A] transition-colors flex flex-col items-center gap-3 text-xl">
                   <Sparkles size={32} className="text-[#B89A6A]"/> Chat with<br/>AI Assistant
                </span>
            </div>
          </div>
        </div>
      </section>

      {/* Expanded Step-by-Step Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200">
           <div className="bg-[#FBF8F2] rounded-[24px] p-8 md:p-10 w-full max-w-2xl shadow-[0_30px_60px_rgba(0,0,0,0.3)] border border-[#B89A6A]/50 relative flex flex-col max-h-[90vh]">
             
             <button onClick={() => setSelectedGuide(null)} className="absolute top-6 right-6 text-[#D2C4AE] hover:text-[#785F3F] transition-colors p-2 bg-[#E9E3D9] rounded-full z-10">
               <X size={20}/>
             </button>
             
             <div className="overflow-y-auto pr-2 flex-1">
               <p className="text-[10px] font-bold text-[#B89A6A] uppercase mb-3 tracking-widest">Situation Guide</p>
               <h3 className="text-3xl md:text-4xl font-serif font-bold text-[#785F3F] mb-8 border-b border-[#D2C4AE]/50 pb-5 leading-tight">
                 {selectedGuide.title}
               </h3>
               
               <div className="space-y-6 mb-8">
                 {selectedGuide.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-5 items-start bg-[#FFFFFF] p-5 rounded-[16px] border border-[#D2C4AE]/50 shadow-sm">
                       <span className="shrink-0 w-8 h-8 rounded-full bg-[#B89A6A] text-white flex items-center justify-center font-bold text-sm shadow-md">{idx + 1}</span>
                       <p className="text-lg text-[#785F3F] leading-relaxed pt-0.5 font-medium">{step}</p>
                    </div>
                 ))}
               </div>
             </div>

             <div className="mt-6 pt-6 border-t border-[#D2C4AE]/50 shrink-0 text-center">
               <button onClick={triggerChatbot} className="inline-flex items-center gap-2 bg-[#333333] text-[#F5F1E8] hover:bg-[#B89A6A] transition-colors px-8 py-3.5 rounded-full font-bold uppercase tracking-widest text-sm shadow-md">
                  Know More <Sparkles size={16}/>
               </button>
             </div>
           </div>
        </div>
      )}
    </>
  );
};



const SubmitStorySection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: 'Other', location: '', story: '' });
  const [consentGiven, setConsentGiven] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [posting, setPosting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const navigate = useNavigate();

  const containsBadWords = (text) => {
      const badWords = ['fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'pussy', 'slut', 'whore', 'motherfucker', 'madarchod', 'bhenchod', 'chutiya', 'mc', 'bc', 'randi'];
      const lower = text.toLowerCase();
      return badWords.some(word => lower.includes(word));
  };

  const handleAnalyze = async () => {
    if (!formData.story.trim() || !formData.title.trim() || !consentGiven) return;
    
    if (containsBadWords(formData.title + " " + formData.story)) {
        setAnalysisResult({ 
            isToxic: true, 
            toxicReason: "Your content contains inappropriate or offensive language. Please remove profanity before posting." 
        });
        return;
    }

    setAnalyzing(true);
    try {
      const res = await axios.post('/ai/analyze-story', { 
          title: formData.title,
          text: formData.story 
      });
      setAnalysisResult(res.data);
    } catch (err) {
      console.error(err);
      alert("AI Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePost = async () => {
    if (!analysisResult) return;
    setPosting(true);
    try {
      // Syncing payload specifically with the expected fields of backend storyController.js
      await axios.post('/stories', {
        title: analysisResult.redactedTitle || formData.title, 
        content: formData.story, // Required by backend validator
        category: formData.category,
        location: formData.location || "India",
        consent: consentGiven // Required by backend validator
      });
      
      setIsModalOpen(false);
      setFormData({ title: '', category: 'Other', location: '', story: '' });
      setConsentGiven(false);
      setAnalysisResult(null);
      
      // Pass success message to YourVoice route
      navigate('/your-voice', { state: { message: "Thank you for sharing your story. Your voice can help others." } });
    } catch (err) {
      console.error("Post failed", err);
      alert(err.response?.data?.message || "Failed to save story.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
      <section className="py-24 flex justify-center bg-[#FBF8F2] relative watermark-bg px-4">
        <div className="w-full max-w-4xl bg-[#E9E3D9] rounded-[48px] p-12 md:p-16 relative overflow-hidden shadow-4xl border border-[#b09f81] text-center">
          <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`}}></div>
          <div className="relative z-10 flex flex-col items-center">
       <div className="hidden md:flex animate-right-pic mb-6 w-24 h-24 rounded-full bg-[#E9E3D9] border-2 border-[#B89A6A] shadow-sm items-center justify-center overflow-hidden">
                   <img 
                      src={stambhlogo} 
                      alt="Ashoka Emblem" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/E9E3D9/B89A6A?text=Emblem" }} 
                   />
                </div>


            <h2 className="text-4xl md:text-5xl font-serif mb-4 text-[#785F3F] font-bold">Submit Your Story</h2>
            <p className="text-[#785F3F]/80 mb-10 leading-relaxed text-lg max-w-xl mx-auto font-medium">
              A Respectful and Protected Environment for sharing Legal experiences that may Guide and Support other.
            </p>
            <button onClick={() => setIsModalOpen(true)} className="bg-[#333333] border border-transparent text-[#F5F1E8] px-8 py-4 rounded-full flex items-center gap-3 mx-auto font-bold tracking-wider text-sm uppercase shadow-lg hover:shadow-[0_0_15px_rgba(198,167,106,0.5)] hover:-translate-y-0.5 transition-all">
              <FileText size={18} /> Write Your Story
            </button>
          </div>
        </div>
      </section>
      
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-[#FBF8F2] rounded-[24px] p-8 md:p-10 w-full max-w-2xl relative shadow-[0_30px_60px_rgba(0,0,0,0.3)] border border-[#B89A6A]/50 flex flex-col max-h-[90vh]">
                  <div className="flex justify-between items-start mb-6 border-b border-[#D2C4AE]/50 pb-5 shrink-0">
                    <div>
                      <h3 className="text-3xl font-bold font-serif text-[#785F3F] mb-2">Share Your Experience</h3>
                      <p className="text-sm text-[#B89A6A] font-semibold flex items-center gap-2 uppercase tracking-widest"><Lock size={14} /> Identity remains anonymous</p>
                    </div>
                    <button onClick={() => { setIsModalOpen(false); setAnalysisResult(null); }} className="text-[#D2C4AE] hover:text-[#785F3F] transition-colors p-2 bg-[#E9E3D9] rounded-full">
                      <X size={20}/>
                    </button>
                  </div>

                  {!analysisResult ? (
                    <div className="flex flex-col flex-1 overflow-y-auto pr-2">
                      <div className="bg-[#E9E3D9] p-4 rounded-xl mb-6 text-sm text-[#785F3F] flex gap-3 border border-[#D2C4AE]">
                        <Shield size={20} className="shrink-0 mt-0.5 text-[#B89A6A]" />
                        <p className="leading-relaxed"><strong className="text-[#B89A6A]">Privacy First:</strong> Your identity is safe. Our AI will automatically remove names, phone numbers, and addresses before anyone sees this.</p>
                      </div>

                      <div className="flex flex-col gap-5 mb-6">
                        <div>
                          <label className="text-xs font-bold uppercase text-[#785F3F] mb-2 block tracking-widest">Story Title (Optional)</label>
                          <input 
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="E.g., Unfair dismissal at my workplace"
                            className="w-full border border-[#D2C4AE] bg-white p-4 rounded-xl focus:outline-none focus:border-[#B89A6A] focus:ring-1 focus:ring-[#B89A6A] text-[#785F3F] font-medium shadow-sm"
                          />
                        </div>
                        <div className="flex gap-4">
                           <div className="w-1/2">
                             <label className="text-xs font-bold uppercase text-[#785F3F] mb-2 block tracking-widest">Category (Optional)</label>
                             <select 
                               value={formData.category}
                               onChange={(e) => setFormData({...formData, category: e.target.value})}
                               className="w-full border border-[#D2C4AE] bg-white p-4 rounded-xl focus:outline-none focus:border-[#B89A6A] focus:ring-1 focus:ring-[#B89A6A] text-[#785F3F] font-medium shadow-sm"
                             >
                                {/* Synced perfectly with YourVoice.jsx Categories */}
                                <option value="Other">Select a category</option>
                                <option value="Workplace">Workplace & Labour</option>
                                <option value="Property">Property & Tenancy</option>
                                <option value="Consumer">Consumer Rights</option>
                                <option value="Cyber">Cyber & Privacy</option>
                                <option value="Other">Other</option>
                             </select>
                           </div>
                           <div className="w-1/2">
                             <label className="text-xs font-bold uppercase text-[#785F3F] mb-2 block tracking-widest">Location (Optional)</label>
                             <input 
                               type="text"
                               value={formData.location}
                               onChange={(e) => setFormData({...formData, location: e.target.value})}
                               placeholder="City/State"
                               className="w-full border border-[#D2C4AE] bg-white p-4 rounded-xl focus:outline-none focus:border-[#B89A6A] focus:ring-1 focus:ring-[#B89A6A] text-[#785F3F] font-medium shadow-sm"
                             />
                           </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase text-[#785F3F] mb-2 block tracking-widest">Your Story</label>
                          <textarea 
                            value={formData.story}
                            onChange={(e) => setFormData({...formData, story: e.target.value})}
                            placeholder="Share what happened..." 
                            className="w-full border border-[#D2C4AE] bg-white p-5 rounded-xl h-48 focus:outline-none focus:border-[#B89A6A] focus:ring-1 focus:ring-[#B89A6A] resize-none text-[#785F3F] text-base leading-relaxed shadow-sm" 
                          />
                        </div>
                      </div>
                      
                      {/* Consent Checkbox */}
                      <div className="flex items-start gap-4 mb-6 bg-[#F5F1E8] p-5 rounded-xl border border-[#D2C4AE]">
                        <input 
                          type="checkbox" 
                          id="consent" 
                          checked={consentGiven} 
                          onChange={(e) => setConsentGiven(e.target.checked)} 
                          className="mt-1 shrink-0 accent-[#B89A6A] w-5 h-5 cursor-pointer"
                        />
                        <label htmlFor="consent" className="text-sm text-[#785F3F] leading-relaxed cursor-pointer font-medium select-none">
                         I confirm this is a true personal experience.
I allow RightVerse to publish this story publicly for awareness purposes.
I consent to share this story anonymously.
                        </label>
                      </div>

                      <div className="mt-auto shrink-0 pb-2">
                        <button 
                          onClick={handleAnalyze} 
                          disabled={analyzing || !formData.story.trim() || !formData.title.trim() || !consentGiven}
                          className="w-full bg-[#333333] text-white py-4 rounded-full hover:bg-[#B89A6A] transition-all flex justify-center items-center gap-2 font-bold text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                           {analyzing ? <Loader2 className="animate-spin" size={20} /> : <><Sparkles size={18} className="text-[#C6A76A]"/> Analyze & Anonymize</>}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col flex-1 overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
                       {analysisResult.isToxic ? (
                         <div className="bg-[#8C2F2F]/10 border border-[#8C2F2F]/20 p-8 rounded-2xl mb-6 text-center shadow-inner">
                            <ShieldAlert size={48} className="text-[#8C2F2F] mx-auto mb-4" />
                            <h4 className="font-bold text-[#8C2F2F] text-2xl mb-2 font-serif">Content Flagged</h4>
                            <p className="text-base text-[#8C2F2F]/80 mb-6 font-medium">{analysisResult.toxicReason}</p>
                            <button onClick={() => setAnalysisResult(null)} className="mt-4 px-6 py-2.5 rounded-full border border-[#8C2F2F] text-sm font-bold text-[#8C2F2F] hover:bg-[#8C2F2F] hover:text-white transition-colors">Edit Story</button>
                         </div>
                       ) : (
                         <>
                           <div className="bg-[#E9E3D9] border border-[#D2C4AE] p-6 rounded-2xl mb-8 shadow-sm">
                              <h4 className="font-bold text-[#B89A6A] text-sm flex items-center gap-2 mb-3 uppercase tracking-widest">
                                <Sparkles size={16} className="text-[#B89A6A]"/> Legal Insight
                              </h4>
                              <p className="text-base text-[#785F3F] leading-relaxed font-medium">
                                "{analysisResult.insight}"
                              </p>
                           </div>

                           <label className="text-xs font-bold uppercase text-[#D2C4AE] mb-3 block tracking-widest">Public Preview (Anonymized)</label>
                           
                           <div className="bg-white border border-[#D2C4AE] p-6 rounded-2xl mb-8 shadow-inner overflow-y-auto max-h-56">
                              <h5 className="font-bold font-serif text-xl text-[#785F3F] mb-3 leading-snug">
                                {analysisResult.redactedTitle || formData.title}
                              </h5>
                              <p className="text-base text-[#785F3F]/90 leading-relaxed italic">
                                "{analysisResult.redactedStory}"
                              </p>
                           </div>

                           <div className="mt-auto grid grid-cols-2 gap-5 shrink-0 pb-2">
                             <button 
                               onClick={() => setAnalysisResult(null)} 
                               className="px-6 py-4 rounded-full border-2 border-[#D2C4AE] text-[#785F3F] hover:bg-[#E9E3D9] font-bold transition-colors uppercase tracking-widest text-sm"
                             >
                               Edit
                             </button>
                             <button 
                               onClick={handlePost} 
                               disabled={posting}
                               className="px-6 py-4 rounded-full bg-[#333333] text-white hover:bg-[#B89A6A] font-bold flex justify-center items-center gap-2 disabled:opacity-70 transition-colors uppercase tracking-widest text-sm shadow-md"
                             >
                               {posting ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle size={20} className="text-[#C6A76A]" /> Confirm Post</>}
                             </button>
                           </div>
                         </>
                       )}
                    </div>
                  )}
              </div>
          </div>
      )}
    </>
  );
};

const HelpResourcesSection = () => (
  <section className="py-24 bg-[#FBF8F2] watermark-bg reveal-on-scroll border-t border-[#D2C4AE]/50">
    <div className="container mx-auto px-4 relative z-10">
       <div className="bg-[#E9E3D9] rounded-[24px] p-10 md:p-16 shadow-[0_15px_40px_rgba(184,154,106,0.15)] border border-[#D2C4AE]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
             <div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#B89A6A] mb-4">Help & Resources</h2>
                <p className="text-[#785F3F] text-lg font-medium">Access essential legal helplines, government portals, and support resources.</p>
             </div>
             <Link to="/resources" className="bg-[#333333] text-white text-sm uppercase px-10 py-4 rounded-full font-bold hover:bg-[#B89A6A] transition-all shrink-0 tracking-widest text-center shadow-md">
                View All Resources →
             </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {HELP_RESOURCES.map((res, i) => {
                let colorClass = "text-[#785F3F] bg-[#F5F1E8] border-[#D2C4AE]";
                if (res.type === 'urgent') colorClass = "text-[#8C2F2F] bg-[#8C2F2F]/10 border-[#8C2F2F]/20";
                if (res.type === 'needed-soon') colorClass = "text-[#C6A76A] bg-[#C6A76A]/10 border-[#C6A76A]/20";
                if (res.type === 'learning') colorClass = "text-[#8FA79A] bg-[#8FA79A]/10 border-[#8FA79A]/20";

                return (
                  <Link to="/resources" key={i} className="flex items-center gap-5 bg-[#FFFFFF] p-6 rounded-[20px] border border-[#D2C4AE] hover:border-[#B89A6A] hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(184,154,106,0.15)] transition-all duration-300 cursor-pointer group">
                     <div className={`p-4 rounded-[16px] border ${colorClass} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                        {res.icon}
                     </div>
                     <div>
                        <h4 className="font-bold text-[#785F3F] text-xl mb-1 group-hover:text-[#B89A6A] transition-colors">{res.title}</h4>
                        <p className="text-[10px] text-[#D2C4AE] uppercase tracking-widest font-bold">
                           {res.type === 'urgent' && 'Emergency Contact'}
                           {res.type === 'needed-soon' && 'Action Portal'}
                           {res.type === 'learning' && 'Educational Resource'}
                        </p>
                     </div>
                  </Link>
                );
             })}
          </div>
       </div>
    </div>
  </section>
);