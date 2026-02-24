import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { fetchLawBySlug } from "../api/lawApi";

const Icons = {
  BookOpen: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Download: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Scale: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  LinkOut: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 015.657 5.656l-3 3a4 4 0 01-5.657-5.656m-1.656 1.656a4 4 0 01-5.657-5.656l3-3a4 4 0 015.657 5.656" />
    </svg>
  ),
};

function useMode() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  return params.get("mode") === "lawyers" ? "lawyers" : "citizens";
}

const fmtDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString();
};

const asArray = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);

const normalizeFaqs = (faqs) =>
  asArray(faqs).map((f) => ({
    question: f?.question ?? f?.q ?? "",
    answer: f?.answer ?? f?.a ?? "",
  })).filter((f) => f.question || f.answer);

const normalizeJudgments = (judgments) =>
  asArray(judgments).map((j) => ({
    caseName: j?.caseName ?? j?.title ?? "",
    court: j?.court ?? "",
    year: j?.year ?? "",
    citation: j?.citation ?? "",
    holding: j?.holding ?? j?.summary ?? "",
    link: j?.link ?? "",
  })).filter((j) => j.caseName || j.holding || j.citation);

const normalizeAmendments = (amendments) =>
  asArray(amendments).map((a) => {
    if (typeof a === "string") return { summary: a };
    return {
      date: a?.date,
      summary: a?.summary ?? a?.type ?? a?.note ?? "",
      type: a?.type ?? "",
      note: a?.note ?? "",
    };
  }).filter((a) => a.summary || a.date || a.type || a.note);

