import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios , {BASE_URL} from '../utils/axios';
import { ArrowLeft, Calendar, ExternalLink, Scale, AlertTriangle, BookOpen, Share2 } from 'lucide-react';

export default function NewsDetail() {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/ai/law/${id}`)
      .then(res => {
        setNews(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching detail:", err);
        setLoading(false);
      });
  }, [id]);

  // --- Image Resolver using BASE_URL ---
  const resolveImage = (imgPath) => {
    const fallbackImg = "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=1200";
    if (!imgPath) return fallbackImg;
    if (imgPath.startsWith('http') || imgPath.startsWith('data:')) return imgPath;
    
    // Safely extract the root URL (removes '/api' if BASE_URL includes it)
    const rootUrl = BASE_URL ? BASE_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000';
    return `${rootUrl}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
  };

  const triggerChatbot = (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-global-chatbot'));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8]">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-5 w-40 bg-[#D2C4AE] rounded-full mb-5"></div>
        <div className="h-3 w-56 bg-[#E9E3D9] rounded-full"></div>
      </div>
    </div>
  );

  if (!news) return <div className="text-center py-24 text-[#785F3F] font-serif text-2xl bg-[#F5F1E8] min-h-screen">News not found.</div>;

  return (
    <div className="min-h-screen bg-[#F5F1E8] font-sans text-[#785F3F] pb-24 relative overflow-hidden">
      <style>{`
        .watermark-bg::before {
          content: ''; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background-image: url('/india-map-watermark.png');
          background-repeat: no-repeat; background-position: center; background-size: cover; opacity: 0.05;
          pointer-events: none; z-index: 0;
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-4  relative z-10 watermark-bg">
          <div className="max-w-5xl mx-auto  h-16 flex items-center justify-between relative z-10">
          <Link to="/news" className="flex items-center gap-2 text-[#785F3F] hover:text-[#B89A6A] font-bold uppercase tracking-wider text-xs transition-colors">
            <ArrowLeft size={16} /> Back to Newsroom
          </Link>
          <div className="text-[10px] font-bold bg-[#F5F1E8] text-[#B89A6A] px-4 py-1.5 rounded-full uppercase tracking-widest border border-[#D2C4AE] shadow-sm">
             AI Legal Analysis
          </div>
        </div>
        <div className="mb-10">
           <div className="flex items-center gap-3 text-sm text-[#D2C4AE] font-bold mb-5 tracking-wide">
              <span className="flex items-center gap-2"><Calendar size={16}/> {new Date(news.date || news.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
           </div>
           <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#B89A6A] leading-tight mb-8">
             {news.title}
           </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
           
           <div className="md:col-span-8 space-y-10">
              
              <div className="w-full h-80 bg-[#D2C4AE] rounded-[24px] overflow-hidden relative border border-[#D2C4AE] shadow-md">
                 <img 
                   src={resolveImage(news.imageUrl || news.image)} 
                   alt={news.title} 
                   className="w-full h-full object-cover opacity-90" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#333]/40 to-transparent"></div>
              </div>

              <div className="max-w-none">
                 <h3 className="text-2xl font-bold font-serif text-[#B89A6A] border-b border-[#D2C4AE] pb-3 mb-5">The Incident</h3>
                 <p className="text-lg text-[#785F3F] leading-relaxed font-medium">
                   {news.summary || news.content}
                 </p>
              </div>

              <div className="bg-[#E9E3D9] border border-[#D2C4AE] rounded-[24px] p-8 md:p-10 shadow-sm">
                 <h3 className="text-2xl font-bold font-serif text-[#B89A6A] mb-6 flex items-center gap-3">
                    <Scale className="text-[#B89A6A]" size={28} /> Legal Breakdown
                 </h3>
                 
                 {news.highlights && (
                 <div className="mb-8">
                    <p className="text-xs font-bold text-[#D2C4AE] uppercase tracking-widest mb-3">Applicable Laws</p>
                    <p className="text-lg font-bold text-[#785F3F] bg-[#F5F1E8] inline-block px-5 py-2.5 rounded-[12px] border border-[#D2C4AE] shadow-inner">
                       {news.highlights}
                    </p>
                 </div>
                 )}

                 {news.whyItMatters && (
                 <div>
                    <p className="text-xs font-bold text-[#D2C4AE] uppercase tracking-widest mb-4">Why It Matters (Legal Lesson)</p>
                    <div className="flex gap-5">
                       <div className="w-1.5 bg-[#B89A6A] rounded-full shrink-0"></div>
                       <p className="text-[#785F3F] italic leading-relaxed text-lg font-serif">
                          "{news.whyItMatters}"
                       </p>
                    </div>
                 </div>
                 )}
              </div>

           </div>

           <div className="md:col-span-4 space-y-8">
              
              <div className="bg-[#E9E3D9] border border-[#D2C4AE] rounded-[20px] p-8 shadow-sm lg:sticky top-32">
                 <h4 className="font-bold text-[#B89A6A] text-lg mb-6 font-serif">Quick Actions</h4>
                 
                 {news.sourceLink && (
                   <a 
                     href={news.sourceLink} 
                     target="_blank" 
                     rel="noreferrer"
                     className="flex items-center justify-between w-full p-4 mb-4 bg-[#F5F1E8] hover:bg-white border border-[#D2C4AE] hover:border-[#B89A6A] rounded-[12px] text-sm font-bold text-[#785F3F] transition-all hover:-translate-y-0.5 shadow-sm"
                   >
                      Read Original Source <ExternalLink size={16} className="text-[#B89A6A]"/>
                   </a>
                 )}

                 <button 
                    onClick={() => navigator.share({ title: news.title, url: window.location.href }).catch(()=>console.log('Share dismissed'))}
                    className="flex items-center justify-between w-full p-4 bg-[#F5F1E8] hover:bg-white border border-[#D2C4AE] hover:border-[#B89A6A] rounded-[12px] text-sm font-bold text-[#785F3F] transition-all hover:-translate-y-0.5 shadow-sm"
                 >
                    Share Article <Share2 size={16} className="text-[#B89A6A]"/>
                 </button>

                 <div className="mt-8 pt-6 border-t border-[#D2C4AE]">
                    <p className="text-xs text-[#D2C4AE] leading-relaxed font-semibold">
                       <AlertTriangle size={14} className="inline mr-1.5 text-[#B89A6A]"/>
                       <strong>Disclaimer:</strong> This content is generated by AI based on public news feeds for educational purposes. It is not legal advice.
                    </p>
                 </div>
              </div>

              <div className="bg-[#333333] text-[#F5F1E8] rounded-[20px] p-8 shadow-[0_15px_30px_rgba(0,0,0,0.2)] border border-[#B89A6A]/50">
                 <BookOpen size={32} className="mb-4 text-[#B89A6A]"/>
                 <h4 className="font-bold font-serif text-2xl mb-3 text-[#B89A6A]">Confused by the laws?</h4>
                 <p className="text-[#D2C4AE] text-base mb-6 leading-relaxed">
                    Our AI Chatbot can explain Section {news.highlights?.split(' ')[1] || "IPC"} and other terms in simple language.
                 </p>
                 
                 {/* Replaced <Link> with <button> to trigger the global chatbot event */}
                 <button 
                    onClick={triggerChatbot} 
                    className="block text-center w-full py-3.5 bg-[#B89A6A] text-white font-bold tracking-wide rounded-[12px] text-sm hover:bg-[#785F3F] transition-colors shadow-md"
                 >
                    Ask RightVerse AI
                 </button>
              </div>

           </div>

        </div>

      </div>
    </div>
  );
}