import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Calendar, User, ArrowRight, Loader2, BookOpen } from 'lucide-react';

export default function Blogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [navigatingId, setNavigatingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/blogs')
      .then(res => {
        setArticles(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // 12. Scroll Reveal Observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loading, articles, searchTerm]);

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleArticleClick = (e, id) => {
    e.preventDefault();
    setNavigatingId(id);
    // 9. Blog Card Click Transition (Wait for animation before navigating)
    setTimeout(() => {
      navigate(`/blogs/${id}`);
    }, 400); 
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF8F2] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/india-map-watermark.png')] bg-no-repeat bg-center bg-cover opacity-5 pointer-events-none"></div>
      <div className="flex flex-col items-center">
        <Loader2 className="animate-spin text-[#B89A6A] relative z-10 mb-4" size={48} />
        <p className="text-[#B89A6A] font-bold tracking-widest uppercase text-sm animate-pulse">Loading Editorial...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBF8F2] py-12 px-4 font-sans text-[#785F3F] relative overflow-hidden">
      
      <style>{`
        .watermark-bg::before {
          content: ''; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background-image: url('/india-map-watermark.png');
          background-repeat: no-repeat; background-position: center top; background-size: cover; opacity: 0.04;
          pointer-events: none; z-index: 0;
        }

        /* 13. Image Loading Interaction (Soft Shimmer) */
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .skeleton-shimmer {
          background: #E9E3D9;
          background-image: linear-gradient(to right, #E9E3D9 0%, #F5F1E8 20%, #E9E3D9 40%, #E9E3D9 100%);
          background-repeat: no-repeat; background-size: 1000px 100%;
          animation: shimmer 2s infinite linear forwards;
        }

        /* 5 & 12. Entrance Animation & Scroll Reveal */
        .scroll-reveal {
          opacity: 0; transform: translateY(30px);
          transition: opacity 600ms ease-out, transform 600ms ease-out;
        }
        .scroll-reveal.revealed {
          opacity: 1; transform: translateY(0);
        }

        /* 1. Blog Card Hover (Editorial Lift) */
        .blog-card {
          position: relative;
          transition: transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 300ms cubic-bezier(0.2, 0.8, 0.2, 1);
          border-radius: 18px;
          background: #FFFFFF;
          border: 1px solid #D2C4AE;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 15px rgba(120,95,63,0.05); /* Soft base shadow */
        }
        
        /* 11. Subtle Editorial Accent */
        .blog-card::before {
          content: ''; position: absolute; top: -1px; left: -1px; right: -1px; height: 3px;
          background: #B89A6A; transform: scaleX(0); transition: transform 300ms ease-out;
          transform-origin: center; z-index: 20; border-top-left-radius: 18px; border-top-right-radius: 18px;
        }
        
        .blog-card-wrapper:hover .blog-card {
          transform: translateY(-6px);
          box-shadow: 0 25px 50px rgba(120,95,63,0.25); /* +25% deepen */
        }
        .blog-card-wrapper:hover .blog-card::before {
          transform: scaleX(1);
        }
        
        /* 2. Image Parallax Micro-Motion */
        .blog-img-container {
          overflow: hidden;
          border-top-left-radius: 17px;
          border-top-right-radius: 17px;
        }
        .blog-img {
          transition: transform 400ms cubic-bezier(0.25, 1, 0.5, 1);
        }
        .blog-card-wrapper:hover .blog-img {
          transform: translateY(-4px) scale(1.05);
        }
        
        /* 4. Author & Date Micro-Interaction */
        .meta-text {
          color: #D2C4AE;
          transition: color 300ms ease;
        }
        .blog-card-wrapper:hover .meta-text {
          color: #785F3F; /* Darkens slightly */
        }
        
        /* 3. Read Article Link Interaction */
        .read-more {
          position: relative;
          display: inline-flex;
          align-items: center;
        }
        .read-more::after {
          content: ''; position: absolute; left: 0; bottom: -2px; width: 100%; height: 2px;
          background: #B89A6A; transform: scaleX(0); transform-origin: left; transition: transform 300ms ease;
        }
        .blog-card-wrapper:hover .read-more::after {
          transform: scaleX(1); /* Underline grows */
        }
        .read-arrow {
          transition: transform 300ms ease;
        }
        .blog-card-wrapper:hover .read-arrow {
          transform: translateX(3px); /* Arrow slides right */
        }
        
        /* 6. Search Bar Interaction */
        .search-input {
          transition: all 300ms ease;
        }
        .search-input:focus {
          border-color: #B89A6A;
          box-shadow: 0 0 20px rgba(184,154,106,0.2);
        }
        .search-input:focus + .search-icon {
          color: #B89A6A;
          filter: brightness(1.2);
        }

        /* 9. Blog Card Click Transition */
        .click-transition .blog-card {
          animation: clickAnim 400ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes clickAnim {
          0% { transform: scale(1); opacity: 1; }
          30% { transform: scale(0.98); opacity: 0.9; }
          100% { transform: scale(1.02); opacity: 0; }
        }
      `}</style>
      
      <div className="container mx-auto text-center mb-12 max-w-3xl relative z-10 watermark-bg">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#B89A6A] mb-6 tracking-wide drop-shadow-sm">
          Awareness Blogs
        </h1>
        <p className="text-[#785F3F] text-lg md:text-xl leading-relaxed font-medium px-4">
          Learn your rights, legal processes, and important information through expertly crafted editorial articles.
        </p>
      </div>

      <div className="container mx-auto mb-16 max-w-3xl relative z-10 watermark-bg px-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search for articles (e.g. Rights, FIR, Property)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input w-full pl-8 pr-16 py-5 rounded-full border border-[#D2C4AE] focus:outline-none bg-[#FFFFFF] text-[#785F3F] placeholder-[#D2C4AE] text-lg font-medium shadow-sm"
          />
          <Search className="search-icon absolute right-6 top-1/2 -translate-y-1/2 text-[#D2C4AE] transition-all duration-300" size={24} />
        </div>
      </div>

      <section className="container mx-auto max-w-7xl relative z-10 watermark-bg px-4">
        {/* 7 & 10. Grid Responsiveness & Density Balance */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-16 ${filteredArticles.length < 3 ? 'justify-center max-w-4xl mx-auto' : ''}`}>
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article, index) => (
              <div 
                key={article._id} 
                className={`scroll-reveal blog-card-wrapper cursor-pointer h-full ${navigatingId === article._id ? 'click-transition' : ''}`}
                style={{ transitionDelay: `${index * 80}ms` }} /* 5. Stagger 80ms */
                onClick={(e) => handleArticleClick(e, article._id)}
              >
                <div className="blog-card">
                  
                  {/* Image Top Crop */}
                  <div className="h-64 overflow-hidden relative bg-[#E9E3D9] blog-img-container shrink-0 border-b border-[#D2C4AE]/50">
                    <div className="absolute inset-0 skeleton-shimmer z-0" id={`skel-${article._id}`}></div>
                    <img 
                      src={article.image || "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800"} 
                      alt={article.title} 
                      className="blog-img w-full h-full object-cover relative z-10 opacity-0 transition-opacity duration-500"
                      onLoad={(e) => {
                        e.target.style.opacity = '1';
                        const skel = document.getElementById(`skel-${article._id}`);
                        if (skel) skel.style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Content Area */}
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-5 text-[11px] mb-5 uppercase tracking-widest font-bold meta-text">
                      <span className="flex items-center gap-1.5"><User size={14} /> {article.author || "Editorial"}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={14} /> {article.date || new Date().toLocaleDateString()}</span>
                    </div>

                    <h3 className="text-2xl font-serif font-bold text-[#785F3F] mb-4 leading-snug line-clamp-3">
                      {article.title}
                    </h3>

                    <p className="text-[#785F3F]/80 text-base leading-relaxed mb-8 line-clamp-2 font-medium flex-1">
                      {article.summary || article.content?.substring(0, 100) + '...'}
                    </p>

                    <div className="mt-auto flex items-center text-[#B89A6A] font-bold text-[13px] tracking-widest uppercase border-t border-[#D2C4AE]/40 pt-5">
                      <span className="read-more">Read Article</span> <ArrowRight size={16} className="read-arrow ml-2" />
                    </div>
                  </div>

                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-24 bg-[#E9E3D9] border-2 border-dashed border-[#D2C4AE] rounded-[24px] shadow-sm">
              <BookOpen className="mx-auto text-[#D2C4AE] mb-5" size={56}/>
              <h3 className="text-3xl font-serif font-bold text-[#785F3F] mb-3">No articles found</h3>
              <p className="text-[#B89A6A] text-lg font-medium">Try adjusting your search terms.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}