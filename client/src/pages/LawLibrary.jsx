import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchLaws, suggestLaws } from "../api/lawApi";

const CATEGORIES = [
  "Criminal Law",
  "Civil & Property",
  "Family Law",
  "Employment & Labor",
  "Consumer Rights",
  "Traffic & Vehicle Laws",
  "Cyber Law",
  "Women & Child Protection",
  "Finance & Tax",
  "Other",
];

const COURTS = ["Supreme Court", "High Court", "District Court", "Tribunal", "Other"];
const TYPES = ["statute", "case"];

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function LawLibrary() {
  const nav = useNavigate();
  const query = useQuery();
  const location = useLocation();

  const mode = location.pathname.includes("/lawyers") ? "lawyers" : "citizens";

  const [q, setQ] = useState(query.get("q") || "");
  const [category, setCategory] = useState(query.get("category") || "");
  const [year, setYear] = useState(query.get("year") || "");
  const [courtLevel, setCourtLevel] = useState(query.get("courtLevel") || "");
  const [jurisdiction, setJurisdiction] = useState(query.get("jurisdiction") || "");
  const [practiceArea, setPracticeArea] = useState(query.get("practiceArea") || "");
  const [lawType, setLawType] = useState(query.get("lawType") || "");
  const [sort, setSort] = useState(query.get("sort") || "relevance");

  const [data, setData] = useState({ items: [], pagination: { page: 1, pages: 1 } });
  const [loading, setLoading] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const sugTimer = useRef(null);

  useEffect(() => {
    if (location.pathname === "/law-library") {
      nav(`/law-library/citizens${location.search}`, { replace: true });
    }
  }, [location.pathname, nav, location.search]);

  const applyUrl = (overrides = {}) => {
    const params = new URLSearchParams();
    const merged = {
      q,
      category,
      year,
      courtLevel,
      jurisdiction,
      practiceArea,
      lawType,
      sort,
      ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== "" && v != null) params.set(k, v);
    });
    nav(`${mode === "lawyers" ? "/law-library/lawyers" : "/law-library/citizens"}?${params.toString()}`);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchLaws({
        q,
        category,
        year,
        courtLevel,
        jurisdiction,
        practiceArea,
        lawType,
        sort,
        page: query.get("page") || 1,
        limit: 12,
      });
      setData(res);
    } catch (e) {
      setData({ items: [], pagination: { page: 1, pages: 1 } });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setQ(query.get("q") || "");
    setCategory(query.get("category") || "");
    setYear(query.get("year") || "");
    setCourtLevel(query.get("courtLevel") || "");
    setJurisdiction(query.get("jurisdiction") || "");
    setPracticeArea(query.get("practiceArea") || "");
    setLawType(query.get("lawType") || "");
    setSort(query.get("sort") || "relevance");
  }, [location.search, location.pathname]);

  useEffect(() => {
    load();
  }, [location.search, location.pathname]);

  const onToggleMode = (selectedMode) => {
    if (mode === selectedMode) return;
    nav(`/law-library/${selectedMode}${location.search || ""}`);
  };

  const onSearchChange = (val) => {
    setQ(val);
    setShowSug(true);
    if (sugTimer.current) clearTimeout(sugTimer.current);
    sugTimer.current = setTimeout(async () => {
      if (!val || val.trim().length < 2) return setSuggestions([]);
      try {
        const res = await suggestLaws(val.trim());
        setSuggestions(res);
      } catch {
        setSuggestions([]);
      }
    }, 250);
  };

  const clearAll = () => {
    setQ("");
    setCategory("");
    setYear("");
    setCourtLevel("");
    setJurisdiction("");
    setPracticeArea("");
    setLawType("");
    setSort("relevance");
    nav(`/law-library/${mode}`);
  };

  const inputBase =
    "w-full px-5 py-3.5 rounded-[14px] bg-[#F5F1E8] border border-[#D2C4AE] text-[#785F3F] placeholder:text-[#D2C4AE] outline-none transition-all duration-200 focus:border-[#B89A6A] focus:shadow-[0_0_15px_rgba(184,154,106,0.15)] focus:bg-white";

  const selectBase =
    "w-full px-4 py-3 rounded-[12px] bg-[#F5F1E8] border border-[#D2C4AE] text-[#785F3F] outline-none transition-all duration-200 focus:border-[#B89A6A] focus:shadow-[0_0_10px_rgba(184,154,106,0.1)] focus:bg-white appearance-none";

  return (
    <div className="min-h-screen bg-[#F5F1E8] font-sans text-[#785F3F] relative overflow-hidden">
      <style>{`
        .watermark-bg::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background-image: url('/india-map-watermark.png');
          background-repeat: no-repeat; background-position: center center; background-size: cover; opacity: 0.06;
          pointer-events: none; z-index: 0;
        }
        @keyframes modeSwitchFade {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-mode-switch {
          animation: modeSwitchFade 200ms ease-out forwards;
        }
        @keyframes staggerRise {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .stagger-item {
          opacity: 0;
          animation: staggerRise 400ms ease-out forwards;
        }
        .text-readable-hover {
          transition: background-color 0.2s ease;
          border-radius: 4px;
        }
        .text-readable-hover:hover {
          background-color: rgba(233, 227, 217, 0.4);
        }
        .toggle-btn {
          transition: all 200ms ease-out;
        }
        .toggle-btn:hover:not(.active) {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(184, 154, 106, 0.15);
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10 watermark-bg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 text-center md:text-left">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#B89A6A]">Law Library</h1>
            <p className="text-[#785F3F] mt-3 text-lg max-w-2xl">
              {mode === "citizens"
                ? "Understand laws in simple words. Real examples, steps, and who to contact."
                : "Statutes and case law with filters, citations, judgments, and practical interpretation."}
            </p>
          </div>

          <div className="bg-[#E9E3D9] p-1.5 rounded-full border border-[#D2C4AE] flex w-full md:w-auto shadow-sm shrink-0 relative">
            <button
              onClick={() => onToggleMode("citizens")}
              className={`toggle-btn flex-1 md:w-36 py-2.5 px-4 rounded-full text-sm font-bold uppercase tracking-wider text-center ${
                mode === "citizens"
                  ? "active bg-[#B89A6A] text-[#F5F1E8] shadow-md"
                  : "text-[#D2C4AE] hover:text-[#B89A6A]"
              }`}
            >
              Citizen
            </button>
            <button
              onClick={() => onToggleMode("lawyers")}
              className={`toggle-btn flex-1 md:w-36 py-2.5 px-4 rounded-full text-sm font-bold uppercase tracking-wider text-center ${
                mode === "lawyers"
                  ? "active bg-[#785F3F] text-[#F5F1E8] shadow-md"
                  : "text-[#D2C4AE] hover:text-[#785F3F]"
              }`}
            >
              Lawyer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" key={mode}>
          <div className="lg:col-span-3">
            <div className="bg-[#E9E3D9] border border-[#D2C4AE] rounded-[20px] p-6 shadow-sm animate-mode-switch">
              <div className="font-bold text-xs uppercase tracking-widest text-[#B89A6A] mb-5">Categories</div>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setCategory("");
                    applyUrl({ category: "", page: 1 });
                  }}
                  className={`w-full text-left px-4 py-3 rounded-[12px] transition-all duration-200 font-semibold text-sm ${
                    !category
                      ? "bg-[#B89A6A] text-[#F5F1E8] shadow-md"
                      : "bg-transparent text-[#785F3F] hover:bg-[#F5F1E8] hover:text-[#B89A6A] border border-transparent hover:border-[#D2C4AE]/50"
                  }`}
                >
                  All Laws
                </button>

                {CATEGORIES.map((c, i) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCategory(c);
                      applyUrl({ category: c, page: 1 });
                    }}
                    className={`w-full text-left px-4 py-3 rounded-[12px] transition-all duration-200 font-semibold text-sm ${
                      category === c
                        ? "bg-[#B89A6A] text-[#F5F1E8] shadow-md"
                        : "bg-transparent text-[#785F3F] hover:bg-[#F5F1E8] hover:text-[#B89A6A] border border-transparent hover:border-[#D2C4AE]/50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-9 animate-mode-switch">
            <div className="bg-[#E9E3D9] border border-[#D2C4AE] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(120,95,63,0.05)] mb-8">
              <div className="relative">
                <input
                  value={q}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setShowSug(true)}
                  onBlur={() => setTimeout(() => setShowSug(false), 120)}
                  placeholder="Search by law name, section, keyword, or situation..."
                  className={inputBase}
                />

                {showSug && suggestions.length > 0 && (
                  <div className="absolute z-30 w-full mt-3 rounded-[16px] border border-[#B89A6A]/40 bg-[#F5F1E8] overflow-hidden shadow-[0_15px_40px_rgba(184,154,106,0.2)]">
                    {suggestions.map((s) => (
                      <Link
                        key={s._id}
                        to={`/law/${s._id}?mode=${mode}`}
                        className="block px-5 py-4 hover:bg-[#E9E3D9] transition-colors border-b border-[#D2C4AE]/30 last:border-0"
                      >
                        <div className="font-bold text-[#785F3F] text-lg">{s.title}</div>
                        <div className="text-xs text-[#B89AAA] font-bold tracking-wide mt-1 uppercase">
                          {s.statuteName ? `${s.statuteName} • ` : ""}
                          {s.year || ""} {s.category ? `• ${s.category}` : ""}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" className={selectBase} />

                <div className="relative">
                  <select value={courtLevel} onChange={(e) => setCourtLevel(e.target.value)} className={selectBase}>
                    <option value="">Court Level (all)</option>
                    {COURTS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <select value={lawType} onChange={(e) => setLawType(e.target.value)} className={selectBase}>
                    <option value="">Type (all)</option>
                    {TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <input
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  placeholder="Jurisdiction (e.g., India/Delhi)"
                  className={`${inputBase} md:col-span-2 py-3 rounded-[12px]`}
                />

                <input
                  value={practiceArea}
                  onChange={(e) => setPracticeArea(e.target.value)}
                  placeholder="Practice Area"
                  className={`${inputBase} py-3 rounded-[12px]`}
                />

                <div className="relative md:col-span-2">
                  <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectBase}>
                    <option value="relevance">Sort: Relevance</option>
                    <option value="year_desc">Sort: Newest</option>
                    <option value="year_asc">Sort: Oldest</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => applyUrl({ page: 1 })}
                    className="flex-1 px-4 py-3 rounded-[12px] bg-[#333333] text-white font-bold tracking-wide hover:shadow-[0_4px_15px_rgba(184,154,170,0.4)] hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Apply
                  </button>
                  <button
                    onClick={clearAll}
                    className="flex-1 px-4 py-3 rounded-[12px] border border-[#D2C4AE] bg-[#F5F1E8] hover:bg-[#E9E3D9] hover:border-[#B89A6A] text-[#785F3F] font-bold transition-all duration-200"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            <div>
              {loading ? (
                <div className="text-center py-12 text-[#B89A6A] font-bold text-lg animate-pulse">
                  Loading Legal Records...
                </div>
              ) : data.items.length === 0 ? (
                <div className="text-center py-12 text-[#D2C4AE] font-serif text-xl border-2 border-dashed border-[#D2C4AE] rounded-[20px]">
                  No laws found matching your criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                  {data.items.map((law, index) => {
                    const isCitizen = mode === "citizens";
                    const cardClass = isCitizen
                      ? "bg-[#F5F1E8] border border-[#D2C4AE] shadow-sm hover:border-[#B89A6A]"
                      : "bg-[#E9E3D9] border border-[#B89A6A]/40 shadow-md hover:border-[#B89A6A] hover:shadow-[0_12px_30px_rgba(120,95,63,0.2)]";

                    const titleClass = isCitizen ? "text-[#B89A6A]" : "text-[#785F3F]";

                    return (
                      <Link
                        key={law._id}
                        to={`/law/${law._id}?mode=${mode}`}
                        className={`stagger-item block rounded-[20px] p-7 transition-all duration-300 hover:-translate-y-[4px] hover:shadow-[0_10px_25px_rgba(184,154,106,0.15)] group relative overflow-hidden ${cardClass}`}
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        {mode === "lawyers" && (
                          <div className="absolute top-0 left-0 w-1 h-full bg-[#B89A6A] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        )}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <div className={`text-xl font-bold font-serif leading-snug mb-2 ${titleClass}`}>{law.title}</div>
                            <div className="text-[11px] font-bold uppercase tracking-widest text-[#B89AAA]">
                              {law.statuteName ? `${law.statuteName} • ` : ""}
                              {law.year ? `${law.year} • ` : ""}
                              {law.category}
                            </div>
                          </div>
                          <div className="text-[10px] font-bold tracking-widest text-[#B89A6A] bg-[#B89A6A]/10 border border-[#B89A6A]/20 rounded-full px-2.5 py-1.5 shrink-0">
                            {law.lawType?.toUpperCase()}
                          </div>
                        </div>

                        <div className="text-[#785F3F] text-sm leading-relaxed line-clamp-3 text-readable-hover p-1 -ml-1">
                          {isCitizen
                            ? law?.citizen?.summary || law?.citizen?.whatThisMeans || "Open to read details."
                            : law?.lawyer?.interpretation || "Open to read official legal text and interpretation."}
                        </div>

                        {mode === "lawyers" && (
                          <div className="mt-5 pt-4 border-t border-[#D2C4AE]/40 text-[11px] font-bold uppercase tracking-widest text-[#785F3F]/70 flex flex-wrap gap-x-2">
                            {law.courtLevel ? <span>{law.courtLevel}</span> : null}
                            {law.courtLevel && law.jurisdiction ? <span className="text-[#D2C4AE]">•</span> : null}
                            {law.jurisdiction ? <span>{law.jurisdiction}</span> : null}
                            {(law.courtLevel || law.jurisdiction) && law.practiceArea ? <span className="text-[#D2C4AE]">•</span> : null}
                            {law.practiceArea ? <span>{law.practiceArea}</span> : null}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {data.pagination?.pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  disabled={data.pagination.page <= 1}
                  onClick={() => applyUrl({ page: data.pagination.page - 1 })}
                  className="px-5 py-2.5 rounded-full border-2 border-[#D2C4AE] bg-[#F5F1E8] hover:bg-[#E9E3D9] hover:border-[#B89A6A] text-[#785F3F] font-bold disabled:opacity-40 disabled:hover:border-[#D2C4AE] disabled:hover:bg-[#F5F1E8] transition-all"
                >
                  Prev
                </button>
                <div className="text-[#B89A6A] font-bold tracking-widest text-sm uppercase bg-[#E9E3D9] px-4 py-2 rounded-full border border-[#D2C4AE]">
                  Page {data.pagination.page} / {data.pagination.pages}
                </div>
                <button
                  disabled={data.pagination.page >= data.pagination.pages}
                  onClick={() => applyUrl({ page: data.pagination.page + 1 })}
                  className="px-5 py-2.5 rounded-full border-2 border-[#D2C4AE] bg-[#F5F1E8] hover:bg-[#E9E3D9] hover:border-[#B89A6A] text-[#785F3F] font-bold disabled:opacity-40 disabled:hover:border-[#D2C4AE] disabled:hover:bg-[#F5F1E8] transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}