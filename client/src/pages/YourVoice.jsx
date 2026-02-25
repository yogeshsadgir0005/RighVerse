import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, Heart, Share2, Shield, MapPin, Calendar, Search, 
  X, Loader2, Sparkles, Feather, PenTool, Lock, CheckCircle 
} from 'lucide-react';

const CATEGORIES = ["All", "Workplace", "Property", "Consumer", "Cyber", "Other"];

export default function YourVoice() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Expanded Story Modal State
  const [expandedStory, setExpandedStory] = useState(null);

  // Success Message State (from Redirection)
  const location = useLocation();
  const navigate = useNavigate();
  const [toastMsg, setToastMsg] = useState(location.state?.message || null);

  useEffect(() => {
    fetchStories();
    if (location.state?.message) {
      window.history.replaceState({}, document.title);
      setTimeout(() => setToastMsg(null), 5000);
    }
  }, [location.state]);

  const fetchStories = async () => {
    try {
      const res = await axios.get('/stories');
      setStories(res.data);
    } catch (err) {
      console.error("Error fetching stories:", err);
    } finally {
      setLoading(false);
    }
  };

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
  }, [loading, stories, activeCategory, searchQuery]);

  // Filtering Logic (Search + Category)
  const filteredStories = stories.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.redactedBody && s.redactedBody.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Fallback "General" to "Other" for filtering purposes if it doesn't match predefined categories
    const storyCat = s.category && s.category !== "General" ? s.category : "Other";
    const matchesCat = activeCategory === 'All' || storyCat.includes(activeCategory);
    
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#F5F1E8] font-sans text-[#785F3F] relative overflow-hidden flex flex-col">
      <style>{`
        .watermark-bg::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background-image: url('/india-map-watermark.png');
          background-repeat: no-repeat; background-position: center; background-size: cover; opacity: 0.05;
          pointer-events: none; z-index: 0;
        }
        
        .warm-glow-bg {
          background: radial-gradient(circle at center, rgba(184,154,106,0.05) 0%, #F5F1E8 70%);
        }

        @keyframes fadeRise {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-reveal { animation: fadeRise 500ms ease-out forwards; }

        .scroll-reveal {
          opacity: 0; transform: translateY(20px);
          transition: opacity 500ms ease-out, transform 500ms ease-out;
        }
        .scroll-reveal.revealed { opacity: 1; transform: translateY(0); }

        /* Story Card Hover Interaction */
        .story-card {
          transition: transform 200ms ease-out, box-shadow 200ms ease-out, border-color 200ms ease-out;
        }
        .story-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(184, 154, 106, 0.2);
          border-color: #B89A6A;
        }

        .category-tag { transition: background-color 200ms ease, color 200ms ease; }
        .story-card:hover .category-tag { background-color: #E9E3D9; color: #333333; }

        .micro-icon { transition: transform 200ms ease; }
        .story-card:hover .micro-icon { transform: scale(1.1); }

        .action-btn { opacity: 0.6; transition: all 200ms ease; }
        .story-card:hover .action-btn { opacity: 1; }
        .action-btn.support svg { transition: fill 200ms ease; }
        .action-btn.support:hover svg { fill: currentColor; color: #8C2F2F; }
        .action-btn.share svg { transition: transform 200ms ease; }
        .action-btn.share:hover svg { transform: translateX(2px); color: #B89A6A; }

        .search-input { transition: border-color 200ms ease, box-shadow 200ms ease; }
        .search-input:focus {
          border-color: #B89A6A;
          box-shadow: 0 0 10px rgba(184,154,106,0.2);
        }
        .search-input:focus + .search-icon { color: #B89A6A; }
        .search-input:focus::placeholder { opacity: 0.5; }

        .modal-overlay {
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          animation: fadeIn 200ms ease-out forwards;
        }
        .modal-content { animation: modalScale 200ms ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalScale { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .toast-message { animation: slideDown 300ms ease-out forwards; }
      `}</style>
      
      {toastMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#E9E3D9] border border-[#B89A6A] text-[#785F3F] px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2 toast-message">
          <CheckCircle size={18} className="text-[#B89A6A]" /> {toastMsg}
        </div>
      )}

      {/* Page Header / Slogan */}
      <div className="relative z-10 pt-20 pb-10 px-4 text-center hero-reveal watermark-bg">
         <h1 className="text-5xl md:text-6xl font-serif text-[#B89A6A] mb-4 drop-shadow-sm">Your Voice</h1>
         <p className="text-[#785F3F] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
           A safe, AI-protected space to share your legal experiences, find solidarity, and learn from the community.
         </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-6xl mx-auto px-4 py-8 relative z-10 warm-glow-bg w-full">
        
        {/* Search & Filters */}
        <div className="max-w-3xl mx-auto mb-16 scroll-reveal">
           <div className="relative mb-6">
             <input 
               type="text" 
               placeholder="Search stories by keyword..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="search-input w-full pl-14 pr-6 py-4 rounded-full border border-[#D2C4AE] bg-[#FBF8F2] text-[#785F3F] placeholder-[#D2C4AE] text-lg outline-none"
             />
             <Search className="search-icon absolute left-6 top-1/2 -translate-y-1/2 text-[#D2C4AE]" size={20} />
           </div>

           {/* Category Pill Filters */}
           <div className="flex flex-wrap justify-center gap-3">
             {CATEGORIES.map(cat => (
               <button
                 key={cat}
                 onClick={() => setActiveCategory(cat)}
                 className={`px-5 py-2 rounded-full text-xs md:text-sm font-bold tracking-wider transition-all duration-200 uppercase ${
                   activeCategory === cat 
                     ? 'bg-[#B89A6A] text-[#F5F1E8] shadow-md border border-[#B89A6A]' 
                     : 'bg-[#E9E3D9] text-[#785F3F] border border-[#D2C4AE] hover:bg-[#FBF8F2] hover:border-[#B89A6A]'
                 }`}
               >
                 {cat}
               </button>
             ))}
           </div>
        </div>

        {/* Stories Grid */}
        {loading ? (
           <div className="text-center py-24 text-[#B89A6A] font-bold text-lg animate-pulse flex flex-col items-center">
             <Loader2 className="animate-spin mb-4" size={32}/> Loading Community Voices...
           </div>
        ) : filteredStories.length === 0 ? (
           <div className="text-center py-24 bg-[#E9E3D9] rounded-[24px] border-2 border-dashed border-[#D2C4AE] shadow-sm max-w-2xl mx-auto scroll-reveal">
             <MessageSquare size={48} className="mx-auto text-[#D2C4AE] mb-5"/>
             <h3 className="text-2xl font-serif font-bold text-[#785F3F] mb-2">No stories found</h3>
             <p className="text-[#B89A6A] text-lg">Try adjusting your filters or be the first to share a story.</p>
           </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12 ${filteredStories.length < 3 ? 'justify-center max-w-4xl mx-auto' : ''}`}>
            {filteredStories.map((story, index) => (
              <div 
                key={story._id} 
                className="scroll-reveal" 
                style={{ animationDelay: `${(index % 3) * 80}ms` }}
                onClick={() => setExpandedStory(story)}
              >
                <StoryCard data={story} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Story Modal */}
      {expandedStory && (
        <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-4">
          <div className="modal-content bg-[#FBF8F2] rounded-[20px] p-8 md:p-10 w-full max-w-2xl relative shadow-[0_30px_60px_rgba(0,0,0,0.3)] border border-[#B89A6A]/50 flex flex-col max-h-[90vh] overflow-y-auto">
            <button onClick={() => setExpandedStory(null)} className="absolute top-6 right-6 text-[#D2C4AE] hover:text-[#785F3F] transition-colors p-2 bg-[#E9E3D9] rounded-full"><X size={20}/></button>
            <div className="mb-6 pr-12">
               <span className="inline-block bg-[#E9E3D9] text-[#B89A6A] border border-[#D2C4AE] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-4">{expandedStory.category || "General"}</span>
               <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#785F3F] leading-tight mb-4">{expandedStory.title}</h2>
               <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-[#D2C4AE] uppercase tracking-wide">
                 <span className="flex items-center gap-1.5"><Shield size={14} className="text-[#B89A6A]"/> Anonymous</span>
                 <span className="flex items-center gap-1.5"><MapPin size={14}/> {expandedStory.location}</span>
                 <span className="flex items-center gap-1.5"><Calendar size={14}/> {new Date(expandedStory.createdAt).toLocaleDateString()}</span>
               </div>
            </div>
            <div className="bg-white border border-[#D2C4AE] p-6 rounded-[16px] mb-8">
              <p className="text-[#785F3F] text-lg leading-relaxed whitespace-pre-wrap">{expandedStory.redactedBody}</p>
            </div>
            {expandedStory.insight && (
              <div className="bg-[#E9E3D9] p-6 rounded-[16px] border border-[#D2C4AE]/50">
                 <div className="flex items-start gap-3">
                    <div className="mt-1.5 min-w-[4px] h-8 bg-[#B89A6A] rounded-full"></div>
                    <div>
                      <p className="text-xs font-bold text-[#B89A6A] uppercase mb-2 tracking-widest flex items-center gap-1"><Sparkles size={12} /> AI Legal Insight</p>
                      <p className="text-base text-[#785F3F] font-medium leading-snug">{expandedStory.insight}</p>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StoryCard({ data }) {
  const dateStr = new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  // Local state to handle likes instantly in the UI
  const [supports, setSupports] = useState(data.supports || 0);
  const [hasSupported, setHasSupported] = useState(false);

  const handleSupport = async (e) => {
    e.stopPropagation(); // Prevents the card from expanding when clicking the button
    if (hasSupported) return; // Prevent multiple clicks in one session
    
    // Optimistically update UI
    setSupports(prev => prev + 1);
    setHasSupported(true);

    try {
      await axios.put(`/stories/${data._id}/support`);
    } catch (err) {
      console.error("Failed to support story:", err);
      // Revert UI if the API call fails
      setSupports(prev => prev - 1);
      setHasSupported(false);
    }
  };

  return (
    <div className="story-card bg-[#FBF8F2] rounded-[20px] border border-[#D2C4AE] flex flex-col h-full cursor-pointer relative overflow-hidden">
      <div className="p-8 pb-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-5">
           <span className="category-tag bg-[#E9E3D9] text-[#B89AAA] border border-[#D2C4AE] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
             {data.category || "General"}
           </span>
           <span className="text-xs text-[#D2C4AE] font-bold flex items-center gap-1.5 uppercase tracking-wide">
             <Calendar size={12}/> {dateStr}
           </span>
        </div>
        
        <h3 className="text-2xl font-serif font-bold text-[#785F3F] leading-tight mb-4">{data.title}</h3>
        
        <div className="flex items-center gap-4 text-xs font-bold text-[#D2C4AE] mb-5 uppercase tracking-wide">
           <span className="flex items-center gap-1.5"><Shield size={14} className="text-[#B89AAA] micro-icon"/> Anonymous</span>
           <span className="flex items-center gap-1.5"><MapPin size={14} className="micro-icon"/> {data.location}</span>
        </div>

        <p className="text-[#785F3F] text-base leading-relaxed line-clamp-4 italic flex-1">"{data.redactedBody}"</p>
      </div>

      <div className="mt-auto bg-[#E9E3D9]/50 p-6 border-t border-[#D2C4AE]/50">
         {data.insight && (
           <div className="flex items-start gap-3">
              <div className="mt-1.5 min-w-[4px] h-8 bg-[#B89A6A] rounded-full"></div>
              <div>
                <p className="text-[10px] font-bold text-[#B89A6A] uppercase mb-1.5 tracking-widest flex items-center gap-1"><Sparkles size={10} /> AI Legal Insight</p>
                <p className="text-sm text-[#785F3F] font-medium leading-snug line-clamp-2">{data.insight}</p>
              </div>
           </div>
         )}
         
         <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#D2C4AE]/50 text-[#785F3F]">
            {/* Supported button now changes color and displays the count dynamically */}
            <button 
              className={`action-btn support flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${hasSupported ? 'text-[#8C2F2F] opacity-100' : ''}`} 
              onClick={handleSupport}
            >
              <Heart size={16} className={hasSupported ? "fill-current" : ""} /> 
              Support {supports > 0 ? `(${supports})` : ''}
            </button>
            <button className="action-btn share flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide" onClick={(e) => e.stopPropagation()}>
              <Share2 size={16}/> Share
            </button>
         </div>
      </div>
    </div>
  );
}