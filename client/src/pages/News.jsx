import React, { useState, useEffect } from 'react';
import axios, { BASE_URL } from '../utils/axios';
import { Search, Clock, ArrowRight, TrendingUp, Loader2, Sparkles, Scale, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function News() {
  const [searchTerm, setSearchTerm] = useState("");
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/ai/weekly-updates')
      .then(res => {
        setNewsList(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching news:", err);
        setLoading(false);
      });
  }, []);

  const highlightNews = newsList.length > 0 ? newsList[0] : null;
  const sideNews = newsList.length > 1 ? newsList.slice(1, 4) : [];

  const filteredSideNews = sideNews.filter(n => 
    n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLegalImage = (index) => {
    const images = [
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800", 
      "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=800", 
      "https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?auto=format&fit=crop&q=80&w=800", 
      "https://images.unsplash.com/photo-1555374018-13a8994ab246?auto=format&fit=crop&q=80&w=800"  
    ];
    return images[index % images.length];
  };

  const resolveImage = (imgPath, index) => {
    if (!imgPath) return getLegalImage(index);
    if (imgPath.startsWith('http') || imgPath.startsWith('data:')) return imgPath;
    const rootUrl = BASE_URL ? BASE_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000';
    return `${rootUrl}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F5F1E8]"><Loader2 className="animate-spin text-[#B89A6A]" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-8 px-4 font-sans text-[#785F3F] relative overflow-hidden">
      <style>{`
        .watermark-bg::before {
          content: ''; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background-image: url('/india-map-watermark.png');
          background-repeat: no-repeat; background-position: center; background-size: cover; opacity: 0.05;
          pointer-events: none; z-index: 0;
        }

        /* 6. Hero Entrance Animation */
        @keyframes heroEntrance {
          from { opacity: 0; transform: scale(1.02); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-hero {
          animation: heroEntrance 0.8s ease-out forwards;
        }

        /* 7. News List Stagger */
        @keyframes staggerRise {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-stagger {
          opacity: 0;
          animation: staggerRise 0.6s ease-out forwards;
        }

        /* 1. Hero News Card (Main Story) Interaction */
        .hero-img { transition: transform 600ms ease-out; }
        .hero-card:hover .hero-img { transform: scale(1.04); }
        
        .hero-overlay { transition: background-color 600ms ease-out; background-color: rgba(0,0,0,0.4); }
        .hero-card:hover .hero-overlay { background-color: rgba(0,0,0,0.45); }
        
        .hero-headline { transition: text-shadow 300ms ease-out; }
        .hero-card:hover .hero-headline { text-shadow: 0 0 15px rgba(255,255,255,0.4); }

        /* 2. Law of the Day Tag Interaction */
        .law-tag { transition: filter 300ms ease, background-color 300ms ease; }
        .hero-card:hover .law-tag { filter: brightness(1.1); background-color: #A63B3B; }

        /* 4. Legal Insight Section Interaction */
        .insight-box { transition: all 300ms ease; }
        .hero-card:hover .insight-box {
          box-shadow: 0 8px 20px rgba(184,154,106,0.25);
          border-color: #B89A6A;
          border-left-width: 8px; /* Slight growth to emphasize */
        }

        /* 5. Read Full Legal Analysis Link */
        .read-link {
          position: relative;
          display: inline-flex;
          align-items: center;
        }
        .read-link::after {
          content: ''; position: absolute; left: 0; bottom: -2px; height: 2px; width: 100%;
          background: #B89A6A; transform: scaleX(0); transform-origin: left; transition: transform 300ms ease-out;
        }
        .hero-card:hover .read-link::after { transform: scaleX(1); }
        
        .read-arrow { transition: transform 300ms ease-out; }
        .hero-card:hover .read-arrow { transform: translateX(4px); }

        /* 3. Side News List */
        .side-card { transition: all 300ms ease-out; }
        .side-card:hover {
          transform: translateY(-3px);
          background-color: #FBF8F2; /* Subtle background tint */
          border-color: #B89A6A;
          box-shadow: 0 8px 20px rgba(184,154,106,0.15);
        }
        .side-img { transition: transform 500ms ease-out; }
        .side-card:hover .side-img { transform: scale(1.05); }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .mobile-stack-img { display: block; width: 100%; height: 200px; }
          .hero-img-container { height: 280px; }
        }
      `}</style>
      
      {/* Header Area */}
      <div className="container mx-auto pt-8 pb-10 max-w-7xl relative z-10 watermark-bg">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-4 mb-3">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#B89A6A] tracking-wide">Legal Newsroom</h1>
                <span className="bg-[#E9E3D9] text-[#785F3F] text-xs font-bold px-3 py-1.5 rounded-full border border-[#D2C4AE] flex items-center gap-1.5 shadow-sm uppercase tracking-widest shrink-0">
                    <Sparkles size={14} className="text-[#B89A6A]" /> AI Curated
                </span>
            </div>
            <p className="text-[#785F3F] text-lg max-w-2xl">Daily legal updates, court verdicts, and rights awareness — simplified by AI.</p>
          </div>

         
        </div>
      </div>

      {/* 8. Mobile Responsiveness (Grid Layout) */}
      <section className="container mx-auto max-w-7xl mb-16 relative z-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Main Hero Card (Left on Desktop, Top on Tablet/Mobile) */}
          <div className="flex-1 lg:w-2/3">
            {highlightNews && (
              <Link to={`/news/${highlightNews._id}`} className="block h-full hero-card group">
                <div className="bg-[#FBF8F2] border border-[#D2C4AE] rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(120,95,63,0.05)] transition-all duration-300 h-full flex flex-col animate-hero">
                    
                    {/* Hero Image Container */}
                    <div className="hero-img-container h-[350px] md:h-[450px] overflow-hidden relative bg-[#D2C4AE]">
                        <img 
                            src={resolveImage(highlightNews.imageUrl || highlightNews.image, 0)} 
                            alt="Highlight" 
                            className="hero-img w-full h-full object-cover opacity-90 group-hover:opacity-100"
                        />
                        <div className="hero-overlay absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/40 to-transparent"></div>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 z-10">
                            <span className="law-tag bg-[#8C2F2F] text-[#F5F1E8] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block shadow-md">
                                Law of the Day
                            </span>
                            <h2 className="hero-headline text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#FBF8F2] leading-tight drop-shadow-md mb-4">
                                {highlightNews.title}
                            </h2>
                            <div className="flex items-center gap-2 text-[#E9E3D9] text-sm font-bold tracking-wide uppercase">
                                <Clock size={14} /> {new Date(highlightNews.date || highlightNews.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                        </div>
                    </div>
                    
                    {/* Hero Content Box */}
                    <div className="p-8 md:p-10 flex flex-col flex-1 bg-[#FBF8F2] relative">
                        {/* 4. Legal Insight Block */}
                        <div className="insight-box bg-[#E9E3D9] border border-[#D2C4AE] border-l-[6px] border-l-[#B89A6A] p-6 mb-8 rounded-r-[16px]">
                             <span className="font-bold text-[#785F3F] block text-xs uppercase mb-3 flex items-center gap-2 tracking-widest">
                               <Scale size={16} className="text-[#B89A6A]"/> AI Key Insight
                             </span>
                             <p className="text-lg md:text-xl leading-relaxed font-serif text-[#785F3F] italic">"{highlightNews.highlights}"</p>
                        </div>

                        <p className="text-[#785F3F] text-lg leading-relaxed mb-8 line-clamp-3 flex-1 md:line-clamp-none">
                            {highlightNews.summary}
                        </p>
                        
                        {/* 5. Read Link Interaction */}
                        <div className="mt-auto flex items-center text-[#B89A6A] font-bold uppercase tracking-widest text-sm pt-4 border-t border-[#D2C4AE]/50">
                            <span className="read-link">Read Full Legal Analysis</span> <ArrowRight size={18} className="read-arrow ml-2" />
                        </div>
                    </div>
                </div>
              </Link>
            )}
          </div>

          {/* Side News List (Right on Desktop, Below on Tablet/Mobile) */}
          <div className="w-full lg:w-1/3 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#D2C4AE]">
              <TrendingUp className="text-[#B89A6A]" size={22} />
              <h3 className="text-2xl font-serif font-bold text-[#785F3F]">More Developments</h3>
            </div>

            <div className="flex flex-col gap-6 flex-1">
                {filteredSideNews.length > 0 ? filteredSideNews.map((news, idx) => (
                <Link to={`/news/${news._id}`} key={news._id} className="animate-stagger group block flex-1" style={{ animationDelay: `${idx * 70}ms` }}>
                    {/* 3. Side News Card */}
                    <div className="side-card flex flex-col md:flex-row lg:flex-row gap-5 items-start p-5 bg-[#E9E3D9] border border-[#D2C4AE] rounded-[20px] cursor-pointer h-full">
                        
                        {/* Thumbnail */}
                        <div className="h-48 w-full md:h-28 md:w-28 lg:h-28 lg:w-28 shrink-0 rounded-[12px] overflow-hidden bg-[#D2C4AE] relative mobile-stack-img">
                           <img 
                               src={resolveImage(news.imageUrl || news.image, idx + 1)} 
                               alt="Thumbnail" 
                               className="side-img w-full h-full object-cover opacity-90 group-hover:opacity-100"
                           />
                        </div>
                        
                        {/* Content */}
                        <div className="flex flex-col justify-between flex-1 h-full py-1">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-[10px] font-bold bg-[#FBF8F2] text-[#B89A6A] px-2.5 py-1 rounded border border-[#B89A6A]/30 uppercase tracking-widest shadow-sm">
                                      Update
                                    </span>
                                    <span className="text-[11px] text-[#D2C4AE] font-bold flex items-center gap-1.5 uppercase tracking-wider">
                                        <Clock size={12} /> {new Date(news.date || news.createdAt || Date.now()).toLocaleDateString()}
                                    </span>
                                </div>
                                <h4 className="text-lg md:text-base lg:text-base font-bold font-serif text-[#785F3F] leading-snug line-clamp-3 group-hover:text-[#B89A6A] transition-colors">
                                    {news.title}
                                </h4>
                            </div>
                        </div>
                    </div>
                </Link>
                )) : (
                <div className="p-12 text-center border-2 border-dashed border-[#D2C4AE] rounded-[24px] flex-1 flex flex-col items-center justify-center bg-[#E9E3D9] opacity-70">
                    <BookOpen className="mx-auto text-[#D2C4AE] mb-4" size={32}/>
                    <p className="text-[#785F3F] font-serif font-bold text-lg">No other updates found.</p>
                </div>
                )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}