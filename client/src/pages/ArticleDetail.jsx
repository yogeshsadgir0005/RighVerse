import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../utils/axios';
import {
  Calendar,
  User,
  ArrowLeft,
  Loader2,
  BookOpen,
  Clock3,
} from 'lucide-react';

export default function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/blogs/${id}`);
        if (isMounted) setArticle(res.data);
      } catch (err) {
        console.error('Error fetching article:', err);
        if (isMounted) setArticle(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchArticle();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const estimatedReadTime = useMemo(() => {
    if (!article?.content) return null;
    const text = stripHtml(article.content).trim();
    const words = text ? text.split(/\s+/).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 220));
    return `${minutes} min read`;
  }, [article?.content]);

  const isHtmlContent = useMemo(() => {
    if (!article?.content) return false;
    return /<\/?[a-z][\s\S]*>/i.test(article.content);
  }, [article?.content]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-14 w-14 rounded-full border-2 border-[#D8C4A1] border-t-[#9C7B4C] animate-spin" />
          <p className="text-[#8A6A3E] font-medium tracking-wide">
            Loading article...
          </p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center px-6">
        <div className="w-full max-w-xl rounded-3xl border border-[#E0D3BF] bg-white/70 backdrop-blur-sm shadow-sm p-8 text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-[#F1E7D7] flex items-center justify-center">
            <BookOpen className="text-[#A9834E]" size={26} />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#7A5C35] mb-2">
            Article not found
          </h2>
          <p className="text-[#9B7D52] mb-6 leading-relaxed">
            The article you are looking for may have been removed or the link is incorrect.
          </p>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#8E6A3C] text-white font-semibold hover:bg-[#76562F] transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#5E4526]">
      {/* subtle background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('/india-map-watermark.png')] bg-center bg-cover" />

      <article className="relative z-10">
        {/* Top wrapper */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14">
      

          {/* Hero card */}
          <div className="rounded-3xl border border-[#E2D5C2] bg-white/75 backdrop-blur-sm shadow-[0_10px_30px_rgba(90,60,20,0.06)] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left content */}
              <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F2E6D3] text-[#8C6A3D] text-xs font-bold uppercase tracking-wider mb-4">
                  <BookOpen size={14} />
                  Editorial Blog
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight text-[#7A5C35]">
                  {article.title}
                </h1>

                {article.summary && (
                  <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#7E6647] max-w-3xl">
                    {article.summary}
                  </p>
                )}

 {/* Content renderer */}
            {isHtmlContent ? (
              <div
                className="prose prose-lg max-w-none prose-headings:text-[#6F4F2A] prose-p:text-[#5F4729] prose-p:leading-8 prose-strong:text-[#5B4121] prose-a:text-[#8A673A] prose-li:text-[#5F4729] prose-blockquote:text-[#7A5C35] prose-blockquote:border-[#D8C4A1]"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            ) : (
              <div className="whitespace-pre-wrap text-[17px] sm:text-[18px] leading-8 text-[#5F4729]">
                {article.content}
              </div>
            )}
    

                <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E8DAC4] bg-[#FFFDF8] px-3 py-2 text-[#7A5C35]">
                    <User size={16} className="text-[#A6814C]" />
                    <span className="font-semibold">{article.author || 'Unknown Author'}</span>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E8DAC4] bg-[#FFFDF8] px-3 py-2 text-[#7A5C35]">
                    <Calendar size={16} className="text-[#A6814C]" />
                    <span className="font-semibold">{article.date || 'No date'}</span>
                  </div>

                  {estimatedReadTime && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#E8DAC4] bg-[#FFFDF8] px-3 py-2 text-[#7A5C35]">
                      <Clock3 size={16} className="text-[#A6814C]" />
                      <span className="font-semibold">{estimatedReadTime}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right image (if exists) */}
              {article.image ? (
                <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full bg-[#EFE4D2]">
                  {!imgLoaded && (
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#EEE1CD] via-[#F6EEDF] to-[#EEE1CD]" />
                  )}
                  <img
                    src={article.image}
                    alt={article.title}
                    onLoad={() => setImgLoaded(true)}
                    className={`h-full w-full object-cover transition duration-500 ${
                      imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                </div>
              ) : (
                <div className="lg:col-span-5 p-6 sm:p-8 flex items-center justify-center bg-gradient-to-br from-[#F2E7D6] to-[#EADCC5]">
                  <div className="text-center">
                    <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-white/70 flex items-center justify-center border border-[#E1D1BA]">
                      <BookOpen className="text-[#A6814C]" />
                    </div>
                    <p className="text-[#8A6D45] font-medium">No cover image uploaded</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


          {/* Footer CTA */}
          <div className="py-8 text-center ">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[#DCC8A9] bg-white/80 text-[#7A5C35] font-semibold hover:bg-[#F7F1E7] transition-colors"
            >
              <ArrowLeft size={18} />
              Explore More Articles
            </Link>
          </div>
        
      </article>
    </div>
  );
}

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, ' ');
}