export default function LawDetail() {
  const { slug } = useParams();
  const mode = useMode();
  const nav = useNavigate();
  const location = useLocation();

  const [law, setLaw] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  const switchMode = (targetMode) => {
    if (mode === targetMode) return;
    const params = new URLSearchParams(location.search);
    params.set("mode", targetMode);
    nav(`/law/${slug}?${params.toString()}`);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setPageLoaded(false);
      try {
        const res = await fetchLawBySlug(slug);
        if (!mounted) return;
        setLaw(res);
        setTimeout(() => mounted && setPageLoaded(true), 50);
      } catch {
        if (!mounted) return;
        setLaw(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug]);

  const normalizedLaw = useMemo(() => {
    if (!law) return null;
    return {
      ...law,
      citizen: {
        ...(law.citizen || {}),
        faqs: normalizeFaqs(law.citizen?.faqs),
      },
      lawyer: {
        ...(law.lawyer || {}),
        judgments: normalizeJudgments(law.lawyer?.judgments),
        amendments: normalizeAmendments(law.lawyer?.amendments),
      },
    };
  }, [law]);

  if (loading) return <LoadingState />;
  if (!normalizedLaw) return <NotFoundState />;

  const data = normalizedLaw;

  return (
    <div className={`min-h-screen bg-[#F5F1E8] text-[#785F3F] font-sans selection:bg-[#B89A6A]/30 transition-all duration-300 transform ${pageLoaded ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"}`}>
      <style>{`
        .watermark-bg::before {
          content: ''; position: fixed; inset: 0;
          background-image: url('/india-map-watermark.png');
          background-repeat: no-repeat; background-position: center; background-size: cover;
          opacity: 0.05; pointer-events: none; z-index: 0;
        }
        @keyframes crossFade { 0% { opacity: 0; transform: translateY(10px);} 100% { opacity: 1; transform: translateY(0);} }
        .section-stagger { opacity: 0; animation: crossFade 300ms ease-out forwards; }
        .readability-hover { transition: background-color 0.2s ease; border-radius: 6px; }
        .readability-hover:hover { background-color: rgba(184, 154, 106, 0.05); }
        .resource-link { position: relative; }
        .resource-link::after {
          content: ''; position: absolute; width: 100%; height: 1px; bottom: -2px; left: 0;
          background-color: #B89A6A; transform: scaleX(0); transform-origin: left; transition: transform 0.2s ease-out;
        }
        .resource-link:hover::after { transform: scaleX(1); }
        .lawyer-black-card { transition: all 0.3s ease; }
        .lawyer-black-card:hover { box-shadow: 0 0 20px rgba(184, 154, 106, 0.2); filter: brightness(1.03); }
        .meta-row { transition: transform 0.2s ease-out, color 0.2s ease-out; }
        .meta-row:hover { transform: translateX(3px); }
        .meta-row:hover .meta-label { color: #B89A6A; }
        .meta-row:hover .meta-val { color: #333333; }
        .back-btn-icon { transition: transform 0.2s ease-out; }
        .back-btn:hover .back-btn-icon { transform: translateX(-3px); }
        .resource-icon { transition: transform 0.2s ease-out; }
        .resource-link-wrapper:hover .resource-icon { transform: translateX(3px); }
        .mode-btn { transition: all 0.2s ease-out; }
        .mode-btn:hover:not(.active) { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(184, 154, 106, 0.15); }
      `}</style>

      {/* Breadcrumb bar */}
      <div className="bg-[#E9E3D9] border-b border-[#D2C4AE]/50 sticky top-0 z-30 relative watermark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center text-sm text-[#785F3F] relative z-10">
          <Link to="/law-library" className="hover:text-[#B89A6A] transition-colors flex items-center gap-2 font-bold uppercase tracking-wider text-[11px]">
            <Icons.BookOpen /> Library
          </Link>
          <span className="mx-3 text-[#D2C4AE]">/</span>
          <span className="truncate font-bold text-[#B89A6A] max-w-[200px] sm:max-w-md">{data.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative z-10 watermark-bg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6 order-2 lg:order-1">
            <div className="hidden lg:block">
              <Link to="/law-library" className="back-btn flex items-center justify-center gap-3 w-full py-4 rounded-[16px] border-2 border-[#D2C4AE] bg-[#E9E3D9] text-[#785F3F] hover:bg-[#F5F1E8] hover:border-[#B89A6A] hover:text-[#B89A6A] transition-all font-bold text-sm tracking-wide">
                <span className="back-btn-icon"><Icons.ArrowLeft /></span> Back to Library
              </Link>
            </div>

            {/* Metadata - all top-level fields */}
            <div className="bg-[#E9E3D9] rounded-[20px] border border-[#D2C4AE] shadow-sm p-7">
              <h3 className="text-[11px] font-bold text-[#B89A6A] uppercase tracking-widest mb-5">
                Legal Metadata
              </h3>

              <div className="space-y-5">
                <MetaRow label="Title" value={data.title} />
                <MetaRow label="Slug" value={data.slug} />
                <MetaRow label="Statute" value={data.statuteName} />
                <MetaRow label="Category" value={data.category} />
                <MetaRow label="Type" value={data.lawType || "statute"} />
                <MetaRow label="Court Level" value={data.courtLevel} />
                <MetaRow label="Year" value={data.year} />
                <MetaRow label="Jurisdiction" value={data.jurisdiction || "India"} />
                <MetaRow label="Practice Area" value={data.practiceArea} />
                <MetaRow label="Relevance Score" value={typeof data.relevanceScore === "number" ? String(data.relevanceScore) : undefined} />
                <MetaRow label="Published" value={typeof data.isPublished === "boolean" ? (data.isPublished ? "Yes" : "No") : undefined} />
                <MetaRow label="Created" value={fmtDate(data.createdAt)} />
                <MetaRow label="Updated" value={fmtDate(data.updatedAt)} />
              </div>

              <div className="mt-8 pt-6 border-t border-[#D2C4AE]/40 space-y-5">
                <TagGroup title="Keywords" items={data.keywords} />
                <TagGroup title="Sections" items={data.sections} />
                <TagGroup title="Situations" items={data.situations} />
                <TagGroup title="Tags" items={data.tags} />
              </div>

              <div className="mt-8 pt-6 border-t border-[#D2C4AE]/40">
                <div className="text-[11px] font-bold text-[#B89A6A] uppercase tracking-widest mb-4">
                  Resources
                </div>
                {Array.isArray(data.resources) && data.resources.length > 0 ? (
                  <ul className="space-y-3">
                    {data.resources.map((r, i) => (
                      <li key={i} className="rounded-[14px] border border-[#D2C4AE] bg-[#F5F1E8] p-3">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="resource-link-wrapper flex items-start gap-3 text-sm text-[#785F3F] font-bold transition group"
                        >
                          <span className="resource-icon p-2 bg-[#E9E3D9] text-[#B89A6A] rounded-[10px] border border-[#D2C4AE] group-hover:border-[#B89A6A] transition-colors">
                            <Icons.Download />
                          </span>
                          <span className="min-w-0">
                            <span className="resource-link block break-words">{r.label || "Download Document"}</span>
                            <span className="block text-[11px] mt-1 text-[#B89A6A] uppercase tracking-wider">
                              Type: {r.type || "link"}
                            </span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#D2C4AE] italic font-semibold">No resources attached.</p>
                )}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="mb-10">
              <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#B89A6A] leading-tight mb-4">
                {data.title}
              </h1>
              {data.statuteName && (
                <p className="text-[#785F3F] font-serif text-xl italic font-semibold">
                  {data.statuteName}
                </p>
              )}
            </div>

            <div className="bg-[#E9E3D9] p-1.5 rounded-full inline-flex mb-10 w-full sm:w-auto border border-[#D2C4AE] shadow-sm">
              <button
                onClick={() => switchMode("citizens")}
                className={`mode-btn flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                  mode === "citizens"
                    ? "active bg-[#785F3F] text-[#F5F1E8] shadow-md"
                    : "text-[#D2C4AE] hover:text-[#785F3F]"
                }`}
              >
                <Icons.User /> Citizen View
              </button>
              <button
                onClick={() => switchMode("lawyers")}
                className={`mode-btn flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                  mode === "lawyers"
                    ? "active bg-[#785F3F] text-[#F5F1E8] shadow-md"
                    : "text-[#D2C4AE] hover:text-[#785F3F]"
                }`}
              >
                <Icons.Scale /> Lawyer View
              </button>
            </div>

            <div key={mode} className="flex flex-col gap-6">
              {mode === "citizens" ? <CitizenView law={data} /> : <LawyerView law={data} />}
            </div>

            <div className="mt-8 lg:hidden">
              <Link to="/law-library" className="back-btn flex items-center justify-center gap-3 w-full py-4 rounded-[16px] border-2 border-[#D2C4AE] bg-[#E9E3D9] text-[#785F3F] hover:bg-[#F5F1E8] hover:border-[#B89A6A] hover:text-[#B89A6A] transition-all font-bold text-sm tracking-wide">
                <span className="back-btn-icon"><Icons.ArrowLeft /></span> Back to Library
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="meta-row flex flex-col gap-1 cursor-default">
      <span className="meta-label text-[10px] text-[#D2C4AE] font-bold uppercase tracking-widest">{label}</span>
      <span className="meta-val text-sm font-bold text-[#785F3F] leading-tight break-words">{String(value)}</span>
    </div>
  );
}

function TagGroup({ title, items }) {
  const safe = asArray(items);
  return (
    <div>
      <div className="text-[11px] font-bold text-[#B89A6A] uppercase tracking-widest mb-3">{title}</div>
      {safe.length ? (
        <div className="flex flex-wrap gap-2">
          {safe.map((item, i) => (
            <span key={`${title}-${i}`} className="px-3 py-1.5 rounded-full text-xs font-semibold border border-[#D2C4AE] bg-[#F5F1E8] text-[#785F3F]">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#D2C4AE] italic font-semibold">None</p>
      )}
    </div>
  );
}

function Section({ title, children, accent = false, index = 0, isLawyer = false }) {
  const cardStyle = accent
    ? "lawyer-black-card bg-[#2C2C2C] text-[#F5F1E8] border border-[#B89A6A]"
    : isLawyer
    ? "bg-[#E9E3D9] border border-[#B89A6A]/40 shadow-md hover:-translate-y-[3px] hover:shadow-[0_12px_25px_rgba(120,95,63,0.2)] transition-all duration-300"
    : "bg-[#F5F1E8] border border-[#D2C4AE] shadow-sm hover:-translate-y-[3px] hover:shadow-[0_8px_20px_rgba(184,154,106,0.15)] transition-all duration-300";

  return (
    <div className={`section-stagger rounded-[24px] overflow-hidden ${cardStyle}`} style={{ animationDelay: `${index * 40}ms` }}>
      <div className={`px-8 py-5 border-b ${accent ? "border-[#B89A6A]/30" : "border-[#D2C4AE]/50"}`}>
        <h2 className="font-serif text-xl font-bold text-[#B89A6A]">{title}</h2>
      </div>
      <div className={`p-8 leading-relaxed ${accent ? "text-[#D2C4AE]" : "text-[#785F3F]"}`}>{children}</div>
    </div>
  );
}

function CitizenView({ law }) {
  const c = law.citizen || {};
  const faqs = normalizeFaqs(c.faqs);

  return (
    <>
      <Section title="Simple Summary" index={0} isLawyer={false}>
        <p className="text-lg readability-hover p-2 -m-2 font-medium">{c.summary || "No summary available."}</p>
      </Section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 section-stagger" style={{ animationDelay: "40ms" }}>
        <div className="bg-[#E9E3D9] border border-[#D2C4AE] rounded-[24px] p-8 hover:-translate-y-[3px] hover:shadow-[0_8px_20px_rgba(184,154,106,0.15)] transition-all duration-300">
          <h3 className="font-serif font-bold text-[#B89A6A] text-lg mb-3">What this means</h3>
          <p className="text-[#785F3F] text-base leading-relaxed readability-hover p-2 -m-2">{c.whatThisMeans || "—"}</p>
        </div>
        <div className="bg-[#F5F1E8] border border-[#B89A6A]/40 rounded-[24px] p-8 hover:-translate-y-[3px] hover:shadow-[0_8px_20px_rgba(184,154,106,0.15)] transition-all duration-300">
          <h3 className="font-serif font-bold text-[#B89A6A] text-lg mb-3">Real-life Example</h3>
          <p className="text-[#785F3F] text-base leading-relaxed readability-hover p-2 -m-2">{c.realLifeExample || "—"}</p>
        </div>
      </div>

      <Section title="Steps to take" index={2} isLawyer={false}>
        {asArray(c.stepsToTake).length ? (
          <ul className="space-y-4">
            {asArray(c.stepsToTake).map((s, i) => (
              <li key={i} className="flex gap-4 readability-hover p-2 -m-2 items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-[#B89A6A] text-[#F5F1E8] rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                  {i + 1}
                </span>
                <span className="pt-1 font-medium">{s}</span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="p-2">—</span>
        )}
      </Section>

      <Section title="Who to contact" index={3} isLawyer={false}>
        {asArray(c.whoToContact).length ? (
          <ul className="list-disc pl-6 space-y-2 marker:text-[#B89A6A]">
            {asArray(c.whoToContact).map((s, i) => (
              <li key={i} className="readability-hover p-1 -m-1 font-medium">{s}</li>
            ))}
          </ul>
        ) : (
          <span className="p-2">—</span>
        )}
      </Section>

      <Section title="Must Know" index={4} isLawyer={false}>
        {asArray(c.mustKnow).length ? (
          <ul className="list-disc pl-6 space-y-2 marker:text-[#B89A6A]">
            {asArray(c.mustKnow).map((s, i) => (
              <li key={i} className="readability-hover p-1 -m-1 font-medium">{s}</li>
            ))}
          </ul>
        ) : (
          <span className="p-2">—</span>
        )}
      </Section>

      <Section title="Frequently Asked Questions" index={5} isLawyer={false}>
        {faqs.length ? (
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <details key={i} className="group border border-[#D2C4AE] rounded-[16px] bg-[#E9E3D9] open:bg-[#F5F1E8] open:border-[#B89A6A] transition-all duration-300">
                <summary className="flex cursor-pointer items-center justify-between p-5 font-bold text-[#785F3F] group-open:text-[#B89A6A]">
                  {f.question || "Question"}
                  <span className="ml-4 flex-shrink-0 transition-transform duration-300 group-open:rotate-180 text-[#B89A6A]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-0 text-[#785F3F] text-base leading-relaxed readability-hover p-2 -m-2">
                  {f.answer || "—"}
                </div>
              </details>
            ))}
          </div>
        ) : (
          <span className="p-2">—</span>
        )}
      </Section>
    </>
  );
}

function LawyerView({ law }) {
  const l = law.lawyer || {};
  const judgments = normalizeJudgments(l.judgments);
  const amendments = normalizeAmendments(l.amendments);

  return (
    <>
      <Section title="Official Legal Text" accent index={0} isLawyer={true}>
        <div className="font-serif whitespace-pre-line text-justify leading-8 text-lg">
          {l.officialText || "No official text provided."}
        </div>
      </Section>

      <Section title="Interpretation & Scope" index={1} isLawyer={true}>
        <p className="readability-hover p-2 -m-2 text-lg font-medium">{l.interpretation || "—"}</p>
      </Section>

      <Section title="Landmark Judgments" index={2} isLawyer={true}>
        {judgments.length ? (
          <div className="space-y-6">
            {judgments.map((j, i) => (
              <div key={i} className="border-l-4 border-[#B89A6A] pl-5 py-2 readability-hover p-2 -m-2">
                <div className="font-serif font-bold text-xl text-[#B89A6A]">{j.caseName || "Untitled Judgment"}</div>
                <div className="text-xs font-bold text-[#B89AAA] uppercase tracking-widest mt-2 mb-3">
                  {[j.court, j.year, j.citation].filter(Boolean).join(" • ") || "No citation metadata"}
                </div>
                <p className="text-base text-[#785F3F] leading-relaxed font-medium">{j.holding || "—"}</p>
                {j.link && (
                  <a href={j.link} target="_blank" rel="noreferrer" className="text-[#B89A6A] text-xs font-bold uppercase tracking-widest mt-3 inline-flex items-center gap-2 hover:text-[#785F3F] transition-colors resource-link">
                    <Icons.LinkOut /> Read Judgment
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <span className="p-2">—</span>
        )}
      </Section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 section-stagger" style={{ animationDelay: "120ms" }}>
        <div className="bg-[#E9E3D9] border border-[#B89A6A]/40 rounded-[24px] p-8 shadow-md hover:-translate-y-[3px] hover:shadow-[0_12px_25px_rgba(120,95,63,0.2)] transition-all duration-300">
          <h3 className="font-serif font-bold text-[#B89A6A] text-xl mb-5 pb-3 border-b border-[#D2C4AE]">Related Provisions</h3>
          {asArray(l.relatedProvisions).length ? (
            <ul className="list-disc pl-6 space-y-3 text-base text-[#785F3F] font-medium marker:text-[#B89A6A]">
              {asArray(l.relatedProvisions).map((s, i) => <li key={i} className="readability-hover p-1 -m-1">{s}</li>)}
            </ul>
          ) : <span className="p-1">—</span>}
        </div>

        <div className="bg-[#E9E3D9] border border-[#B89A6A]/40 rounded-[24px] p-8 shadow-md hover:-translate-y-[3px] hover:shadow-[0_12px_25px_rgba(120,95,63,0.2)] transition-all duration-300">
          <h3 className="font-serif font-bold text-[#B89A6A] text-xl mb-5 pb-3 border-b border-[#D2C4AE]">Amendment History</h3>
          {amendments.length ? (
            <ul className="space-y-4">
              {amendments.map((a, i) => (
                <li key={i} className="text-base readability-hover p-2 -m-2 border-b border-[#D2C4AE]/40 last:border-b-0">
                  <span className="block font-bold text-[#B89A6A] mb-1">{fmtDate(a.date) || "No date specified"}</span>
                  <span className="block text-[#785F3F] font-medium">{a.summary || "—"}</span>
                  {(a.type || a.note) && (
                    <span className="block text-xs mt-2 text-[#B89A6A] uppercase tracking-wide">
                      {[a.type, a.note].filter(Boolean).join(" • ")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : <span className="p-1">—</span>}
        </div>
      </div>

      <Section title="Citations" index={4} isLawyer={true}>
        {asArray(l.citations).length ? (
          <ul className="list-disc pl-6 space-y-2 marker:text-[#B89A6A]">
            {asArray(l.citations).map((c, i) => (
              <li key={i} className="readability-hover p-1 -m-1 font-medium">{c}</li>
            ))}
          </ul>
        ) : (
          <span className="p-2">—</span>
        )}
      </Section>

      <Section title="Commentary" index={5} isLawyer={true}>
        <p className="readability-hover p-2 -m-2 text-base font-medium leading-relaxed">{l.commentary || "—"}</p>
      </Section>
    </>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/india-map-watermark.png')] bg-no-repeat bg-center bg-cover opacity-5 pointer-events-none"></div>
      <div className="animate-pulse flex flex-col items-center relative z-10">
        <div className="h-5 w-40 bg-[#E9E3D9] rounded-full mb-5 border border-[#D2C4AE]"></div>
        <div className="h-3 w-56 bg-[#E9E3D9] rounded-full border border-[#D2C4AE]"></div>
      </div>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/india-map-watermark.png')] bg-no-repeat bg-center bg-cover opacity-5 pointer-events-none"></div>
      <div className="text-center p-10 bg-[#E9E3D9] border border-[#D2C4AE] rounded-[24px] shadow-lg max-w-md relative z-10">
        <h2 className="text-3xl font-serif font-bold text-[#B89A6A] mb-3">Law not found</h2>
        <p className="text-[#785F3F] mb-8 font-medium">The legal document you are looking for does not exist or has been removed.</p>
        <Link to="/law-library" className="px-8 py-3 bg-[#B89A6A] text-[#F5F1E8] rounded-full text-base font-bold tracking-wide hover:bg-[#785F3F] hover:shadow-lg transition-all inline-flex items-center gap-2">
          <Icons.ArrowLeft /> Return to Library
        </Link>
      </div>
    </div>
  );
}